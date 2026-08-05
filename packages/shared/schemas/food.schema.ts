// ============================================================================
// NutriAX Pro — Food Database Zod Schemas
// Covers: Food entries, serving units, and search
// ============================================================================

import { z } from 'zod';
import { FOOD_SOURCES } from '../constants';

// ---------------------------------------------------------------------------
// Food Database Entry
// ---------------------------------------------------------------------------
export const FoodEntrySchema = z.object({
  name: z.string().min(2, 'Nome do alimento é obrigatório').max(200),
  category: z.string().max(100).nullable().optional(),
  source: z.enum(FOOD_SOURCES).default('taco'),

  // Composição centesimal por 100g
  kcal_100g: z.number().min(0).nullable().optional(),
  protein_100g: z.number().min(0).nullable().optional(),
  carb_100g: z.number().min(0).nullable().optional(),
  lipid_100g: z.number().min(0).nullable().optional(),
  fiber_100g: z.number().min(0).nullable().optional(),
  sodium_mg_100g: z.number().min(0).nullable().optional(),

  // Micronutrientes (opcionais)
  calcium_mg_100g: z.number().min(0).nullable().optional(),
  iron_mg_100g: z.number().min(0).nullable().optional(),
  zinc_mg_100g: z.number().min(0).nullable().optional(),
  magnesium_mg_100g: z.number().min(0).nullable().optional(),
  vitamin_c_mg_100g: z.number().min(0).nullable().optional(),
  vitamin_a_mcg_100g: z.number().min(0).nullable().optional(),
  vitamin_d_mcg_100g: z.number().min(0).nullable().optional(),
  vitamin_b12_mcg_100g: z.number().min(0).nullable().optional(),
  folate_mcg_100g: z.number().min(0).nullable().optional(),
  potassium_mg_100g: z.number().min(0).nullable().optional(),
});

export type FoodEntryInput = z.infer<typeof FoodEntrySchema>;

// ---------------------------------------------------------------------------
// Serving Unit
// ---------------------------------------------------------------------------
export const ServingUnitSchema = z.object({
  food_id: z.string().uuid(),
  unit_name: z.string().min(1, 'Nome da medida é obrigatório').max(100),
  weight_g: z.number().positive('Peso deve ser positivo'),
  is_default: z.boolean().default(false),
});

export type ServingUnitInput = z.infer<typeof ServingUnitSchema>;

// ---------------------------------------------------------------------------
// Food Search Query
// ---------------------------------------------------------------------------
export const FoodSearchSchema = z.object({
  query: z.string().min(2, 'Busca deve ter pelo menos 2 caracteres').max(100),
  category: z.string().optional(),
  source: z.enum(FOOD_SOURCES).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type FoodSearchInput = z.infer<typeof FoodSearchSchema>;

// ---------------------------------------------------------------------------
// Portion Calculator (convert serving to nutritional values)
// ---------------------------------------------------------------------------
export const PortionCalcSchema = z.object({
  food_id: z.string().uuid(),
  weight_g: z.number().positive().optional(),
  serving_unit_id: z.string().uuid().optional(),
  quantity: z.number().positive().default(1),
}).refine(
  (data) => data.weight_g !== undefined || data.serving_unit_id !== undefined,
  { message: 'Informe o peso em gramas ou selecione uma medida caseira' }
);

export type PortionCalcInput = z.infer<typeof PortionCalcSchema>;
