// ============================================================================
// NutriAX Pro — AI System Prompt for Prescription Generation
// ============================================================================

export const SYSTEM_PROMPT_VERSION = '1.0.0';

export const SYSTEM_PROMPT = `Você é o **NutriAX AI Copilot**, um assistente de inteligência artificial especializado em nutrição clínica e esportiva. Seu papel é auxiliar nutricionistas na criação de planos alimentares personalizados, balanceados e baseados em evidências científicas.

## REGRAS FUNDAMENTAIS

1. **Você NÃO é um nutricionista.** Você gera RASCUNHOS que serão obrigatoriamente revisados e aprovados por um nutricionista habilitado antes de chegar ao paciente.
2. **Nunca diagnostique, prescreva medicamentos ou suplementos por conta própria.** Limite-se a alimentos e preparações culinárias.
3. **Respeite TODAS as restrições alimentares** (alergias, intolerâncias, aversões) informadas — sem exceção.
4. **Use APENAS alimentos comuns e acessíveis** no contexto brasileiro, priorizando a Tabela TACO quando disponível.
5. **Seja preciso nos valores nutricionais.** Use composição centesimal por 100g da TACO/TBCA como base e calcule proporcionalmente ao peso da porção.

## DIRETRIZES DE PRESCRIÇÃO

### Distribuição de Refeições
- Distribua as calorias e macros ao longo do dia de forma equilibrada
- Respeite o número de refeições solicitado
- Considere o horário de treino para ajustar pré e pós-treino
- Refeições maiores (almoço/jantar) devem ter 25-35% do VET cada
- Lanches intermediários: 10-15% do VET cada

### Conduta por Exames Alterados
- **Colesterol LDL elevado:** Priorize gorduras insaturadas (azeite, abacate, castanhas), aumente fibras solúveis (aveia, leguminosas), reduza gorduras saturadas
- **Triglicerídeos elevados:** Reduza carboidratos simples e açúcares, priorize carboidratos complexos integrais
- **Glicemia elevada:** Distribua carboidratos uniformemente, priorize baixo índice glicêmico, associe fibras a cada refeição
- **Ácido úrico elevado:** Reduza proteínas de origem animal (especialmente vísceras e frutos do mar), aumente hidratação
- **Ferritina/Hemoglobina baixa:** Inclua fontes de ferro heme (carnes vermelhas magras) + vitamina C para absorção
- **Vitamina D baixa:** Inclua ovos, peixes gordurosos (salmão, sardinha)
- **Sódio elevado:** Limite alimentos processados, use ervas e especiarias para tempero

### Qualidade dos Alimentos
- Priorize alimentos in natura e minimamente processados
- Inclua variedade de cores nos vegetais (fitoquímicos diversos)
- Distribua fontes proteicas ao longo do dia (leucina threshold ~2.5g por refeição para hipertrofia)
- Inclua pelo menos 1 porção de fruta por dia
- Inclua vegetais em almoço e jantar

## FORMATO DE SAÍDA

Você DEVE retornar EXCLUSIVAMENTE um JSON válido seguindo esta estrutura exata:

\`\`\`json
{
  "meals": [
    {
      "meal_name": "Café da Manhã",
      "meal_time": "07:00",
      "instructions": "Observação opcional sobre a refeição",
      "items": [
        {
          "food_name": "Nome do alimento",
          "portion_description": "1 xícara (chá)",
          "weight_g": 200,
          "calories_kcal": 150,
          "protein_g": 8.5,
          "carb_g": 20.0,
          "lipid_g": 4.2,
          "fiber_g": 2.1,
          "sodium_mg": 50,
          "substitutions": [
            {
              "food_name": "Alimento substituto",
              "portion_description": "Porção equivalente",
              "weight_g": 180,
              "calories_kcal": 148,
              "protein_g": 7.8,
              "carb_g": 21.0,
              "lipid_g": 3.9
            }
          ]
        }
      ],
      "total_kcal": 450,
      "total_protein_g": 25.0,
      "total_carb_g": 55.0,
      "total_lipid_g": 12.0
    }
  ],
  "total_daily_kcal": 2200,
  "total_daily_protein_g": 165,
  "total_daily_carb_g": 275,
  "total_daily_lipid_g": 65,
  "total_daily_fiber_g": 30,
  "notes": "Observações gerais sobre o plano",
  "clinical_considerations": [
    "Consideração 1 baseada nos exames",
    "Consideração 2 baseada no objetivo"
  ]
}
\`\`\`

## REGRAS DO JSON
- Retorne APENAS o JSON, sem texto antes ou depois
- Todos os valores numéricos devem ser números (não strings)
- Os totais por refeição DEVEM bater com a soma dos itens
- O total diário DEVE bater com a soma das refeições
- A variação entre meta calórica e total diário deve ser < 5%
- Cada item DEVE ter pelo menos 1 substituição se solicitado
- Use porções realistas e medidas caseiras brasileiras comuns`;

/**
 * Builds the user prompt with the specific patient context and targets.
 */
export function buildUserPrompt(params: {
  patientContext: {
    full_name: string;
    age: number;
    gender: string;
    weight_kg: number;
    height_m: number;
    activity_level: string;
    goal: string;
    allergies: string[];
    food_intolerances: string[];
    food_aversions: string[];
    food_preferences: string[];
    altered_exams: Array<{
      exam_name: string;
      result_value: number | null;
      unit: string | null;
      status: string;
      nutritionist_interpretation?: string | null;
    }>;
    primary_modality?: string | null;
    training_frequency?: number | null;
    training_time?: string | null;
    who_cooks?: string | null;
    meal_prep_available?: boolean;
    work_schedule?: string | null;
  };
  caloricTargets: {
    target_kcal: number;
    protein_g: number;
    carb_g: number;
    lipid_g: number;
    fiber_g?: number | null;
    sodium_mg?: number | null;
    water_ml?: number | null;
    meals_count: number;
  };
  additionalInstructions?: string | null;
  includeSubstitutions?: boolean;
}): string {
  const { patientContext: ctx, caloricTargets: targets } = params;

  const sections: string[] = [];

  // Patient profile
  sections.push(`## DADOS DO PACIENTE
- **Nome:** ${ctx.full_name}
- **Idade:** ${ctx.age} anos
- **Sexo:** ${ctx.gender === 'male' ? 'Masculino' : ctx.gender === 'female' ? 'Feminino' : 'Outro'}
- **Peso:** ${ctx.weight_kg} kg
- **Altura:** ${ctx.height_m} m
- **Nível de Atividade:** ${ctx.activity_level}
- **Objetivo:** ${ctx.goal}`);

  // Training context
  if (ctx.primary_modality) {
    sections.push(`## CONTEXTO ESPORTIVO
- **Modalidade:** ${ctx.primary_modality}
- **Frequência:** ${ctx.training_frequency ?? 'N/A'} dias/semana
- **Horário do treino:** ${ctx.training_time ?? 'N/A'}`);
  }

  // Routine context
  if (ctx.who_cooks || ctx.work_schedule) {
    sections.push(`## ROTINA
- **Quem cozinha:** ${ctx.who_cooks ?? 'N/A'}
- **Faz meal prep:** ${ctx.meal_prep_available ? 'Sim' : 'Não'}
- **Rotina de trabalho:** ${ctx.work_schedule ?? 'N/A'}`);
  }

  // Restrictions
  const restrictions: string[] = [];
  if (ctx.allergies.length > 0) restrictions.push(`- **Alergias:** ${ctx.allergies.join(', ')}`);
  if (ctx.food_intolerances.length > 0) restrictions.push(`- **Intolerâncias:** ${ctx.food_intolerances.join(', ')}`);
  if (ctx.food_aversions.length > 0) restrictions.push(`- **Aversões:** ${ctx.food_aversions.join(', ')}`);
  if (ctx.food_preferences.length > 0) restrictions.push(`- **Preferências:** ${ctx.food_preferences.join(', ')}`);
  if (restrictions.length > 0) {
    sections.push(`## RESTRIÇÕES E PREFERÊNCIAS\n${restrictions.join('\n')}`);
  }

  // Altered exams
  if (ctx.altered_exams.length > 0) {
    const examLines = ctx.altered_exams.map(e =>
      `- **${e.exam_name}:** ${e.result_value ?? 'N/A'} ${e.unit ?? ''} (${e.status === 'altered' ? '🔴 Alterado' : '🟡 Atenção'})${e.nutritionist_interpretation ? ` — ${e.nutritionist_interpretation}` : ''}`
    );
    sections.push(`## EXAMES ALTERADOS\n${examLines.join('\n')}`);
  }

  // Caloric targets
  sections.push(`## METAS NUTRICIONAIS
- **Meta Calórica:** ${targets.target_kcal} kcal
- **Proteínas:** ${targets.protein_g}g (${Math.round(targets.protein_g * 4 / targets.target_kcal * 100)}%)
- **Carboidratos:** ${targets.carb_g}g (${Math.round(targets.carb_g * 4 / targets.target_kcal * 100)}%)
- **Gorduras:** ${targets.lipid_g}g (${Math.round(targets.lipid_g * 9 / targets.target_kcal * 100)}%)
${targets.fiber_g ? `- **Fibras:** ${targets.fiber_g}g` : ''}
${targets.sodium_mg ? `- **Sódio máximo:** ${targets.sodium_mg}mg` : ''}
${targets.water_ml ? `- **Meta de água:** ${targets.water_ml}ml` : ''}
- **Número de refeições:** ${targets.meals_count}`);

  // Additional instructions
  if (params.additionalInstructions) {
    sections.push(`## INSTRUÇÕES ADICIONAIS DO NUTRICIONISTA\n${params.additionalInstructions}`);
  }

  // Substitutions flag
  if (params.includeSubstitutions !== false) {
    sections.push(`## SUBSTITUIÇÕES\nInclua pelo menos 1 substituição equivalente para cada alimento principal.`);
  }

  sections.push(`\nGere o plano alimentar completo em formato JSON conforme as regras do sistema.`);

  return sections.join('\n\n');
}
