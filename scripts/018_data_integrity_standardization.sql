-- Data Integrity and Standardization Enhancement
-- This migration adds data source tracking and unit standardization

-- Add data source tracking to vital_signs table
ALTER TABLE public.vital_signs
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'patient_app', 'wearable', 'medical_device', 'ehr_import')),
  ADD COLUMN IF NOT EXISTS verified_by_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS temperature_unit TEXT DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
  ADD COLUMN IF NOT EXISTS height_unit TEXT DEFAULT 'cm' CHECK (height_unit IN ('cm', 'inches'));

-- Add standardized values columns (always store in standard units)
ALTER TABLE public.vital_signs
  ADD COLUMN IF NOT EXISTS temperature_celsius DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN temperature_unit = 'fahrenheit' THEN ROUND(((temperature - 32) * 5 / 9)::numeric, 2)
      ELSE temperature
    END
  ) STORED,
  ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(7,2) GENERATED ALWAYS AS (
    CASE 
      WHEN weight_unit = 'lbs' THEN ROUND((weight * 0.453592)::numeric, 2)
      ELSE weight
    END
  ) STORED,
  ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN height_unit = 'inches' THEN ROUND((height * 2.54)::numeric, 2)
      ELSE height
    END
  ) STORED;

-- Create index on data source and verification status
CREATE INDEX IF NOT EXISTS idx_vital_signs_data_source ON public.vital_signs(data_source);
CREATE INDEX IF NOT EXISTS idx_vital_signs_is_verified ON public.vital_signs(is_verified);

-- Add data source tracking to lab_results table
ALTER TABLE public.lab_results
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'lab_system', 'ehr_import', 'external_lab')),
  ADD COLUMN IF NOT EXISTS verified_by_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS result_unit_standardized TEXT; -- Standardized unit after conversion

-- Create a lookup table for common lab test units and their standard conversions
CREATE TABLE IF NOT EXISTS public.lab_unit_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  from_unit TEXT NOT NULL,
  to_unit TEXT NOT NULL,
  conversion_factor DECIMAL(20,10) NOT NULL,
  conversion_offset DECIMAL(20,10) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_name, from_unit, to_unit)
);

ALTER TABLE public.lab_unit_conversions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read unit conversions
CREATE POLICY "lab_unit_conversions_select" ON public.lab_unit_conversions 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage unit conversions
CREATE POLICY "lab_unit_conversions_insert" ON public.lab_unit_conversions 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "lab_unit_conversions_update" ON public.lab_unit_conversions 
  FOR UPDATE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "lab_unit_conversions_delete" ON public.lab_unit_conversions 
  FOR DELETE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Insert common lab unit conversions
INSERT INTO public.lab_unit_conversions (test_name, from_unit, to_unit, conversion_factor, conversion_offset) VALUES
  -- Glucose conversions
  ('Glucose', 'mg/dL', 'mmol/L', 0.0555, 0),
  ('Glucose', 'mmol/L', 'mg/dL', 18.0182, 0),
  
  -- Cholesterol conversions
  ('Total Cholesterol', 'mg/dL', 'mmol/L', 0.0259, 0),
  ('Total Cholesterol', 'mmol/L', 'mg/dL', 38.67, 0),
  ('LDL Cholesterol', 'mg/dL', 'mmol/L', 0.0259, 0),
  ('LDL Cholesterol', 'mmol/L', 'mg/dL', 38.67, 0),
  ('HDL Cholesterol', 'mg/dL', 'mmol/L', 0.0259, 0),
  ('HDL Cholesterol', 'mmol/L', 'mg/dL', 38.67, 0),
  
  -- Hemoglobin conversions
  ('Hemoglobin', 'g/dL', 'g/L', 10, 0),
  ('Hemoglobin', 'g/L', 'g/dL', 0.1, 0),
  
  -- Creatinine conversions
  ('Creatinine', 'mg/dL', 'μmol/L', 88.42, 0),
  ('Creatinine', 'μmol/L', 'mg/dL', 0.0113, 0)
ON CONFLICT (test_name, from_unit, to_unit) DO NOTHING;

-- Add validation metadata to patients table
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS data_quality_score DECIMAL(3,2) DEFAULT 1.00 CHECK (data_quality_score >= 0 AND data_quality_score <= 1),
  ADD COLUMN IF NOT EXISTS last_data_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_reviewed_by_id UUID REFERENCES public.users(id);

-- Function to calculate data quality score based on verification status
CREATE OR REPLACE FUNCTION public.calculate_patient_data_quality(patient_uuid UUID)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
AS $$
DECLARE
  total_vitals INTEGER;
  verified_vitals INTEGER;
  total_labs INTEGER;
  verified_labs INTEGER;
  quality_score DECIMAL(3,2);
BEGIN
  -- Count total and verified vital signs (last 30 days)
  SELECT COUNT(*), SUM(CASE WHEN is_verified THEN 1 ELSE 0 END)
  INTO total_vitals, verified_vitals
  FROM public.vital_signs
  WHERE patient_id = patient_uuid
    AND measured_at > NOW() - INTERVAL '30 days';
  
  -- Count total and verified lab results (last 90 days)
  SELECT COUNT(*), SUM(CASE WHEN is_verified THEN 1 ELSE 0 END)
  INTO total_labs, verified_labs
  FROM public.lab_results
  WHERE patient_id = patient_uuid
    AND ordered_at > NOW() - INTERVAL '90 days';
  
  -- Calculate quality score
  IF (total_vitals + total_labs) = 0 THEN
    quality_score := 1.00; -- No data yet
  ELSE
    quality_score := ROUND(
      (COALESCE(verified_vitals, 0) + COALESCE(verified_labs, 0))::DECIMAL / 
      (total_vitals + total_labs)::DECIMAL, 
      2
    );
  END IF;
  
  RETURN COALESCE(quality_score, 1.00);
END;
$$;

-- Create a view for data quality dashboard
CREATE OR REPLACE VIEW public.patient_data_quality AS
SELECT 
  p.id,
  p.mrn,
  p.first_name,
  p.last_name,
  p.data_quality_score,
  p.last_data_review_at,
  p.last_reviewed_by_id,
  COUNT(DISTINCT vs.id) FILTER (WHERE vs.measured_at > NOW() - INTERVAL '30 days') as recent_vital_count,
  COUNT(DISTINCT vs.id) FILTER (WHERE vs.is_verified AND vs.measured_at > NOW() - INTERVAL '30 days') as verified_vital_count,
  COUNT(DISTINCT lr.id) FILTER (WHERE lr.ordered_at > NOW() - INTERVAL '90 days') as recent_lab_count,
  COUNT(DISTINCT lr.id) FILTER (WHERE lr.is_verified AND lr.ordered_at > NOW() - INTERVAL '90 days') as verified_lab_count,
  u.full_name as primary_physician_name
FROM public.patients p
LEFT JOIN public.vital_signs vs ON vs.patient_id = p.id
LEFT JOIN public.lab_results lr ON lr.patient_id = p.id
LEFT JOIN public.users u ON u.id = p.primary_physician_id
GROUP BY p.id, p.mrn, p.first_name, p.last_name, p.data_quality_score, 
         p.last_data_review_at, p.last_reviewed_by_id, u.full_name;

-- Function to mark vital signs as verified
CREATE OR REPLACE FUNCTION public.verify_vital_signs(vital_signs_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  -- Only doctors and nurses can verify vital signs
  IF user_role NOT IN ('doctor', 'nurse', 'admin') THEN
    RAISE EXCEPTION 'Only doctors, nurses, and admins can verify vital signs';
  END IF;
  
  -- Update the vital signs record
  UPDATE public.vital_signs
  SET is_verified = TRUE,
      verified_by_id = auth.uid(),
      verified_at = NOW()
  WHERE id = vital_signs_id;
  
  RETURN TRUE;
END;
$$;

-- Function to mark lab results as verified
CREATE OR REPLACE FUNCTION public.verify_lab_result(lab_result_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  -- Only doctors and lab technicians can verify lab results
  IF user_role NOT IN ('doctor', 'lab_technician', 'admin') THEN
    RAISE EXCEPTION 'Only doctors, lab technicians, and admins can verify lab results';
  END IF;
  
  -- Update the lab result record
  UPDATE public.lab_results
  SET is_verified = TRUE,
      verified_by_id = auth.uid(),
      verified_at = NOW()
  WHERE id = lab_result_id;
  
  RETURN TRUE;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_lab_results_data_source ON public.lab_results(data_source);
CREATE INDEX IF NOT EXISTS idx_lab_results_is_verified ON public.lab_results(is_verified);
