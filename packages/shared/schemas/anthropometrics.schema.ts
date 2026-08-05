// ============================================================================
// NutriAX Pro — Anthropometrics Zod Schema
// Covers: Body composition assessments with multiple protocols
// ============================================================================

import { z } from 'zod';
import { ANTHROPOMETRIC_PROTOCOLS } from '../constants';

// ---------------------------------------------------------------------------
// Skinfold Measurements
// ---------------------------------------------------------------------------
export const SkinfoldsSchema = z.object({
  triceps: z.number().min(0).max(100).optional(),
  subscapular: z.number().min(0).max(100).optional(),
  chest: z.number().min(0).max(100).optional(),
  axillary: z.number().min(0).max(100).optional(),
  suprailiac: z.number().min(0).max(100).optional(),
  abdominal: z.number().min(0).max(100).optional(),
  thigh: z.number().min(0).max(100).optional(),
  calf: z.number().min(0).max(100).optional(),
});

export type SkinfoldsInput = z.infer<typeof SkinfoldsSchema>;

// ---------------------------------------------------------------------------
// Circumference Measurements (cm)
// ---------------------------------------------------------------------------
export const CircumferencesSchema = z.object({
  neck: z.number().min(0).max(100).optional(),
  chest: z.number().min(0).max(200).optional(),
  waist: z.number().min(0).max(250).optional(),
  hip: z.number().min(0).max(250).optional(),
  abdomen: z.number().min(0).max(250).optional(),
  arm_relaxed_r: z.number().min(0).max(80).optional(),
  arm_contracted_r: z.number().min(0).max(80).optional(),
  forearm_r: z.number().min(0).max(60).optional(),
  thigh_proximal_r: z.number().min(0).max(100).optional(),
  thigh_medial_r: z.number().min(0).max(100).optional(),
  calf_r: z.number().min(0).max(70).optional(),
});

export type CircumferencesInput = z.infer<typeof CircumferencesSchema>;

// ---------------------------------------------------------------------------
// Full Anthropometric Assessment
// ---------------------------------------------------------------------------
export const AnthropometricSchema = z.object({
  patient_id: z.string().uuid(),
  assessed_by: z.string().uuid().nullable().optional(),
  assessment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),

  // Medidas Primárias
  weight_kg: z.number().positive().max(500, 'Peso inválido'),
  bf_percentage: z.number().min(0).max(70).nullable().optional(),
  muscle_mass_kg: z.number().min(0).nullable().optional(),
  fat_mass_kg: z.number().min(0).nullable().optional(),
  residual_mass_kg: z.number().min(0).nullable().optional(),

  // Índices (calculados no frontend ou backend)
  bmi: z.number().min(0).nullable().optional(),
  ffmi: z.number().min(0).nullable().optional(),
  waist_hip_ratio: z.number().min(0).max(2).nullable().optional(),
  waist_height_ratio: z.number().min(0).max(2).nullable().optional(),

  // Dobras e Circunferências
  skinfolds_mm: SkinfoldsSchema.nullable().optional(),
  circumferences_cm: CircumferencesSchema.nullable().optional(),

  // Protocolo
  protocol_used: z.enum(ANTHROPOMETRIC_PROTOCOLS).nullable().optional(),
  density_formula: z.string().max(200).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type AnthropometricInput = z.infer<typeof AnthropometricSchema>;
