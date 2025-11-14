-- ============================================================================
-- MULTI-FACTOR AUTHENTICATION (MFA) AND ENHANCED SECURITY
-- Implements TOTP, backup codes, session management, and account security
-- ============================================================================

-- MFA secrets table
CREATE TABLE IF NOT EXISTS mfa_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL, -- Base32 encoded TOTP secret
  enabled BOOLEAN DEFAULT FALSE,
  enabled_at TIMESTAMPTZ,
  backup_codes TEXT[], -- Encrypted backup codes
  backup_codes_used INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mfa_user ON mfa_secrets(user_id);
CREATE INDEX idx_mfa_enabled ON mfa_secrets(enabled) WHERE enabled = TRUE;

-- MFA verification attempts
CREATE TABLE IF NOT EXISTS mfa_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  success BOOLEAN NOT NULL,
  method TEXT NOT NULL, -- totp, backup_code, sms
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mfa_attempts_user ON mfa_verification_attempts(user_id, attempted_at DESC);
CREATE INDEX idx_mfa_attempts_failures ON mfa_verification_attempts(user_id, success, attempted_at DESC) WHERE success = FALSE;

-- Trusted devices for MFA
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  ip_address INET NOT NULL,
  user_agent TEXT,
  trusted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trusted_devices_user ON trusted_devices(user_id, trusted_at DESC);
CREATE INDEX idx_trusted_devices_active ON trusted_devices(user_id, expires_at DESC) WHERE revoked = FALSE;
CREATE UNIQUE INDEX idx_trusted_devices_unique ON trusted_devices(user_id, device_fingerprint) WHERE revoked = FALSE;

-- Session management table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  terminated BOOLEAN DEFAULT FALSE,
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_active ON user_sessions(session_token, expires_at) WHERE terminated = FALSE;
CREATE INDEX idx_sessions_last_activity ON user_sessions(last_activity DESC) WHERE terminated = FALSE;

-- Password history for preventing reuse
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES users(id), -- NULL if self-changed, or admin ID
  change_reason TEXT
);

CREATE INDEX idx_password_history_user ON password_history(user_id, changed_at DESC);

-- IP whitelist for admin access
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  description TEXT NOT NULL,
  role_restriction TEXT[], -- Roles that must use this whitelist
  added_by UUID NOT NULL REFERENCES users(id),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enabled BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ip_whitelist_active ON ip_whitelist(enabled, expires_at) WHERE enabled = TRUE;

-- Security settings per user
CREATE TABLE IF NOT EXISTS user_security_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mfa_required BOOLEAN DEFAULT TRUE,
  password_expires_at TIMESTAMPTZ,
  password_change_required BOOLEAN DEFAULT FALSE,
  allowed_ip_addresses INET[],
  session_timeout_minutes INTEGER DEFAULT 15,
  max_concurrent_sessions INTEGER DEFAULT 3,
  security_questions JSONB, -- Encrypted security questions/answers
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to check if session is valid and not timed out
CREATE OR REPLACE FUNCTION is_session_valid(p_session_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_activity TIMESTAMPTZ;
  v_timeout_minutes INTEGER;
  v_expired BOOLEAN;
BEGIN
  SELECT 
    s.last_activity,
    COALESCE(u.session_timeout_minutes, 15),
    s.expires_at < NOW() OR s.terminated
  INTO v_last_activity, v_timeout_minutes, v_expired
  FROM user_sessions s
  LEFT JOIN user_security_settings u ON u.user_id = s.user_id
  WHERE s.session_token = p_session_token;
  
  IF NOT FOUND OR v_expired THEN
    RETURN FALSE;
  END IF;
  
  -- Check inactivity timeout
  IF v_last_activity + (v_timeout_minutes || ' minutes')::INTERVAL < NOW() THEN
    -- Mark session as terminated due to inactivity
    UPDATE user_sessions
    SET terminated = TRUE,
        terminated_at = NOW(),
        termination_reason = 'inactivity_timeout'
    WHERE session_token = p_session_token;
    RETURN FALSE;
  END IF;
  
  -- Update last activity
  UPDATE user_sessions
  SET last_activity = NOW()
  WHERE session_token = p_session_token;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to terminate all sessions for a user
CREATE OR REPLACE FUNCTION terminate_user_sessions(
  p_user_id UUID,
  p_reason TEXT DEFAULT 'admin_action'
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_sessions
  SET terminated = TRUE,
      terminated_at = NOW(),
      termination_reason = p_reason
  WHERE user_id = p_user_id
    AND terminated = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check account lockout status
CREATE OR REPLACE FUNCTION is_account_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_locked BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM account_lockouts
    WHERE user_id = p_user_id
      AND locked_until > NOW()
      AND unlocked_at IS NULL
  ) INTO v_locked;
  
  RETURN v_locked;
END;
$$ LANGUAGE plpgsql;

-- Function to record failed login and potentially lock account
CREATE OR REPLACE FUNCTION record_failed_login(
  p_email TEXT,
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_recent_failures INTEGER;
  v_lockout_duration INTERVAL := '15 minutes';
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM users WHERE email = p_email;
  
  -- Count recent failures (last 15 minutes)
  SELECT COUNT(*) INTO v_recent_failures
  FROM authentication_events
  WHERE email = p_email
    AND success = FALSE
    AND timestamp > NOW() - v_lockout_duration;
  
  -- If 5 or more failures, lock the account
  IF v_recent_failures >= 4 THEN
    INSERT INTO account_lockouts (
      user_id, email, locked_until, failed_attempts, ip_address
    ) VALUES (
      v_user_id, p_email, NOW() + v_lockout_duration, v_recent_failures + 1, p_ip_address
    );
    
    RETURN jsonb_build_object(
      'locked', TRUE,
      'locked_until', NOW() + v_lockout_duration,
      'reason', 'Too many failed login attempts'
    );
  END IF;
  
  RETURN jsonb_build_object('locked', FALSE, 'attempts_remaining', 5 - v_recent_failures);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes()
RETURNS TEXT[] AS $$
DECLARE
  v_codes TEXT[];
  v_code TEXT;
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    -- Generate 8-character alphanumeric code
    v_code := UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    v_codes := array_append(v_codes, v_code);
  END LOOP;
  RETURN v_codes;
END;
$$ LANGUAGE plpgsql;

-- Function to enable MFA for user
CREATE OR REPLACE FUNCTION enable_mfa_for_user(
  p_user_id UUID,
  p_secret TEXT
)
RETURNS UUID AS $$
DECLARE
  v_mfa_id UUID;
  v_backup_codes TEXT[];
BEGIN
  v_backup_codes := generate_backup_codes();
  
  INSERT INTO mfa_secrets (user_id, secret, enabled, enabled_at, backup_codes)
  VALUES (p_user_id, p_secret, TRUE, NOW(), v_backup_codes)
  ON CONFLICT (user_id) DO UPDATE
  SET secret = p_secret,
      enabled = TRUE,
      enabled_at = NOW(),
      backup_codes = v_backup_codes,
      backup_codes_used = '{}',
      updated_at = NOW()
  RETURNING id INTO v_mfa_id;
  
  RETURN v_mfa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to clean up old sessions automatically
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < NOW() - INTERVAL '30 days';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Run cleanup daily
CREATE OR REPLACE FUNCTION schedule_session_cleanup()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE (expires_at < NOW() - INTERVAL '30 days')
     OR (terminated = TRUE AND terminated_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Compliance monitoring view
CREATE OR REPLACE VIEW security_compliance_status AS
SELECT
  'MFA Adoption Rate' AS metric,
  (COUNT(*) FILTER (WHERE m.enabled = TRUE))::FLOAT / NULLIF(COUNT(*), 0) * 100 AS value,
  '%' AS unit
FROM users u
LEFT JOIN mfa_secrets m ON m.user_id = u.id
UNION ALL
SELECT
  'Active Sessions',
  COUNT(*)::FLOAT,
  'sessions'
FROM user_sessions
WHERE terminated = FALSE AND expires_at > NOW()
UNION ALL
SELECT
  'Failed Login Attempts (24h)',
  COUNT(*)::FLOAT,
  'attempts'
FROM authentication_events
WHERE success = FALSE AND timestamp > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT
  'Locked Accounts',
  COUNT(*)::FLOAT,
  'accounts'
FROM account_lockouts
WHERE locked_until > NOW() AND unlocked_at IS NULL;

-- Grant permissions
GRANT SELECT ON mfa_secrets TO authenticated;
GRANT SELECT ON mfa_verification_attempts TO authenticated;
GRANT SELECT ON trusted_devices TO authenticated;
GRANT SELECT ON user_sessions TO authenticated;
GRANT SELECT ON user_security_settings TO authenticated;
GRANT SELECT ON security_compliance_status TO authenticated;

-- RLS policies
ALTER TABLE mfa_secrets ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid conflicts
DROP POLICY IF EXISTS mfa_secrets_own_access ON mfa_secrets;

CREATE POLICY mfa_secrets_own_access ON mfa_secrets
  FOR ALL
  USING (user_id = (SELECT auth.uid()));

ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid conflicts
DROP POLICY IF EXISTS trusted_devices_own_access ON trusted_devices;

CREATE POLICY trusted_devices_own_access ON trusted_devices
  FOR ALL
  USING (user_id = (SELECT auth.uid()));

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid conflicts
DROP POLICY IF EXISTS user_sessions_own_access ON user_sessions;

CREATE POLICY user_sessions_own_access ON user_sessions
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid conflicts
DROP POLICY IF EXISTS user_security_settings_own_access ON user_security_settings;

CREATE POLICY user_security_settings_own_access ON user_security_settings
  FOR ALL
  USING (user_id = (SELECT auth.uid()));

-- Comments
COMMENT ON TABLE mfa_secrets IS 'MFA secrets and backup codes for two-factor authentication';
COMMENT ON TABLE mfa_verification_attempts IS 'Log of all MFA verification attempts';
COMMENT ON TABLE trusted_devices IS 'Devices trusted for reduced MFA requirements';
COMMENT ON TABLE user_sessions IS 'Active user sessions with inactivity tracking';
COMMENT ON TABLE password_history IS 'Password history to prevent reuse';
COMMENT ON TABLE ip_whitelist IS 'IP whitelist for admin and privileged access';
COMMENT ON TABLE user_security_settings IS 'Per-user security configuration';
