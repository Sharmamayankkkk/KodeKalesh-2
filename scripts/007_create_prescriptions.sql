-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL, -- "500mg", "2 tablets", etc.
  frequency TEXT NOT NULL, -- "twice daily", "every 8 hours", etc.
  route TEXT NOT NULL, -- oral, intravenous, intramuscular, topical
  start_date DATE NOT NULL,
  end_date DATE,
  indication TEXT, -- Reason for prescription
  refills_remaining INTEGER,
  prescribed_by_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT DEFAULT 'active', -- active, completed, discontinued
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prescriptions_select" ON public.prescriptions 
  FOR SELECT USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR auth.uid() = prescribed_by_id
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "prescriptions_insert" ON public.prescriptions 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'admin'));

CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
