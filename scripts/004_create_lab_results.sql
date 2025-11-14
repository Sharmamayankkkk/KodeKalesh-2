-- Lab Results table
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL, -- Blood work, Urinalysis, CT Scan, etc.
  test_category TEXT NOT NULL, -- hematology, chemistry, microbiology, imaging
  result TEXT, -- Textual result
  result_value DECIMAL(10,2), -- Numeric result if applicable
  unit TEXT, -- mg/dL, mmol/L, etc.
  reference_range TEXT, -- Normal range
  status TEXT DEFAULT 'normal', -- normal, abnormal, critical
  lab_id UUID REFERENCES public.users(id), -- Lab technician who recorded it
  ordered_by_id UUID NOT NULL REFERENCES public.users(id), -- Doctor who ordered it
  ordered_at TIMESTAMPTZ NOT NULL,
  result_at TIMESTAMPTZ,
  notes TEXT,
  file_url TEXT, -- URL to lab report PDF if applicable
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab_results_select" ON public.lab_results 
  FOR SELECT USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('lab_technician', 'admin')
  );

CREATE POLICY "lab_results_insert" ON public.lab_results 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'lab_technician', 'admin'));

CREATE INDEX idx_lab_results_patient ON public.lab_results(patient_id);
CREATE INDEX idx_lab_results_status ON public.lab_results(status);
CREATE INDEX idx_lab_results_ordered_at ON public.lab_results(ordered_at DESC);
