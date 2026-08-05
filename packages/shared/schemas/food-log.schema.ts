// ============================================================================
// NutriAX Pro — Food Log Zod Schemas
// Covers: Daily food diary entries and check-in
// ============================================================================

import { z } from 'zod';
import { MEAL_LOG_STATUSES } from '../constants';

// ---------------------------------------------------------------------------
// Food Log Entry (meal-level check-in)
// ---------------------------------------------------------------------------
export const FoodLogSchema = z.object({
  patient_id: z.string().uuid(),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  meal_name: z.string().min(1).max(100),
  status: z.enum(MEAL_LOG_STATUSES).default('completed'),

  total_kcal: z.number().min(0).nullable().optional(),
  total_protein_g: z.number().min(0).nullable().optional(),
  total_carb_g: z.number().min(0).nullable().optional(),
  total_lipid_g: z.number().min(0).nullable().optional(),
  total_fiber_g: z.number().min(0).nullable().optional(),
  total_sodium_mg: z.number().min(0).nullable().optional(),

  water_ml: z.number().int().min(0).nullable().optional(),
  mood: z.string().max(100).nullable().optional(),
  hunger_level: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type FoodLogInput = z.infer<typeof FoodLogSchema>;

// ---------------------------------------------------------------------------
// Food Log Item (individual food consumed)
// ---------------------------------------------------------------------------
export const FoodLogItemSchema = z.object({
  food_log_id: z.string().uuid(),
  food_id: z.string().uuid().nullable().optional(),
  food_name: z.string().min(1).max(200),
  portion_description: z.string().max(200).nullable().optional(),
  weight_g_ml: z.number().positive().nullable().optional(),

  calories_kcal: z.number().min(0).nullable().optional(),
  protein_g: z.number().min(0).nullable().optional(),
  carb_g: z.number().min(0).nullable().optional(),
  lipid_g: z.number().min(0).nullable().optional(),

  is_from_prescription: z.boolean().default(false),
  was_substituted: z.boolean().default(false),
});

export type FoodLogItemInput = z.infer<typeof FoodLogItemSchema>;

// ---------------------------------------------------------------------------
// Quick Check-in (simplified meal logging for the patient app)
// ---------------------------------------------------------------------------
export const QuickCheckInSchema = z.object({
  patient_id: z.string().uuid(),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_name: z.string().min(1),
  status: z.enum(MEAL_LOG_STATUSES),
  notes: z.string().max(500).nullable().optional(),
  water_ml: z.number().int().min(0).nullable().optional(),
  hunger_level: z.number().int().min(1).max(10).nullable().optional(),
  mood: z.string().max(100).nullable().optional(),
});

export type QuickCheckInInput = z.infer<typeof QuickCheckInSchema>;
