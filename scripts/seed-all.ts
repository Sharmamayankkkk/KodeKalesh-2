import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'lab_technician' | 'pharmacist' | 'receptionist';
}

const demoUsers: DemoUser[] = [
  {
    email: 'admin@healthpulse.com',
    password: 'Password123!',
    full_name: 'Sarah Anderson',
    role: 'admin',
  },
  {
    email: 'dr.smith@healthpulse.com',
    password: 'Password123!',
    full_name: 'Dr. James Smith',
    role: 'doctor',
  },
  {
    email: 'dr.patel@healthpulse.com',
    password: 'Password123!',
    full_name: 'Dr. Priya Patel',
    role: 'doctor',
  },
  {
    email: 'nurse.williams@healthpulse.com',
    password: 'Password123!',
    full_name: 'Nurse Maria Williams',
    role: 'nurse',
  },
  {
    email: 'nurse.johnson@healthpulse.com',
    password: 'Password123!',
    full_name: 'Nurse Robert Johnson',
    role: 'nurse',
  },
  {
    email: 'lab.chen@healthpulse.com',
    password: 'Password123!',
    full_name: 'Lab Tech David Chen',
    role: 'lab_technician',
  },
  {
    email: 'pharm.garcia@healthpulse.com',
    password: 'Password123!',
    full_name: 'Pharmacist Carlos Garcia',
    role: 'pharmacist',
  },
  {
    email: 'reception@healthpulse.com',
    password: 'Password123!',
    full_name: 'Receptionist Jennifer Lee',
    role: 'receptionist',
  },
];

async function seedDatabase() {
  console.log('[v0] Starting database seeding...');

  try {
    // Create users via Supabase Auth
    console.log('[v0] Creating auth users...');
    const userIds: { [key: string]: string } = {};

    for (const user of demoUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
          },
        });

        if (error) {
          console.warn(`[v0] User ${user.email} may already exist or error: ${error.message}`);
        } else if (data.user) {
          userIds[user.email] = data.user.id;
          console.log(`[v0] Created user: ${user.email}`);
        }
      } catch (err) {
        console.warn(`[v0] Error creating user ${user.email}:`, err);
      }
    }

    // Get the admin doctor ID for references
    const adminId = userIds['admin@healthpulse.com'] || 'admin-id';
    const doctorId = userIds['dr.smith@healthpulse.com'] || 'doctor-id';

    // Seed patients
    console.log('[v0] Creating patients...');
    const patients = [
      {
        mrn: 'MRN-001',
        first_name: 'John',
        last_name: 'Anderson',
        date_of_birth: '1955-03-15',
        gender: 'M',
        blood_type: 'O+',
        allergies: ['Penicillin'],
        chronic_conditions: ['Type 2 Diabetes', 'Hypertension'],
        emergency_contact_name: 'Mary Johnson',
        emergency_contact_phone: '555-0101',
        insurance_provider: 'Blue Cross',
        insurance_member_id: 'BC123456',
        primary_physician_id: doctorId,
      },
      {
        mrn: 'MRN-002',
        first_name: 'Sarah',
        last_name: 'Johnson',
        date_of_birth: '1962-07-22',
        gender: 'F',
        blood_type: 'A+',
        allergies: ['Sulfa drugs'],
        chronic_conditions: ['Asthma', 'GERD'],
        emergency_contact_name: 'John Martinez',
        emergency_contact_phone: '555-0102',
        insurance_provider: 'Aetna',
        insurance_member_id: 'AE654321',
        primary_physician_id: doctorId,
      },
      {
        mrn: 'MRN-003',
        first_name: 'Michael',
        last_name: 'Davis',
        date_of_birth: '1948-11-08',
        gender: 'M',
        blood_type: 'B+',
        allergies: [],
        chronic_conditions: ['COPD', 'Heart Failure'],
        emergency_contact_name: 'Susan Brown',
        emergency_contact_phone: '555-0103',
        insurance_provider: 'United Health',
        insurance_member_id: 'UH987654',
        primary_physician_id: doctorId,
      },
    ];

    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .insert(patients);

    if (patientError) {
      console.warn('[v0] Patient creation warning:', patientError.message);
    } else {
      console.log('[v0] Created patients successfully');
    }

    // Seed vital signs
    console.log('[v0] Creating vital signs...');
    const { data: vitalsData, error: vitalsError } = await supabase
      .from('vital_signs')
      .insert([
        {
          patient_id: 1,
          temperature: 98.6,
          blood_pressure_systolic: 145,
          blood_pressure_diastolic: 92,
          heart_rate: 78,
          respiratory_rate: 16,
          oxygen_saturation: 97.0,
          weight: 185,
          bmi: 29.5,
          recorded_by: doctorId,
          recorded_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          patient_id: 1,
          temperature: 99.8,
          blood_pressure_systolic: 158,
          blood_pressure_diastolic: 102,
          heart_rate: 92,
          respiratory_rate: 22,
          oxygen_saturation: 95.9,
          weight: 188,
          bmi: 30.0,
          recorded_by: doctorId,
          recorded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);

    if (vitalsError) {
      console.warn('[v0] Vital signs warning:', vitalsError.message);
    } else {
      console.log('[v0] Created vital signs successfully');
    }

    // Seed alerts
    console.log('[v0] Creating alerts...');
    const { error: alertError } = await supabase
      .from('alerts')
      .insert([
        {
          patient_id: 1,
          alert_type: 'high_glucose',
          severity: 'critical',
          title: 'Critical Glucose Level',
          description:
            'Patient glucose level critically elevated. Immediate intervention needed.',
          status: 'unresolved',
          created_by: doctorId,
        },
        {
          patient_id: 3,
          alert_type: 'heart_failure',
          severity: 'critical',
          title: 'Heart Failure Decompensation',
          description: 'Signs of acute decompensation. Urgent evaluation needed.',
          status: 'unresolved',
          created_by: doctorId,
        },
      ]);

    if (alertError) {
      console.warn('[v0] Alerts warning:', alertError.message);
    } else {
      console.log('[v0] Created alerts successfully');
    }

    console.log('[v0] Database seeding completed!');
    console.log('[v0] You can now login with any demo account (password: Password123!)');
  } catch (error) {
    console.error('[v0] Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
