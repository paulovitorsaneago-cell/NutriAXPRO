-- ============================================================================
-- NutriAX Pro — Initial Schema Migration
-- Version: 001
-- Description: Complete normalized relational schema for the NutriAX nutrition
--              management platform. Maps all 9 original CSV modules plus new
--              tables for food database (TACO), AI audit logs, and file uploads.
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('nutritionist', 'patient');

CREATE TYPE gender AS ENUM ('male', 'female', 'other');

CREATE TYPE activity_level AS ENUM (
  'sedentary',        -- Pouca ou nenhuma atividade
  'lightly_active',   -- 1-3 dias/semana
  'moderately_active',-- 3-5 dias/semana
  'very_active',      -- 6-7 dias/semana
  'extremely_active'  -- Atleta / 2x por dia
);

CREATE TYPE goal_type AS ENUM (
  'fat_loss',         -- Emagrecimento / Déficit calórico
  'muscle_gain',      -- Hipertrofia / Superávit calórico
  'maintenance',      -- Manutenção
  'health',           -- Saúde geral / Reeducação alimentar
  'performance'       -- Performance esportiva
);

CREATE TYPE exam_status AS ENUM (
  'normal',           -- 🟢 Dentro da faixa
  'attention',        -- 🟡 Limítrofe
  'altered'           -- 🔴 Alterado
);

CREATE TYPE exam_category AS ENUM (
  'hemograma',
  'lipidograma',
  'glicemico',
  'hepatico',
  'renal',
  'hormonal',
  'inflamatorio',
  'vitaminas_minerais',
  'tireoidiano',
  'outros'
);

CREATE TYPE bristol_scale AS ENUM (
  'type_1',  -- Caroços duros separados
  'type_2',  -- Forma de salsicha com caroços
  'type_3',  -- Salsicha com fissuras
  'type_4',  -- Salsicha lisa e macia (ideal)
  'type_5',  -- Pedaços macios com bordas claras
  'type_6',  -- Pedaços fofos com bordas irregulares
  'type_7'   -- Aquoso, sem pedaços sólidos
);

CREATE TYPE stress_level AS ENUM ('low', 'moderate', 'high', 'very_high');

CREATE TYPE sleep_quality AS ENUM ('poor', 'fair', 'good', 'excellent');

CREATE TYPE meal_log_status AS ENUM (
  'completed',     -- Refeição realizada conforme prescrito
  'partial',       -- Realizada com alterações
  'skipped',       -- Pulou a refeição
  'substituted'    -- Trocou por substituto equivalente
);

CREATE TYPE food_source AS ENUM ('taco', 'tbca', 'usda', 'custom');

CREATE TYPE anthropometric_protocol AS ENUM (
  'jackson_pollock_7',
  'jackson_pollock_3',
  'guedes',
  'petroski',
  'faulkner',
  'durnin_womersley',
  'other'
);

CREATE TYPE bmr_formula AS ENUM (
  'katch_mcardle',
  'mifflin_st_jeor',
  'harris_benedict',
  'cunningham'
);

-- ============================================================================
-- 2. HELPER FUNCTION: auto-update `updated_at`
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 3.1 USERS (extends Supabase auth.users)
-- Maps: Authentication layer
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  role        user_role NOT NULL DEFAULT 'patient',
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  phone       TEXT,
  crn         TEXT,  -- Registro no Conselho (apenas nutricionista)
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- ---------------------------------------------------------------------------
-- 3.2 PATIENTS (CSV: 01_Paciente)
-- Maps: Patient profile linked to a nutritionist
-- ---------------------------------------------------------------------------
CREATE TABLE public.patients (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  nutritionist_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  birth_date       DATE,
  gender           gender,
  height_m         NUMERIC(4,2),  -- ex: 1.78
  activity_level   activity_level NOT NULL DEFAULT 'sedentary',
  goal             goal_type NOT NULL DEFAULT 'health',
  occupation       TEXT,
  notes            TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_height CHECK (height_m > 0 AND height_m < 3.0),
  CONSTRAINT chk_nutritionist_role CHECK (
    nutritionist_id != user_id  -- Nutricionista não pode ser paciente de si mesmo
  )
);

CREATE TRIGGER set_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_nutritionist_id ON public.patients(nutritionist_id);
CREATE INDEX idx_patients_active ON public.patients(nutritionist_id, is_active);

-- ---------------------------------------------------------------------------
-- 3.3 PATIENT_ANAMNESIS — Clínica (CSV: 01 + 03)
-- Maps: Clinical anamnesis, allergies, medications, GI health
-- ---------------------------------------------------------------------------
CREATE TABLE public.patient_anamnesis (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id           UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Histórico Clínico
  clinical_history     TEXT,         -- Patologias prévias, cirurgias
  current_medications  TEXT,         -- Medicamentos em uso
  allergies            TEXT[],       -- Array de alergias / intolerâncias
  food_intolerances    TEXT[],       -- Intolerâncias alimentares específicas
  family_history       TEXT,         -- Histórico familiar (DM, HAS, DCV, etc.)

  -- Saúde Gastrointestinal
  intestinal_function  bristol_scale,
  bowel_frequency      TEXT,         -- ex: "1x ao dia", "irregular"
  gi_symptoms          TEXT[],       -- Distensão, gases, refluxo, etc.

  -- Hidratação
  daily_water_ml       INTEGER,      -- Consumo diário de água em ml
  water_goal_ml        INTEGER,      -- Meta de hidratação

  -- Hábitos Alimentares (Recordatório - CSV 03)
  usual_breakfast      TEXT,
  usual_morning_snack  TEXT,
  usual_lunch          TEXT,
  usual_afternoon_snack TEXT,
  usual_dinner         TEXT,
  usual_supper         TEXT,
  food_preferences     TEXT,         -- Alimentos preferidos
  food_aversions       TEXT,         -- Alimentos que não gosta
  cooking_skills       TEXT,         -- Nível de habilidade culinária
  meals_per_day        INTEGER,
  eating_speed         TEXT,         -- "Rápido", "Normal", "Lento"
  emotional_eating     BOOLEAN DEFAULT FALSE,
  weekend_changes      TEXT,         -- Como muda nos finais de semana

  -- Suplementos atuais
  current_supplements  JSONB,        -- [{name, dosage, frequency}]

  filled_by_patient    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_anamnesis_updated_at
  BEFORE UPDATE ON public.patient_anamnesis
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_anamnesis_patient_id ON public.patient_anamnesis(patient_id);

-- ---------------------------------------------------------------------------
-- 3.4 PATIENT_ANAMNESIS_SPORTS — Esportiva (CSV: 01 expandido)
-- Maps: Exercise routine, modalities, supplements, perceived effort
-- ---------------------------------------------------------------------------
CREATE TABLE public.patient_anamnesis_sports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  primary_modality      TEXT,         -- Musculação, Corrida, CrossFit, etc.
  secondary_modalities  TEXT[],       -- Outras modalidades
  weekly_frequency      INTEGER,      -- Dias por semana
  session_duration_min  INTEGER,      -- Duração média da sessão
  training_time         TEXT,         -- "Manhã", "Tarde", "Noite"
  training_experience   TEXT,         -- "Iniciante", "Intermediário", "Avançado"
  perceived_effort      INTEGER CHECK (perceived_effort BETWEEN 1 AND 10),  -- PSE 1-10
  uses_ergogenics       BOOLEAN DEFAULT FALSE,
  ergogenics_details    TEXT,         -- Cafeína, creatina, etc.
  sports_goals          TEXT,         -- Objetivo esportivo específico
  injuries_history      TEXT,         -- Lesões pregressas

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_anamnesis_sports_updated_at
  BEFORE UPDATE ON public.patient_anamnesis_sports
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_anamnesis_sports_patient_id ON public.patient_anamnesis_sports(patient_id);

-- ---------------------------------------------------------------------------
-- 3.5 PATIENT_ANAMNESIS_ROUTINE — Rotina & Hábitos (CSV: 01 expandido)
-- Maps: Sleep, stress, work routine, cooking habits
-- ---------------------------------------------------------------------------
CREATE TABLE public.patient_anamnesis_routine (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id           UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  wake_time            TIME,          -- Horário de acordar
  sleep_time           TIME,          -- Horário de dormir
  sleep_hours          NUMERIC(3,1),  -- Horas de sono
  sleep_quality        sleep_quality,
  uses_sleep_aids      BOOLEAN DEFAULT FALSE,

  stress_level         stress_level,
  stress_sources       TEXT[],        -- ["Trabalho", "Financeiro", "Familiar"]

  work_schedule        TEXT,          -- "Comercial", "Turnos", "Home Office"
  who_cooks            TEXT,          -- "Eu mesmo", "Cônjuge", "Marmitaria"
  meal_prep_available  BOOLEAN DEFAULT FALSE,  -- Faz meal prep?
  has_kitchen_access   BOOLEAN DEFAULT TRUE,   -- Acesso a cozinha no trabalho

  alcohol_consumption  TEXT,          -- "Nunca", "Social", "Semanal", "Diário"
  smoking              BOOLEAN DEFAULT FALSE,
  recreational_drugs   BOOLEAN DEFAULT FALSE,

  daily_screen_hours   NUMERIC(3,1),
  leisure_activities   TEXT[],

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_anamnesis_routine_updated_at
  BEFORE UPDATE ON public.patient_anamnesis_routine
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_anamnesis_routine_patient_id ON public.patient_anamnesis_routine(patient_id);

-- ---------------------------------------------------------------------------
-- 3.6 FOOD_DATABASE — Tabela Nutricional (TACO / TBCA / USDA)
-- Maps: New module - Nutritional composition reference
-- ---------------------------------------------------------------------------
CREATE TABLE public.food_database (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  name_search     TEXT GENERATED ALWAYS AS (LOWER(UNACCENT(name))) STORED,  -- Para busca
  category        TEXT,            -- "Cereais", "Carnes", "Frutas", etc.
  source          food_source NOT NULL DEFAULT 'taco',

  -- Composição centesimal por 100g
  kcal_100g       NUMERIC(7,2),
  protein_100g    NUMERIC(7,2),
  carb_100g       NUMERIC(7,2),
  lipid_100g      NUMERIC(7,2),
  fiber_100g      NUMERIC(7,2),
  sodium_mg_100g  NUMERIC(7,2),

  -- Micronutrientes (opcionais)
  calcium_mg_100g    NUMERIC(7,2),
  iron_mg_100g       NUMERIC(7,2),
  zinc_mg_100g       NUMERIC(7,2),
  magnesium_mg_100g  NUMERIC(7,2),
  vitamin_c_mg_100g  NUMERIC(7,2),
  vitamin_a_mcg_100g NUMERIC(7,2),
  vitamin_d_mcg_100g NUMERIC(7,2),
  vitamin_b12_mcg_100g NUMERIC(7,2),
  folate_mcg_100g    NUMERIC(7,2),
  potassium_mg_100g  NUMERIC(7,2),

  -- Metadata
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_food_database_updated_at
  BEFORE UPDATE ON public.food_database
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Extensão necessária para UNACCENT na coluna gerada
CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE INDEX idx_food_name_search ON public.food_database USING GIN (name_search gin_trgm_ops);
CREATE INDEX idx_food_category ON public.food_database(category);
CREATE INDEX idx_food_source ON public.food_database(source);

-- Extensão para trigram (busca fuzzy)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------------------------------------------------------------------------
-- 3.7 FOOD_SERVING_UNITS — Medidas Caseiras
-- Maps: Conversion between household measures and grams
-- ---------------------------------------------------------------------------
CREATE TABLE public.food_serving_units (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id       UUID NOT NULL REFERENCES public.food_database(id) ON DELETE CASCADE,
  unit_name     TEXT NOT NULL,       -- "colher de sopa", "xícara", "unidade média"
  weight_g      NUMERIC(7,2) NOT NULL, -- Peso em gramas da medida
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,

  UNIQUE(food_id, unit_name)
);

CREATE INDEX idx_serving_food_id ON public.food_serving_units(food_id);

-- ---------------------------------------------------------------------------
-- 3.8 ANTHROPOMETRICS (CSV: 04_Antropometria)
-- Maps: Body composition assessments over time
-- ---------------------------------------------------------------------------
CREATE TABLE public.anthropometrics (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  assessed_by       UUID REFERENCES public.users(id),  -- Nutricionista que avaliou
  assessment_date   DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Medidas Primárias
  weight_kg         NUMERIC(5,2) NOT NULL,
  bf_percentage     NUMERIC(5,2),     -- % de gordura corporal
  muscle_mass_kg    NUMERIC(5,2),     -- Massa magra
  fat_mass_kg       NUMERIC(5,2),     -- Massa gorda
  residual_mass_kg  NUMERIC(5,2),     -- Massa residual

  -- Índices Calculados
  bmi               NUMERIC(5,2),     -- IMC
  ffmi              NUMERIC(5,2),     -- Fat-Free Mass Index
  waist_hip_ratio   NUMERIC(4,3),     -- RCQ
  waist_height_ratio NUMERIC(4,3),    -- RCEst

  -- Dobras Cutâneas (JSONB para flexibilidade entre protocolos)
  -- Ex: {"triceps": 12.5, "subscapular": 18.0, "chest": 8.0, ...}
  skinfolds_mm      JSONB,

  -- Circunferências (JSONB)
  -- Ex: {"waist": 82.0, "hip": 98.0, "arm_relaxed": 33.0, ...}
  circumferences_cm JSONB,

  -- Protocolo e Observações
  protocol_used     anthropometric_protocol,
  density_formula   TEXT,             -- Fórmula de densidade usada
  notes             TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_weight CHECK (weight_kg > 0 AND weight_kg < 500),
  CONSTRAINT chk_bf CHECK (bf_percentage IS NULL OR (bf_percentage >= 0 AND bf_percentage <= 70))
);

CREATE TRIGGER set_anthropometrics_updated_at
  BEFORE UPDATE ON public.anthropometrics
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_anthropometrics_patient_id ON public.anthropometrics(patient_id);
CREATE INDEX idx_anthropometrics_date ON public.anthropometrics(patient_id, assessment_date DESC);

-- ---------------------------------------------------------------------------
-- 3.9 CLINICAL_EXAMS (CSV: 02_Exames_Clínicos)
-- Maps: Lab results with nutritionist interpretation
-- ---------------------------------------------------------------------------
CREATE TABLE public.clinical_exams (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                  UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  entered_by                  UUID REFERENCES public.users(id),  -- Quem digitou

  -- Identificação do Exame
  exam_date                   DATE NOT NULL DEFAULT CURRENT_DATE,
  exam_name                   TEXT NOT NULL,        -- "Hemoglobina", "Colesterol Total"
  category                    exam_category NOT NULL DEFAULT 'outros',

  -- Resultado
  result_value                NUMERIC(10,3),
  result_text                 TEXT,                  -- Para resultados não numéricos
  unit                        TEXT,                  -- "mg/dL", "g/dL", "UI/L"

  -- Valores de Referência
  ref_min                     NUMERIC(10,3),
  ref_max                     NUMERIC(10,3),
  ref_text                    TEXT,                  -- Referência textual (ex: "< 100 mg/dL")

  -- Classificação e Conduta (preenchido pelo nutricionista)
  status_flag                 exam_status NOT NULL DEFAULT 'normal',
  priority                    INTEGER DEFAULT 0 CHECK (priority BETWEEN 0 AND 5),
  nutritionist_interpretation TEXT,                  -- Interpretação contextual
  nutritional_conduct         TEXT,                  -- Conduta nutricional
  dietary_guidelines          TEXT[],                -- Diretrizes alimentares específicas

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_clinical_exams_updated_at
  BEFORE UPDATE ON public.clinical_exams
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_exams_patient_id ON public.clinical_exams(patient_id);
CREATE INDEX idx_exams_date ON public.clinical_exams(patient_id, exam_date DESC);
CREATE INDEX idx_exams_status ON public.clinical_exams(patient_id, status_flag);
CREATE INDEX idx_exams_category ON public.clinical_exams(category);

-- ---------------------------------------------------------------------------
-- 3.10 EXAM_UPLOADS — PDFs de Laudos (Supabase Storage)
-- Maps: Patient-uploaded exam files
-- ---------------------------------------------------------------------------
CREATE TABLE public.exam_uploads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  uploaded_by   UUID NOT NULL REFERENCES public.users(id),

  file_name     TEXT NOT NULL,
  file_path     TEXT NOT NULL,       -- Caminho no Supabase Storage
  file_size_kb  INTEGER,
  mime_type     TEXT DEFAULT 'application/pdf',
  description   TEXT,
  exam_date     DATE,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_uploads_patient_id ON public.exam_uploads(patient_id);

-- ---------------------------------------------------------------------------
-- 3.11 NUTRITIONAL_PLANS (CSV: 05_Avaliação_Nutricional)
-- Maps: Caloric targets, macros, BMR calculations
-- ---------------------------------------------------------------------------
CREATE TABLE public.nutritional_plans (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id   UUID NOT NULL REFERENCES public.users(id),
  plan_name         TEXT,             -- "Fase 1 - Cutting", "Manutenção Pós-Bulking"

  -- TMB / GET
  bmr_formula       bmr_formula NOT NULL DEFAULT 'mifflin_st_jeor',
  bmr_kcal          NUMERIC(7,2) NOT NULL,
  activity_factor   NUMERIC(4,2) NOT NULL DEFAULT 1.55,
  tef_factor        NUMERIC(4,2) DEFAULT 1.10, -- Efeito térmico
  get_kcal          NUMERIC(7,2) NOT NULL,     -- Gasto Energético Total

  -- Meta Calórica
  caloric_adjustment_kcal NUMERIC(7,2) DEFAULT 0, -- +/- ajuste (déficit/superávit)
  target_kcal       NUMERIC(7,2) NOT NULL,

  -- Macronutrientes
  protein_g         NUMERIC(7,2) NOT NULL,
  protein_pct       NUMERIC(5,2),
  protein_per_kg    NUMERIC(4,2),      -- g/kg de peso

  carb_g            NUMERIC(7,2) NOT NULL,
  carb_pct          NUMERIC(5,2),

  lipid_g           NUMERIC(7,2) NOT NULL,
  lipid_pct         NUMERIC(5,2),
  lipid_per_kg      NUMERIC(4,2),

  -- Micronutrientes alvo
  fiber_g           NUMERIC(7,2),
  sodium_mg         NUMERIC(7,2),
  water_ml          NUMERIC(7,0),

  -- Status
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from        DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until       DATE,
  notes             TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_target_kcal CHECK (target_kcal > 0),
  CONSTRAINT chk_macros_positive CHECK (protein_g >= 0 AND carb_g >= 0 AND lipid_g >= 0)
);

CREATE TRIGGER set_nutritional_plans_updated_at
  BEFORE UPDATE ON public.nutritional_plans
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_plans_patient_id ON public.nutritional_plans(patient_id);
CREATE INDEX idx_plans_nutritionist_id ON public.nutritional_plans(nutritionist_id);
CREATE INDEX idx_plans_active ON public.nutritional_plans(patient_id, is_active) WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- 3.12 PRESCRIPTIONS (CSV: 08_Prescrição_Nutricional — Refeições)
-- Maps: Individual meals within a nutritional plan
-- ---------------------------------------------------------------------------
CREATE TABLE public.prescriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id         UUID NOT NULL REFERENCES public.nutritional_plans(id) ON DELETE CASCADE,

  meal_name       TEXT NOT NULL,      -- "Café da Manhã", "Almoço", "Pré-Treino"
  meal_order      INTEGER NOT NULL DEFAULT 0,  -- Ordenação das refeições
  meal_time       TIME,               -- Horário sugerido
  instructions    TEXT,               -- Observações gerais da refeição
  generated_by_ai BOOLEAN NOT NULL DEFAULT FALSE,

  -- Totais calculados da refeição
  total_kcal      NUMERIC(7,2),
  total_protein_g NUMERIC(7,2),
  total_carb_g    NUMERIC(7,2),
  total_lipid_g   NUMERIC(7,2),
  total_fiber_g   NUMERIC(7,2),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_prescriptions_plan_id ON public.prescriptions(plan_id);
CREATE INDEX idx_prescriptions_order ON public.prescriptions(plan_id, meal_order);

-- ---------------------------------------------------------------------------
-- 3.13 PRESCRIPTION_ITEMS (CSV: 08 — Itens de cada refeição)
-- Maps: Individual food items within a meal prescription
-- ---------------------------------------------------------------------------
CREATE TABLE public.prescription_items (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id      UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  food_id              UUID REFERENCES public.food_database(id),

  food_name            TEXT NOT NULL,        -- Nome do alimento (denormalizado para histórico)
  portion_description  TEXT NOT NULL,        -- "1 xícara (chá)", "2 fatias médias"
  weight_g_ml          NUMERIC(7,2),         -- Peso/volume em g ou ml
  item_order           INTEGER NOT NULL DEFAULT 0,

  -- Valores nutricionais da porção
  calories_kcal        NUMERIC(7,2),
  protein_g            NUMERIC(7,2),
  carb_g               NUMERIC(7,2),
  lipid_g              NUMERIC(7,2),
  fiber_g              NUMERIC(7,2),
  sodium_mg            NUMERIC(7,2),

  is_optional          BOOLEAN NOT NULL DEFAULT FALSE,
  is_substitutable     BOOLEAN NOT NULL DEFAULT TRUE,
  notes                TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_prescription_id ON public.prescription_items(prescription_id);
CREATE INDEX idx_items_food_id ON public.prescription_items(food_id);
CREATE INDEX idx_items_order ON public.prescription_items(prescription_id, item_order);

-- ---------------------------------------------------------------------------
-- 3.14 PRESCRIPTION_SUBSTITUTIONS (CSV: 08 — Substituições)
-- Maps: Equivalent food substitutions for prescription items
-- ---------------------------------------------------------------------------
CREATE TABLE public.prescription_substitutions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_item_id     UUID NOT NULL REFERENCES public.prescription_items(id) ON DELETE CASCADE,
  substitute_food_id   UUID REFERENCES public.food_database(id),

  substitute_name      TEXT NOT NULL,
  portion_description  TEXT NOT NULL,
  weight_g_ml          NUMERIC(7,2),

  calories_kcal        NUMERIC(7,2),
  protein_g            NUMERIC(7,2),
  carb_g               NUMERIC(7,2),
  lipid_g              NUMERIC(7,2),

  notes                TEXT
);

CREATE INDEX idx_substitutions_item_id ON public.prescription_substitutions(original_item_id);

-- ---------------------------------------------------------------------------
-- 3.15 FOOD_LOGS (CSV: 09_Controle_Alimentar — Cabeçalho diário)
-- Maps: Daily food diary header with adherence summary
-- ---------------------------------------------------------------------------
CREATE TABLE public.food_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  log_date         DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Resumo do dia
  meal_name        TEXT NOT NULL,       -- Nome da refeição registrada
  status           meal_log_status NOT NULL DEFAULT 'completed',

  -- Totais consumidos
  total_kcal       NUMERIC(7,2),
  total_protein_g  NUMERIC(7,2),
  total_carb_g     NUMERIC(7,2),
  total_lipid_g    NUMERIC(7,2),
  total_fiber_g    NUMERIC(7,2),
  total_sodium_mg  NUMERIC(7,2),

  -- Check-in
  water_ml         INTEGER,            -- Água consumida até a refeição
  mood             TEXT,               -- Estado emocional
  hunger_level     INTEGER CHECK (hunger_level BETWEEN 1 AND 10),
  notes            TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(patient_id, log_date, meal_name)
);

CREATE TRIGGER set_food_logs_updated_at
  BEFORE UPDATE ON public.food_logs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_food_logs_patient_id ON public.food_logs(patient_id);
CREATE INDEX idx_food_logs_date ON public.food_logs(patient_id, log_date DESC);

-- ---------------------------------------------------------------------------
-- 3.16 FOOD_LOG_ITEMS (CSV: 09 — Itens individuais consumidos)
-- Maps: Individual food items logged by the patient
-- ---------------------------------------------------------------------------
CREATE TABLE public.food_log_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_log_id      UUID NOT NULL REFERENCES public.food_logs(id) ON DELETE CASCADE,
  food_id          UUID REFERENCES public.food_database(id),

  food_name        TEXT NOT NULL,
  portion_description TEXT,
  weight_g_ml      NUMERIC(7,2),

  calories_kcal    NUMERIC(7,2),
  protein_g        NUMERIC(7,2),
  carb_g           NUMERIC(7,2),
  lipid_g          NUMERIC(7,2),

  is_from_prescription BOOLEAN NOT NULL DEFAULT FALSE,  -- Se veio do cardápio
  was_substituted  BOOLEAN NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_log_items_log_id ON public.food_log_items(food_log_id);

-- ---------------------------------------------------------------------------
-- 3.17 BODY_EVOLUTION (CSV: 06 + 07 — Dashboard & Evolução)
-- Maps: Computed evolution snapshots for dashboards
-- This is a materialized view approach: populated by trigger from anthropometrics
-- ---------------------------------------------------------------------------
CREATE TABLE public.body_evolution (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  assessment_id    UUID NOT NULL REFERENCES public.anthropometrics(id) ON DELETE CASCADE,
  assessment_date  DATE NOT NULL,

  -- Valores absolutos
  weight_kg        NUMERIC(5,2) NOT NULL,
  bf_percentage    NUMERIC(5,2),
  muscle_mass_kg   NUMERIC(5,2),
  fat_mass_kg      NUMERIC(5,2),
  bmi              NUMERIC(5,2),
  ffmi             NUMERIC(5,2),

  -- Deltas em relação à avaliação anterior
  delta_weight_kg      NUMERIC(5,2),
  delta_bf_percentage  NUMERIC(5,2),
  delta_muscle_kg      NUMERIC(5,2),
  delta_fat_kg         NUMERIC(5,2),

  -- Próxima reavaliação sugerida
  next_assessment_date DATE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evolution_patient_id ON public.body_evolution(patient_id);
CREATE INDEX idx_evolution_date ON public.body_evolution(patient_id, assessment_date DESC);

-- ---------------------------------------------------------------------------
-- 3.18 AI_GENERATION_LOGS — Auditoria de Chamadas IA
-- Maps: Audit trail for AI-generated prescriptions
-- ---------------------------------------------------------------------------
CREATE TABLE public.ai_generation_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id     UUID NOT NULL REFERENCES public.users(id),
  patient_id          UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  plan_id             UUID REFERENCES public.nutritional_plans(id),

  -- Requisição
  request_payload     JSONB NOT NULL,    -- Dados enviados ao LLM
  prompt_version      TEXT,              -- Versão do prompt usado
  model_used          TEXT NOT NULL,     -- "gemini-2.0-flash", "gpt-4o", etc.

  -- Resposta
  response_payload    JSONB,             -- Resposta bruta do LLM
  response_parsed     JSONB,            -- Resposta parseada e validada
  was_accepted        BOOLEAN,           -- Nutricionista aceitou a sugestão?
  modifications_made  TEXT,              -- O que foi alterado manualmente

  -- Metadata
  latency_ms          INTEGER,
  tokens_used         INTEGER,
  error_message       TEXT,
  status              TEXT NOT NULL DEFAULT 'pending', -- pending, success, error, rejected

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_nutritionist ON public.ai_generation_logs(nutritionist_id);
CREATE INDEX idx_ai_logs_patient ON public.ai_generation_logs(patient_id);
CREATE INDEX idx_ai_logs_status ON public.ai_generation_logs(status);

-- ============================================================================
-- 4. VIEWS — Conveniência para Dashboards
-- ============================================================================

-- Vista: Resumo diário de adesão do paciente (para Dashboard do Nutricionista)
CREATE OR REPLACE VIEW public.v_daily_adherence AS
SELECT
  fl.patient_id,
  fl.log_date,
  COUNT(*) AS meals_logged,
  COUNT(*) FILTER (WHERE fl.status = 'completed') AS meals_completed,
  COUNT(*) FILTER (WHERE fl.status = 'skipped') AS meals_skipped,
  SUM(fl.total_kcal) AS total_kcal_consumed,
  SUM(fl.total_protein_g) AS total_protein_consumed,
  SUM(fl.total_carb_g) AS total_carb_consumed,
  SUM(fl.total_lipid_g) AS total_lipid_consumed,
  SUM(fl.total_fiber_g) AS total_fiber_consumed,
  SUM(fl.total_sodium_mg) AS total_sodium_consumed,
  MAX(fl.water_ml) AS max_water_ml
FROM public.food_logs fl
GROUP BY fl.patient_id, fl.log_date;

-- Vista: Exames alterados (para alertas rápidos)
CREATE OR REPLACE VIEW public.v_altered_exams AS
SELECT
  ce.patient_id,
  ce.exam_name,
  ce.category,
  ce.result_value,
  ce.unit,
  ce.status_flag,
  ce.priority,
  ce.nutritionist_interpretation,
  ce.exam_date
FROM public.clinical_exams ce
WHERE ce.status_flag IN ('attention', 'altered')
ORDER BY ce.priority DESC, ce.exam_date DESC;

-- ============================================================================
-- 5. FUNCTION: Calculate BMR
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_bmr(
  p_formula bmr_formula,
  p_weight_kg NUMERIC,
  p_height_cm NUMERIC,
  p_age INTEGER,
  p_gender gender,
  p_bf_percentage NUMERIC DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_bmr NUMERIC;
  v_lbm NUMERIC;
BEGIN
  CASE p_formula
    WHEN 'katch_mcardle' THEN
      -- Requer % de gordura
      IF p_bf_percentage IS NULL THEN
        RAISE EXCEPTION 'Katch-McArdle requires body fat percentage';
      END IF;
      v_lbm := p_weight_kg * (1 - p_bf_percentage / 100);
      v_bmr := 370 + (21.6 * v_lbm);

    WHEN 'mifflin_st_jeor' THEN
      IF p_gender = 'male' THEN
        v_bmr := (10 * p_weight_kg) + (6.25 * p_height_cm) - (5 * p_age) + 5;
      ELSE
        v_bmr := (10 * p_weight_kg) + (6.25 * p_height_cm) - (5 * p_age) - 161;
      END IF;

    WHEN 'harris_benedict' THEN
      IF p_gender = 'male' THEN
        v_bmr := 88.362 + (13.397 * p_weight_kg) + (4.799 * p_height_cm) - (5.677 * p_age);
      ELSE
        v_bmr := 447.593 + (9.247 * p_weight_kg) + (3.098 * p_height_cm) - (4.330 * p_age);
      END IF;

    WHEN 'cunningham' THEN
      IF p_bf_percentage IS NULL THEN
        RAISE EXCEPTION 'Cunningham requires body fat percentage';
      END IF;
      v_lbm := p_weight_kg * (1 - p_bf_percentage / 100);
      v_bmr := 500 + (22 * v_lbm);

    ELSE
      RAISE EXCEPTION 'Unknown BMR formula: %', p_formula;
  END CASE;

  RETURN ROUND(v_bmr, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 6. TRIGGER: Auto-populate body_evolution from anthropometrics
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_populate_body_evolution()
RETURNS TRIGGER AS $$
DECLARE
  v_prev RECORD;
BEGIN
  -- Buscar avaliação anterior
  SELECT weight_kg, bf_percentage, muscle_mass_kg, fat_mass_kg
  INTO v_prev
  FROM public.anthropometrics
  WHERE patient_id = NEW.patient_id
    AND id != NEW.id
  ORDER BY assessment_date DESC
  LIMIT 1;

  INSERT INTO public.body_evolution (
    patient_id, assessment_id, assessment_date,
    weight_kg, bf_percentage, muscle_mass_kg, fat_mass_kg, bmi, ffmi,
    delta_weight_kg, delta_bf_percentage, delta_muscle_kg, delta_fat_kg,
    next_assessment_date
  ) VALUES (
    NEW.patient_id, NEW.id, NEW.assessment_date,
    NEW.weight_kg, NEW.bf_percentage, NEW.muscle_mass_kg, NEW.fat_mass_kg, NEW.bmi, NEW.ffmi,
    CASE WHEN v_prev IS NOT NULL THEN NEW.weight_kg - v_prev.weight_kg END,
    CASE WHEN v_prev IS NOT NULL THEN NEW.bf_percentage - v_prev.bf_percentage END,
    CASE WHEN v_prev IS NOT NULL THEN NEW.muscle_mass_kg - v_prev.muscle_mass_kg END,
    CASE WHEN v_prev IS NOT NULL THEN NEW.fat_mass_kg - v_prev.fat_mass_kg END,
    NEW.assessment_date + INTERVAL '30 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_populate_body_evolution
  AFTER INSERT ON public.anthropometrics
  FOR EACH ROW EXECUTE FUNCTION public.fn_populate_body_evolution();

-- ============================================================================
-- End of Migration 001
-- ============================================================================
