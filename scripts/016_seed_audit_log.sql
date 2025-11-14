-- Updated to use audit_log table (not audit_logs) with correct schema
INSERT INTO public.audit_log (user_id, action, table_name, record_id, changes, ip_address, user_agent, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'create', 'patients', '650e8400-e29b-41d4-a716-446655440001'::UUID, '{"mrn": "MRN001", "first_name": "John", "last_name": "Anderson"}'::JSONB, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '30 days'),
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 'create', 'vital_signs', NULL, '{"temperature": 98.5, "systolic_bp": 162}'::JSONB, '192.168.1.101', 'Mozilla/5.0', NOW()),
  ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'create', 'lab_results', NULL, '{"test_name": "Hemoglobin A1C", "result_value": 8.2}'::JSONB, '192.168.1.102', 'Mozilla/5.0', NOW() - INTERVAL '20 days'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'update', 'alerts', NULL, '{"status": "acknowledged"}'::JSONB, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '8 hours'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'create', 'visits', NULL, '{"visit_type": "routine", "diagnosis": "Type 2 Diabetes"}'::JSONB, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '15 days'),
  ('550e8400-e29b-41d4-a716-446655440006'::UUID, 'update', 'prescriptions', NULL, '{"status": "filled"}'::JSONB, '192.168.1.103', 'Mozilla/5.0', NOW() - INTERVAL '8 days'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'read', 'patients', '650e8400-e29b-41d4-a716-446655440001'::UUID, '{"patient_id": "650e8400-e29b-41d4-a716-446655440001"}'::JSONB, '192.168.1.102', 'Mozilla/5.0', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
