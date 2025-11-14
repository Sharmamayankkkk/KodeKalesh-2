-- ============================================================================
-- DATABASE OPTIMIZATION: INDEXING, PARTITIONING, AND PERFORMANCE
-- Implements production-grade database optimization strategies
-- ============================================================================

ALTER TABLE public.vital_signs ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.vital_signs ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.vital_signs ADD COLUMN IF NOT EXISTS verified_by_id UUID REFERENCES public.users(id);

-- ============================================================================
-- 1. ADVANCED INDEXING STRATEGY
-- ============================================================================

-- Covering indexes for common queries (includes frequently accessed columns)
CREATE INDEX IF NOT EXISTS idx_vitals_patient_date_covering 
  ON vital_signs(patient_id, measured_at DESC)
  INCLUDE (temperature, heart_rate, systolic_bp, diastolic_bp, 
           respiratory_rate, oxygen_saturation);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient_date_covering
  ON lab_results(patient_id, result_at DESC)
  INCLUDE (test_name, result_value, unit, reference_range, status);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_active
  ON prescriptions(patient_id, start_date DESC)
  INCLUDE (medication_name, dosage, frequency, status)
  WHERE status = 'active';

-- Partial indexes for frequently queried subsets
CREATE INDEX IF NOT EXISTS idx_active_alerts
  ON alerts(created_at DESC, patient_id, severity)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_unverified_data
  ON vital_signs(patient_id, measured_at DESC)
  WHERE is_verified = FALSE;

-- GIN indexes for JSON/array columns
CREATE INDEX IF NOT EXISTS idx_audit_changes_gin
  ON audit_logs USING GIN(new_values);


-- Hash indexes for equality lookups
CREATE INDEX IF NOT EXISTS idx_users_email_hash
  ON users USING HASH(email);


-- ============================================================================
-- 2. TABLE PARTITIONING FOR LARGE TABLES
-- ============================================================================

-- Note: Partitioning existing tables requires table recreation
-- For production use, consider using pg_partman extension for automatic partition management
-- Below is example code for future reference when implementing partitioning:

-- Example: Partition vital_signs by month (declarative partitioning)
-- This would require recreating the table as a partitioned table
-- DO $$ 
-- BEGIN
--   -- Create new partitioned table (only if table doesn't exist or during migration)
--   -- CREATE TABLE vital_signs_partitioned (
--   --   LIKE vital_signs INCLUDING ALL
--   -- ) PARTITION BY RANGE (measured_at);
--   
--   -- Create partitions for current and future months
--   -- CREATE TABLE vital_signs_2024_11 PARTITION OF vital_signs_partitioned
--   --   FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
--   -- CREATE TABLE vital_signs_2024_12 PARTITION OF vital_signs_partitioned
--   --   FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
-- END $$;

-- Similarly for lab_results
-- DO $$
-- BEGIN
--   -- CREATE TABLE lab_results_partitioned (
--   --   LIKE lab_results INCLUDING ALL
--   -- ) PARTITION BY RANGE (result_at);
-- END $$;

-- ============================================================================
-- 3. MATERIALIZED VIEWS FOR COMPLEX QUERIES
-- ============================================================================

-- Patient summary view (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_patient_summary AS
SELECT
  p.id AS patient_id,
  p.first_name,
  p.last_name,
  p.date_of_birth,
  p.gender,
  
  -- Latest vitals
  (SELECT measured_at FROM vital_signs WHERE patient_id = p.id ORDER BY measured_at DESC LIMIT 1) AS last_vitals_date,
  (SELECT temperature FROM vital_signs WHERE patient_id = p.id ORDER BY measured_at DESC LIMIT 1) AS last_temperature,
  (SELECT heart_rate FROM vital_signs WHERE patient_id = p.id ORDER BY measured_at DESC LIMIT 1) AS last_heart_rate,
  (SELECT systolic_bp FROM vital_signs WHERE patient_id = p.id ORDER BY measured_at DESC LIMIT 1) AS last_bp_systolic,
  
  -- Lab results count
  (SELECT COUNT(*) FROM lab_results WHERE patient_id = p.id) AS total_lab_results,
  (SELECT MAX(result_at) FROM lab_results WHERE patient_id = p.id) AS last_lab_date,
  
  -- Active alerts count
  (SELECT COUNT(*) FROM alerts WHERE patient_id = p.id AND status = 'active') AS active_alerts_count,
  
  -- Active prescriptions count
  (SELECT COUNT(*) FROM prescriptions WHERE patient_id = p.id AND status = 'active') AS active_prescriptions_count,
  
  -- Data quality score
  (SELECT data_quality_score FROM patients WHERE id = p.id) AS data_quality_score,
  
  -- Last updated
  NOW() AS summary_updated_at
FROM patients p
WHERE p.status = 'active';

CREATE UNIQUE INDEX ON mv_patient_summary(patient_id);
CREATE INDEX ON mv_patient_summary(last_vitals_date DESC);
CREATE INDEX ON mv_patient_summary(active_alerts_count DESC) WHERE active_alerts_count > 0;

-- Refresh function (call this periodically, e.g., every 5 minutes)
CREATE OR REPLACE FUNCTION refresh_patient_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_patient_summary;
END;
$$ LANGUAGE plpgsql;

-- Alert statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_alert_statistics AS
SELECT
  DATE_TRUNC('day', created_at) AS alert_date,
  severity,
  alert_type,
  COUNT(*) AS alert_count,
  COUNT(DISTINCT patient_id) AS unique_patients,
  AVG(EXTRACT(EPOCH FROM (acknowledged_at - created_at))) AS avg_response_time_seconds
FROM alerts
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at), severity, alert_type;

CREATE INDEX ON mv_alert_statistics(alert_date DESC, severity);

-- ============================================================================
-- 4. QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- Function to get recent patient vitals efficiently
CREATE OR REPLACE FUNCTION get_recent_patient_vitals(
  p_patient_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  measured_at TIMESTAMPTZ,
  temperature NUMERIC,
  heart_rate INTEGER,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.measured_at,
    v.temperature,
    v.heart_rate,
    v.systolic_bp,
    v.diastolic_bp,
    v.respiratory_rate,
    v.oxygen_saturation
  FROM vital_signs v
  WHERE v.patient_id = p_patient_id
    AND v.measured_at > NOW() - (p_days || ' days')::INTERVAL
  ORDER BY v.measured_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get patient alerts with statistics
CREATE OR REPLACE FUNCTION get_patient_alerts_summary(p_patient_id UUID)
RETURNS TABLE (
  total_alerts BIGINT,
  active_alerts BIGINT,
  critical_alerts BIGINT,
  avg_response_time_minutes NUMERIC,
  last_alert_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_alerts,
    COUNT(*) FILTER (WHERE status = 'active') AS active_alerts,
    COUNT(*) FILTER (WHERE severity = 'critical') AS critical_alerts,
    AVG(EXTRACT(EPOCH FROM (acknowledged_at - created_at)) / 60) AS avg_response_time_minutes,
    MAX(created_at) AS last_alert_date
  FROM alerts
  WHERE patient_id = p_patient_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 5. CONNECTION POOLING CONFIGURATION
-- ============================================================================

-- Set optimal connection pool parameters (to be configured in postgresql.conf)
COMMENT ON DATABASE postgres IS 
  'Recommended connection pool settings:
   - max_connections: 200 (adjust based on expected load)
   - shared_buffers: 25% of RAM
   - effective_cache_size: 75% of RAM
   - work_mem: 50MB (for complex queries)
   - maintenance_work_mem: 1GB
   - checkpoint_completion_target: 0.9
   - wal_buffers: 16MB
   - default_statistics_target: 100
   - random_page_cost: 1.1 (for SSD)
   - effective_io_concurrency: 200 (for SSD)
   
   Use PgBouncer for connection pooling:
   - pool_mode: transaction
   - max_client_conn: 1000
   - default_pool_size: 25
   - reserve_pool_size: 5';

-- ============================================================================
-- 6. VACUUMING AND MAINTENANCE
-- ============================================================================

-- Enable autovacuum for better performance
ALTER TABLE vital_signs SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE lab_results SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE audit_logs SET (autovacuum_vacuum_scale_factor = 0.02);

-- ============================================================================
-- 7. PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View to identify slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- View to identify missing indexes
CREATE OR REPLACE VIEW missing_indexes AS
SELECT
  schemaname,
  relname AS tablename,
  seq_scan,
  idx_scan,
  ROUND(100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0), 2) AS seq_scan_pct
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_scan DESC;

-- View to identify index usage
CREATE OR REPLACE VIEW index_usage AS
SELECT
  schemaname,
  relname AS tablename,
  indexrelname AS indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- View to identify table bloat
CREATE OR REPLACE VIEW table_bloat AS
SELECT
  schemaname,
  relname AS tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||relname)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - pg_relation_size(schemaname||'.'||relname)) AS indexes_size,
  n_tup_ins AS inserts,
  n_tup_upd AS updates,
  n_tup_del AS deletes,
  n_live_tup AS live_tuples,
  n_dead_tup AS dead_tuples,
  ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_tuple_pct
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- ============================================================================
-- 8. CACHE WARMING FUNCTIONS
-- ============================================================================

-- Function to warm up frequently accessed data
CREATE OR REPLACE FUNCTION warm_cache()
RETURNS void AS $$
BEGIN
  -- Pre-load recent patient summaries
  PERFORM * FROM mv_patient_summary LIMIT 1000;
  
  -- Pre-load recent vitals
  PERFORM * FROM vital_signs 
  WHERE measured_at > NOW() - INTERVAL '7 days'
  LIMIT 10000;
  
  -- Pre-load active alerts
  PERFORM * FROM alerts WHERE status = 'active';
  
  RAISE NOTICE 'Cache warmed successfully';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. QUERY PLAN ANALYSIS HELPERS
-- ============================================================================

-- Function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_query(p_query TEXT)
RETURNS TABLE (
  query_plan TEXT
) AS $$
BEGIN
  RETURN QUERY EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' || p_query;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. DATABASE STATISTICS UPDATE
-- ============================================================================

-- Function to update table statistics (run after bulk operations)
CREATE OR REPLACE FUNCTION update_statistics()
RETURNS void AS $$
BEGIN
  ANALYZE patients;
  ANALYZE vital_signs;
  ANALYZE lab_results;
  ANALYZE alerts;
  ANALYZE prescriptions;
  ANALYZE audit_logs;
  
  RAISE NOTICE 'Statistics updated for all major tables';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_vitals_patient_date_covering IS 
  'Covering index for patient vitals queries - includes most commonly accessed columns to avoid table lookups';


COMMENT ON MATERIALIZED VIEW mv_patient_summary IS 
  'Pre-computed patient summary data - refresh every 5 minutes for optimal performance. Use REFRESH MATERIALIZED VIEW CONCURRENTLY to avoid blocking reads.';

COMMENT ON FUNCTION refresh_patient_summary IS 
  'Refresh patient summary materialized view. Schedule this to run every 5 minutes via cron or pg_cron extension.';

COMMENT ON VIEW slow_queries IS 
  'Identifies slow queries based on pg_stat_statements. Requires pg_stat_statements extension enabled.';

COMMENT ON VIEW missing_indexes IS 
  'Identifies tables with high sequential scan ratio - candidates for adding indexes';

COMMENT ON FUNCTION warm_cache IS 
  'Warms up database cache with frequently accessed data. Run after database restart or during low-traffic periods.';

-- ============================================================================
-- RECOMMENDATIONS FOR PRODUCTION
-- ============================================================================

/*
PRODUCTION DEPLOYMENT CHECKLIST:

1. Enable pg_stat_statements extension:
   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

2. Enable pg_partman for automatic partition management:
   CREATE EXTENSION IF NOT EXISTS pg_partman;

3. Set up automated jobs:
   - Refresh mv_patient_summary every 5 minutes
   - Run update_statistics() daily during off-peak hours
   - Run VACUUM ANALYZE weekly
   - Monitor slow_queries view daily

4. Configure connection pooling with PgBouncer:
   - Install and configure PgBouncer
   - Set pool_mode = transaction
   - Configure max_client_conn based on expected load

5. Set up read replicas:
   - Configure at least 2 read replicas for reporting queries
   - Route analytical queries to replicas
   - Use connection pooling to distribute load

6. Monitor performance:
   - Set up monitoring for slow_queries
   - Alert on missing_indexes with high seq_scan
   - Monitor table_bloat and schedule VACUUM when needed
   - Track index_usage to identify unused indexes

7. Implement caching layer:
   - Deploy Redis for hot data caching
   - Cache patient summaries (TTL: 5 minutes)
   - Cache AI analysis results (TTL: 1 hour)
   - Cache alert statistics (TTL: 1 minute)

8. Regular maintenance:
   - Weekly VACUUM ANALYZE during low-traffic windows
   - Monthly REINDEX for heavily updated tables
   - Quarterly partition maintenance (archive old partitions)
   - Annual review of index usage and cleanup

9. Backup strategy:
   - Configure automated backups (hourly point-in-time recovery)
   - Test restore procedures monthly
   - Set up cross-region backup replication
   - Document recovery procedures (RTO < 4 hours, RPO < 15 minutes)

10. Performance targets:
    - p95 query latency < 100ms
    - p99 query latency < 500ms
    - Database CPU < 70% average
    - Connection pool saturation < 80%
    - Cache hit ratio > 95%
*/