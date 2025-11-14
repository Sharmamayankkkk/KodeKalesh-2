-- Seed vital signs data for the past 30 days
-- Patient 1: Diabetic with slightly elevated BP and glucose
INSERT INTO public.vital_signs (patient_id, measured_at, temperature, systolic_bp, diastolic_bp, heart_rate, respiratory_rate, oxygen_saturation, weight, height, bmi, notes, recorded_by_id, created_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, NOW() - INTERVAL '28 days', 98.2, 148, 92, 72, 16, 98.0, 95.0, 180, 29.3, 'Initial reading', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW() - INTERVAL '28 days'),
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, NOW() - INTERVAL '21 days', 98.4, 152, 94, 75, 17, 97.5, 95.2, 180, 29.4, 'BP slightly elevated', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW() - INTERVAL '21 days'),
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, NOW() - INTERVAL '14 days', 98.1, 155, 95, 78, 18, 97.0, 95.5, 180, 29.5, 'BP trending up', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW() - INTERVAL '14 days'),
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, NOW() - INTERVAL '7 days', 98.3, 158, 96, 81, 19, 96.5, 95.7, 180, 29.6, 'Alert: BP >155 systolic', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW() - INTERVAL '7 days'),
  ('650e8400-e29b-41d4-a716-446655440001'::UUID, NOW(), 98.5, 162, 98, 84, 20, 96.0, 96.0, 180, 29.6, 'Critical: continuing trend', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW()),
  ('650e8400-e29b-41d4-a716-446655440002'::UUID, NOW() - INTERVAL '25 days', 98.0, 118, 76, 68, 14, 99.0, 62.0, 168, 22.0, 'Stable', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW() - INTERVAL '25 days'),
  ('650e8400-e29b-41d4-a716-446655440002'::UUID, NOW() - INTERVAL '18 days', 98.2, 120, 78, 70, 15, 98.5, 62.0, 168, 22.0, 'Post-exercise', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW() - INTERVAL '18 days'),
  ('650e8400-e29b-41d4-a716-446655440002'::UUID, NOW() - INTERVAL '11 days', 98.1, 122, 79, 72, 16, 98.0, 62.1, 168, 22.0, 'Normal', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW() - INTERVAL '11 days'),
  ('650e8400-e29b-41d4-a716-446655440003'::UUID, NOW() - INTERVAL '26 days', 98.6, 142, 88, 62, 16, 94.0, 85.0, 180, 26.2, 'Stable', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW() - INTERVAL '26 days'),
  ('650e8400-e29b-41d4-a716-446655440003'::UUID, NOW(), 99.2, 158, 97, 88, 24, 85.0, 87.0, 180, 26.8, 'ALERT: Decompensation likely', '550e8400-e29b-41d4-a716-446655440004'::UUID, NOW())
ON CONFLICT DO NOTHING;
