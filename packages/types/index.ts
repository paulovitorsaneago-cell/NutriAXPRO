// ============================================================================
// NutriAX Pro — Shared TypeScript Types for PostgreSQL / Supabase Schema
// ============================================================================

export type UserRole = 'NUTRITIONIST' | 'PATIENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  nutritionist_id?: string;
  birth_date?: string;
  gender: 'Masculino' | 'Feminino';
  height_m: number;
  goal: string;
  activity_level: string;
  created_at: string;
}

export interface Anamnesis {
  id: string;
  patient_id: string;
  clinical_notes?: string;
  sports_notes?: string;
  routine_notes?: string;
  sleep_quality?: string;
  stress_level?: string;
  updated_at: string;
}

export interface Anthropometrics {
  id: string;
  patient_id: string;
  date: string;
  weight_kg: number;
  bf_percent?: number;
  muscle_mass_kg?: number;
  skinfolds_json?: {
    triceps?: number;
    subscapular?: number;
    suprailiac?: number;
    abdominal?: number;
    thigh?: number;
    chest?: number;
    midaxillary?: number;
  };
  circumferences_json?: {
    waist?: number;
    abdomen?: number;
    hip?: number;
    chest?: number;
    arm_r?: number;
    arm_l?: number;
    thigh_r?: number;
    thigh_l?: number;
  };
  created_at: string;
}

export type ExamStatusFlag = 'OK' | 'HIGH' | 'LOW' | 'CRITICAL';

export interface LabExam {
  id: string;
  patient_id: string;
  exam_name: string;
  result_value: string;
  unit: string;
  status_flag: ExamStatusFlag;
  priority?: string;
  nutritionist_notes?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  nutritionist_id?: string;
  target_kcal: number;
  protein_g: number;
  carb_g: number;
  lipid_g: number;
  is_active: boolean;
  items?: PrescriptionItem[];
  created_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  meal_name: string;
  meal_time: string;
  food_name: string;
  portion: string;
  calories: number;
  protein: number;
  carb: number;
  lipid: number;
  order_index?: number;
}

export interface FoodLog {
  id: string;
  patient_id: string;
  date: string;
  meal_name: string;
  is_completed: boolean;
  logged_at: string;
}

export interface FoodTaco {
  id: string;
  name: string;
  category?: string;
  kcal_100g: number;
  protein_100g: number;
  carb_100g: number;
  lipid_100g: number;
  fiber_100g: number;
}
