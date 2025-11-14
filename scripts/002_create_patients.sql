-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn TEXT NOT NULL UNIQUE, -- Medical Record Number
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL, -- M, F, O
  blood_type TEXT, -- A+, A-, B+, B-, AB+, AB-, O+, O-
  allergies TEXT[], -- Array of allergy strings
  medications TEXT[], -- Current medications
  chronic_conditions TEXT[], -- Chronic conditions
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  insurance_provider TEXT,
  insurance_member_id TEXT,
  primary_physician_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'active', -- active, inactive, discharged
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_select_own_physician" ON public.patients 
  FOR SELECT USING (auth.uid() = primary_physician_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "patients_insert_physicians" ON public.patients 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'admin'));

CREATE POLICY "patients_update_own_physician" ON public.patients 
  FOR UPDATE USING (auth.uid() = primary_physician_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE INDEX idx_patients_primary_physician ON public.patients(primary_physician_id);
CREATE INDEX idx_patients_mrn ON public.patients(mrn);
