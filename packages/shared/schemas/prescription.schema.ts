// ============================================================================
// NutriAX Pro — Prescription Zod Schemas
// Covers: Nutritional plans, prescriptions, items, and substitutions
// ============================================================================

import { z } from 'zod';
import { BMR_FORMULAS } from '../constants';

// ---------------------------------------------------------------------------
// Nutritional Plan (caloric/macro targets)
// ---------------------------------------------------------------------------
export const NutritionalPlanSchema = z.object({
  patient_id: z.string().uuid(),
  nutritionist_id: z.string().uuid(),
  plan_name: z.string().max(200).nullable().optional(),

  bmr_formula: z.enum(BMR_FORMULAS).default('mifflin_st_jeor'),
  bmr_kcal: z.number().positive('TMB deve ser positiva'),
  activity_factor: z.number().min(1.0).max(2.5).default(1.55),
  tef_factor: z.number().min(1.0).max(1.3).nullable().optional(),
  get_kcal: z.number().positive('GET deve ser positivo'),

  caloric_adjustment_kcal: z.number().default(0),
  target_kcal: z.number().positive('Meta calórica deve ser positiva'),

  protein_g: z.number().min(0),
  protein_pct: z.number().min(0).max(100).nullable().optional(),
  protein_per_kg: z.number().min(0).max(5).nullable().optional(),

  carb_g: z.number().min(0),
  carb_pct: z.number().min(0).max(100).nullable().optional(),

  lipid_g: z.number().min(0),
  lipid_pct: z.number().min(0).max(100).nullable().optional(),
  lipid_per_kg: z.number().min(0).max(3).nullable().optional(),

  fiber_g: z.number().min(0).nullable().optional(),
  sodium_mg: z.number().min(0).nullable().optional(),
  water_ml: z.number().min(0).nullable().optional(),

  is_active: z.boolean().default(true),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type NutritionalPlanInput = z.infer<typeof NutritionalPlanSchema>;

// ---------------------------------------------------------------------------
// Prescription (meal within a plan)
// ---------------------------------------------------------------------------
export const PrescriptionSchema = z.object({
  plan_id: z.string().uuid(),
  meal_name: z.string().min(1).max(100),
  meal_order: z.number().int().min(0).default(0),
  meal_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  instructions: z.string().max(2000).nullable().optional(),
  generated_by_ai: z.boolean().default(false),
});

export type PrescriptionInput = z.infer<typeof PrescriptionSchema>;

// ---------------------------------------------------------------------------
// Prescription Item (food within a meal)
// ---------------------------------------------------------------------------
export const PrescriptionItemSchema = z.object({
  prescription_id: z.string().uuid(),
  food_id: z.string().uuid().nullable().optional(),
  food_name: z.string().min(1).max(200),
  portion_description: z.string().min(1).max(200),
  weight_g_ml: z.number().positive().nullable().optional(),
  item_order: z.number().int().min(0).default(0),

  calories_kcal: z.number().min(0).nullable().optional(),
  protein_g: z.number().min(0).nullable().optional(),
  carb_g: z.number().min(0).nullable().optional(),
  lipid_g: z.number().min(0).nullable().optional(),
  fiber_g: z.number().min(0).nullable().optional(),
  sodium_mg: z.number().min(0).nullable().optional(),

  is_optional: z.boolean().default(false),
  is_substitutable: z.boolean().default(true),
  notes: z.string().max(500).nullable().optional(),
});

export type PrescriptionItemInput = z.infer<typeof PrescriptionItemSchema>;

// ---------------------------------------------------------------------------
// Substitution
// ---------------------------------------------------------------------------
export const SubstitutionSchema = z.object({
  original_item_id: z.string().uuid(),
  substitute_food_id: z.string().uuid().nullable().optional(),
  substitute_name: z.string().min(1).max(200),
  portion_description: z.string().min(1).max(200),
  weight_g_ml: z.number().positive().nullable().optional(),

  calories_kcal: z.number().min(0).nullable().optional(),
  protein_g: z.number().min(0).nullable().optional(),
  carb_g: z.number().min(0).nullable().optional(),
  lipid_g: z.number().min(0).nullable().optional(),

  notes: z.string().max(500).nullable().optional(),
});

export type SubstitutionInput = z.infer<typeof SubstitutionSchema>;

// ---------------------------------------------------------------------------
// Full Prescription (nested: plan + meals + items + substitutions)
// For batch creation / AI output parsing
// ---------------------------------------------------------------------------
export const FullPrescriptionItemSchema = PrescriptionItemSchema
  .omit({ prescription_id: true })
  .extend({
    substitutions: z.array(SubstitutionSchema.omit({ original_item_id: true })).optional(),
  });

export const FullPrescriptionMealSchema = PrescriptionSchema
  .omit({ plan_id: true })
  .extend({
    items: z.array(FullPrescriptionItemSchema).min(1, 'Cada refeição precisa de pelo menos 1 alimento'),
  });

export const FullPrescriptionSchema = z.object({
  plan: NutritionalPlanSchema,
  meals: z.array(FullPrescriptionMealSchema).min(1, 'Prescrição precisa de pelo menos 1 refeição'),
});

export type FullPrescriptionInput = z.infer<typeof FullPrescriptionSchema>;
