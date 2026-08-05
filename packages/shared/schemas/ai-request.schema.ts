// ============================================================================
// NutriAX Pro — AI Prescription Request Zod Schema
// Covers: Input validation for /api/ai/generate-prescription endpoint
// ============================================================================

import { z } from 'zod';
import { ACTIVITY_LEVELS, GOAL_TYPES, GENDERS } from '../constants';

// ---------------------------------------------------------------------------
// Patient Context for AI (assembled by the nutritionist before requesting)
// ---------------------------------------------------------------------------
export const AiPatientContextSchema = z.object({
  // Dados básicos
  full_name: z.string(),
  age: z.number().int().min(1).max(120),
  gender: z.enum(GENDERS),
  weight_kg: z.number().positive(),
  height_m: z.number().positive(),
  activity_level: z.enum(ACTIVITY_LEVELS),
  goal: z.enum(GOAL_TYPES),

  // Restrições
  allergies: z.array(z.string()).default([]),
  food_intolerances: z.array(z.string()).default([]),
  food_aversions: z.array(z.string()).default([]),
  food_preferences: z.array(z.string()).default([]),

  // Exames alterados (para conduta dietoterápica)
  altered_exams: z.array(z.object({
    exam_name: z.string(),
    result_value: z.number().nullable(),
    unit: z.string().nullable(),
    status: z.enum(['attention', 'altered']),
    nutritionist_interpretation: z.string().nullable().optional(),
  })).default([]),

  // Contexto esportivo
  primary_modality: z.string().nullable().optional(),
  training_frequency: z.number().int().nullable().optional(),
  training_time: z.string().nullable().optional(),

  // Contexto de rotina
  who_cooks: z.string().nullable().optional(),
  meal_prep_available: z.boolean().default(false),
  work_schedule: z.string().nullable().optional(),
});

export type AiPatientContext = z.infer<typeof AiPatientContextSchema>;

// ---------------------------------------------------------------------------
// Caloric Targets for AI
// ---------------------------------------------------------------------------
export const AiCaloricTargetsSchema = z.object({
  target_kcal: z.number().positive(),
  protein_g: z.number().min(0),
  carb_g: z.number().min(0),
  lipid_g: z.number().min(0),
  fiber_g: z.number().min(0).nullable().optional(),
  sodium_mg: z.number().min(0).nullable().optional(),
  water_ml: z.number().min(0).nullable().optional(),
  meals_count: z.number().int().min(3).max(8).default(6),
});

export type AiCaloricTargets = z.infer<typeof AiCaloricTargetsSchema>;

// ---------------------------------------------------------------------------
// AI Generation Request (full payload)
// ---------------------------------------------------------------------------
export const AiGeneratePrescriptionRequestSchema = z.object({
  patient_id: z.string().uuid(),
  plan_id: z.string().uuid().nullable().optional(),
  patient_context: AiPatientContextSchema,
  caloric_targets: AiCaloricTargetsSchema,

  // Configuration
  additional_instructions: z.string().max(2000).nullable().optional(),
  include_substitutions: z.boolean().default(true),
  language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
  model_preference: z.enum(['gemini', 'openai', 'anthropic']).default('gemini'),
});

export type AiGeneratePrescriptionRequest = z.infer<typeof AiGeneratePrescriptionRequestSchema>;

// ---------------------------------------------------------------------------
// AI Generated Meal (expected LLM output structure)
// ---------------------------------------------------------------------------
export const AiGeneratedItemSchema = z.object({
  food_name: z.string(),
  portion_description: z.string(),
  weight_g: z.number().positive(),
  calories_kcal: z.number().min(0),
  protein_g: z.number().min(0),
  carb_g: z.number().min(0),
  lipid_g: z.number().min(0),
  fiber_g: z.number().min(0).optional(),
  sodium_mg: z.number().min(0).optional(),
  substitutions: z.array(z.object({
    food_name: z.string(),
    portion_description: z.string(),
    weight_g: z.number().positive(),
    calories_kcal: z.number().min(0),
    protein_g: z.number().min(0),
    carb_g: z.number().min(0),
    lipid_g: z.number().min(0),
  })).optional(),
});

export const AiGeneratedMealSchema = z.object({
  meal_name: z.string(),
  meal_time: z.string().regex(/^\d{2}:\d{2}$/),
  instructions: z.string().nullable().optional(),
  items: z.array(AiGeneratedItemSchema).min(1),
  total_kcal: z.number().min(0),
  total_protein_g: z.number().min(0),
  total_carb_g: z.number().min(0),
  total_lipid_g: z.number().min(0),
});

export const AiGeneratedPrescriptionSchema = z.object({
  meals: z.array(AiGeneratedMealSchema).min(3),
  total_daily_kcal: z.number().positive(),
  total_daily_protein_g: z.number().min(0),
  total_daily_carb_g: z.number().min(0),
  total_daily_lipid_g: z.number().min(0),
  total_daily_fiber_g: z.number().min(0).optional(),
  notes: z.string().nullable().optional(),
  clinical_considerations: z.array(z.string()).optional(),
});

export type AiGeneratedPrescription = z.infer<typeof AiGeneratedPrescriptionSchema>;
