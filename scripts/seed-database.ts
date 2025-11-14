import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[v0] Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "doctor" | "nurse" | "lab_technician" | "pharmacist" | "receptionist";
}

const demoUsers: DemoUser[] = [
  {
    email: "admin@healthpulse.com",
    password: "Password123!",
    full_name: "Sarah Anderson",
    role: "admin",
  },
  {
    email: "dr.smith@healthpulse.com",
    password: "Password123!",
    full_name: "Dr. James Smith",
    role: "doctor",
  },
  {
    email: "dr.patel@healthpulse.com",
    password: "Password123!",
    full_name: "Dr. Priya Patel",
    role: "doctor",
  },
  {
    email: "nurse.williams@healthpulse.com",
    password: "Password123!",
    full_name: "Nurse Maria Williams",
    role: "nurse",
  },
  {
    email: "nurse.johnson@healthpulse.com",
    password: "Password123!",
    full_name: "Nurse Robert Johnson",
    role: "nurse",
  },
  {
    email: "lab.chen@healthpulse.com",
    password: "Password123!",
    full_name: "Lab Tech David Chen",
    role: "lab_technician",
  },
  {
    email: "pharm.garcia@healthpulse.com",
    password: "Password123!",
    full_name: "Pharmacist Carlos Garcia",
    role: "pharmacist",
  },
  {
    email: "reception@healthpulse.com",
    password: "Password123!",
    full_name: "Receptionist Jennifer Lee",
    role: "receptionist",
  },
];

async function seedDatabase() {
  console.log("[v0] 🚀 Starting HealthPulse Pro database seeding...\n");

  try {
    // Create users via Supabase Auth
    console.log("[v0] 👥 Creating auth users...");
    const userIds: { [key: string]: string } = {};
    let successCount = 0;

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
          if (error.message.includes("already exists")) {
            console.log(`   ℹ️  ${user.email} already exists`);
          } else {
            console.warn(`   ⚠️  ${user.email}: ${error.message}`);
          }
        } else if (data.user) {
          userIds[user.email] = data.user.id;
          successCount++;
          console.log(`   ✓ ${user.email}`);
        }
      } catch (err) {
        console.warn(`   ⚠️  Error with ${user.email}:`, (err as Error).message);
      }
    }
    console.log(`✓ ${successCount} users created/verified\n`);

    // Get the doctor ID for patient creation
    const doctorId = userIds["dr.smith@healthpulse.com"] || userIds[Object.keys(userIds)[0]];

    if (!doctorId) {
      console.error("[v0] ❌ No doctor user ID found. Cannot proceed with patient creation.");
      process.exit(1);
    }

    // Seed patients
    console.log("[v0] 🏥 Creating patients...");
    const patients = [
      {
        mrn: "MRN-001",
        first_name: "John",
        last_name: "Anderson",
        date_of_birth: "1955-03-15",
        gender: "M",
        blood_type: "O+",
        allergies: ["Penicillin"],
        chronic_conditions: ["Type 2 Diabetes", "Hypertension"],
        emergency_contact_name: "Mary Johnson",
        emergency_contact_phone: "555-0101",
        insurance_provider: "Blue Cross",
        insurance_member_id: "BC123456",
        primary_physician_id: doctorId,
      },
      {
        mrn: "MRN-002",
        first_name: "Sarah",
        last_name: "Johnson",
        date_of_birth: "1962-07-22",
        gender: "F",
        blood_type: "A+",
        allergies: ["Sulfa drugs"],
        chronic_conditions: ["Asthma", "GERD"],
        emergency_contact_name: "John Martinez",
        emergency_contact_phone: "555-0102",
        insurance_provider: "Aetna",
        insurance_member_id: "AE654321",
        primary_physician_id: doctorId,
      },
      {
        mrn: "MRN-003",
        first_name: "Michael",
        last_name: "Davis",
        date_of_birth: "1948-11-08",
        gender: "M",
        blood_type: "B+",
        allergies: [],
        chronic_conditions: ["COPD", "Heart Failure"],
        emergency_contact_name: "Susan Brown",
        emergency_contact_phone: "555-0103",
        insurance_provider: "United Health",
        insurance_member_id: "UH987654",
        primary_physician_id: doctorId,
      },
      {
        mrn: "MRN-004",
        first_name: "Emily",
        last_name: "Wilson",
        date_of_birth: "1970-05-19",
        gender: "F",
        blood_type: "AB-",
        allergies: [],
        chronic_conditions: ["Hypothyroidism", "Migraine"],
        emergency_contact_name: "David Lee",
        emergency_contact_phone: "555-0104",
        insurance_provider: "Cigna",
        insurance_member_id: "CI789012",
        primary_physician_id: doctorId,
      },
      {
        mrn: "MRN-005",
        first_name: "Robert",
        last_name: "Brown",
        date_of_birth: "1985-09-30",
        gender: "M",
        blood_type: "O-",
        allergies: [],
        chronic_conditions: ["Type 1 Diabetes", "Celiac Disease"],
        emergency_contact_name: "Emma Taylor",
        emergency_contact_phone: "555-0105",
        insurance_provider: "Blue Cross",
        insurance_member_id: "BC345678",
        primary_physician_id: doctorId,
      },
    ];

    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .insert(patients)
      .select();

    if (patientError) {
      console.warn("[v0] ⚠️  Patient insert warning:", patientError.message);
    } else {
      console.log(`✓ ${patients.length} patients created\n`);
    }

    // Get patient IDs
    const { data: allPatients } = await supabase
      .from("patients")
      .select("id, mrn")
      .limit(5);

    const patientMap: { [key: string]: string } = {};
    if (allPatients) {
      for (let i = 0; i < allPatients.length; i++) {
        patientMap[`pat-00${i + 1}`] = allPatients[i].id;
      }
    }

    const firstPatientId = allPatients?.[0]?.id;

    if (!firstPatientId) {
      console.warn("[v0] ⚠️  No patients found for vital signs. Skipping vital signs seed.");
    } else {
      // Seed vital signs
      console.log("[v0] 📊 Creating vital signs...");
      const vitalSigns = [
        {
          patient_id: firstPatientId,
          temperature: 98.2,
          blood_pressure_systolic: 148,
          blood_pressure_diastolic: 92,
          heart_rate: 72,
          respiratory_rate: 16,
          oxygen_saturation: 98.0,
          weight: 215,
          bmi: 32.1,
          recorded_by: doctorId,
          recorded_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          patient_id: firstPatientId,
          temperature: 99.8,
          blood_pressure_systolic: 158,
          blood_pressure_diastolic: 102,
          heart_rate: 92,
          respiratory_rate: 22,
          oxygen_saturation: 94.0,
          weight: 219,
          bmi: 32.7,
          recorded_by: doctorId,
          recorded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const { error: vitalsError } = await supabase
        .from("vital_signs")
        .insert(vitalSigns);

      if (vitalsError) {
        console.warn("[v0] ⚠️  Vital signs warning:", vitalsError.message);
      } else {
        console.log(`✓ ${vitalSigns.length} vital signs records created\n`);
      }

      // Seed alerts
      console.log("[v0] 🚨 Creating alerts...");
      const alerts = [
        {
          patient_id: firstPatientId,
          alert_type: "high_glucose",
          severity: "critical",
          title: "Critical Glucose Level",
          description: "Patient glucose level critically elevated at 185 mg/dL. Immediate intervention needed.",
          status: "unresolved",
          created_by: doctorId,
        },
        {
          patient_id: firstPatientId,
          alert_type: "medication_adherence",
          severity: "high",
          title: "Medication Adherence Issue",
          description: "Poor compliance with diabetes medications. Contributing to glucose elevation.",
          status: "unresolved",
          created_by: doctorId,
        },
      ];

      const { error: alertError } = await supabase
        .from("alerts")
        .insert(alerts);

      if (alertError) {
        console.warn("[v0] ⚠️  Alerts warning:", alertError.message);
      } else {
        console.log(`✓ ${alerts.length} alerts created\n`);
      }
    }

    console.log("=====================================");
    console.log("✅ Database seed completed!");
    console.log("=====================================\n");

    console.log("📝 Demo Account Credentials:");
    console.log("🔐 Password for all accounts: Password123!\n");

    console.log("Accounts created:");
    demoUsers.forEach((user) => {
      console.log(`   • ${user.email} (${user.role})`);
    });

    console.log("\n🎯 Next steps:");
    console.log("   1. Login to the app with any demo account");
    console.log("   2. Check the Patients page to see seeded patient data");
    console.log("   3. View Alerts page to see critical alerts");
    console.log("   4. Check Vital Signs and historical data\n");
  } catch (error) {
    console.error("[v0] ❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
