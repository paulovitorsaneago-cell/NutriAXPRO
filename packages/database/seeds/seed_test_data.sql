-- ============================================================================
-- NutriAX Pro — Seed: Test Data
-- Patient: Paulo Vitor | Nutritionist: Dra. Ana Souza
-- Complete test scenario with anamnesis, exams, plan, prescription, food logs
-- ============================================================================
-- IMPORTANT: Run seed_food_database.sql BEFORE this file.
-- These UUIDs are deterministic for development/testing purposes only.
-- In production, auth.users records are created via Supabase Auth.
-- ============================================================================

-- ============================================================================
-- 1. USERS
-- ============================================================================

-- Nutritionist
INSERT INTO public.users (id, email, role, full_name, phone, crn) VALUES
('b0000001-0000-0000-0000-000000000001', 'ana.souza@nutriaxpro.com', 'nutritionist', 'Dra. Ana Souza', '(11) 99999-1234', 'CRN-3 12345');

-- Patient
INSERT INTO public.users (id, email, role, full_name, phone) VALUES
('b0000002-0000-0000-0000-000000000001', 'paulo.vitor@email.com', 'patient', 'Paulo Vitor Oliveira', '(11) 98888-5678');

-- ============================================================================
-- 2. PATIENT PROFILE
-- ============================================================================

INSERT INTO public.patients (id, user_id, nutritionist_id, birth_date, gender, height_m, activity_level, goal, occupation) VALUES
('c0000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '1995-03-15', 'male', 1.78, 'very_active', 'muscle_gain', 'Desenvolvedor de Software');

-- ============================================================================
-- 3. ANAMNESIS — Clínica
-- ============================================================================

INSERT INTO public.patient_anamnesis (
  id, patient_id, clinical_history, current_medications,
  allergies, food_intolerances, family_history,
  intestinal_function, bowel_frequency, gi_symptoms,
  daily_water_ml, water_goal_ml,
  usual_breakfast, usual_morning_snack, usual_lunch,
  usual_afternoon_snack, usual_dinner, usual_supper,
  food_preferences, food_aversions, cooking_skills,
  meals_per_day, eating_speed, emotional_eating, weekend_changes,
  current_supplements, filled_by_patient
) VALUES (
  'd0000001-0000-0000-0000-000000000001',
  'c0000001-0000-0000-0000-000000000001',
  'Sem patologias diagnosticadas. Dor lombar esporádica.',
  'Nenhum medicamento contínuo.',
  ARRAY['Camarão'],
  ARRAY['Lactose (parcial)'],
  'Pai: HAS. Mãe: DM tipo 2. Avó materna: DCV.',
  'type_4',
  '1x ao dia, manhã',
  ARRAY[]::TEXT[],
  2000,
  3500,
  'Pão com manteiga + café com leite',
  'Biscoito ou fruta quando tem',
  'Arroz, feijão, carne, salada pouca',
  'Café com pão ou nada',
  'Igual ao almoço ou lanche rápido',
  'Não costuma comer',
  'Frango, batata-doce, banana, aveia, ovo',
  'Fígado, beterraba, quiabo',
  'Básico, sabe cozinhar arroz/ovo/frango',
  4,
  'Rápido',
  FALSE,
  'Come mais no fim de semana, pizza/hambúrguer',
  '[{"name": "Whey Protein", "dosage": "30g", "frequency": "Pós-treino"}, {"name": "Creatina", "dosage": "5g", "frequency": "Diário"}]'::jsonb,
  TRUE
);

-- ============================================================================
-- 4. ANAMNESIS — Esportiva
-- ============================================================================

INSERT INTO public.patient_anamnesis_sports (
  id, patient_id, primary_modality, secondary_modalities,
  weekly_frequency, session_duration_min, training_time,
  training_experience, perceived_effort, uses_ergogenics,
  ergogenics_details, sports_goals, injuries_history
) VALUES (
  'd0000002-0000-0000-0000-000000000001',
  'c0000001-0000-0000-0000-000000000001',
  'Musculação',
  ARRAY['Caminhada'],
  5,
  75,
  'Noite',
  'Intermediário',
  7,
  TRUE,
  'Creatina monoidratada 5g/dia, cafeína pré-treino 200mg',
  'Ganho de massa muscular com manutenção de BF% abaixo de 15%',
  'Tendinite no ombro direito (2023), tratada com fisioterapia'
);

-- ============================================================================
-- 5. ANAMNESIS — Rotina
-- ============================================================================

INSERT INTO public.patient_anamnesis_routine (
  id, patient_id, wake_time, sleep_time, sleep_hours,
  sleep_quality, uses_sleep_aids, stress_level, stress_sources,
  work_schedule, who_cooks, meal_prep_available, has_kitchen_access,
  alcohol_consumption, smoking, recreational_drugs,
  daily_screen_hours, leisure_activities
) VALUES (
  'd0000003-0000-0000-0000-000000000001',
  'c0000001-0000-0000-0000-000000000001',
  '07:30',
  '23:30',
  7.5,
  'fair',
  FALSE,
  'moderate',
  ARRAY['Trabalho', 'Metas profissionais'],
  'Home Office',
  'Eu mesmo',
  TRUE,
  TRUE,
  'Social',
  FALSE,
  FALSE,
  10.0,
  ARRAY['Games', 'Séries', 'Caminhada no parque']
);

-- ============================================================================
-- 6. ANTHROPOMETRICS (1 avaliação)
-- ============================================================================

INSERT INTO public.anthropometrics (
  id, patient_id, assessed_by, assessment_date,
  weight_kg, bf_percentage, muscle_mass_kg, fat_mass_kg,
  bmi, ffmi, waist_hip_ratio, waist_height_ratio,
  skinfolds_mm, circumferences_cm,
  protocol_used, notes
) VALUES (
  'e0000001-0000-0000-0000-000000000001',
  'c0000001-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000001',
  '2026-07-28',
  82.5,
  16.8,
  68.6,
  13.9,
  26.0,
  21.7,
  0.84,
  0.47,
  '{"triceps": 11.0, "subscapular": 16.5, "chest": 9.0, "axillary": 12.0, "suprailiac": 15.0, "abdominal": 22.0, "thigh": 14.0}'::jsonb,
  '{"neck": 38.0, "chest": 102.0, "waist": 83.5, "hip": 99.0, "arm_relaxed_r": 34.5, "arm_contracted_r": 37.0, "forearm_r": 29.0, "thigh_proximal_r": 58.0, "calf_r": 38.5}'::jsonb,
  'jackson_pollock_7',
  'Primeira avaliação. Boa massa muscular, gordura abdominal moderada. Meta: reduzir para 13-14% BF mantendo massa magra.'
);

-- ============================================================================
-- 7. CLINICAL EXAMS (Hemograma + Lipidograma parcial)
-- ============================================================================

INSERT INTO public.clinical_exams (id, patient_id, entered_by, exam_date, exam_name, category, result_value, unit, ref_min, ref_max, status_flag, priority, nutritionist_interpretation, nutritional_conduct, dietary_guidelines) VALUES
-- Hemograma
('f0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-07-20', 'Hemoglobina', 'hemograma', 15.2, 'g/dL', 13.0, 17.5, 'normal', 0, 'Dentro da normalidade.', NULL, NULL),
('f0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-07-20', 'Hematócrito', 'hemograma', 45.1, '%', 38.0, 50.0, 'normal', 0, 'Adequado.', NULL, NULL),
-- Lipidograma
('f0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-07-20', 'Colesterol Total', 'lipidograma', 210, 'mg/dL', NULL, 190, 'attention', 2, 'Limítrofe. Histórico familiar de DCV.', 'Aumentar fibras solúveis e gorduras insaturadas. Reduzir gordura saturada.', ARRAY['Aumentar aveia e leguminosas', 'Incluir azeite de oliva', 'Reduzir queijos amarelos e embutidos']),
('f0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-07-20', 'LDL Colesterol', 'lipidograma', 138, 'mg/dL', NULL, 130, 'attention', 3, 'Acima do desejável para perfil com HF de DCV.', 'Priorizar gorduras mono e poli-insaturadas. Incluir fitosteróis.', ARRAY['2 castanhas-do-pará/dia', 'Abacate 3x/semana', 'Peixes gordurosos 2x/semana']),
('f0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-07-20', 'HDL Colesterol', 'lipidograma', 48, 'mg/dL', 40, NULL, 'normal', 0, 'Adequado, mas poderia estar mais alto. Exercício contribui.', NULL, NULL),
('f0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-07-20', 'Triglicerídeos', 'lipidograma', 145, 'mg/dL', NULL, 150, 'normal', 0, 'Dentro da faixa, mas próximo do limite.', NULL, NULL),
-- Glicêmico
('f0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-07-20', 'Glicemia de jejum', 'glicemico', 89, 'mg/dL', 70, 99, 'normal', 0, 'Normal. Mãe é DM2, monitorar anualmente.', NULL, NULL),
-- Vitaminas
('f0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-07-20', 'Vitamina D (25-OH)', 'vitaminas_minerais', 22, 'ng/mL', 30, 60, 'altered', 4, 'Insuficiente. Comum em home office com pouca exposição solar.', 'Sugerir suplementação com médico. Incluir fontes alimentares.', ARRAY['Incluir ovos diariamente', 'Salmão ou sardinha 2-3x/semana', 'Considerar exposição solar 15min/dia']);

-- ============================================================================
-- 8. NUTRITIONAL PLAN
-- ============================================================================

INSERT INTO public.nutritional_plans (
  id, patient_id, nutritionist_id, plan_name,
  bmr_formula, bmr_kcal, activity_factor, tef_factor, get_kcal,
  caloric_adjustment_kcal, target_kcal,
  protein_g, protein_pct, protein_per_kg,
  carb_g, carb_pct,
  lipid_g, lipid_pct, lipid_per_kg,
  fiber_g, sodium_mg, water_ml,
  is_active, valid_from, notes
) VALUES (
  'g0000001-0000-0000-0000-000000000001',
  'c0000001-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000001',
  'Fase 1 — Recomposição Corporal',
  'katch_mcardle',
  1852.0,    -- TMB Katch-McArdle: 370 + 21.6 * 68.6 = 1851.76
  1.725,     -- Very active
  1.10,
  3511.0,    -- GET: 1852 * 1.725 * 1.10 = 3513 (arredondado)
  -300,      -- Leve déficit para recomposição
  3200,
  198.0, 24.8, 2.4,   -- 2.4g/kg (hipertrofia)
  380.0, 47.5,          -- Carboidratos
  88.9, 25.0, 1.08,    -- Gorduras
  35, 2300, 3500,
  TRUE,
  '2026-07-28',
  'Recomposição corporal com leve déficit. Prioridade: manter massa magra, reduzir BF%. Atenção ao colesterol: priorizar gorduras insaturadas. Vit D insuficiente: incluir fontes alimentares.'
);

-- ============================================================================
-- 9. PRESCRIPTIONS (6 refeições)
-- ============================================================================

-- Café da Manhã
INSERT INTO public.prescriptions (id, plan_id, meal_name, meal_order, meal_time, instructions, total_kcal, total_protein_g, total_carb_g, total_lipid_g, total_fiber_g) VALUES
('h0000001-0000-0000-0000-000000000001', 'g0000001-0000-0000-0000-000000000001', 'Café da Manhã', 1, '07:30', 'Primeira refeição do dia. Incluir fontes de proteína e fibras.', 520, 38, 60, 14, 7);

INSERT INTO public.prescription_items (id, prescription_id, food_id, food_name, portion_description, weight_g_ml, item_order, calories_kcal, protein_g, carb_g, lipid_g, fiber_g) VALUES
('i0000001-0000-0000-0000-000000000001', 'h0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'Aveia em flocos', '3 colheres de sopa (45g)', 45, 1, 177, 6.3, 30.0, 3.8, 4.1),
('i0000001-0000-0000-0000-000000000002', 'h0000001-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000001', 'Banana prata', '1 unidade média', 86, 2, 84, 1.1, 22.4, 0.1, 1.7),
('i0000001-0000-0000-0000-000000000003', 'h0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003', 'Ovo cozido', '2 unidades', 100, 3, 146, 13.3, 0.6, 9.5, 0),
('i0000001-0000-0000-0000-000000000004', 'h0000001-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000002', 'Iogurte natural desnatado', '1 pote (170g)', 170, 4, 71, 7.0, 9.4, 0.5, 0);

-- Lanche da Manhã
INSERT INTO public.prescriptions (id, plan_id, meal_name, meal_order, meal_time, instructions, total_kcal, total_protein_g, total_carb_g, total_lipid_g) VALUES
('h0000001-0000-0000-0000-000000000002', 'g0000001-0000-0000-0000-000000000001', 'Lanche da Manhã', 2, '10:00', NULL, 320, 28, 30, 10);

INSERT INTO public.prescription_items (id, prescription_id, food_id, food_name, portion_description, weight_g_ml, item_order, calories_kcal, protein_g, carb_g, lipid_g) VALUES
('i0000002-0000-0000-0000-000000000001', 'h0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000004', 'Pão integral', '2 fatias', 50, 1, 127, 4.7, 25.0, 1.7),
('i0000002-0000-0000-0000-000000000002', 'h0000001-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000001', 'Peito de frango desfiado', '80g', 80, 2, 127, 25.6, 0, 2.6),
('i0000002-0000-0000-0000-000000000003', 'h0000001-0000-0000-0000-000000000002', 'a0000007-0000-0000-0000-000000000001', 'Azeite de oliva', '1 colher de chá', 5, 3, 44, 0, 0, 5.0);

-- Almoço
INSERT INTO public.prescriptions (id, plan_id, meal_name, meal_order, meal_time, instructions, total_kcal, total_protein_g, total_carb_g, total_lipid_g, total_fiber_g) VALUES
('h0000001-0000-0000-0000-000000000003', 'g0000001-0000-0000-0000-000000000001', 'Almoço', 3, '12:30', 'Refeição principal. Incluir vegetais variados e fonte de gordura boa.', 750, 45, 85, 22, 10);

INSERT INTO public.prescription_items (id, prescription_id, food_id, food_name, portion_description, weight_g_ml, item_order, calories_kcal, protein_g, carb_g, lipid_g, fiber_g) VALUES
('i0000003-0000-0000-0000-000000000001', 'h0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Arroz integral', '2 escumadeiras (150g)', 150, 1, 186, 3.9, 38.7, 1.5, 4.1),
('i0000003-0000-0000-0000-000000000002', 'h0000001-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000001', 'Feijão carioca', '1 concha (86g)', 86, 2, 65, 4.1, 11.7, 0.4, 7.3),
('i0000003-0000-0000-0000-000000000003', 'h0000001-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000002', 'Patinho bovino grelhado', '150g', 150, 3, 329, 53.9, 0, 11.0, 0),
('i0000003-0000-0000-0000-000000000004', 'h0000001-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000001', 'Brócolis cozido', '1 xícara (60g)', 60, 4, 15, 1.3, 2.6, 0.3, 2.0),
('i0000003-0000-0000-0000-000000000005', 'h0000001-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000003', 'Salada (alface, tomate)', '1 prato', 100, 5, 13, 1.2, 2.4, 0.2, 1.5),
('i0000003-0000-0000-0000-000000000006', 'h0000001-0000-0000-0000-000000000003', 'a0000007-0000-0000-0000-000000000001', 'Azeite de oliva', '1 colher de sopa', 13, 6, 115, 0, 0, 13.0, 0);

-- Lanche da Tarde
INSERT INTO public.prescriptions (id, plan_id, meal_name, meal_order, meal_time, instructions, total_kcal, total_protein_g, total_carb_g, total_lipid_g) VALUES
('h0000001-0000-0000-0000-000000000004', 'g0000001-0000-0000-0000-000000000001', 'Lanche da Tarde / Pré-Treino', 4, '17:00', 'Consumir 60-90 min antes do treino. Foco em carboidrato de fácil digestão + proteína.', 480, 30, 65, 10);

INSERT INTO public.prescription_items (id, prescription_id, food_id, food_name, portion_description, weight_g_ml, item_order, calories_kcal, protein_g, carb_g, lipid_g) VALUES
('i0000004-0000-0000-0000-000000000001', 'h0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000007', 'Batata-doce cozida', '1 unidade média (130g)', 130, 1, 100, 0.8, 23.9, 0.1),
('i0000004-0000-0000-0000-000000000002', 'h0000001-0000-0000-0000-000000000004', 'a0000003-0000-0000-0000-000000000001', 'Peito de frango grelhado', '120g', 120, 2, 191, 38.4, 0, 3.8),
('i0000004-0000-0000-0000-000000000003', 'h0000001-0000-0000-0000-000000000004', 'a0000005-0000-0000-0000-000000000001', 'Banana prata', '1 unidade média', 86, 3, 84, 1.1, 22.4, 0.1);

-- Pós-Treino
INSERT INTO public.prescriptions (id, plan_id, meal_name, meal_order, meal_time, instructions, total_kcal, total_protein_g, total_carb_g, total_lipid_g) VALUES
('h0000001-0000-0000-0000-000000000005', 'g0000001-0000-0000-0000-000000000001', 'Pós-Treino', 5, '19:30', 'Imediatamente após o treino. Proteína rápida + carboidrato.', 350, 32, 45, 5);

INSERT INTO public.prescription_items (id, prescription_id, food_id, food_name, portion_description, weight_g_ml, item_order, calories_kcal, protein_g, carb_g, lipid_g) VALUES
('i0000005-0000-0000-0000-000000000001', 'h0000001-0000-0000-0000-000000000005', 'a0000004-0000-0000-0000-000000000005', 'Whey Protein', '1 scoop (30g)', 30, 1, 120, 24.0, 2.4, 1.8),
('i0000005-0000-0000-0000-000000000002', 'h0000001-0000-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000001', 'Banana prata', '1 unidade grande', 110, 2, 108, 1.4, 28.6, 0.1),
('i0000005-0000-0000-0000-000000000003', 'h0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000003', 'Aveia em flocos', '2 colheres de sopa', 30, 3, 118, 4.2, 20.0, 2.6);

-- Jantar
INSERT INTO public.prescriptions (id, plan_id, meal_name, meal_order, meal_time, instructions, total_kcal, total_protein_g, total_carb_g, total_lipid_g, total_fiber_g) VALUES
('h0000001-0000-0000-0000-000000000006', 'g0000001-0000-0000-0000-000000000001', 'Jantar', 6, '21:00', 'Última grande refeição. Incluir salmão para vitamina D e ômega-3 (conduta LDL + Vit D).', 680, 40, 70, 25, 8);

INSERT INTO public.prescription_items (id, prescription_id, food_id, food_name, portion_description, weight_g_ml, item_order, calories_kcal, protein_g, carb_g, lipid_g, fiber_g, notes) VALUES
('i0000006-0000-0000-0000-000000000001', 'h0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000007', 'Batata-doce cozida', '1 unidade média (130g)', 130, 1, 100, 0.8, 23.9, 0.1, 2.9, NULL),
('i0000006-0000-0000-0000-000000000002', 'h0000001-0000-0000-0000-000000000006', 'a0000003-0000-0000-0000-000000000005', 'Salmão grelhado', '1 filé (120g)', 120, 2, 292, 31.3, 0, 18.1, 0, 'Fonte de Vit D + Ômega-3. Conduta: Vit D insuficiente + LDL limítrofe.'),
('i0000006-0000-0000-0000-000000000003', 'h0000001-0000-0000-0000-000000000006', 'a0000006-0000-0000-0000-000000000005', 'Abobrinha refogada', '100g', 100, 3, 15, 0.8, 3.0, 0.1, 1.4, NULL),
('i0000006-0000-0000-0000-000000000004', 'h0000001-0000-0000-0000-000000000006', 'a0000005-0000-0000-0000-000000000005', 'Abacate', '3 colheres de sopa (60g)', 60, 4, 58, 0.7, 3.6, 5.0, 3.8, 'Gordura monoinsaturada — conduta LDL.'),
('i0000006-0000-0000-0000-000000000005', 'h0000001-0000-0000-0000-000000000006', 'a0000007-0000-0000-0000-000000000002', 'Castanha-do-pará', '2 unidades', 10, 5, 64, 1.5, 1.2, 6.4, 0.8, 'Selênio — 2 unidades/dia. Conduta lipidograma.');

-- ============================================================================
-- 10. FOOD LOGS (3 dias de exemplo)
-- ============================================================================

-- Dia 1: 2026-07-29 (terça) — Boa adesão
INSERT INTO public.food_logs (id, patient_id, log_date, meal_name, status, total_kcal, total_protein_g, total_carb_g, total_lipid_g, water_ml, hunger_level, notes) VALUES
('j0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', '2026-07-29', 'Café da Manhã', 'completed', 510, 36, 58, 14, 500, 7, NULL),
('j0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', '2026-07-29', 'Lanche da Manhã', 'completed', 300, 26, 28, 9, 300, 4, NULL),
('j0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', '2026-07-29', 'Almoço', 'completed', 740, 44, 82, 21, 500, 8, 'Comi tudo conforme prescrito'),
('j0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001', '2026-07-29', 'Lanche da Tarde / Pré-Treino', 'completed', 470, 29, 63, 10, 300, 6, NULL),
('j0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000001', '2026-07-29', 'Pós-Treino', 'completed', 340, 30, 43, 5, 700, 9, NULL),
('j0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000001', '2026-07-29', 'Jantar', 'completed', 670, 39, 68, 24, 400, 5, NULL);

-- Dia 2: 2026-07-30 (quarta) — Adesão parcial
INSERT INTO public.food_logs (id, patient_id, log_date, meal_name, status, total_kcal, total_protein_g, total_carb_g, total_lipid_g, water_ml, hunger_level, notes) VALUES
('j0000002-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', '2026-07-30', 'Café da Manhã', 'completed', 500, 35, 57, 13, 400, 6, NULL),
('j0000002-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', '2026-07-30', 'Lanche da Manhã', 'skipped', 0, 0, 0, 0, 200, 3, 'Reunião longa, não consegui comer'),
('j0000002-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', '2026-07-30', 'Almoço', 'substituted', 800, 40, 95, 25, 500, 9, 'Troquei patinho por frango desfiado. Comi mais arroz.'),
('j0000002-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001', '2026-07-30', 'Lanche da Tarde / Pré-Treino', 'completed', 460, 28, 62, 9, 300, 5, NULL),
('j0000002-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000001', '2026-07-30', 'Pós-Treino', 'completed', 350, 31, 44, 5, 600, 8, NULL),
('j0000002-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000001', '2026-07-30', 'Jantar', 'partial', 500, 30, 55, 18, 300, 4, 'Estava sem fome, comi menos');

-- Dia 3: 2026-07-31 (quinta) — Boa adesão
INSERT INTO public.food_logs (id, patient_id, log_date, meal_name, status, total_kcal, total_protein_g, total_carb_g, total_lipid_g, water_ml, hunger_level) VALUES
('j0000003-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', '2026-07-31', 'Café da Manhã', 'completed', 525, 37, 61, 14, 500, 7),
('j0000003-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', '2026-07-31', 'Lanche da Manhã', 'completed', 310, 27, 29, 9, 400, 5),
('j0000003-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', '2026-07-31', 'Almoço', 'completed', 745, 44, 84, 22, 500, 8),
('j0000003-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001', '2026-07-31', 'Lanche da Tarde / Pré-Treino', 'completed', 475, 30, 64, 10, 300, 6),
('j0000003-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000001', '2026-07-31', 'Pós-Treino', 'completed', 345, 31, 44, 5, 700, 9),
('j0000003-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000001', '2026-07-31', 'Jantar', 'completed', 675, 40, 69, 25, 500, 5);

-- ============================================================================
-- End of Seed: Test Data
-- ============================================================================
