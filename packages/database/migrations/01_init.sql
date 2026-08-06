-- ==============================================================================
-- NUTRIAX PRO — MIGRATION 01: INITIAL RELATIONAL SCHEMA (POSTGRESQL / SUPABASE)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('NUTRITIONIST', 'PATIENT')),
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  birth_date DATE,
  gender VARCHAR(20) CHECK (gender IN ('Masculino', 'Feminino')),
  height_m NUMERIC(3, 2) NOT NULL DEFAULT 1.93,
  current_weight_kg NUMERIC(5, 2) NOT NULL DEFAULT 115.8,
  target_weight_kg NUMERIC(5, 2) DEFAULT 107.99,
  goal VARCHAR(255) NOT NULL DEFAULT 'Emagrecimento & Recomposição',
  profile_type VARCHAR(100) DEFAULT 'Praticante Recreativo',
  activity_level VARCHAR(100) DEFAULT 'Moderado (AF 1.43)',
  training_routine VARCHAR(255) DEFAULT 'Musculação 6x/semana + Cardio HIIT 4x',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PATIENT ANAMNESIS TABLE
CREATE TABLE IF NOT EXISTS public.patient_anamnesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE UNIQUE,
  clinical_history TEXT,
  sports_data TEXT,
  daily_routine TEXT,
  sleep_quality VARCHAR(50) DEFAULT 'BOA (7-8h)',
  stress_level VARCHAR(50) DEFAULT 'MODERADO',
  cooking_availability VARCHAR(100) DEFAULT 'Cozinha diariamente',
  allergies TEXT DEFAULT 'Nenhuma alergia conhecida',
  food_preferences TEXT DEFAULT 'Prefere frango, ovos, arroz integral, aveia e iogurte proteico',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ANTHROPOMETRICS TABLE (JACKSON POLLOCK 7 & METRICS)
CREATE TABLE IF NOT EXISTS public.anthropometrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5, 2) NOT NULL,
  height_m NUMERIC(3, 2) NOT NULL DEFAULT 1.93,
  skinfolds_json JSONB DEFAULT '{}'::jsonb,
  circumferences_json JSONB DEFAULT '{}'::jsonb,
  bf_percent NUMERIC(4, 2),
  muscle_mass_kg NUMERIC(5, 2),
  fat_mass_kg NUMERIC(5, 2),
  bmi NUMERIC(4, 2),
  whr NUMERIC(4, 2),
  whtr NUMERIC(4, 2),
  ffmi NUMERIC(4, 2),
  protocol_used VARCHAR(50) DEFAULT 'Jackson Pollock 7 Dobras',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LAB EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.lab_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  exam_name VARCHAR(150) NOT NULL,
  category VARCHAR(100) DEFAULT 'Geral',
  result_value VARCHAR(50) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  ref_min NUMERIC(8, 2),
  ref_max NUMERIC(8, 2),
  status_flag VARCHAR(20) DEFAULT 'OK' CHECK (status_flag IN ('OK', 'HIGH', 'LOW', 'CRITICAL')),
  priority VARCHAR(50) DEFAULT 'Rotina',
  nutritionist_interpretation TEXT,
  clinical_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. NUTRITIONAL PLANS TABLE
CREATE TABLE IF NOT EXISTS public.nutritional_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  bmr_kcal INT NOT NULL DEFAULT 2423,
  get_kcal INT NOT NULL DEFAULT 3464,
  target_kcal INT NOT NULL DEFAULT 2840,
  protein_g INT NOT NULL DEFAULT 190,
  carb_g INT NOT NULL DEFAULT 349,
  lipid_g INT NOT NULL DEFAULT 76,
  fiber_g INT DEFAULT 40,
  sodium_mg INT DEFAULT 2000,
  water_ml INT DEFAULT 5300,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES public.nutritional_plans(id) ON DELETE CASCADE,
  meal_name VARCHAR(100) NOT NULL,
  meal_time VARCHAR(10) NOT NULL,
  instructions TEXT
);

-- 8. PRESCRIPTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  food_name VARCHAR(255) NOT NULL,
  weight_g_ml NUMERIC(6,1) NOT NULL,
  portion_desc VARCHAR(100) NOT NULL,
  calories_kcal INT DEFAULT 0,
  protein_g NUMERIC(5,1) DEFAULT 0,
  carb_g NUMERIC(5,1) DEFAULT 0,
  lipid_g NUMERIC(5,1) DEFAULT 0,
  is_substitutable BOOLEAN DEFAULT TRUE
);

-- 9. FOOD LOGS TABLE (DAILY PATIENT CHECK-IN)
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_name VARCHAR(100) NOT NULL,
  is_completed BOOLEAN DEFAULT TRUE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  substitution_notes TEXT
);

-- 10. FOOD DATABASE TABLE (TACO/TBCA)
CREATE TABLE IF NOT EXISTS public.food_database (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  source VARCHAR(50) DEFAULT 'TACO/TBCA Auditado',
  kcal_100g NUMERIC(6,1) NOT NULL,
  protein_100g NUMERIC(5,1) DEFAULT 0,
  carb_100g NUMERIC(5,1) DEFAULT 0,
  lipid_100g NUMERIC(5,1) DEFAULT 0,
  fiber_100g NUMERIC(5,1) DEFAULT 0,
  sodium_mg_100g NUMERIC(6,1) DEFAULT 0
);

-- ROW LEVEL SECURITY (RLS) POLICIES ENABLED
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;
