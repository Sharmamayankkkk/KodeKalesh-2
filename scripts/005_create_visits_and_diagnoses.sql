-- Clinical Visits table
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_type TEXT NOT NULL, -- routine, emergency, follow_up, consultation
  chief_complaint TEXT,
  clinical_notes TEXT,
  diagnosis TEXT[],
  treatment_plan TEXT,
  medications_prescribed TEXT[],
  referrals TEXT[], -- Array of specialist referrals
  follow_up_date DATE,
  physician_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT DEFAULT 'completed', -- scheduled, in_progress, completed, cancelled
  visit_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visits_select" ON public.visits 
  FOR SELECT USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR auth.uid() = physician_id
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "visits_insert" ON public.visits 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'admin'));

CREATE INDEX idx_visits_patient ON public.visits(patient_id);
CREATE INDEX idx_visits_physician ON public.visits(physician_id);
CREATE INDEX idx_visits_visit_date ON public.visits(visit_date DESC);
