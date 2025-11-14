-- Vital Signs/Measurements table
CREATE TABLE IF NOT EXISTS public.vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ NOT NULL,
  temperature DECIMAL(5,2), -- Celsius
  systolic_bp INTEGER, -- Systolic blood pressure
  diastolic_bp INTEGER, -- Diastolic blood pressure
  heart_rate INTEGER, -- bpm
  respiratory_rate INTEGER, -- breaths per minute
  oxygen_saturation DECIMAL(5,2), -- SpO2 %
  weight DECIMAL(7,2), -- kg
  height DECIMAL(5,2), -- cm
  bmi DECIMAL(5,2), -- Calculated
  notes TEXT,
  recorded_by_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vital_signs_select" ON public.vital_signs 
  FOR SELECT USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "vital_signs_insert" ON public.vital_signs 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('nurse', 'doctor', 'admin'));

CREATE INDEX idx_vital_signs_patient ON public.vital_signs(patient_id);
CREATE INDEX idx_vital_signs_measured_at ON public.vital_signs(measured_at DESC);
