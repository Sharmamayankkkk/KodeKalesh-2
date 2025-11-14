-- Audit Log table for compliance
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL, -- create, read, update, delete
  table_name TEXT NOT NULL,
  record_id UUID,
  changes JSONB, -- JSON of what changed
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_admin" ON public.audit_log 
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
