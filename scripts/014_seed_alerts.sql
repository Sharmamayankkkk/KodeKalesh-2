-- Seed clinical alerts with various severity levels
INSERT INTO public.alerts (patient_id, alert_type, severity, title, description, triggered_by, assigned_to_id, status, acknowledged_at, acknowledged_by_id, resolved_at, resolution_notes, created_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'vital_threshold', 'critical', 'Critical BP Level', 'Systolic BP 162 mmHg - stage 2 hypertension', 'vital_signs', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'open', NULL, NULL, NULL, NULL, NOW()),
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'lab_abnormal', 'high', 'Elevated A1C', 'Hemoglobin A1C 8.2% - suboptimal glucose control', 'lab_results', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 day'),
  ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'vital_threshold', 'medium', 'Respiratory Changes', 'SpO2 98%, RR normal - asthma stable', 'vital_signs', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days'),
  ('650e8400-e29b-41d4-a716-446655440003'::UUID, 'lab_abnormal', 'critical', 'Elevated Cardiac Markers', 'BNP 425, Troponin 0.08 - heart failure decompensation', 'lab_results', '550e8400-e29b-41d4-a716-446655440003'::UUID, 'acknowledged', NOW() - INTERVAL '8 hours', '550e8400-e29b-41d4-a716-446655440003'::UUID, NULL, NULL, NOW() - INTERVAL '4 hours'),
  ('650e8400-e29b-41d4-a716-446655440003'::UUID, 'vital_threshold', 'high', 'Hemodynamic Instability', 'Systolic BP 158, HR 88, RR 24 - progressive HF symptoms', 'vital_signs', '550e8400-e29b-41d4-a716-446655440003'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'lab_abnormal', 'medium', 'Early Nephropathy', 'Urine microalbumin 45 mg/24h - diabetic nephropathy early stage', 'lab_results', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'resolved', NOW() - INTERVAL '10 days', '550e8400-e29b-41d4-a716-446655440002'::UUID, NOW() - INTERVAL '8 days', 'Started ACE inhibitor', NOW() - INTERVAL '18 days')
ON CONFLICT DO NOTHING;

-- High-risk alerts
('alert-001', 'pat-001', 'elevated_glucose', 'critical', 'Critical hyperglycemia detected', 'glucose_monitor', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'open', NULL, NULL, NOW() - INTERVAL '2 hours'),
('alert-002', 'pat-001', 'medication_needed', 'high', 'Blood glucose trending upward for 7 days. A1C 8.2%', 'ai_analysis', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'open', NULL, NULL, NOW() - INTERVAL '1 hour'),

-- Cardiac alerts
('alert-003', 'pat-003', 'cardiac_risk', 'critical', 'BNP 1250, NT-proBNP significantly elevated. Heart failure decompensation likely', 'vital_signs', '550e8400-e29b-41d4-a716-446655440003'::UUID, 'acknowledged', NOW() - INTERVAL '30 minutes', '550e8400-e29b-41d4-a716-446655440003'::UUID, NULL, NOW() - INTERVAL '4 hours'),
('alert-004', 'pat-003', 'hemodynamic_instability', 'high', 'Systolic BP 158, HR 88, RR 24 - Progressive HF symptoms', 'vital_analysis', '550e8400-e29b-41d4-a716-446655440003'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),

-- Respiratory alerts
('alert-005', 'pat-002', 'respiratory_decline', 'moderate', 'SpO2 93%, RR 20 - Possible asthma exacerbation', 'vital_signs', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '8 hours'),

-- Medication alerts
('alert-006', 'pat-002', 'medication_refill', 'low', 'Albuterol inhaler refill needed', 'prescription_system', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'acknowledged', NOW() - INTERVAL '5 days', '550e8400-e29b-41d4-a716-446655440002'::UUID, NULL, NULL, NOW() - INTERVAL '6 days'),

-- Lab result alerts
('alert-007', 'pat-001', 'abnormal_lab', 'high', 'Urine microalbumin 45 mg/24h - Diabetic nephropathy early stage', 'lab_results', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '18 days'),

-- Resolved alerts
('alert-008', 'pat-004', 'medication_reminder', 'low', 'Levothyroxine refill reminder', 'reminder_system', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'resolved', NOW() - INTERVAL '10 days', '550e8400-e29b-41d4-a716-446655440002'::UUID, NOW() - INTERVAL '8 days', NULL, NOW() - INTERVAL '12 days');
