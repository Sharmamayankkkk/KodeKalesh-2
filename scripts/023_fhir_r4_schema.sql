-- ============================================================================
-- HL7 FHIR R4 COMPLIANT SCHEMA FOR EHR INTEGRATION
-- Implements FHIR resources for interoperability with Epic, Cerner, and other EHR systems
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. FHIR PATIENT RESOURCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fhir_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- FHIR Resource metadata
  resource_type TEXT DEFAULT 'Patient' NOT NULL,
  fhir_id TEXT UNIQUE NOT NULL, -- FHIR Resource ID
  version INTEGER DEFAULT 1,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Identifiers (can have multiple - MRN, SSN, insurance, etc.)
  identifiers JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- Example: [{'system': 'urn:oid:1.2.840.114350', 'value': 'MRN12345', 'type': 'MR'}]
  
  -- Name (can have multiple - official, nickname, maiden, etc.)
  names JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- Example: [{'use': 'official', 'family': 'Smith', 'given': ['John', 'A']}]
  
  -- Telecom (phone, email, etc.)
  telecoms JSONB DEFAULT '[]'::JSONB,
  
  -- Gender (administrative)
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  
  -- Birth date
  birth_date DATE,
  
  -- Deceased indicator
  deceased_boolean BOOLEAN DEFAULT FALSE,
  deceased_datetime TIMESTAMPTZ,
  
  -- Address (can have multiple)
  addresses JSONB DEFAULT '[]'::JSONB,
  
  -- Marital status
  marital_status JSONB,
  
  -- Contact (emergency contacts, family)
  contacts JSONB DEFAULT '[]'::JSONB,
  
  -- Communication (languages spoken)
  communications JSONB DEFAULT '[]'::JSONB,
  
  -- General practitioner references
  general_practitioners JSONB DEFAULT '[]'::JSONB,
  
  -- Managing organization
  managing_organization TEXT,
  
  -- Active status
  active BOOLEAN DEFAULT TRUE,
  
  -- Full FHIR resource (for complete compliance)
  fhir_resource JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fhir_patients_patient ON fhir_patients(patient_id);
CREATE INDEX idx_fhir_patients_fhir_id ON fhir_patients(fhir_id);
CREATE INDEX idx_fhir_patients_identifiers ON fhir_patients USING GIN(identifiers);

-- ============================================================================
-- 2. FHIR OBSERVATION RESOURCE (Vitals, Labs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fhir_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fhir_id TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 1,
  
  -- Patient reference
  patient_id UUID NOT NULL REFERENCES patients(id),
  patient_fhir_id TEXT NOT NULL,
  
  -- Status: registered, preliminary, final, amended, corrected, cancelled
  status TEXT NOT NULL CHECK (status IN ('registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error')),
  
  -- Category: vital-signs, laboratory, social-history, etc.
  categories JSONB NOT NULL DEFAULT '[]'::JSONB,
  
  -- Code (LOINC, SNOMED CT)
  code JSONB NOT NULL,
  -- Example: {'coding': [{'system': 'http://loinc.org', 'code': '8867-4', 'display': 'Heart rate'}]}
  
  -- Effective time
  effective_datetime TIMESTAMPTZ,
  effective_period JSONB,
  
  -- Issued time
  issued TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performer (who recorded the observation)
  performers JSONB DEFAULT '[]'::JSONB,
  
  -- Value (can be Quantity, CodeableConcept, String, Boolean, etc.)
  value_quantity JSONB,
  value_codeable_concept JSONB,
  value_string TEXT,
  value_boolean BOOLEAN,
  value_integer INTEGER,
  value_range JSONB,
  
  -- Data absent reason
  data_absent_reason JSONB,
  
  -- Interpretation (high, low, normal, etc.)
  interpretations JSONB DEFAULT '[]'::JSONB,
  
  -- Notes
  notes JSONB DEFAULT '[]'::JSONB,
  
  -- Body site
  body_site JSONB,
  
  -- Method
  method JSONB,
  
  -- Specimen reference
  specimen_reference TEXT,
  
  -- Device reference
  device_reference TEXT,
  
  -- Reference range
  reference_ranges JSONB DEFAULT '[]'::JSONB,
  
  -- Related observations
  has_member JSONB DEFAULT '[]'::JSONB, -- For grouping related observations
  derived_from JSONB DEFAULT '[]'::JSONB,
  
  -- Component (for multi-component observations like blood pressure)
  components JSONB DEFAULT '[]'::JSONB,
  
  -- Full FHIR resource
  fhir_resource JSONB NOT NULL,
  
  -- Link to internal tables
  vital_sign_id UUID REFERENCES vital_signs(id),
  lab_result_id UUID REFERENCES lab_results(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fhir_obs_patient ON fhir_observations(patient_id, effective_datetime DESC);
CREATE INDEX idx_fhir_obs_status ON fhir_observations(status);
CREATE INDEX idx_fhir_obs_code ON fhir_observations USING GIN(code);
CREATE INDEX idx_fhir_obs_category ON fhir_observations USING GIN(categories);
CREATE INDEX idx_fhir_obs_vital ON fhir_observations(vital_sign_id) WHERE vital_sign_id IS NOT NULL;
CREATE INDEX idx_fhir_obs_lab ON fhir_observations(lab_result_id) WHERE lab_result_id IS NOT NULL;

-- ============================================================================
-- 3. FHIR CONDITION RESOURCE (Diagnoses, Problems)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fhir_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fhir_id TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 1,
  
  -- Clinical status: active, recurrence, relapse, inactive, remission, resolved
  clinical_status JSONB NOT NULL,
  
  -- Verification status: unconfirmed, provisional, differential, confirmed, refuted, entered-in-error
  verification_status JSONB,
  
  -- Category: problem-list-item, encounter-diagnosis
  categories JSONB DEFAULT '[]'::JSONB,
  
  -- Severity
  severity JSONB,
  
  -- Code (ICD-10, SNOMED CT)
  code JSONB NOT NULL,
  
  -- Body site
  body_sites JSONB DEFAULT '[]'::JSONB,
  
  -- Patient reference
  patient_id UUID NOT NULL REFERENCES patients(id),
  patient_fhir_id TEXT NOT NULL,
  
  -- Encounter reference
  encounter_reference TEXT,
  
  -- Onset (when it started)
  onset_datetime TIMESTAMPTZ,
  onset_age JSONB,
  onset_period JSONB,
  onset_range JSONB,
  onset_string TEXT,
  
  -- Abatement (when it resolved)
  abatement_datetime TIMESTAMPTZ,
  abatement_age JSONB,
  abatement_period JSONB,
  abatement_range JSONB,
  abatement_string TEXT,
  
  -- Recorded date
  recorded_date DATE,
  
  -- Recorder reference
  recorder_reference TEXT,
  
  -- Asserter reference
  asserter_reference TEXT,
  
  -- Stage
  stages JSONB DEFAULT '[]'::JSONB,
  
  -- Evidence
  evidences JSONB DEFAULT '[]'::JSONB,
  
  -- Notes
  notes JSONB DEFAULT '[]'::JSONB,
  
  -- Full FHIR resource
  fhir_resource JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fhir_cond_patient ON fhir_conditions(patient_id);
CREATE INDEX idx_fhir_cond_code ON fhir_conditions USING GIN(code);
CREATE INDEX idx_fhir_cond_clinical ON fhir_conditions USING GIN(clinical_status);

-- ============================================================================
-- 4. FHIR MEDICATION REQUEST RESOURCE (Prescriptions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fhir_medication_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fhir_id TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 1,
  
  -- Status: active, on-hold, cancelled, completed, entered-in-error, stopped, draft, unknown
  status TEXT NOT NULL CHECK (status IN ('active', 'on-hold', 'cancelled', 'completed', 'entered-in-error', 'stopped', 'draft', 'unknown')),
  
  -- Intent: proposal, plan, order, original-order, reflex-order, filler-order, instance-order, option
  intent TEXT NOT NULL CHECK (intent IN ('proposal', 'plan', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order', 'option')),
  
  -- Priority: routine, urgent, asap, stat
  priority TEXT CHECK (priority IN ('routine', 'urgent', 'asap', 'stat')),
  
  -- Medication (CodeableConcept or Reference)
  medication_codeable_concept JSONB,
  medication_reference TEXT,
  
  -- Patient reference
  patient_id UUID NOT NULL REFERENCES patients(id),
  patient_fhir_id TEXT NOT NULL,
  
  -- Encounter reference
  encounter_reference TEXT,
  
  -- Authored on
  authored_on TIMESTAMPTZ DEFAULT NOW(),
  
  -- Requester reference
  requester_reference TEXT,
  
  -- Performer reference
  performer_reference TEXT,
  
  -- Performer type
  performer_type JSONB,
  
  -- Recorder reference
  recorder_reference TEXT,
  
  -- Reason code
  reason_codes JSONB DEFAULT '[]'::JSONB,
  
  -- Reason reference
  reason_references JSONB DEFAULT '[]'::JSONB,
  
  -- Dosage instruction
  dosage_instructions JSONB DEFAULT '[]'::JSONB,
  
  -- Dispense request
  dispense_request JSONB,
  
  -- Substitution
  substitution JSONB,
  
  -- Prior prescription
  prior_prescription_reference TEXT,
  
  -- Notes
  notes JSONB DEFAULT '[]'::JSONB,
  
  -- Full FHIR resource
  fhir_resource JSONB NOT NULL,
  
  -- Link to internal prescription
  prescription_id UUID REFERENCES prescriptions(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fhir_med_patient ON fhir_medication_requests(patient_id);
CREATE INDEX idx_fhir_med_status ON fhir_medication_requests(status);
CREATE INDEX idx_fhir_med_prescription ON fhir_medication_requests(prescription_id);

-- ============================================================================
-- 5. FHIR ALLERGY INTOLERANCE RESOURCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fhir_allergy_intolerances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fhir_id TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 1,
  
  -- Clinical status: active, inactive, resolved
  clinical_status JSONB,
  
  -- Verification status: unconfirmed, confirmed, refuted, entered-in-error
  verification_status JSONB,
  
  -- Type: allergy, intolerance
  allergy_type TEXT CHECK (allergy_type IN ('allergy', 'intolerance')),
  
  -- Category: food, medication, environment, biologic
  categories TEXT[] DEFAULT '{}',
  
  -- Criticality: low, high, unable-to-assess
  criticality TEXT CHECK (criticality IN ('low', 'high', 'unable-to-assess')),
  
  -- Code (substance)
  code JSONB NOT NULL,
  
  -- Patient reference
  patient_id UUID NOT NULL REFERENCES patients(id),
  patient_fhir_id TEXT NOT NULL,
  
  -- Encounter reference
  encounter_reference TEXT,
  
  -- Onset
  onset_datetime TIMESTAMPTZ,
  onset_age JSONB,
  onset_period JSONB,
  onset_range JSONB,
  onset_string TEXT,
  
  -- Recorded date
  recorded_date TIMESTAMPTZ,
  
  -- Recorder reference
  recorder_reference TEXT,
  
  -- Asserter reference
  asserter_reference TEXT,
  
  -- Last occurrence
  last_occurrence TIMESTAMPTZ,
  
  -- Notes
  notes JSONB DEFAULT '[]'::JSONB,
  
  -- Reactions
  reactions JSONB DEFAULT '[]'::JSONB,
  
  -- Full FHIR resource
  fhir_resource JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fhir_allergy_patient ON fhir_allergy_intolerances(patient_id);
CREATE INDEX idx_fhir_allergy_code ON fhir_allergy_intolerances USING GIN(code);
CREATE INDEX idx_fhir_allergy_category ON fhir_allergy_intolerances USING GIN(categories);

-- ============================================================================
-- 6. FHIR DOCUMENT REFERENCE RESOURCE (Clinical Notes, Reports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fhir_document_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fhir_id TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 1,
  
  -- Master identifier
  master_identifier JSONB,
  
  -- Identifiers
  identifiers JSONB DEFAULT '[]'::JSONB,
  
  -- Status: current, superseded, entered-in-error
  status TEXT NOT NULL CHECK (status IN ('current', 'superseded', 'entered-in-error')),
  
  -- Doc status: preliminary, final, amended, entered-in-error
  doc_status TEXT CHECK (doc_status IN ('preliminary', 'final', 'amended', 'entered-in-error')),
  
  -- Type (LOINC document type)
  document_type JSONB NOT NULL,
  
  -- Category
  categories JSONB DEFAULT '[]'::JSONB,
  
  -- Patient reference
  patient_id UUID NOT NULL REFERENCES patients(id),
  patient_fhir_id TEXT NOT NULL,
  
  -- Date (when document was created)
  date TIMESTAMPTZ,
  
  -- Authors
  authors JSONB DEFAULT '[]'::JSONB,
  
  -- Authenticator
  authenticator_reference TEXT,
  
  -- Custodian
  custodian_reference TEXT,
  
  -- Related to
  relates_to JSONB DEFAULT '[]'::JSONB,
  
  -- Description
  description TEXT,
  
  -- Security label
  security_labels JSONB DEFAULT '[]'::JSONB,
  
  -- Content (attachments)
  content JSONB NOT NULL DEFAULT '[]'::JSONB,
  
  -- Context
  context JSONB,
  
  -- Full FHIR resource
  fhir_resource JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fhir_doc_patient ON fhir_document_references(patient_id);
CREATE INDEX idx_fhir_doc_type ON fhir_document_references USING GIN(document_type);
CREATE INDEX idx_fhir_doc_date ON fhir_document_references(date DESC);

-- ============================================================================
-- 7. FHIR API ENDPOINT LOGS (For tracking API usage and compliance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fhir_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Request details
  method TEXT NOT NULL, -- GET, POST, PUT, DELETE
  endpoint TEXT NOT NULL, -- /Patient, /Observation, etc.
  resource_type TEXT,
  resource_id TEXT,
  
  -- Query parameters
  query_params JSONB,
  
  -- Response
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  
  -- User/System making the request
  user_id UUID REFERENCES users(id),
  client_id TEXT, -- OAuth client ID
  ip_address INET,
  user_agent TEXT,
  
  -- Errors
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fhir_api_logs_timestamp ON fhir_api_logs(timestamp DESC);
CREATE INDEX idx_fhir_api_logs_endpoint ON fhir_api_logs(endpoint, timestamp DESC);
CREATE INDEX idx_fhir_api_logs_user ON fhir_api_logs(user_id, timestamp DESC);
CREATE INDEX idx_fhir_api_logs_errors ON fhir_api_logs(status_code, timestamp DESC) WHERE status_code >= 400;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate FHIR-compliant IDs
CREATE OR REPLACE FUNCTION generate_fhir_id(p_resource_type TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN p_resource_type || '/' || gen_random_uuid()::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to convert internal patient to FHIR Patient resource
CREATE OR REPLACE FUNCTION patient_to_fhir(p_patient_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_patient RECORD;
  v_fhir_resource JSONB;
BEGIN
  SELECT * INTO v_patient FROM patients WHERE id = p_patient_id;
  
  v_fhir_resource := jsonb_build_object(
    'resourceType', 'Patient',
    'id', generate_fhir_id('Patient'),
    'meta', jsonb_build_object(
      'versionId', '1',
      'lastUpdated', NOW()
    ),
    'identifier', jsonb_build_array(
      jsonb_build_object(
        'system', 'urn:healthpulse:patient',
        'value', v_patient.id::TEXT
      )
    ),
    'active', TRUE,
    'name', jsonb_build_array(
      jsonb_build_object(
        'use', 'official',
        'family', v_patient.last_name,
        'given', jsonb_build_array(v_patient.first_name)
      )
    ),
    'gender', lower(v_patient.gender),
    'birthDate', v_patient.date_of_birth
  );
  
  IF v_patient.email IS NOT NULL THEN
    v_fhir_resource := jsonb_set(
      v_fhir_resource,
      '{telecom}',
      jsonb_build_array(
        jsonb_build_object(
          'system', 'email',
          'value', v_patient.email,
          'use', 'home'
        )
      )
    );
  END IF;
  
  IF v_patient.phone IS NOT NULL THEN
    v_fhir_resource := jsonb_set(
      v_fhir_resource,
      '{telecom}',
      COALESCE(v_fhir_resource->'telecom', '[]'::JSONB) || 
      jsonb_build_array(
        jsonb_build_object(
          'system', 'phone',
          'value', v_patient.phone,
          'use', 'mobile'
        )
      )
    );
  END IF;
  
  RETURN v_fhir_resource;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON fhir_patients TO authenticated;
GRANT SELECT ON fhir_observations TO authenticated;
GRANT SELECT ON fhir_conditions TO authenticated;
GRANT SELECT ON fhir_medication_requests TO authenticated;
GRANT SELECT ON fhir_allergy_intolerances TO authenticated;
GRANT SELECT ON fhir_document_references TO authenticated;

-- Comments
COMMENT ON TABLE fhir_patients IS 'HL7 FHIR R4 Patient resources for EHR interoperability';
COMMENT ON TABLE fhir_observations IS 'HL7 FHIR R4 Observation resources (vitals, labs, social history)';
COMMENT ON TABLE fhir_conditions IS 'HL7 FHIR R4 Condition resources (diagnoses, problems)';
COMMENT ON TABLE fhir_medication_requests IS 'HL7 FHIR R4 MedicationRequest resources (prescriptions)';
COMMENT ON TABLE fhir_allergy_intolerances IS 'HL7 FHIR R4 AllergyIntolerance resources';
COMMENT ON TABLE fhir_document_references IS 'HL7 FHIR R4 DocumentReference resources (clinical notes, reports)';
COMMENT ON TABLE fhir_api_logs IS 'FHIR API access logs for compliance and monitoring';

--
-- FHIR IMPLEMENTATION NOTES:
--
-- 1. Epic Integration:
--    - Join Epic App Orchard program
--    - Implement SMART on FHIR authentication (OAuth 2.0)
--    - Support Epic's FHIR endpoints
--    - Test with Epic's sandbox environment
--
-- 2. Cerner Integration:
--    - Register with Cerner Code Console
--    - Implement Cerner's FHIR API
--    - Support CareAware for real-time vitals
--
-- 3. FHIR API Endpoints to Implement:
--    - GET /Patient/{id}
--    - GET /Patient?identifier={mrn}
--    - GET /Observation?patient={id}&category=vital-signs
--    - GET /Observation?patient={id}&category=laboratory
--    - GET /Condition?patient={id}
--    - GET /MedicationRequest?patient={id}&status=active
--    - GET /AllergyIntolerance?patient={id}
--    - GET /DocumentReference?patient={id}
--    - POST /Patient (create)
--    - PUT /Patient/{id} (update)
--    - POST /$export (bulk data export)
--
-- 4. Security:
--    - SMART on FHIR authentication
--    - OAuth 2.0 with PKCE
--    - Scopes: patient/*.read, patient/*.write, user/*.read, user/*.write
--    - Rate limiting per client
--    - Audit all FHIR API access
--
-- 5. Testing:
--    - Use FHIR validator: https://validator.fhir.org/
--    - Test with Inferno testing tool
--    - Verify against US Core profiles
--    - Test bulk data export (FHIR Bulk Data Access)
--
-- 6. Performance:
--    - Cache FHIR resources (Redis, 5-minute TTL)
--    - Use pagination for large result sets (_count parameter)
--    - Implement _summary and _elements for partial resources
--    - Support _include and _revinclude for efficient queries
--
