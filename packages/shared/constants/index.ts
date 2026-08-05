// ============================================================================
// NutriAX Pro — Shared Constants & Enum Values
// ============================================================================

export const USER_ROLES = ['nutritionist', 'patient'] as const;
export const GENDERS = ['male', 'female', 'other'] as const;
export const ACTIVITY_LEVELS = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'] as const;
export const GOAL_TYPES = ['fat_loss', 'muscle_gain', 'maintenance', 'health', 'performance'] as const;
export const EXAM_STATUSES = ['normal', 'attention', 'altered'] as const;
export const EXAM_CATEGORIES = ['hemograma', 'lipidograma', 'glicemico', 'hepatico', 'renal', 'hormonal', 'inflamatorio', 'vitaminas_minerais', 'tireoidiano', 'outros'] as const;
export const BRISTOL_SCALES = ['type_1', 'type_2', 'type_3', 'type_4', 'type_5', 'type_6', 'type_7'] as const;
export const STRESS_LEVELS = ['low', 'moderate', 'high', 'very_high'] as const;
export const SLEEP_QUALITIES = ['poor', 'fair', 'good', 'excellent'] as const;
export const MEAL_LOG_STATUSES = ['completed', 'partial', 'skipped', 'substituted', 'fasting'] as const;
export const FOOD_SOURCES = ['taco', 'tbca', 'usda', 'custom'] as const;
export const ANTHROPOMETRIC_PROTOCOLS = ['jackson_pollock_7', 'jackson_pollock_3', 'guedes', 'petroski', 'faulkner', 'durnin_womersley', 'other'] as const;
export const BMR_FORMULAS = ['katch_mcardle', 'mifflin_st_jeor', 'harris_benedict', 'cunningham'] as const;

// Activity factor multipliers for GET calculation
export const ACTIVITY_FACTORS: Record<typeof ACTIVITY_LEVELS[number], number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

// Bristol scale labels (pt-BR)
export const BRISTOL_LABELS: Record<typeof BRISTOL_SCALES[number], string> = {
  type_1: 'Tipo 1 — Caroços duros separados',
  type_2: 'Tipo 2 — Forma de salsicha com caroços',
  type_3: 'Tipo 3 — Salsicha com fissuras na superfície',
  type_4: 'Tipo 4 — Salsicha lisa e macia (ideal)',
  type_5: 'Tipo 5 — Pedaços macios com bordas claras',
  type_6: 'Tipo 6 — Pedaços fofos com bordas irregulares',
  type_7: 'Tipo 7 — Aquoso, sem pedaços sólidos',
};

// Default meal structure (pt-BR)
export const DEFAULT_MEALS = [
  { name: 'Café da Manhã', order: 1, time: '07:00' },
  { name: 'Lanche da Manhã', order: 2, time: '10:00' },
  { name: 'Almoço', order: 3, time: '12:30' },
  { name: 'Lanche da Tarde', order: 4, time: '15:30' },
  { name: 'Pré-Treino', order: 5, time: '17:00' },
  { name: 'Jantar', order: 6, time: '19:30' },
  { name: 'Ceia', order: 7, time: '21:30' },
] as const;

// Macronutrient kcal per gram
export const KCAL_PER_GRAM = {
  protein: 4,
  carb: 4,
  lipid: 9,
  fiber: 2, // partially digestible
  alcohol: 7,
} as const;
