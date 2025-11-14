import { z } from 'zod';

/**
 * Clinical Data Validation Utilities
 * Provides validation schemas and functions for clinical data integrity
 */

// Unit conversion types
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'inches';
export type DataSource = 'manual' | 'patient_app' | 'wearable' | 'medical_device' | 'ehr_import';

// Validation schemas for vital signs
export const vitalSignsSchema = z.object({
  temperature: z.number().min(30).max(45).optional(), // Celsius range
  temperature_unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  systolic_bp: z.number().min(60).max(250).optional(),
  diastolic_bp: z.number().min(40).max(150).optional(),
  heart_rate: z.number().min(30).max(220).optional(),
  respiratory_rate: z.number().min(8).max(50).optional(),
  oxygen_saturation: z.number().min(70).max(100).optional(),
  weight: z.number().min(2).max(300).optional(),
  weight_unit: z.enum(['kg', 'lbs']).default('kg'),
  height: z.number().min(30).max(250).optional(),
  height_unit: z.enum(['cm', 'inches']).default('cm'),
  data_source: z.enum(['manual', 'patient_app', 'wearable', 'medical_device', 'ehr_import']).default('manual'),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => {
    // If both BP values are provided, systolic should be greater than diastolic
    if (data.systolic_bp && data.diastolic_bp) {
      return data.systolic_bp > data.diastolic_bp;
    }
    return true;
  },
  {
    message: 'Systolic blood pressure must be greater than diastolic',
    path: ['systolic_bp'],
  }
);

// Lab result validation
export const labResultSchema = z.object({
  test_name: z.string().min(1).max(200),
  test_category: z.enum(['hematology', 'chemistry', 'microbiology', 'imaging', 'other']),
  result: z.string().max(500).optional(),
  result_value: z.number().optional(),
  unit: z.string().max(50).optional(),
  reference_range: z.string().max(100).optional(),
  status: z.enum(['normal', 'abnormal', 'critical']).default('normal'),
  data_source: z.enum(['manual', 'lab_system', 'ehr_import', 'external_lab']).default('manual'),
  notes: z.string().max(1000).optional(),
});

// Activity data validation
export const dailyActivitySchema = z.object({
  activity_date: z.date(),
  steps: z.number().min(0).max(100000).optional(),
  active_minutes: z.number().min(0).max(1440).optional(),
  sedentary_minutes: z.number().min(0).max(1440).optional(),
  calories_burned: z.number().min(0).max(10000).optional(),
  distance_km: z.number().min(0).max(200).optional(),
  floors_climbed: z.number().min(0).max(500).optional(),
  data_source: z.enum(['manual', 'wearable', 'patient_app']).default('manual'),
  device_name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

// Nutrition log validation
export const nutritionLogSchema = z.object({
  log_date: z.date(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  meal_time: z.string().optional(),
  total_calories: z.number().min(0).max(10000).optional(),
  protein_grams: z.number().min(0).max(500).optional(),
  carbohydrates_grams: z.number().min(0).max(1000).optional(),
  fat_grams: z.number().min(0).max(500).optional(),
  fiber_grams: z.number().min(0).max(200).optional(),
  sugar_grams: z.number().min(0).max(500).optional(),
  sodium_mg: z.number().min(0).max(50000).optional(),
  water_ml: z.number().min(0).max(10000).optional(),
  meal_description: z.string().max(500).optional(),
  data_source: z.enum(['manual', 'patient_app', 'nutrition_tracker']).default('manual'),
  app_name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

// Sleep record validation
export const sleepRecordSchema = z.object({
  sleep_date: z.date(),
  bedtime: z.date(),
  wake_time: z.date(),
  total_sleep_minutes: z.number().min(0).max(1440).optional(),
  deep_sleep_minutes: z.number().min(0).max(720).optional(),
  light_sleep_minutes: z.number().min(0).max(720).optional(),
  rem_sleep_minutes: z.number().min(0).max(480).optional(),
  awake_minutes: z.number().min(0).max(720).optional(),
  sleep_quality_score: z.number().min(1).max(10).optional(),
  sleep_interruptions: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
  data_source: z.enum(['manual', 'wearable', 'patient_app', 'sleep_tracker']).default('manual'),
  device_name: z.string().max(100).optional(),
}).refine(
  (data) => {
    // Wake time should be after bedtime
    return data.wake_time > data.bedtime;
  },
  {
    message: 'Wake time must be after bedtime',
    path: ['wake_time'],
  }
);

/**
 * Unit conversion utilities
 */

export const convertTemperature = (
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit
): number => {
  if (from === to) return value;
  
  if (from === 'fahrenheit' && to === 'celsius') {
    return parseFloat(((value - 32) * 5 / 9).toFixed(2));
  }
  
  if (from === 'celsius' && to === 'fahrenheit') {
    return parseFloat((value * 9 / 5 + 32).toFixed(2));
  }
  
  return value;
};

export const convertWeight = (
  value: number,
  from: WeightUnit,
  to: WeightUnit
): number => {
  if (from === to) return value;
  
  if (from === 'lbs' && to === 'kg') {
    return parseFloat((value * 0.453592).toFixed(2));
  }
  
  if (from === 'kg' && to === 'lbs') {
    return parseFloat((value / 0.453592).toFixed(2));
  }
  
  return value;
};

export const convertHeight = (
  value: number,
  from: HeightUnit,
  to: HeightUnit
): number => {
  if (from === to) return value;
  
  if (from === 'inches' && to === 'cm') {
    return parseFloat((value * 2.54).toFixed(2));
  }
  
  if (from === 'cm' && to === 'inches') {
    return parseFloat((value / 2.54).toFixed(2));
  }
  
  return value;
};

/**
 * Calculate BMI from height and weight
 */
export const calculateBMI = (
  weight: number,
  weightUnit: WeightUnit,
  height: number,
  heightUnit: HeightUnit
): number => {
  // Convert to standard units (kg and cm)
  const weightKg = convertWeight(weight, weightUnit, 'kg');
  const heightCm = convertHeight(height, heightUnit, 'cm');
  
  // BMI = weight (kg) / (height (m))^2
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
};

/**
 * Validate vital signs ranges and provide warnings
 */
export interface VitalSignsWarning {
  field: string;
  severity: 'low' | 'high' | 'critical';
  message: string;
}

export const checkVitalSignsRanges = (vitals: {
  temperature?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
}): VitalSignsWarning[] => {
  const warnings: VitalSignsWarning[] = [];
  
  // Temperature checks (assuming Celsius)
  if (vitals.temperature) {
    if (vitals.temperature < 35) {
      warnings.push({
        field: 'temperature',
        severity: 'critical',
        message: 'Hypothermia - critically low temperature',
      });
    } else if (vitals.temperature > 39) {
      warnings.push({
        field: 'temperature',
        severity: 'high',
        message: 'Fever - elevated temperature',
      });
    } else if (vitals.temperature > 41) {
      warnings.push({
        field: 'temperature',
        severity: 'critical',
        message: 'Hyperthermia - critically high temperature',
      });
    }
  }
  
  // Blood pressure checks
  if (vitals.systolic_bp) {
    if (vitals.systolic_bp < 90) {
      warnings.push({
        field: 'systolic_bp',
        severity: 'low',
        message: 'Hypotension - low systolic blood pressure',
      });
    } else if (vitals.systolic_bp >= 140 && vitals.systolic_bp < 180) {
      warnings.push({
        field: 'systolic_bp',
        severity: 'high',
        message: 'Hypertension - elevated systolic blood pressure',
      });
    } else if (vitals.systolic_bp >= 180) {
      warnings.push({
        field: 'systolic_bp',
        severity: 'critical',
        message: 'Hypertensive crisis - critically high systolic blood pressure',
      });
    }
  }
  
  if (vitals.diastolic_bp) {
    if (vitals.diastolic_bp < 60) {
      warnings.push({
        field: 'diastolic_bp',
        severity: 'low',
        message: 'Hypotension - low diastolic blood pressure',
      });
    } else if (vitals.diastolic_bp >= 90 && vitals.diastolic_bp < 120) {
      warnings.push({
        field: 'diastolic_bp',
        severity: 'high',
        message: 'Hypertension - elevated diastolic blood pressure',
      });
    } else if (vitals.diastolic_bp >= 120) {
      warnings.push({
        field: 'diastolic_bp',
        severity: 'critical',
        message: 'Hypertensive crisis - critically high diastolic blood pressure',
      });
    }
  }
  
  // Heart rate checks
  if (vitals.heart_rate) {
    if (vitals.heart_rate < 60) {
      warnings.push({
        field: 'heart_rate',
        severity: 'low',
        message: 'Bradycardia - low heart rate',
      });
    } else if (vitals.heart_rate > 100 && vitals.heart_rate <= 120) {
      warnings.push({
        field: 'heart_rate',
        severity: 'high',
        message: 'Tachycardia - elevated heart rate',
      });
    } else if (vitals.heart_rate > 120) {
      warnings.push({
        field: 'heart_rate',
        severity: 'critical',
        message: 'Severe tachycardia - critically high heart rate',
      });
    }
  }
  
  // Oxygen saturation checks
  if (vitals.oxygen_saturation) {
    if (vitals.oxygen_saturation < 90) {
      warnings.push({
        field: 'oxygen_saturation',
        severity: 'critical',
        message: 'Hypoxemia - critically low oxygen saturation',
      });
    } else if (vitals.oxygen_saturation < 95) {
      warnings.push({
        field: 'oxygen_saturation',
        severity: 'low',
        message: 'Low oxygen saturation',
      });
    }
  }
  
  // Respiratory rate checks
  if (vitals.respiratory_rate) {
    if (vitals.respiratory_rate < 12) {
      warnings.push({
        field: 'respiratory_rate',
        severity: 'low',
        message: 'Bradypnea - low respiratory rate',
      });
    } else if (vitals.respiratory_rate > 20 && vitals.respiratory_rate <= 30) {
      warnings.push({
        field: 'respiratory_rate',
        severity: 'high',
        message: 'Tachypnea - elevated respiratory rate',
      });
    } else if (vitals.respiratory_rate > 30) {
      warnings.push({
        field: 'respiratory_rate',
        severity: 'critical',
        message: 'Severe tachypnea - critically high respiratory rate',
      });
    }
  }
  
  return warnings;
};

/**
 * Data quality scoring
 */
export const calculateDataQualityScore = (data: {
  hasVerification: boolean;
  dataSource: DataSource;
  completeness: number; // 0-1 scale
  timeliness: number; // days since measurement
}): number => {
  let score = 1.0;
  
  // Verification bonus
  if (data.hasVerification) {
    score *= 1.0;
  } else {
    score *= 0.8;
  }
  
  // Data source reliability
  const sourceMultiplier: Record<DataSource, number> = {
    medical_device: 1.0,
    manual: 0.9,
    wearable: 0.85,
    ehr_import: 0.95,
    patient_app: 0.7,
  };
  score *= sourceMultiplier[data.dataSource] || 0.8;
  
  // Completeness factor
  score *= data.completeness;
  
  // Timeliness factor (data older than 30 days is less reliable)
  if (data.timeliness > 30) {
    score *= 0.7;
  } else if (data.timeliness > 7) {
    score *= 0.9;
  }
  
  return parseFloat(Math.min(score, 1.0).toFixed(2));
};
