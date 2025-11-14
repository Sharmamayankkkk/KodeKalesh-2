-- Clinical Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- vital_threshold, lab_abnormal, medication_interaction, allergy_warning, critical_value
  severity TEXT NOT NULL, -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT,
  triggered_by TEXT, -- vital_signs, lab_results, medication, manual
  source_id UUID, -- Reference to vital_signs, lab_results, etc.
  assigned_to_id UUID REFERENCES public.users(id), -- Assigned physician/nurse
  status TEXT DEFAULT 'open', -- open, acknowledged, resolved, dismissed
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_id UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_select" ON public.alerts 
  FOR SELECT USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR auth.uid() = assigned_to_id
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "alerts_insert" ON public.alerts 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "alerts_update" ON public.alerts 
  FOR UPDATE USING (
    auth.uid() = assigned_to_id 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX idx_alerts_patient ON public.alerts(patient_id);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);
