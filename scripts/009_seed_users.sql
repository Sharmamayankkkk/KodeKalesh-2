-- Updated to use Supabase auth UUID format and removed password field (managed by Supabase Auth)
-- Insert user profiles that link to Supabase Auth users
-- Note: These UUIDs must match the auth.users table created via Supabase Auth
INSERT INTO public.users (id, email, full_name, role, status, department, phone, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'admin@healthpulse.com', 'Sarah Anderson', 'admin', 'active', 'Administration', '+1-555-0001', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'dr.smith@healthpulse.com', 'Dr. James Smith', 'doctor', 'active', 'Cardiology', '+1-555-0002', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'dr.patel@healthpulse.com', 'Dr. Priya Patel', 'doctor', 'active', 'Internal Medicine', '+1-555-0003', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 'nurse.williams@healthpulse.com', 'Maria Williams', 'nurse', 'active', 'Nursing', '+1-555-0004', NOW()),
  ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'lab.chen@healthpulse.com', 'David Chen', 'lab_technician', 'active', 'Laboratory', '+1-555-0005', NOW()),
  ('550e8400-e29b-41d4-a716-446655440006'::UUID, 'pharm.garcia@healthpulse.com', 'Carlos Garcia', 'pharmacist', 'active', 'Pharmacy', '+1-555-0006', NOW()),
  ('550e8400-e29b-41d4-a716-446655440007'::UUID, 'reception@healthpulse.com', 'Jennifer Lee', 'receptionist', 'active', 'Front Desk', '+1-555-0007', NOW()),
  ('550e8400-e29b-41d4-a716-446655440008'::UUID, 'nurse.johnson@healthpulse.com', 'Robert Johnson', 'nurse', 'active', 'Nursing', '+1-555-0008', NOW())
ON CONFLICT (id) DO NOTHING;

-- Password for all demo accounts: Password123!