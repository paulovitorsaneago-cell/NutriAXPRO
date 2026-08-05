// ============================================================================
// NutriAX Pro — Database Types (TypeScript)
// Manually authored to match 001_initial_schema.sql
// Compatible with `supabase gen types typescript` output format
// ============================================================================

// ---------------------------------------------------------------------------
// Enum Types
// ---------------------------------------------------------------------------

export type UserRole = 'nutritionist' | 'patient';
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type GoalType = 'fat_loss' | 'muscle_gain' | 'maintenance' | 'health' | 'performance';
export type ExamStatus = 'normal' | 'attention' | 'altered';
export type ExamCategory = 'hemograma' | 'lipidograma' | 'glicemico' | 'hepatico' | 'renal' | 'hormonal' | 'inflamatorio' | 'vitaminas_minerais' | 'tireoidiano' | 'outros';
export type BristolScale = 'type_1' | 'type_2' | 'type_3' | 'type_4' | 'type_5' | 'type_6' | 'type_7';
export type StressLevel = 'low' | 'moderate' | 'high' | 'very_high';
export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type MealLogStatus = 'completed' | 'partial' | 'skipped' | 'substituted';
export type FoodSource = 'taco' | 'tbca' | 'usda' | 'custom';
export type AnthropometricProtocol = 'jackson_pollock_7' | 'jackson_pollock_3' | 'guedes' | 'petroski' | 'faulkner' | 'durnin_womersley' | 'other';
export type BmrFormula = 'katch_mcardle' | 'mifflin_st_jeor' | 'harris_benedict' | 'cunningham';

// ---------------------------------------------------------------------------
// JSON Field Types
// ---------------------------------------------------------------------------

export interface SupplementEntry {
  name: string;
  dosage: string;
  frequency: string;
}

export interface SkinfoldsMeasurements {
  triceps?: number;
  subscapular?: number;
  chest?: number;
  axillary?: number;
  suprailiac?: number;
  abdominal?: number;
  thigh?: number;
  calf?: number;
}

export interface CircumferencesMeasurements {
  neck?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  abdomen?: number;
  arm_relaxed_r?: number;
  arm_contracted_r?: number;
  forearm_r?: number;
  thigh_proximal_r?: number;
  thigh_medial_r?: number;
  calf_r?: number;
}

// ---------------------------------------------------------------------------
// Table Row Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  crn: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  nutritionist_id: string;
  birth_date: string | null;
  gender: Gender | null;
  height_m: number | null;
  activity_level: ActivityLevel;
  goal: GoalType;
  occupation: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientAnamnesis {
  id: string;
  patient_id: string;
  clinical_history: string | null;
  current_medications: string | null;
  allergies: string[] | null;
  food_intolerances: string[] | null;
  family_history: string | null;
  intestinal_function: BristolScale | null;
  bowel_frequency: string | null;
  gi_symptoms: string[] | null;
  daily_water_ml: number | null;
  water_goal_ml: number | null;
  usual_breakfast: string | null;
  usual_morning_snack: string | null;
  usual_lunch: string | null;
  usual_afternoon_snack: string | null;
  usual_dinner: string | null;
  usual_supper: string | null;
  food_preferences: string | null;
  food_aversions: string | null;
  cooking_skills: string | null;
  meals_per_day: number | null;
  eating_speed: string | null;
  emotional_eating: boolean;
  weekend_changes: string | null;
  current_supplements: SupplementEntry[] | null;
  filled_by_patient: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientAnamnesisSports {
  id: string;
  patient_id: string;
  primary_modality: string | null;
  secondary_modalities: string[] | null;
  weekly_frequency: number | null;
  session_duration_min: number | null;
  training_time: string | null;
  training_experience: string | null;
  perceived_effort: number | null;
  uses_ergogenics: boolean;
  ergogenics_details: string | null;
  sports_goals: string | null;
  injuries_history: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientAnamnesisRoutine {
  id: string;
  patient_id: string;
  wake_time: string | null;
  sleep_time: string | null;
  sleep_hours: number | null;
  sleep_quality: SleepQuality | null;
  uses_sleep_aids: boolean;
  stress_level: StressLevel | null;
  stress_sources: string[] | null;
  work_schedule: string | null;
  who_cooks: string | null;
  meal_prep_available: boolean;
  has_kitchen_access: boolean;
  alcohol_consumption: string | null;
  smoking: boolean;
  recreational_drugs: boolean;
  daily_screen_hours: number | null;
  leisure_activities: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface FoodDatabaseEntry {
  id: string;
  name: string;
  name_search: string;
  category: string | null;
  source: FoodSource;
  kcal_100g: number | null;
  protein_100g: number | null;
  carb_100g: number | null;
  lipid_100g: number | null;
  fiber_100g: number | null;
  sodium_mg_100g: number | null;
  calcium_mg_100g: number | null;
  iron_mg_100g: number | null;
  zinc_mg_100g: number | null;
  magnesium_mg_100g: number | null;
  vitamin_c_mg_100g: number | null;
  vitamin_a_mcg_100g: number | null;
  vitamin_d_mcg_100g: number | null;
  vitamin_b12_mcg_100g: number | null;
  folate_mcg_100g: number | null;
  potassium_mg_100g: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoodServingUnit {
  id: string;
  food_id: string;
  unit_name: string;
  weight_g: number;
  is_default: boolean;
}

export interface Anthropometric {
  id: string;
  patient_id: string;
  assessed_by: string | null;
  assessment_date: string;
  weight_kg: number;
  bf_percentage: number | null;
  muscle_mass_kg: number | null;
  fat_mass_kg: number | null;
  residual_mass_kg: number | null;
  bmi: number | null;
  ffmi: number | null;
  waist_hip_ratio: number | null;
  waist_height_ratio: number | null;
  skinfolds_mm: SkinfoldsMeasurements | null;
  circumferences_cm: CircumferencesMeasurements | null;
  protocol_used: AnthropometricProtocol | null;
  density_formula: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalExam {
  id: string;
  patient_id: string;
  entered_by: string | null;
  exam_date: string;
  exam_name: string;
  category: ExamCategory;
  result_value: number | null;
  result_text: string | null;
  unit: string | null;
  ref_min: number | null;
  ref_max: number | null;
  ref_text: string | null;
  status_flag: ExamStatus;
  priority: number;
  nutritionist_interpretation: string | null;
  nutritional_conduct: string | null;
  dietary_guidelines: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ExamUpload {
  id: string;
  patient_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size_kb: number | null;
  mime_type: string;
  description: string | null;
  exam_date: string | null;
  created_at: string;
}

export interface NutritionalPlan {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  plan_name: string | null;
  bmr_formula: BmrFormula;
  bmr_kcal: number;
  activity_factor: number;
  tef_factor: number | null;
  get_kcal: number;
  caloric_adjustment_kcal: number;
  target_kcal: number;
  protein_g: number;
  protein_pct: number | null;
  protein_per_kg: number | null;
  carb_g: number;
  carb_pct: number | null;
  lipid_g: number;
  lipid_pct: number | null;
  lipid_per_kg: number | null;
  fiber_g: number | null;
  sodium_mg: number | null;
  water_ml: number | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  plan_id: string;
  meal_name: string;
  meal_order: number;
  meal_time: string | null;
  instructions: string | null;
  generated_by_ai: boolean;
  total_kcal: number | null;
  total_protein_g: number | null;
  total_carb_g: number | null;
  total_lipid_g: number | null;
  total_fiber_g: number | null;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  food_id: string | null;
  food_name: string;
  portion_description: string;
  weight_g_ml: number | null;
  item_order: number;
  calories_kcal: number | null;
  protein_g: number | null;
  carb_g: number | null;
  lipid_g: number | null;
  fiber_g: number | null;
  sodium_mg: number | null;
  is_optional: boolean;
  is_substitutable: boolean;
  notes: string | null;
  created_at: string;
}

export interface PrescriptionSubstitution {
  id: string;
  original_item_id: string;
  substitute_food_id: string | null;
  substitute_name: string;
  portion_description: string;
  weight_g_ml: number | null;
  calories_kcal: number | null;
  protein_g: number | null;
  carb_g: number | null;
  lipid_g: number | null;
  notes: string | null;
}

export interface FoodLog {
  id: string;
  patient_id: string;
  log_date: string;
  meal_name: string;
  status: MealLogStatus;
  total_kcal: number | null;
  total_protein_g: number | null;
  total_carb_g: number | null;
  total_lipid_g: number | null;
  total_fiber_g: number | null;
  total_sodium_mg: number | null;
  water_ml: number | null;
  mood: string | null;
  hunger_level: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodLogItem {
  id: string;
  food_log_id: string;
  food_id: string | null;
  food_name: string;
  portion_description: string | null;
  weight_g_ml: number | null;
  calories_kcal: number | null;
  protein_g: number | null;
  carb_g: number | null;
  lipid_g: number | null;
  is_from_prescription: boolean;
  was_substituted: boolean;
  created_at: string;
}

export interface BodyEvolution {
  id: string;
  patient_id: string;
  assessment_id: string;
  assessment_date: string;
  weight_kg: number;
  bf_percentage: number | null;
  muscle_mass_kg: number | null;
  fat_mass_kg: number | null;
  bmi: number | null;
  ffmi: number | null;
  delta_weight_kg: number | null;
  delta_bf_percentage: number | null;
  delta_muscle_kg: number | null;
  delta_fat_kg: number | null;
  next_assessment_date: string | null;
  created_at: string;
}

export interface AiGenerationLog {
  id: string;
  nutritionist_id: string;
  patient_id: string;
  plan_id: string | null;
  request_payload: Record<string, unknown>;
  prompt_version: string | null;
  model_used: string;
  response_payload: Record<string, unknown> | null;
  response_parsed: Record<string, unknown> | null;
  was_accepted: boolean | null;
  modifications_made: string | null;
  latency_ms: number | null;
  tokens_used: number | null;
  error_message: string | null;
  status: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// View Types
// ---------------------------------------------------------------------------

export interface DailyAdherence {
  patient_id: string;
  log_date: string;
  meals_logged: number;
  meals_completed: number;
  meals_skipped: number;
  total_kcal_consumed: number | null;
  total_protein_consumed: number | null;
  total_carb_consumed: number | null;
  total_lipid_consumed: number | null;
  total_fiber_consumed: number | null;
  total_sodium_consumed: number | null;
  max_water_ml: number | null;
}

export interface AlteredExam {
  patient_id: string;
  exam_name: string;
  category: ExamCategory;
  result_value: number | null;
  unit: string | null;
  status_flag: ExamStatus;
  priority: number;
  nutritionist_interpretation: string | null;
  exam_date: string;
}

// ---------------------------------------------------------------------------
// Supabase-compatible Database interface
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'created_at' | 'updated_at'>; Update: Partial<Omit<User, 'id' | 'created_at'>> };
      patients: { Row: Patient; Insert: Omit<Patient, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Patient, 'id' | 'created_at'>> };
      patient_anamnesis: { Row: PatientAnamnesis; Insert: Omit<PatientAnamnesis, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<PatientAnamnesis, 'id' | 'created_at'>> };
      patient_anamnesis_sports: { Row: PatientAnamnesisSports; Insert: Omit<PatientAnamnesisSports, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<PatientAnamnesisSports, 'id' | 'created_at'>> };
      patient_anamnesis_routine: { Row: PatientAnamnesisRoutine; Insert: Omit<PatientAnamnesisRoutine, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<PatientAnamnesisRoutine, 'id' | 'created_at'>> };
      food_database: { Row: FoodDatabaseEntry; Insert: Omit<FoodDatabaseEntry, 'id' | 'name_search' | 'created_at' | 'updated_at'>; Update: Partial<Omit<FoodDatabaseEntry, 'id' | 'name_search' | 'created_at'>> };
      food_serving_units: { Row: FoodServingUnit; Insert: Omit<FoodServingUnit, 'id'>; Update: Partial<Omit<FoodServingUnit, 'id'>> };
      anthropometrics: { Row: Anthropometric; Insert: Omit<Anthropometric, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Anthropometric, 'id' | 'created_at'>> };
      clinical_exams: { Row: ClinicalExam; Insert: Omit<ClinicalExam, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<ClinicalExam, 'id' | 'created_at'>> };
      exam_uploads: { Row: ExamUpload; Insert: Omit<ExamUpload, 'id' | 'created_at'>; Update: Partial<Omit<ExamUpload, 'id' | 'created_at'>> };
      nutritional_plans: { Row: NutritionalPlan; Insert: Omit<NutritionalPlan, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<NutritionalPlan, 'id' | 'created_at'>> };
      prescriptions: { Row: Prescription; Insert: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Prescription, 'id' | 'created_at'>> };
      prescription_items: { Row: PrescriptionItem; Insert: Omit<PrescriptionItem, 'id' | 'created_at'>; Update: Partial<Omit<PrescriptionItem, 'id' | 'created_at'>> };
      prescription_substitutions: { Row: PrescriptionSubstitution; Insert: Omit<PrescriptionSubstitution, 'id'>; Update: Partial<Omit<PrescriptionSubstitution, 'id'>> };
      food_logs: { Row: FoodLog; Insert: Omit<FoodLog, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<FoodLog, 'id' | 'created_at'>> };
      food_log_items: { Row: FoodLogItem; Insert: Omit<FoodLogItem, 'id' | 'created_at'>; Update: Partial<Omit<FoodLogItem, 'id' | 'created_at'>> };
      body_evolution: { Row: BodyEvolution; Insert: Omit<BodyEvolution, 'id' | 'created_at'>; Update: Partial<Omit<BodyEvolution, 'id' | 'created_at'>> };
      ai_generation_logs: { Row: AiGenerationLog; Insert: Omit<AiGenerationLog, 'id' | 'created_at'>; Update: Partial<Omit<AiGenerationLog, 'id' | 'created_at'>> };
    };
    Views: {
      v_daily_adherence: { Row: DailyAdherence };
      v_altered_exams: { Row: AlteredExam };
    };
    Functions: {
      calculate_bmr: {
        Args: {
          p_formula: BmrFormula;
          p_weight_kg: number;
          p_height_cm: number;
          p_age: number;
          p_gender: Gender;
          p_bf_percentage?: number;
        };
        Returns: number;
      };
      get_user_role: { Args: Record<string, never>; Returns: UserRole };
      is_nutritionist: { Args: Record<string, never>; Returns: boolean };
      is_nutritionist_of: { Args: { p_patient_id: string }; Returns: boolean };
      get_my_patient_id: { Args: Record<string, never>; Returns: string };
      can_access_patient: { Args: { p_patient_id: string }; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      gender: Gender;
      activity_level: ActivityLevel;
      goal_type: GoalType;
      exam_status: ExamStatus;
      exam_category: ExamCategory;
      bristol_scale: BristolScale;
      stress_level: StressLevel;
      sleep_quality: SleepQuality;
      meal_log_status: MealLogStatus;
      food_source: FoodSource;
      anthropometric_protocol: AnthropometricProtocol;
      bmr_formula: BmrFormula;
    };
  };
}
