-- Lifestyle Data Model Extension
-- This migration adds tables for tracking lifestyle factors

-- Daily Activity table
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  steps INTEGER,
  active_minutes INTEGER, -- Minutes of moderate to vigorous activity
  sedentary_minutes INTEGER,
  calories_burned INTEGER,
  distance_km DECIMAL(7,2), -- Distance in kilometers
  floors_climbed INTEGER,
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'wearable', 'patient_app')),
  device_name TEXT, -- e.g., "Fitbit Charge 5", "Apple Watch Series 8"
  synced_at TIMESTAMPTZ,
  notes TEXT,
  recorded_by_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, activity_date)
);

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_activity_select" ON public.daily_activity 
  FOR SELECT USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('nurse', 'admin')
  );

CREATE POLICY "daily_activity_insert" ON public.daily_activity 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "daily_activity_update" ON public.daily_activity 
  FOR UPDATE USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('nurse', 'admin')
  );

CREATE INDEX idx_daily_activity_patient ON public.daily_activity(patient_id);
CREATE INDEX idx_daily_activity_date ON public.daily_activity(activity_date DESC);
CREATE INDEX idx_daily_activity_data_source ON public.daily_activity(data_source);

-- Nutrition Log table
CREATE TABLE IF NOT EXISTS public.nutrition_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_time TIME,
  total_calories INTEGER,
  protein_grams DECIMAL(7,2),
  carbohydrates_grams DECIMAL(7,2),
  fat_grams DECIMAL(7,2),
  fiber_grams DECIMAL(7,2),
  sugar_grams DECIMAL(7,2),
  sodium_mg DECIMAL(7,2),
  water_ml INTEGER, -- Daily water intake in ml
  meal_description TEXT,
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'patient_app', 'nutrition_tracker')),
  app_name TEXT, -- e.g., "MyFitnessPal", "Lose It!"
  notes TEXT,
  recorded_by_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nutrition_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutrition_log_select" ON public.nutrition_log 
  FOR SELECT USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('nurse', 'admin')
  );

CREATE POLICY "nutrition_log_insert" ON public.nutrition_log 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "nutrition_log_update" ON public.nutrition_log 
  FOR UPDATE USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('nurse', 'admin')
  );

CREATE INDEX idx_nutrition_log_patient ON public.nutrition_log(patient_id);
CREATE INDEX idx_nutrition_log_date ON public.nutrition_log(log_date DESC);
CREATE INDEX idx_nutrition_log_meal_type ON public.nutrition_log(meal_type);

-- Sleep Records table
CREATE TABLE IF NOT EXISTS public.sleep_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL, -- Date when sleep ended (morning)
  bedtime TIMESTAMPTZ NOT NULL, -- When went to bed
  wake_time TIMESTAMPTZ NOT NULL, -- When woke up
  total_sleep_minutes INTEGER, -- Total sleep time
  deep_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  sleep_quality_score INTEGER CHECK (sleep_quality_score >= 1 AND sleep_quality_score <= 10), -- 1-10 scale
  sleep_interruptions INTEGER, -- Number of times woken up
  notes TEXT, -- Sleep quality notes, dreams, etc.
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'wearable', 'patient_app', 'sleep_tracker')),
  device_name TEXT, -- e.g., "Oura Ring", "Fitbit"
  synced_at TIMESTAMPTZ,
  recorded_by_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, sleep_date)
);

ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sleep_records_select" ON public.sleep_records 
  FOR SELECT USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('nurse', 'admin')
  );

CREATE POLICY "sleep_records_insert" ON public.sleep_records 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "sleep_records_update" ON public.sleep_records 
  FOR UPDATE USING (
    (SELECT auth.uid() = primary_physician_id FROM public.patients WHERE id = patient_id) 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('nurse', 'admin')
  );

CREATE INDEX idx_sleep_records_patient ON public.sleep_records(patient_id);
CREATE INDEX idx_sleep_records_date ON public.sleep_records(sleep_date DESC);
CREATE INDEX idx_sleep_records_data_source ON public.sleep_records(data_source);

-- Create a comprehensive lifestyle summary view
CREATE OR REPLACE VIEW public.patient_lifestyle_summary AS
SELECT 
  p.id as patient_id,
  p.mrn,
  p.first_name,
  p.last_name,
  -- Activity metrics (last 7 days)
  ROUND(AVG(da.steps)) as avg_daily_steps_7d,
  ROUND(AVG(da.active_minutes)) as avg_active_minutes_7d,
  ROUND(AVG(da.calories_burned)) as avg_calories_burned_7d,
  -- Nutrition metrics (last 7 days)
  ROUND(AVG(nl_daily.total_calories)) as avg_daily_calories_7d,
  ROUND(AVG(nl_daily.protein_grams), 1) as avg_daily_protein_7d,
  ROUND(AVG(nl_daily.carbohydrates_grams), 1) as avg_daily_carbs_7d,
  ROUND(AVG(nl_daily.fat_grams), 1) as avg_daily_fat_7d,
  -- Sleep metrics (last 7 days)
  ROUND(AVG(sr.total_sleep_minutes)) as avg_sleep_minutes_7d,
  ROUND(AVG(sr.sleep_quality_score), 1) as avg_sleep_quality_7d,
  ROUND(AVG(sr.sleep_interruptions)) as avg_sleep_interruptions_7d,
  -- Data completeness
  COUNT(DISTINCT da.activity_date) as activity_days_logged_7d,
  COUNT(DISTINCT sr.sleep_date) as sleep_days_logged_7d,
  COUNT(DISTINCT nl_daily.log_date) as nutrition_days_logged_7d,
  -- Last update timestamps
  MAX(da.updated_at) as last_activity_update,
  MAX(sr.updated_at) as last_sleep_update,
  MAX(nl_daily.max_updated) as last_nutrition_update
FROM public.patients p
LEFT JOIN public.daily_activity da ON da.patient_id = p.id 
  AND da.activity_date > CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN (
  SELECT 
    patient_id,
    log_date,
    SUM(total_calories) as total_calories,
    SUM(protein_grams) as protein_grams,
    SUM(carbohydrates_grams) as carbohydrates_grams,
    SUM(fat_grams) as fat_grams,
    MAX(updated_at) as max_updated
  FROM public.nutrition_log
  WHERE log_date > CURRENT_DATE - INTERVAL '7 days'
  GROUP BY patient_id, log_date
) nl_daily ON nl_daily.patient_id = p.id
LEFT JOIN public.sleep_records sr ON sr.patient_id = p.id 
  AND sr.sleep_date > CURRENT_DATE - INTERVAL '7 days'
GROUP BY p.id, p.mrn, p.first_name, p.last_name;

-- Create function to get lifestyle insights for AI analysis
CREATE OR REPLACE FUNCTION public.get_patient_lifestyle_data(patient_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  lifestyle_data JSON;
BEGIN
  SELECT json_build_object(
    'activity', (
      SELECT json_agg(json_build_object(
        'date', activity_date,
        'steps', steps,
        'active_minutes', active_minutes,
        'calories_burned', calories_burned,
        'data_source', data_source
      ))
      FROM public.daily_activity
      WHERE patient_id = patient_uuid
        AND activity_date > CURRENT_DATE - days_back
      ORDER BY activity_date DESC
    ),
    'nutrition', (
      SELECT json_agg(json_build_object(
        'date', log_date,
        'meal_type', meal_type,
        'calories', total_calories,
        'protein', protein_grams,
        'carbs', carbohydrates_grams,
        'fat', fat_grams,
        'data_source', data_source
      ))
      FROM public.nutrition_log
      WHERE patient_id = patient_uuid
        AND log_date > CURRENT_DATE - days_back
      ORDER BY log_date DESC, meal_time DESC
    ),
    'sleep', (
      SELECT json_agg(json_build_object(
        'date', sleep_date,
        'total_sleep_minutes', total_sleep_minutes,
        'sleep_quality', sleep_quality_score,
        'deep_sleep_minutes', deep_sleep_minutes,
        'interruptions', sleep_interruptions,
        'data_source', data_source
      ))
      FROM public.sleep_records
      WHERE patient_id = patient_uuid
        AND sleep_date > CURRENT_DATE - days_back
      ORDER BY sleep_date DESC
    )
  ) INTO lifestyle_data;
  
  RETURN lifestyle_data;
END;
$$;
