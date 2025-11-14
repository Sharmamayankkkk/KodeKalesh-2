-- ============================================================================
-- CLINICAL GUIDELINES AND RULES ENGINE
-- Implements evidence-based clinical practice guidelines and rule-based alerts
-- ============================================================================

-- ============================================================================
-- 1. CLINICAL GUIDELINES DATABASE
-- ============================================================================

-- Evidence-based clinical guidelines
CREATE TABLE IF NOT EXISTS clinical_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_id TEXT UNIQUE NOT NULL, -- e.g., "AHA_HTN_2024"
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  organization TEXT NOT NULL, -- e.g., "American Heart Association"
  specialty TEXT NOT NULL, -- e.g., "Cardiology"
  condition TEXT NOT NULL, -- e.g., "Hypertension"
  
  -- Publication details
  published_date DATE NOT NULL,
  effective_date DATE NOT NULL,
  review_date DATE,
  superseded_by UUID REFERENCES clinical_guidelines(id),
  
  -- Content
  description TEXT,
  full_text TEXT,
  summary JSONB,
  recommendations JSONB NOT NULL, -- Array of recommendation objects
  
  -- Evidence levels
  evidence_quality TEXT CHECK (evidence_quality IN ('high', 'moderate', 'low', 'very_low')),
  recommendation_strength TEXT CHECK (recommendation_strength IN ('strong', 'conditional', 'weak')),
  
  -- References
  pubmed_ids TEXT[],
  doi TEXT,
  url TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'superseded', 'retired')),
  
  -- Metadata
  tags TEXT[],
  keywords TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guidelines_condition ON clinical_guidelines(condition, status);
CREATE INDEX idx_guidelines_specialty ON clinical_guidelines(specialty, status);
CREATE INDEX idx_guidelines_org ON clinical_guidelines(organization, status);
CREATE INDEX idx_guidelines_published ON clinical_guidelines(published_date DESC);

-- ============================================================================
-- 2. CLINICAL RULES ENGINE
-- ============================================================================

-- Clinical decision rules (rule-based alerts)
CREATE TABLE IF NOT EXISTS clinical_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id TEXT UNIQUE NOT NULL, -- e.g., "SEPSIS_QSOFA"
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., "sepsis_screening", "early_warning", "medication_interaction"
  
  -- Rule definition
  description TEXT NOT NULL,
  condition_logic JSONB NOT NULL, -- Rule conditions in structured format
  action TEXT NOT NULL, -- What to do when rule triggers
  
  -- Alert configuration
  severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  alert_message_template TEXT NOT NULL,
  recommendation_template TEXT,
  
  -- Clinical context
  specialty TEXT[],
  conditions TEXT[], -- ICD-10 or SNOMED CT codes
  age_range INT4RANGE,
  gender TEXT[],
  
  -- Evidence basis
  guideline_id UUID REFERENCES clinical_guidelines(id),
  evidence_level TEXT CHECK (evidence_level IN ('expert_opinion', 'case_series', 'rct', 'meta_analysis')),
  references JSONB, -- PubMed IDs, citations
  
  -- Performance tracking
  sensitivity NUMERIC(5,2), -- Target: 95%+
  specificity NUMERIC(5,2), -- Target: 90%+
  ppv NUMERIC(5,2), -- Positive predictive value
  npv NUMERIC(5,2), -- Negative predictive value
  
  -- Configuration
  enabled BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
  cooldown_period INTERVAL, -- Minimum time between alerts for same patient
  requires_acknowledgment BOOLEAN DEFAULT TRUE,
  escalation_delay INTERVAL, -- Time before escalating if not acknowledged
  
  -- A/B testing
  test_group TEXT, -- For A/B testing rule modifications
  test_start_date DATE,
  test_end_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_rules_category ON clinical_rules(category, enabled);
CREATE INDEX idx_rules_severity ON clinical_rules(severity, enabled);
CREATE INDEX idx_rules_guideline ON clinical_rules(guideline_id);
CREATE INDEX idx_rules_priority ON clinical_rules(priority, enabled);

-- Rule execution history
CREATE TABLE IF NOT EXISTS rule_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES clinical_rules(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  
  -- Execution details
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered BOOLEAN NOT NULL,
  conditions_met JSONB, -- Which conditions were met
  input_data JSONB, -- Data used for evaluation
  
  -- Result
  alert_created UUID REFERENCES alerts(id),
  alert_severity TEXT,
  confidence_score NUMERIC(5,2),
  
  -- Performance tracking
  true_positive BOOLEAN, -- Retrospectively determined
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rule_exec_rule ON rule_executions(rule_id, executed_at DESC);
CREATE INDEX idx_rule_exec_patient ON rule_executions(patient_id, executed_at DESC);
CREATE INDEX idx_rule_exec_triggered ON rule_executions(triggered, executed_at DESC) WHERE triggered = TRUE;

-- ============================================================================
-- 3. SEPSIS SCREENING RULES (qSOFA, SIRS)
-- ============================================================================

-- Quick SOFA (Sepsis-related Organ Failure Assessment)
INSERT INTO clinical_rules (
  rule_id, name, category, description, condition_logic, action,
  severity, alert_message_template, recommendation_template,
  evidence_level, enabled, priority
) VALUES (
  'SEPSIS_QSOFA',
  'Quick SOFA Score ≥2',
  'sepsis_screening',
  'qSOFA score ≥2 indicates high risk of poor outcome in patients with suspected infection',
  '{
    "criteria": [
      {"condition": "respiratory_rate >= 22", "points": 1},
      {"condition": "systolic_bp <= 100", "points": 1},
      {"condition": "altered_mental_status = true", "points": 1}
    ],
    "threshold": 2,
    "operator": "sum_gte"
  }'::JSONB,
  'create_alert',
  'high',
  'qSOFA Score: {{score}}/3. Respiratory rate {{rr}}/min, SBP {{sbp}} mmHg, Altered mental status: {{mental_status}}',
  'Consider: 1) Sepsis workup (blood cultures, lactate), 2) Fluid resuscitation, 3) Broad-spectrum antibiotics if indicated, 4) ICU evaluation',
  'meta_analysis',
  TRUE,
  2
);

-- SIRS Criteria
INSERT INTO clinical_rules (
  rule_id, name, category, description, condition_logic, action,
  severity, alert_message_template, recommendation_template,
  evidence_level, enabled, priority
) VALUES (
  'SEPSIS_SIRS',
  'SIRS Criteria ≥2',
  'sepsis_screening',
  'Systemic Inflammatory Response Syndrome - 2+ criteria met',
  '{
    "criteria": [
      {"condition": "temperature < 36 OR temperature > 38", "points": 1},
      {"condition": "heart_rate > 90", "points": 1},
      {"condition": "respiratory_rate > 20", "points": 1},
      {"condition": "wbc < 4000 OR wbc > 12000", "points": 1}
    ],
    "threshold": 2,
    "operator": "sum_gte"
  }'::JSONB,
  'create_alert',
  'medium',
  'SIRS Criteria: {{score}}/4 met. Temp {{temp}}°C, HR {{hr}} bpm, RR {{rr}}/min, WBC {{wbc}} cells/μL',
  'Monitor for infection source. Consider: 1) Blood cultures if febrile, 2) Source control if indicated, 3) Escalate care if worsening',
  'rct',
  TRUE,
  3
);

-- ============================================================================
-- 4. EARLY WARNING SCORES
-- ============================================================================

-- National Early Warning Score 2 (NEWS2)
INSERT INTO clinical_rules (
  rule_id, name, category, description, condition_logic, action,
  severity, alert_message_template, recommendation_template,
  evidence_level, enabled, priority
) VALUES (
  'EWS_NEWS2',
  'NEWS2 Score ≥5',
  'early_warning',
  'National Early Warning Score 2 - detects clinical deterioration',
  '{
    "scoring": [
      {"parameter": "respiratory_rate", "ranges": [
        {"min": 0, "max": 8, "points": 3},
        {"min": 9, "max": 11, "points": 1},
        {"min": 12, "max": 20, "points": 0},
        {"min": 21, "max": 24, "points": 2},
        {"min": 25, "max": 999, "points": 3}
      ]},
      {"parameter": "oxygen_saturation", "ranges": [
        {"min": 0, "max": 91, "points": 3},
        {"min": 92, "max": 93, "points": 2},
        {"min": 94, "max": 95, "points": 1},
        {"min": 96, "max": 100, "points": 0}
      ]},
      {"parameter": "systolic_bp", "ranges": [
        {"min": 0, "max": 90, "points": 3},
        {"min": 91, "max": 100, "points": 2},
        {"min": 101, "max": 110, "points": 1},
        {"min": 111, "max": 219, "points": 0},
        {"min": 220, "max": 999, "points": 3}
      ]},
      {"parameter": "heart_rate", "ranges": [
        {"min": 0, "max": 40, "points": 3},
        {"min": 41, "max": 50, "points": 1},
        {"min": 51, "max": 90, "points": 0},
        {"min": 91, "max": 110, "points": 1},
        {"min": 111, "max": 130, "points": 2},
        {"min": 131, "max": 999, "points": 3}
      ]},
      {"parameter": "temperature", "ranges": [
        {"min": 0, "max": 35.0, "points": 3},
        {"min": 35.1, "max": 36.0, "points": 1},
        {"min": 36.1, "max": 38.0, "points": 0},
        {"min": 38.1, "max": 39.0, "points": 1},
        {"min": 39.1, "max": 999, "points": 2}
      ]},
      {"parameter": "consciousness", "ranges": [
        {"value": "alert", "points": 0},
        {"value": "confused", "points": 3}
      ]}
    ],
    "thresholds": [
      {"min": 0, "max": 4, "response": "routine_monitoring"},
      {"min": 5, "max": 6, "response": "increase_monitoring"},
      {"min": 7, "max": 999, "response": "urgent_clinical_review"}
    ]
  }'::JSONB,
  'create_alert',
  'high',
  'NEWS2 Score: {{score}}. Clinical response: {{response}}',
  'Action based on score: Score 5-6: Increase monitoring frequency, inform clinician. Score ≥7: Urgent clinical review, consider critical care',
  'rct',
  TRUE,
  1
);

-- ============================================================================
-- 5. CHRONIC DISEASE MANAGEMENT RULES
-- ============================================================================

-- Diabetes - Hyperglycemia Alert
INSERT INTO clinical_rules (
  rule_id, name, category, description, condition_logic, action,
  severity, alert_message_template, recommendation_template,
  evidence_level, enabled, priority
) VALUES (
  'DIABETES_HYPERGLYCEMIA',
  'Severe Hyperglycemia',
  'chronic_disease',
  'Blood glucose >300 mg/dL or >250 mg/dL with ketones',
  '{
    "criteria": [
      {
        "or": [
          {"condition": "glucose_mg_dl > 300"},
          {"and": [
            {"condition": "glucose_mg_dl > 250"},
            {"condition": "ketones = \"positive\""}
          ]}
        ]
      }
    ]
  }'::JSONB,
  'create_alert',
  'high',
  'Glucose: {{glucose}} mg/dL. Ketones: {{ketones}}',
  'Risk of DKA. Recommend: 1) Recheck glucose, 2) Check ketones if not done, 3) Contact patient for insulin adjustment, 4) Hydration counseling, 5) Consider ED if symptoms present',
  'expert_opinion',
  TRUE,
  2
);

-- Hypertension - Critical BP
-- Note: guideline_id will be NULL initially since no guidelines are inserted yet
-- Add guideline reference later after populating clinical_guidelines table
INSERT INTO clinical_rules (
  rule_id, name, category, description, condition_logic, action,
  severity, alert_message_template, recommendation_template,
  evidence_level, enabled, priority
) VALUES (
  'HYPERTENSION_CRISIS',
  'Hypertensive Crisis',
  'chronic_disease',
  'SBP ≥180 or DBP ≥120 - potential hypertensive emergency',
  '{
    "criteria": [
      {
        "or": [
          {"condition": "systolic_bp >= 180"},
          {"condition": "diastolic_bp >= 120"}
        ]
      }
    ]
  }'::JSONB,
  'create_alert',
  'critical',
  'BP: {{sbp}}/{{dbp}} mmHg - Hypertensive Crisis',
  'Immediate action required: 1) Assess for end-organ damage (chest pain, SOB, neuro changes), 2) If symptomatic: Emergency ED evaluation, 3) If asymptomatic: Urgent outpatient follow-up within 24-48 hours, 4) Medication review and adjustment',
  'meta_analysis',
  TRUE,
  1
);

-- ============================================================================
-- 6. MEDICATION INTERACTION RULES
-- ============================================================================

-- Drug-drug interaction table
CREATE TABLE IF NOT EXISTS drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_1_name TEXT NOT NULL,
  drug_1_rxcui TEXT, -- RxNorm Concept Unique Identifier
  drug_2_name TEXT NOT NULL,
  drug_2_rxcui TEXT,
  
  interaction_severity TEXT NOT NULL CHECK (interaction_severity IN ('minor', 'moderate', 'major', 'contraindicated')),
  interaction_type TEXT, -- e.g., "pharmacokinetic", "pharmacodynamic"
  mechanism TEXT, -- e.g., "CYP3A4 inhibition"
  effect TEXT NOT NULL, -- What happens
  
  clinical_management TEXT, -- How to manage
  references JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drug_interactions_drug1 ON drug_interactions(drug_1_rxcui);
CREATE INDEX idx_drug_interactions_drug2 ON drug_interactions(drug_2_rxcui);
CREATE INDEX idx_drug_interactions_severity ON drug_interactions(interaction_severity);

-- Example: Warfarin + NSAIDs
INSERT INTO drug_interactions (
  drug_1_name, drug_1_rxcui, drug_2_name, drug_2_rxcui,
  interaction_severity, mechanism, effect, clinical_management
) VALUES (
  'Warfarin', '11289', 'Ibuprofen', '5640',
  'major',
  'Antiplatelet effect + anticoagulation',
  'Increased bleeding risk',
  'Avoid combination if possible. If necessary, monitor INR closely, assess for bleeding, consider gastroprotection (PPI), educate patient on bleeding signs'
);

-- Rule to check for drug interactions
INSERT INTO clinical_rules (
  rule_id, name, category, description, condition_logic, action,
  severity, alert_message_template, recommendation_template,
  evidence_level, enabled, priority
) VALUES (
  'MEDICATION_INTERACTION_CHECK',
  'Drug-Drug Interaction Detected',
  'medication_safety',
  'Checks for major or contraindicated drug-drug interactions',
  '{
    "check_type": "medication_interaction",
    "severity_threshold": ["major", "contraindicated"]
  }'::JSONB,
  'create_alert',
  'high',
  '{{drug_1}} + {{drug_2}}: {{interaction_severity}} interaction detected',
  '{{clinical_management}}',
  'expert_opinion',
  TRUE,
  2
);

-- ============================================================================
-- 7. ACUTE KIDNEY INJURY (AKI) DETECTION
-- ============================================================================

INSERT INTO clinical_rules (
  rule_id, name, category, description, condition_logic, action,
  severity, alert_message_template, recommendation_template,
  evidence_level, enabled, priority
) VALUES (
  'AKI_KDIGO_STAGE1',
  'Acute Kidney Injury - KDIGO Stage 1',
  'organ_dysfunction',
  'Serum creatinine increase ≥0.3 mg/dL within 48 hours or ≥1.5x baseline within 7 days',
  '{
    "criteria": [
      {
        "or": [
          {"condition": "creatinine_increase_48h >= 0.3"},
          {"condition": "creatinine_ratio_7d >= 1.5"}
        ]
      }
    ]
  }'::JSONB,
  'create_alert',
  'medium',
  'AKI Stage 1: Creatinine {{current_cr}} mg/dL (baseline {{baseline_cr}} mg/dL, increase {{increase}} mg/dL)',
  'AKI Management: 1) Review medications (hold nephrotoxins, adjust doses), 2) Assess volume status and optimize, 3) Review recent imaging with contrast, 4) Monitor daily creatinine and urine output, 5) Consider nephrology consult if worsening',
  'rct',
  TRUE,
  2
);

-- ============================================================================
-- 8. FUNCTIONS FOR RULE EVALUATION
-- ============================================================================

-- Function to evaluate a rule for a patient
CREATE OR REPLACE FUNCTION evaluate_clinical_rule(
  p_rule_id UUID,
  p_patient_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_rule RECORD;
  v_patient_data JSONB;
  v_triggered BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get rule definition
  SELECT * INTO v_rule FROM clinical_rules WHERE id = p_rule_id AND enabled = TRUE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Rule not found or disabled');
  END IF;
  
  -- Gather patient data (vitals, labs, medications)
  SELECT jsonb_build_object(
    'vitals', (SELECT jsonb_agg(to_jsonb(v)) FROM (
      SELECT * FROM vital_signs WHERE patient_id = p_patient_id 
      ORDER BY measured_at DESC LIMIT 10
    ) v),
    'labs', (SELECT jsonb_agg(to_jsonb(l)) FROM (
      SELECT * FROM lab_results WHERE patient_id = p_patient_id 
      ORDER BY test_date DESC LIMIT 20
    ) l),
    'medications', (SELECT jsonb_agg(to_jsonb(m)) FROM (
      SELECT * FROM prescriptions WHERE patient_id = p_patient_id AND status = 'active'
    ) m)
  ) INTO v_patient_data;
  
  -- Evaluate rule (simplified - in production, use a proper rules engine)
  -- This would involve parsing condition_logic and evaluating against patient_data
  v_triggered := FALSE; -- Placeholder
  
  -- Log execution
  INSERT INTO rule_executions (
    rule_id, patient_id, triggered, input_data, executed_at
  ) VALUES (
    p_rule_id, p_patient_id, v_triggered, v_patient_data, NOW()
  );
  
  v_result := jsonb_build_object(
    'rule_id', v_rule.rule_id,
    'triggered', v_triggered,
    'patient_id', p_patient_id,
    'evaluated_at', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate NEWS2 score
CREATE OR REPLACE FUNCTION calculate_news2_score(
  p_respiratory_rate INTEGER,
  p_oxygen_saturation INTEGER,
  p_systolic_bp INTEGER,
  p_heart_rate INTEGER,
  p_temperature NUMERIC,
  p_consciousness TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
BEGIN
  -- Respiratory Rate
  IF p_respiratory_rate <= 8 THEN v_score := v_score + 3;
  ELSIF p_respiratory_rate <= 11 THEN v_score := v_score + 1;
  ELSIF p_respiratory_rate <= 20 THEN v_score := v_score + 0;
  ELSIF p_respiratory_rate <= 24 THEN v_score := v_score + 2;
  ELSE v_score := v_score + 3;
  END IF;
  
  -- Oxygen Saturation
  IF p_oxygen_saturation <= 91 THEN v_score := v_score + 3;
  ELSIF p_oxygen_saturation <= 93 THEN v_score := v_score + 2;
  ELSIF p_oxygen_saturation <= 95 THEN v_score := v_score + 1;
  ELSE v_score := v_score + 0;
  END IF;
  
  -- Systolic BP
  IF p_systolic_bp <= 90 THEN v_score := v_score + 3;
  ELSIF p_systolic_bp <= 100 THEN v_score := v_score + 2;
  ELSIF p_systolic_bp <= 110 THEN v_score := v_score + 1;
  ELSIF p_systolic_bp <= 219 THEN v_score := v_score + 0;
  ELSE v_score := v_score + 3;
  END IF;
  
  -- Heart Rate
  IF p_heart_rate <= 40 THEN v_score := v_score + 3;
  ELSIF p_heart_rate <= 50 THEN v_score := v_score + 1;
  ELSIF p_heart_rate <= 90 THEN v_score := v_score + 0;
  ELSIF p_heart_rate <= 110 THEN v_score := v_score + 1;
  ELSIF p_heart_rate <= 130 THEN v_score := v_score + 2;
  ELSE v_score := v_score + 3;
  END IF;
  
  -- Temperature
  IF p_temperature <= 35.0 THEN v_score := v_score + 3;
  ELSIF p_temperature <= 36.0 THEN v_score := v_score + 1;
  ELSIF p_temperature <= 38.0 THEN v_score := v_score + 0;
  ELSIF p_temperature <= 39.0 THEN v_score := v_score + 1;
  ELSE v_score := v_score + 2;
  END IF;
  
  -- Consciousness
  IF p_consciousness = 'confused' OR p_consciousness = 'altered' THEN
    v_score := v_score + 3;
  END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 9. RULE PERFORMANCE TRACKING
-- ============================================================================

-- View for rule performance metrics
CREATE OR REPLACE VIEW rule_performance_metrics AS
SELECT
  r.rule_id,
  r.name,
  r.category,
  r.severity,
  COUNT(*) AS total_executions,
  COUNT(*) FILTER (WHERE re.triggered = TRUE) AS triggers,
  COUNT(*) FILTER (WHERE re.true_positive = TRUE) AS true_positives,
  COUNT(*) FILTER (WHERE re.true_positive = FALSE AND re.triggered = TRUE) AS false_positives,
  ROUND(100.0 * COUNT(*) FILTER (WHERE re.true_positive = TRUE) / NULLIF(COUNT(*) FILTER (WHERE re.triggered = TRUE), 0), 2) AS ppv,
  AVG(re.confidence_score) AS avg_confidence
FROM clinical_rules r
LEFT JOIN rule_executions re ON re.rule_id = r.id
WHERE r.enabled = TRUE
GROUP BY r.id, r.rule_id, r.name, r.category, r.severity;

-- Grant permissions
GRANT SELECT ON clinical_guidelines TO authenticated;
GRANT SELECT ON clinical_rules TO authenticated;
GRANT SELECT ON rule_executions TO authenticated;
GRANT SELECT ON drug_interactions TO authenticated;
GRANT SELECT ON rule_performance_metrics TO authenticated;

-- Comments
COMMENT ON TABLE clinical_guidelines IS 'Evidence-based clinical practice guidelines from major organizations';
COMMENT ON TABLE clinical_rules IS 'Rule-based clinical decision support alerts and screening tools';
COMMENT ON TABLE rule_executions IS 'Historical record of rule evaluations and outcomes';
COMMENT ON TABLE drug_interactions IS 'Known drug-drug interactions with severity and management';
COMMENT ON FUNCTION calculate_news2_score IS 'Calculates National Early Warning Score 2 from vital signs';
COMMENT ON VIEW rule_performance_metrics IS 'Performance metrics for clinical rules (PPV, sensitivity, etc.)';

/*
CLINICAL GUIDELINES SOURCES:

1. American Heart Association (AHA):
   - Hypertension Guidelines
   - Heart Failure Guidelines
   - Atrial Fibrillation Guidelines

2. American Diabetes Association (ADA):
   - Standards of Medical Care in Diabetes
   - Glycemic Targets
   - Diabetic Ketoacidosis Management

3. American College of Chest Physicians (ACCP):
   - Anticoagulation Guidelines
   - COPD Management
   - Pneumonia Guidelines

4. KDIGO (Kidney Disease: Improving Global Outcomes):
   - Acute Kidney Injury Guidelines
   - Chronic Kidney Disease Guidelines

5. Surviving Sepsis Campaign:
   - Sepsis and Septic Shock Management
   - Early Recognition and Treatment

IMPLEMENTATION NOTES:

1. Rules Engine:
   - Evaluate rules real-time on vital signs updates
   - Batch evaluation for daily checks
   - Prioritize by severity and priority score
   - Rate limit: Max 1 alert per rule per patient per cooldown_period

2. Alert Fatigue Mitigation:
   - Smart bundling: Group related alerts
   - Severity-based filtering: Allow customization per user
   - Contextual alerts: Time of day, patient location
   - Acknowledgment required: Track response times

3. Performance Monitoring:
   - Track PPV, NPV, sensitivity, specificity
   - A/B test rule modifications
   - Continuous quality improvement
   - Monthly review of false positives

4. Evidence Updates:
   - Annual review of guidelines
   - Incorporate new evidence as published
   - Version control for rule changes
   - Audit trail for clinical decision rationale

5. Integration with AI:
   - Rules engine provides baseline (rule-based)
   - ML models provide advanced prediction
   - Ensemble: Rules + ML for best performance
   - Explainability: Show which rule triggered vs ML prediction
*/
