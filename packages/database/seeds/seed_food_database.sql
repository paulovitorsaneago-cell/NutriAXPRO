-- ============================================================================
-- NutriAX Pro — Seed: Food Database (TACO 4ª Edição — Amostra Representativa)
-- ~50 alimentos comuns com composição centesimal por 100g
-- Fonte: Tabela Brasileira de Composição de Alimentos (TACO/UNICAMP)
-- ============================================================================

-- Nota: Valores baseados na TACO 4ª edição. Arredondados para praticidade.
-- Os IDs são fixos para uso no seed_test_data.sql

-- ============================================================================
-- CEREAIS E DERIVADOS
-- ============================================================================

INSERT INTO public.food_database (id, name, category, source, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g, sodium_mg_100g, iron_mg_100g, calcium_mg_100g) VALUES
('a0000001-0000-0000-0000-000000000001', 'Arroz integral cozido', 'Cereais e derivados', 'taco', 124, 2.6, 25.8, 1.0, 2.7, 1, 0.3, 5),
('a0000001-0000-0000-0000-000000000002', 'Arroz branco cozido', 'Cereais e derivados', 'taco', 128, 2.5, 28.1, 0.2, 1.6, 1, 0.1, 4),
('a0000001-0000-0000-0000-000000000003', 'Aveia em flocos', 'Cereais e derivados', 'taco', 394, 13.9, 66.6, 8.5, 9.1, 5, 4.4, 48),
('a0000001-0000-0000-0000-000000000004', 'Pão integral (forma)', 'Cereais e derivados', 'taco', 253, 9.4, 49.9, 3.4, 6.9, 491, 2.7, 103),
('a0000001-0000-0000-0000-000000000005', 'Pão francês', 'Cereais e derivados', 'taco', 300, 8.0, 58.6, 3.1, 2.3, 648, 1.0, 19),
('a0000001-0000-0000-0000-000000000006', 'Macarrão cozido', 'Cereais e derivados', 'taco', 102, 3.4, 19.9, 0.5, 1.5, 1, 0.4, 5),
('a0000001-0000-0000-0000-000000000007', 'Batata-doce cozida', 'Cereais e derivados', 'taco', 77, 0.6, 18.4, 0.1, 2.2, 8, 0.2, 17),
('a0000001-0000-0000-0000-000000000008', 'Mandioca cozida', 'Cereais e derivados', 'taco', 125, 0.6, 30.1, 0.3, 1.6, 2, 0.2, 19),
('a0000001-0000-0000-0000-000000000009', 'Tapioca (goma)', 'Cereais e derivados', 'taco', 342, 0.5, 83.2, 0.3, 0.8, 3, 0.3, 16);

-- ============================================================================
-- LEGUMINOSAS
-- ============================================================================

INSERT INTO public.food_database (id, name, category, source, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g, sodium_mg_100g, iron_mg_100g, calcium_mg_100g) VALUES
('a0000002-0000-0000-0000-000000000001', 'Feijão carioca cozido', 'Leguminosas', 'taco', 76, 4.8, 13.6, 0.5, 8.5, 2, 1.3, 27),
('a0000002-0000-0000-0000-000000000002', 'Feijão preto cozido', 'Leguminosas', 'taco', 77, 4.5, 14.0, 0.5, 8.4, 2, 1.5, 29),
('a0000002-0000-0000-0000-000000000003', 'Lentilha cozida', 'Leguminosas', 'taco', 93, 6.3, 16.3, 0.5, 7.9, 2, 1.5, 16),
('a0000002-0000-0000-0000-000000000004', 'Grão-de-bico cozido', 'Leguminosas', 'taco', 130, 6.7, 19.3, 2.6, 5.1, 2, 2.1, 37);

-- ============================================================================
-- CARNES E OVOS
-- ============================================================================

INSERT INTO public.food_database (id, name, category, source, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g, sodium_mg_100g, iron_mg_100g, calcium_mg_100g) VALUES
('a0000003-0000-0000-0000-000000000001', 'Peito de frango grelhado', 'Carnes e ovos', 'taco', 159, 32.0, 0, 3.2, 0, 51, 0.3, 4),
('a0000003-0000-0000-0000-000000000002', 'Patinho bovino grelhado', 'Carnes e ovos', 'taco', 219, 35.9, 0, 7.3, 0, 56, 3.0, 4),
('a0000003-0000-0000-0000-000000000003', 'Ovo de galinha cozido', 'Carnes e ovos', 'taco', 146, 13.3, 0.6, 9.5, 0, 146, 1.5, 49),
('a0000003-0000-0000-0000-000000000004', 'Ovo de galinha (clara cozida)', 'Carnes e ovos', 'taco', 59, 12.6, 1.2, 0.2, 0, 180, 0.1, 6),
('a0000003-0000-0000-0000-000000000005', 'Salmão grelhado', 'Carnes e ovos', 'taco', 243, 26.1, 0, 15.1, 0, 62, 0.7, 20),
('a0000003-0000-0000-0000-000000000006', 'Atum em conserva (light)', 'Carnes e ovos', 'taco', 116, 25.5, 0, 1.4, 0, 351, 1.4, 10),
('a0000003-0000-0000-0000-000000000007', 'Carne moída refogada', 'Carnes e ovos', 'taco', 212, 26.7, 0, 11.2, 0, 49, 2.4, 7),
('a0000003-0000-0000-0000-000000000008', 'Peito de peru defumado', 'Carnes e ovos', 'taco', 130, 16.9, 2.1, 5.9, 0, 875, 0.4, 10);

-- ============================================================================
-- LATICÍNIOS
-- ============================================================================

INSERT INTO public.food_database (id, name, category, source, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g, sodium_mg_100g, calcium_mg_100g) VALUES
('a0000004-0000-0000-0000-000000000001', 'Leite desnatado', 'Laticínios', 'taco', 35, 3.4, 4.9, 0.2, 0, 56, 134),
('a0000004-0000-0000-0000-000000000002', 'Iogurte natural desnatado', 'Laticínios', 'taco', 42, 4.1, 5.5, 0.3, 0, 52, 143),
('a0000004-0000-0000-0000-000000000003', 'Queijo cottage', 'Laticínios', 'taco', 101, 11.5, 3.4, 4.3, 0, 380, 83),
('a0000004-0000-0000-0000-000000000004', 'Queijo minas frescal', 'Laticínios', 'taco', 264, 17.4, 3.2, 20.2, 0, 559, 579),
('a0000004-0000-0000-0000-000000000005', 'Whey protein (concentrado)', 'Laticínios', 'custom', 400, 80.0, 8.0, 6.0, 0, 200, 500);

-- ============================================================================
-- FRUTAS
-- ============================================================================

INSERT INTO public.food_database (id, name, category, source, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g, sodium_mg_100g, vitamin_c_mg_100g, potassium_mg_100g) VALUES
('a0000005-0000-0000-0000-000000000001', 'Banana prata', 'Frutas', 'taco', 98, 1.3, 26.0, 0.1, 2.0, 0, 21.6, 376),
('a0000005-0000-0000-0000-000000000002', 'Maçã com casca', 'Frutas', 'taco', 63, 0.3, 16.6, 0.1, 2.0, 0, 2.4, 77),
('a0000005-0000-0000-0000-000000000003', 'Mamão papaya', 'Frutas', 'taco', 40, 0.5, 10.4, 0.1, 1.8, 3, 78.5, 222),
('a0000005-0000-0000-0000-000000000004', 'Morango fresco', 'Frutas', 'taco', 30, 0.9, 6.8, 0.3, 1.7, 0, 63.6, 184),
('a0000005-0000-0000-0000-000000000005', 'Abacate (polpa)', 'Frutas', 'taco', 96, 1.2, 6.0, 8.4, 6.3, 0, 8.7, 206),
('a0000005-0000-0000-0000-000000000006', 'Laranja pera', 'Frutas', 'taco', 37, 1.0, 8.9, 0.1, 0.8, 0, 53.7, 163),
('a0000005-0000-0000-0000-000000000007', 'Manga (polpa)', 'Frutas', 'taco', 64, 0.4, 16.7, 0.4, 1.6, 0, 17.4, 138);

-- ============================================================================
-- HORTALIÇAS
-- ============================================================================

INSERT INTO public.food_database (id, name, category, source, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g, sodium_mg_100g, vitamin_c_mg_100g) VALUES
('a0000006-0000-0000-0000-000000000001', 'Brócolis cozido', 'Hortaliças', 'taco', 25, 2.1, 4.4, 0.5, 3.4, 5, 42.0),
('a0000006-0000-0000-0000-000000000002', 'Tomate cru', 'Hortaliças', 'taco', 15, 1.1, 3.1, 0.2, 1.2, 2, 21.2),
('a0000006-0000-0000-0000-000000000003', 'Alface crespa crua', 'Hortaliças', 'taco', 11, 1.3, 1.7, 0.2, 1.8, 3, 15.6),
('a0000006-0000-0000-0000-000000000004', 'Cenoura crua', 'Hortaliças', 'taco', 34, 1.3, 7.7, 0.2, 3.2, 3, 3.0),
('a0000006-0000-0000-0000-000000000005', 'Abobrinha cozida', 'Hortaliças', 'taco', 15, 0.8, 3.0, 0.1, 1.4, 1, 5.0),
('a0000006-0000-0000-0000-000000000006', 'Espinafre cozido', 'Hortaliças', 'taco', 22, 2.6, 3.1, 0.2, 2.1, 40, 15.0);

-- ============================================================================
-- ÓLEOS, GORDURAS E OLEAGINOSAS
-- ============================================================================

INSERT INTO public.food_database (id, name, category, source, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g, sodium_mg_100g) VALUES
('a0000007-0000-0000-0000-000000000001', 'Azeite de oliva extra virgem', 'Óleos e gorduras', 'taco', 884, 0, 0, 100.0, 0, 0),
('a0000007-0000-0000-0000-000000000002', 'Castanha-do-pará', 'Oleaginosas', 'taco', 643, 14.5, 12.3, 63.5, 7.9, 1),
('a0000007-0000-0000-0000-000000000003', 'Amendoim torrado', 'Oleaginosas', 'taco', 606, 27.2, 20.3, 49.2, 8.0, 5),
('a0000007-0000-0000-0000-000000000004', 'Pasta de amendoim (integral)', 'Oleaginosas', 'custom', 597, 25.0, 20.0, 50.0, 6.0, 10),
('a0000007-0000-0000-0000-000000000005', 'Castanha de caju', 'Oleaginosas', 'taco', 570, 18.5, 29.1, 46.3, 3.7, 7);

-- ============================================================================
-- OUTROS
-- ============================================================================

INSERT INTO public.food_database (id, name, category, source, kcal_100g, protein_100g, carb_100g, lipid_100g, fiber_100g, sodium_mg_100g) VALUES
('a0000008-0000-0000-0000-000000000001', 'Mel', 'Açúcares e doces', 'taco', 309, 0.3, 84.0, 0, 0, 4),
('a0000008-0000-0000-0000-000000000002', 'Granola (sem açúcar)', 'Cereais e derivados', 'custom', 420, 10.0, 65.0, 14.0, 7.5, 20),
('a0000008-0000-0000-0000-000000000003', 'Cream cheese light', 'Laticínios', 'custom', 164, 7.0, 5.0, 13.0, 0, 530);

-- ============================================================================
-- MEDIDAS CASEIRAS (food_serving_units)
-- ============================================================================

-- Arroz branco
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000001-0000-0000-0000-000000000002', 'colher de sopa cheia', 25, false),
('a0000001-0000-0000-0000-000000000002', 'escumadeira média', 75, true),
('a0000001-0000-0000-0000-000000000002', 'xícara (chá)', 160, false);

-- Arroz integral
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000001-0000-0000-0000-000000000001', 'colher de sopa cheia', 25, false),
('a0000001-0000-0000-0000-000000000001', 'escumadeira média', 75, true);

-- Aveia
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000001-0000-0000-0000-000000000003', 'colher de sopa', 15, true),
('a0000001-0000-0000-0000-000000000003', 'xícara (chá)', 80, false);

-- Pão francês
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000001-0000-0000-0000-000000000005', 'unidade (50g)', 50, true);

-- Pão integral
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000001-0000-0000-0000-000000000004', 'fatia', 25, true);

-- Batata-doce
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000001-0000-0000-0000-000000000007', 'unidade média', 130, true),
('a0000001-0000-0000-0000-000000000007', 'fatia', 40, false);

-- Feijão carioca
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000002-0000-0000-0000-000000000001', 'concha média', 86, true),
('a0000002-0000-0000-0000-000000000001', 'colher de sopa', 26, false);

-- Peito de frango
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000003-0000-0000-0000-000000000001', 'filé médio', 150, true),
('a0000003-0000-0000-0000-000000000001', 'filé grande', 200, false);

-- Ovo
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000003-0000-0000-0000-000000000003', 'unidade (50g)', 50, true);

-- Banana
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000005-0000-0000-0000-000000000001', 'unidade média', 86, true),
('a0000005-0000-0000-0000-000000000001', 'unidade grande', 110, false);

-- Leite
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000004-0000-0000-0000-000000000001', 'copo (200ml)', 200, true),
('a0000004-0000-0000-0000-000000000001', 'xícara (chá)', 182, false);

-- Whey
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000004-0000-0000-0000-000000000005', 'scoop (30g)', 30, true),
('a0000004-0000-0000-0000-000000000005', '2 scoops (60g)', 60, false);

-- Azeite
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000007-0000-0000-0000-000000000001', 'colher de sopa', 13, true),
('a0000007-0000-0000-0000-000000000001', 'colher de chá', 5, false);

-- Castanha-do-pará
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000007-0000-0000-0000-000000000002', 'unidade', 5, true);

-- Pasta de amendoim
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000007-0000-0000-0000-000000000004', 'colher de sopa', 15, true);

-- Macarrão
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000001-0000-0000-0000-000000000006', 'pegador', 110, true),
('a0000001-0000-0000-0000-000000000006', 'prato fundo', 220, false);

-- Salmão
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000003-0000-0000-0000-000000000005', 'filé médio', 120, true);

-- Brócolis
INSERT INTO public.food_serving_units (food_id, unit_name, weight_g, is_default) VALUES
('a0000006-0000-0000-0000-000000000001', 'xícara (chá) picado', 60, true);

-- ============================================================================
-- End of Seed: Food Database
-- ============================================================================
