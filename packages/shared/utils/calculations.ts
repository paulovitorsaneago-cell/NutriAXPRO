// ============================================================================
// NutriAX Pro — Calculation Engine
// TMB, GET, Macro Distribution, and body composition utilities
// ============================================================================

export type BmrFormula = 'katch_mcardle' | 'mifflin_st_jeor' | 'harris_benedict' | 'cunningham';

export interface BmrParams {
  formula: BmrFormula;
  weight_kg: number;
  height_m: number;
  age: number;
  gender: 'male' | 'female';
  muscle_mass_kg?: number | null;
  bf_percentage?: number | null;
}

export interface GetParams extends BmrParams {
  activity_factor: number;
  tef_factor?: number;
}

export interface MacroDistribution {
  protein_g: number;
  protein_pct: number;
  protein_per_kg: number;
  carb_g: number;
  carb_pct: number;
  lipid_g: number;
  lipid_pct: number;
  lipid_per_kg: number;
  total_kcal_from_macros: number;
}

// ============================================================================
// TMB (Basal Metabolic Rate)
// ============================================================================

/**
 * Calculates TMB using 4 different formulas.
 */
export function calculateBMR(params: BmrParams): number {
  const { formula, weight_kg, height_m, age, gender, muscle_mass_kg, bf_percentage } = params;
  const height_cm = height_m * 100;

  switch (formula) {
    case 'katch_mcardle': {
      // Requires lean body mass (LBM)
      let lbm: number;
      if (muscle_mass_kg != null) {
        lbm = muscle_mass_kg;
      } else if (bf_percentage != null) {
        lbm = weight_kg * (1 - bf_percentage / 100);
      } else {
        // Fallback to Mifflin-St Jeor if no body composition data
        return calculateBMR({ ...params, formula: 'mifflin_st_jeor' });
      }
      return 370 + (21.6 * lbm);
    }

    case 'cunningham': {
      let lbm: number;
      if (muscle_mass_kg != null) {
        lbm = muscle_mass_kg;
      } else if (bf_percentage != null) {
        lbm = weight_kg * (1 - bf_percentage / 100);
      } else {
        return calculateBMR({ ...params, formula: 'mifflin_st_jeor' });
      }
      return 500 + (22 * lbm);
    }

    case 'mifflin_st_jeor': {
      if (gender === 'male') {
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
      }
      return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }

    case 'harris_benedict': {
      if (gender === 'male') {
        return 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age);
      }
      return 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age);
    }

    default:
      throw new Error(`Unknown BMR formula: ${formula}`);
  }
}

// ============================================================================
// GET (Total Energy Expenditure)
// ============================================================================

/**
 * Activity factors based on common scales.
 */
export const ACTIVITY_FACTORS: Record<string, { label: string; factor: number }> = {
  sedentary:         { label: 'Sedentário (pouco ou nenhum exercício)', factor: 1.200 },
  lightly_active:    { label: 'Levemente Ativo (1-3 dias/semana)', factor: 1.375 },
  moderately_active: { label: 'Moderadamente Ativo (3-5 dias/semana)', factor: 1.550 },
  very_active:       { label: 'Muito Ativo (6-7 dias/semana)', factor: 1.725 },
  extremely_active:  { label: 'Extremamente Ativo (2x/dia)', factor: 1.900 },
};

/**
 * Calculates GET = TMB × Activity Factor × TEF.
 */
export function calculateGET(params: GetParams): { bmr: number; get: number } {
  const bmr = calculateBMR(params);
  const tef = params.tef_factor ?? 1.10; // 10% thermic effect of food
  const get = bmr * params.activity_factor * tef;
  return { bmr: Math.round(bmr), get: Math.round(get) };
}

// ============================================================================
// Macro Distribution
// ============================================================================

export interface MacroParams {
  target_kcal: number;
  weight_kg: number;
  protein_per_kg: number;
  lipid_per_kg?: number;
  lipid_pct?: number;
  // Carbs fill the remaining calories
}

/**
 * Calculates macro distribution from target calories and protein/fat ratios.
 * Carbohydrates fill the remaining caloric balance.
 */
export function calculateMacros(params: MacroParams): MacroDistribution {
  const { target_kcal, weight_kg, protein_per_kg } = params;

  // Protein
  const protein_g = Math.round(protein_per_kg * weight_kg);
  const protein_kcal = protein_g * 4;
  const protein_pct = (protein_kcal / target_kcal) * 100;

  // Lipids
  let lipid_g: number;
  if (params.lipid_per_kg != null) {
    lipid_g = Math.round(params.lipid_per_kg * weight_kg);
  } else {
    const lipid_pct = params.lipid_pct ?? 25;
    lipid_g = Math.round((target_kcal * lipid_pct / 100) / 9);
  }
  const lipid_kcal = lipid_g * 9;
  const lipid_pct = (lipid_kcal / target_kcal) * 100;
  const lipid_per_kg = lipid_g / weight_kg;

  // Carbs (remaining)
  const remaining_kcal = target_kcal - protein_kcal - lipid_kcal;
  const carb_g = Math.round(Math.max(remaining_kcal / 4, 0));
  const carb_pct = (carb_g * 4 / target_kcal) * 100;

  return {
    protein_g,
    protein_pct: Math.round(protein_pct * 10) / 10,
    protein_per_kg,
    carb_g,
    carb_pct: Math.round(carb_pct * 10) / 10,
    lipid_g,
    lipid_pct: Math.round(lipid_pct * 10) / 10,
    lipid_per_kg: Math.round(lipid_per_kg * 100) / 100,
    total_kcal_from_macros: protein_kcal + carb_g * 4 + lipid_kcal,
  };
}

// ============================================================================
// Body Composition Utilities
// ============================================================================

/**
 * Calculate BMI (Body Mass Index).
 */
export function calculateBMI(weight_kg: number, height_m: number): number {
  return Math.round((weight_kg / (height_m * height_m)) * 10) / 10;
}

/**
 * Calculate FFMI (Fat-Free Mass Index).
 * FFMI = LBM / height² + 6.1 × (1.8 - height)
 */
export function calculateFFMI(lean_mass_kg: number, height_m: number): number {
  const raw = lean_mass_kg / (height_m * height_m);
  const normalized = raw + 6.1 * (1.8 - height_m);
  return Math.round(normalized * 10) / 10;
}

/**
 * Calculate Waist-to-Hip Ratio.
 */
export function calculateWHR(waist_cm: number, hip_cm: number): number {
  return Math.round((waist_cm / hip_cm) * 1000) / 1000;
}

/**
 * Calculate Waist-to-Height Ratio.
 */
export function calculateWHtR(waist_cm: number, height_cm: number): number {
  return Math.round((waist_cm / height_cm) * 1000) / 1000;
}

/**
 * Estimate body fat % from 7-site skinfold (Jackson-Pollock).
 * Men: sum of chest, axillary, triceps, subscapular, abdominal, suprailiac, thigh
 */
export function estimateBfJP7(
  gender: 'male' | 'female',
  age: number,
  skinfolds: {
    chest?: number; axillary?: number; triceps?: number;
    subscapular?: number; abdominal?: number; suprailiac?: number; thigh?: number;
  }
): number | null {
  const { chest, axillary, triceps, subscapular, abdominal, suprailiac, thigh } = skinfolds;
  if (chest == null || axillary == null || triceps == null || subscapular == null || abdominal == null || suprailiac == null || thigh == null) {
    return null;
  }

  const sum = chest + axillary + triceps + subscapular + abdominal + suprailiac + thigh;

  let density: number;
  if (gender === 'male') {
    density = 1.112 - 0.00043499 * sum + 0.00000055 * sum * sum - 0.00028826 * age;
  } else {
    density = 1.097 - 0.00046971 * sum + 0.00000056 * sum * sum - 0.00012828 * age;
  }

  // Siri equation: BF% = (495 / density) - 450
  const bf = (495 / density) - 450;
  return Math.round(bf * 10) / 10;
}

/**
 * Calculate all derived body composition values from weight, height, and BF%.
 */
export function calculateBodyComposition(weight_kg: number, height_m: number, bf_percentage: number) {
  const fat_mass_kg = Math.round((weight_kg * bf_percentage / 100) * 10) / 10;
  const lean_mass_kg = Math.round((weight_kg - fat_mass_kg) * 10) / 10;
  const bmi = calculateBMI(weight_kg, height_m);
  const ffmi = calculateFFMI(lean_mass_kg, height_m);

  return { fat_mass_kg, lean_mass_kg, bmi, ffmi };
}

// ============================================================================
// Water Intake Recommendation
// ============================================================================

/**
 * Estimate daily water intake (ml) based on weight and activity.
 * Base: 35ml/kg, adjusted for activity level.
 */
export function calculateWaterIntake(weight_kg: number, activity_level: string): number {
  const baseMultipliers: Record<string, number> = {
    sedentary: 35,
    lightly_active: 37,
    moderately_active: 40,
    very_active: 45,
    extremely_active: 50,
  };
  const multiplier = baseMultipliers[activity_level] ?? 35;
  return Math.round(weight_kg * multiplier / 100) * 100; // Round to nearest 100ml
}

// ============================================================================
// Fiber Recommendation
// ============================================================================

export function calculateFiberGoal(target_kcal: number): number {
  // 14g per 1000 kcal (IOM recommendation)
  return Math.round((target_kcal / 1000) * 14);
}
