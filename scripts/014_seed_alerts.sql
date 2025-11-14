INSERT INTO public.alerts (
  patient_id, alert_type, severity, title, description,
  triggered_by, assigned_to_id, status, acknowledged_at,
  acknowledged_by_id, resolved_at, resolution_notes, created_at
)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'elevated_glucose', 'critical', 'Critical hyperglycemia detected', 'Glucose 420 mg/dL', 'glucose_monitor', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 hours'),
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'medication_needed', 'high', 'Blood glucose trending upward for 7 days. A1C 8.2%', 'Rising glucose trend', 'ai_analysis', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 hour'),
  ('650e8400-e29b-41d4-a716-446655440003'::UUID, 'cardiac_risk', 'critical', 'BNP 1250, NT-proBNP elevated — likely HF decomp', 'BNP 1250', 'vital_signs', '550e8400-e29b-41d4-a716-446655440003'::UUID, 'acknowledged', NOW() - INTERVAL '30 minutes', '550e8400-e29b-41d4-a716-446655440003'::UUID, NULL, NULL, NOW() - INTERVAL '4 hours'),
  ('650e8400-e29b-41d4-a716-446655440003'::UUID, 'hemodynamic_instability', 'high', 'Systolic BP 158, HR 88, RR 24 - Progressive HF', 'Hemodynamic changes', 'vital_analysis', '550e8400-e29b-41d4-a716-446655440003'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),
  ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'respiratory_decline', 'moderate', 'SpO2 93%, RR 20 - Possible asthma exacerbation', 'Reduced SpO2', 'vital_signs', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '8 hours'),
  ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'medication_refill', 'low', 'Albuterol inhaler refill needed', 'Refill due', 'prescription_system', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'acknowledged', NOW() - INTERVAL '5 days', '550e8400-e29b-41d4-a716-446655440002'::UUID, NULL, NULL, NOW() - INTERVAL '6 days'),
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'abnormal_lab', 'high', 'Urine microalbumin 45 mg/24h - early nephropathy', 'Urine microalbumin 45 mg/24h', 'lab_results', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'open', NULL, NULL, NULL, NULL, NOW() - INTERVAL '18 days'),
  ('650e8400-e29b-41d4-a716-446655440004'::UUID, 'medication_reminder', 'low', 'Levothyroxine refill reminder', 'Refill reminder', 'reminder_system', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'resolved', NOW() - INTERVAL '10 days', '550e8400-e29b-41d4-a716-446655440002'::UUID, NOW() - INTERVAL '8 days', NULL, NOW() - INTERVAL '12 days')
ON CONFLICT DO NOTHING;