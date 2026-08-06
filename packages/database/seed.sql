-- ==============================================================================
-- NUTRIAX PRO — SEED DATA (INITIAL TEST DATA FOR PAULO VITOR R. DE SOUSA)
-- ==============================================================================

-- 1. INSERT INITIAL USERS
INSERT INTO public.users (id, email, role, full_name)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'nutri.paulovitor@gmail.com', 'NUTRITIONIST', 'Paulo Vitor R de Sousa (Nutricionista ADMIN)'),
  ('00000000-0000-0000-0000-000000000002', 'paulovitor.rsousa3@gmail.com', 'PATIENT', 'Paulo Vitor R de Sousa')
ON CONFLICT (email) DO NOTHING;

-- 2. INSERT INITIAL PATIENT
INSERT INTO public.patients (id, user_id, nutritionist_id, birth_date, gender, height_m, current_weight_kg, target_weight_kg, goal, profile_type, activity_level, training_routine)
VALUES
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '1988-03-15',
    'Masculino',
    1.93,
    115.80,
    107.99,
    'Emagrecimento & Recomposição Corporal',
    'Praticante Recreativo',
    'Moderado (AF 1.43)',
    'Musculação 6x/semana (ABC, Vol. Alto) + Cardio HIIT 4x (15 min)'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT ANAMNESIS
INSERT INTO public.patient_anamnesis (patient_id, clinical_history, sports_data, daily_routine, sleep_quality, stress_level, cooking_availability)
VALUES
  (
    '00000000-0000-0000-0000-000000000003',
    'Sem comorbidades graves. Leve dislipidemia (LDL 169 mg/dL). Foco em saúde metabólica e redução de gordura abdominal.',
    'Musculação 6x por semana com alta intensidade. Cardio 4x na semana pós-treino.',
    'Trabalho de escritório (Desk-bound) com NEAT compensado em caminhadas diárias.',
    'BOA (7-8h)',
    'MODERADO',
    'Cozinha diariamente em batelada'
  )
ON CONFLICT (patient_id) DO NOTHING;

-- 4. INSERT ANTHROPOMETRICS (JACKSON POLLOCK 7)
INSERT INTO public.anthropometrics (patient_id, date, weight_kg, height_m, skinfolds_json, circumferences_json, bf_percent, muscle_mass_kg, fat_mass_kg, bmi, whr, whtr, ffmi)
VALUES
  (
    '00000000-0000-0000-0000-000000000003',
    '2026-07-09',
    115.80,
    1.93,
    '{"triceps": 14, "subscapular": 18, "suprailiac": 22, "abdominal": 28, "thigh": 16, "chest": 12, "midaxillary": 15}'::jsonb,
    '{"waist": 101.0, "abdomen": 102.0, "hip": 111.5, "chest": 118.0}'::jsonb,
    17.94,
    95.03,
    20.77,
    31.09,
    0.91,
    0.52,
    25.5
  )
ON CONFLICT DO NOTHING;

-- 5. INSERT LAB EXAMS
INSERT INTO public.lab_exams (patient_id, exam_name, category, result_value, unit, ref_min, ref_max, status_flag, priority, nutritionist_interpretation)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'Glicose Jejum', 'Glicêmico', '81', 'mg/dL', 70, 99, 'OK', 'Rotina', 'Excelente sensibilidade à insulina.'),
  ('00000000-0000-0000-0000-000000000003', 'Colesterol Total', 'Lipidograma', '245', 'mg/dL', 0, 190, 'HIGH', 'Média', 'Discretamente elevado.'),
  ('00000000-0000-0000-0000-000000000003', 'Colesterol LDL', 'Lipidograma', '169', 'mg/dL', 0, 130, 'HIGH', 'Alta', 'Aporte elevado de gorduras saturadas; otimizar fibras e ômega 3.'),
  ('00000000-0000-0000-0000-000000000003', 'Vitamina D (25-OH)', 'Vitaminas', '20', 'ng/mL', 30, 100, 'LOW', 'Média', 'Subótimo; iniciar suplementação de 5.000 UI/dia.')
ON CONFLICT DO NOTHING;

-- 6. INSERT NUTRITIONAL PLAN
INSERT INTO public.nutritional_plans (id, patient_id, nutritionist_id, bmr_kcal, get_kcal, target_kcal, protein_g, carb_g, lipid_g, fiber_g, is_active)
VALUES
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    2423,
    3464,
    2840,
    190,
    349,
    76,
    40,
    TRUE
  )
ON CONFLICT DO NOTHING;

-- 7. INSERT FOOD DATABASE TACO ITEMS
INSERT INTO public.food_database (name, category, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g)
VALUES
  ('Peito de Frango Grelhado', 'Proteínas', 165.0, 31.0, 0.0, 3.5, 0.0),
  ('Ovo de Galinha Mexido / Cozido', 'Proteínas', 154.0, 12.8, 1.0, 11.0, 0.0),
  ('Patinho Moído Grelhado', 'Proteínas', 219.0, 35.9, 0.0, 7.3, 0.0),
  ('Arroz Integral Cozido', 'Carboidratos', 124.0, 2.6, 25.8, 1.0, 2.7),
  ('Feijão Carioca Cozido', 'Leguminosas', 76.0, 4.8, 13.6, 0.5, 8.5),
  ('Pão 100% Integral', 'Carboidratos', 236.0, 10.8, 42.0, 2.8, 6.0),
  ('Azeite de Oliva Extra Virgem', 'Gorduras', 884.0, 0.0, 0.0, 100.0, 0.0),
  ('Iogurte Proteico YoPRO Danone', 'Laticínios', 62.5, 9.4, 5.0, 0.0, 0.0),
  ('Aveia em Flocos Finos', 'Cereais', 382.0, 14.0, 66.0, 7.5, 9.5)
ON CONFLICT DO NOTHING;
