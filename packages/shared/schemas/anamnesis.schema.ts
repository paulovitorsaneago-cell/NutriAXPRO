// ============================================================================
// NutriAX Pro — Anamnesis Zod Schemas
// Covers: Clinical, Sports, and Routine anamnesis sections
// ============================================================================

import { z } from 'zod';
import {
  BRISTOL_SCALES,
  STRESS_LEVELS,
  SLEEP_QUALITIES,
} from '../constants';

// ---------------------------------------------------------------------------
// Supplement Entry
// ---------------------------------------------------------------------------
export const SupplementEntrySchema = z.object({
  name: z.string().min(1, 'Nome do suplemento é obrigatório'),
  dosage: z.string().min(1, 'Dosagem é obrigatória'),
  frequency: z.string().min(1, 'Frequência é obrigatória'),
});

// ---------------------------------------------------------------------------
// Clinical Anamnesis (patient_anamnesis)
// ---------------------------------------------------------------------------
export const ClinicalAnamnesisSchema = z.object({
  patient_id: z.string().uuid(),

  // Histórico Clínico
  clinical_history: z.string().max(2000).nullable().optional(),
  current_medications: z.string().max(1000).nullable().optional(),
  allergies: z.array(z.string().min(1)).nullable().optional(),
  food_intolerances: z.array(z.string().min(1)).nullable().optional(),
  family_history: z.string().max(2000).nullable().optional(),

  // Saúde GI
  intestinal_function: z.enum(BRISTOL_SCALES).nullable().optional(),
  bowel_frequency: z.string().max(100).nullable().optional(),
  gi_symptoms: z.array(z.string()).nullable().optional(),

  // Hidratação
  daily_water_ml: z.number().int().min(0).max(10000).nullable().optional(),
  water_goal_ml: z.number().int().min(0).max(10000).nullable().optional(),

  // Recordatório Alimentar Habitual
  usual_breakfast: z.string().max(1000).nullable().optional(),
  usual_morning_snack: z.string().max(1000).nullable().optional(),
  usual_lunch: z.string().max(1000).nullable().optional(),
  usual_afternoon_snack: z.string().max(1000).nullable().optional(),
  usual_dinner: z.string().max(1000).nullable().optional(),
  usual_supper: z.string().max(1000).nullable().optional(),

  // Preferências
  food_preferences: z.string().max(1000).nullable().optional(),
  food_aversions: z.string().max(1000).nullable().optional(),
  cooking_skills: z.string().max(200).nullable().optional(),
  meals_per_day: z.number().int().min(1).max(12).nullable().optional(),
  eating_speed: z.enum(['Rápido', 'Normal', 'Lento']).nullable().optional(),
  emotional_eating: z.boolean().default(false),
  weekend_changes: z.string().max(500).nullable().optional(),

  // Suplementos
  current_supplements: z.array(SupplementEntrySchema).nullable().optional(),

  filled_by_patient: z.boolean().default(false),
});

export type ClinicalAnamnesisInput = z.infer<typeof ClinicalAnamnesisSchema>;

// ---------------------------------------------------------------------------
// Sports Anamnesis (patient_anamnesis_sports)
// ---------------------------------------------------------------------------
export const SportsAnamnesisSchema = z.object({
  patient_id: z.string().uuid(),

  primary_modality: z.string().max(100).nullable().optional(),
  secondary_modalities: z.array(z.string()).nullable().optional(),
  weekly_frequency: z.number().int().min(0).max(14).nullable().optional(),
  session_duration_min: z.number().int().min(0).max(480).nullable().optional(),
  training_time: z.enum(['Manhã', 'Tarde', 'Noite']).nullable().optional(),
  training_experience: z.enum(['Iniciante', 'Intermediário', 'Avançado']).nullable().optional(),
  perceived_effort: z.number().int().min(1).max(10).nullable().optional(),
  uses_ergogenics: z.boolean().default(false),
  ergogenics_details: z.string().max(500).nullable().optional(),
  sports_goals: z.string().max(500).nullable().optional(),
  injuries_history: z.string().max(1000).nullable().optional(),
});

export type SportsAnamnesisInput = z.infer<typeof SportsAnamnesisSchema>;

// ---------------------------------------------------------------------------
// Routine Anamnesis (patient_anamnesis_routine)
// ---------------------------------------------------------------------------
export const RoutineAnamnesisSchema = z.object({
  patient_id: z.string().uuid(),

  wake_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').nullable().optional(),
  sleep_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').nullable().optional(),
  sleep_hours: z.number().min(0).max(24).nullable().optional(),
  sleep_quality: z.enum(SLEEP_QUALITIES).nullable().optional(),
  uses_sleep_aids: z.boolean().default(false),

  stress_level: z.enum(STRESS_LEVELS).nullable().optional(),
  stress_sources: z.array(z.string()).nullable().optional(),

  work_schedule: z.string().max(200).nullable().optional(),
  who_cooks: z.string().max(200).nullable().optional(),
  meal_prep_available: z.boolean().default(false),
  has_kitchen_access: z.boolean().default(true),

  alcohol_consumption: z.enum(['Nunca', 'Social', 'Semanal', 'Diário']).nullable().optional(),
  smoking: z.boolean().default(false),
  recreational_drugs: z.boolean().default(false),

  daily_screen_hours: z.number().min(0).max(24).nullable().optional(),
  leisure_activities: z.array(z.string()).nullable().optional(),
});

export type RoutineAnamnesisInput = z.infer<typeof RoutineAnamnesisSchema>;

// ---------------------------------------------------------------------------
// Combined Anamnesis (all 3 sections for the patient form)
// ---------------------------------------------------------------------------
export const FullAnamnesisSchema = z.object({
  clinical: ClinicalAnamnesisSchema.omit({ patient_id: true }),
  sports: SportsAnamnesisSchema.omit({ patient_id: true }),
  routine: RoutineAnamnesisSchema.omit({ patient_id: true }),
});

export type FullAnamnesisInput = z.infer<typeof FullAnamnesisSchema>;
