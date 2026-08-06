-- ==============================================================================
-- NUTRIAX PRO — POSTGRESQL / SUPABASE RELATIONAL DATABASE SCHEMA
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (NUTRITIONIST & PATIENT ROLES)
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
  height_m NUMERIC(3, 2) NOT NULL DEFAULT 1.75,
  goal VARCHAR(255) NOT NULL DEFAULT 'Emagrecimento & Recomposição',
  activity_level VARCHAR(100) DEFAULT 'Moderado (1.43)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ANAMNESIS TABLE
CREATE TABLE IF NOT EXISTS public.anamnesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE UNIQUE,
  clinical_notes TEXT,
  sports_notes TEXT,
  routine_notes TEXT,
  sleep_quality VARCHAR(50) DEFAULT 'BOA (7-8h)',
  stress_level VARCHAR(50) DEFAULT 'MODERADO',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ANTHROPOMETRICS TABLE (JACKSON POLLOCK 7 & CIRCUMFERENCES)
CREATE TABLE IF NOT EXISTS public.anthropometrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5, 2) NOT NULL,
  bf_percent NUMERIC(4, 2),
  muscle_mass_kg NUMERIC(5, 2),
  skinfolds_json JSONB DEFAULT '{}'::jsonb,
  circumferences_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LAB EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.lab_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  exam_name VARCHAR(150) NOT NULL,
  result_value VARCHAR(50) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  status_flag VARCHAR(20) DEFAULT 'OK' CHECK (status_flag IN ('OK', 'HIGH', 'LOW', 'CRITICAL')),
  priority VARCHAR(50) DEFAULT 'Rotina',
  nutritionist_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_kcal INT NOT NULL DEFAULT 2840,
  protein_g INT NOT NULL DEFAULT 190,
  carb_g INT NOT NULL DEFAULT 349,
  lipid_g INT NOT NULL DEFAULT 76,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PRESCRIPTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  meal_name VARCHAR(100) NOT NULL,
  meal_time VARCHAR(10) NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  portion VARCHAR(100) NOT NULL,
  calories INT DEFAULT 0,
  protein NUMERIC(5,1) DEFAULT 0,
  carb NUMERIC(5,1) DEFAULT 0,
  lipid NUMERIC(5,1) DEFAULT 0,
  order_index INT DEFAULT 0
);

-- 8. FOOD LOGS TABLE (DAILY PATIENT CHECK-INS)
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_name VARCHAR(100) NOT NULL,
  is_completed BOOLEAN DEFAULT TRUE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. FOODS TACO TABLE (TACO/TBCA NUTRITIONAL DATABASE)
CREATE TABLE IF NOT EXISTS public.foods_taco (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Geral',
  kcal_100g NUMERIC(6,1) NOT NULL,
  protein_100g NUMERIC(5,1) DEFAULT 0,
  carb_100g NUMERIC(5,1) DEFAULT 0,
  lipid_100g NUMERIC(5,1) DEFAULT 0,
  fiber_100g NUMERIC(5,1) DEFAULT 0
);
