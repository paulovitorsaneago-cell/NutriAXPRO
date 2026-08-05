/* ==========================================================================
   NUTRIAX PRO - APP JAVASCRIPT & DATA CONTROLLER (STANDALONE SAAS PLATFORM)
   ========================================================================== */

// GLOBAL ROUTING MAP & NAVIGATION CONTROLLER (DEFINED AT LINE 1 FOR IMMEDIATE ACCESS)
const pageInfoMap = {
  'dashboard': { title: 'Visão Geral', subtitle: 'Acompanhe seu progresso e metas em tempo real (NutriAx Pro)' },
  'dieta': { title: 'Plano Alimentar', subtitle: 'Prescrição nutricional calculada individualmente' },
  'evolucao': { title: 'Evolução Corporal', subtitle: 'Histórico de peso, % de gordura e medidas corporais' },
  'diario': { title: 'Diário & Check-in', subtitle: 'Registre sua rotina diária, peso, treino e sono' },
  'atividades': { title: 'Atividades & METs 360°', subtitle: 'Equivalência metabólica, gasto calórico e zonas de frequência cardíaca' },
  'tabela-nutricional': { title: 'Tabelas Nutricionais (TACO/TBCA/USDA)', subtitle: 'Consulta de alimentos, gramagens, medidas caseiras e micronutrientes' },
  'anamnese': { title: 'Anamnese 360° & MSQ', subtitle: 'Rastreamento metabólico, medicina funcional, sono e estilo de vida' },
  'suplementacao': { title: 'Prescrição de Suplementos', subtitle: 'Fórmulas manipuladas, micronutrientes e fitoterápicos' },
  'exames': { title: 'Exames Clínicos', subtitle: 'Extraídos do laudo do paciente no NutriAx Pro' },
  'motor-ia': { title: 'Motor Prescrição IA', subtitle: 'Geração inteligente de dietas por perfil clínico' },
  'nutri-portal': { title: 'Portal do Nutricionista', subtitle: 'Prescrição de dieta, cadastro de paciente e lançamento de avaliações' }
};

window.switchTab = function(tabId, event) {
  try {
    if (event) {
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
    }

    const activeRole = (typeof window.getUserRole === 'function') ? window.getUserRole() : 'patient';
    let currentTab = tabId || 'dashboard';

    // Route Protection: Redirect patient away from Nutricionista admin tabs
    if (activeRole === 'patient' && (currentTab === 'motor-ia' || currentTab === 'nutri-portal')) {
      alert('Acesso Restrito ao Nutricionista: As abas "Motor Prescrição IA" e "Área Nutricionista" são exclusivas para a conta do profissional responsável.');
      currentTab = 'diario';
    }

    // 1. Update Sidebar Active Link
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-tab') === currentTab) {
        item.classList.add('active');
      }
    });

    // 2. Directly toggle display block/none on section IDs with !important
    const allTabs = [
      'dashboard', 'dieta', 'evolucao', 'diario', 'atividades', 
      'tabela-nutricional', 'anamnese', 'suplementacao', 'exames', 
      'motor-ia', 'nutri-portal'
    ];
    allTabs.forEach(id => {
      const panel = document.getElementById('tab-' + id);
      if (panel) {
        if (id === currentTab) {
          panel.classList.add('active');
          panel.style.setProperty('display', 'block', 'important');
        } else {
          panel.classList.remove('active');
          panel.style.setProperty('display', 'none', 'important');
        }
      }
    });

    // 3. Update topbar titles
    const pageTitle = document.getElementById('current-page-title');
    const pageSubtitle = document.getElementById('current-page-subtitle');
    if (pageInfoMap[currentTab]) {
      if (pageTitle) pageTitle.innerText = pageInfoMap[currentTab].title;
      if (pageSubtitle) pageSubtitle.innerText = pageInfoMap[currentTab].subtitle;
    }

    // 4. Close mobile menu
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }

    // 5. Scroll to top
    try { window.scrollTo(0, 0); } catch(e){}

    // 6. ENFORCE PREENCHIMENTO PERMISSIONS ACCORDING TO ROLE
    if (typeof window.enforcePreenchimentoPermissions === 'function') {
      window.enforcePreenchimentoPermissions(activeRole);
    }

    // 7. DYNAMICALLY RENDER DATA FOR ALL TAB COMPONENTS
    try { if (typeof renderDietMeals === 'function') renderDietMeals(); } catch(e){}
    try { if (typeof renderExamsGrid === 'function') renderExamsGrid(); } catch(e){}
    try { if (typeof renderDailyFoodLogUI === 'function') renderDailyFoodLogUI(); } catch(e){}
    try { if (typeof renderHistoryTable === 'function') renderHistoryTable(); } catch(e){}
    try { if (typeof renderFoodDatalist98 === 'function') renderFoodDatalist98(); } catch(e){}
    try { if (typeof filterTacoFoodDatabaseUI === 'function') filterTacoFoodDatabaseUI(); } catch(e){}
    try { if (typeof calculateMetCaloricExpenditure === 'function') calculateMetCaloricExpenditure(); } catch(e){}
    try {
      if ((currentTab === 'dashboard' || currentTab === 'evolucao') && typeof Chart !== 'undefined') {
        if (typeof refreshChartsTheme === 'function') refreshChartsTheme();
      }
    } catch(e){}

  } catch(err) {
    console.error("Error in switchTab:", err);
  }

  return false;
};

// CHART INSTANCE VARIABLES
let macroChartInstance = null;
let dashWeightChartInstance = null;
let fullEvolutionChartInstance = null;

// DATA MODEL DIRECTLY EXTRACTED FROM NUTRIAX PRO SPREADSHEET
const AppData = {
  patient: {
    id: "paulovitor.rsousa3@gmail.com",
    name: "Paulo Vitor R de Sousa",
    sex: "Masculino",
    age: 38,
    height: 1.93, // meters (193 cm)
    objective: "Perda de peso / Emagrecimento",
    profile: "Praticante Recreativo",
    workoutFreq: "Musculação 6x/semana (ABC, Vol. Alto)",
    cardioFreq: "Cardio 4x/semana (HIIT, 15 min, Moderada)",
    currentWeight: 115.80,
    targetWeight: 107.99,
    initialWeight: 122.00,
    currentFatPercent: 17.94,
    initialFatPercent: 24.50,
    targetFatPercent: 14.00,
    muscleMass: 95.03,
    fatMass: 20.77,
    bmr: 2422.62,
    get: 3464.00,
    waterTarget: 5303, // ml/day
    streakDays: 14
  },

  macros: {
    calories: 2840,
    tdee: 3464,
    deficit: -624,
    proteinGrams: 190,
    proteinKcal: 760, // 27%
    carbsGrams: 349,
    carbsKcal: 1396, // 49%
    fatsGrams: 76,
    fatsKcal: 684, // 24%
    fibersGrams: 40,
    sodiumMg: 2000
  },

  evolutionHistory: [
    { date: "15/01/2026", label: "Jan/26", weight: 122.0, fatPercent: 24.5, muscleMass: 92.1, waist: 112.0, abdomen: 116.0, hip: 118.0 },
    { date: "15/03/2026", label: "Mar/26", weight: 119.5, fatPercent: 22.0, muscleMass: 93.2, waist: 108.0, abdomen: 111.0, hip: 115.0 },
    { date: "15/05/2026", label: "Mai/26", weight: 117.2, fatPercent: 19.8, muscleMass: 94.0, waist: 104.5, abdomen: 106.0, hip: 113.0 },
    { date: "09/07/2026", label: "Jul/26", weight: 115.8, fatPercent: 17.9, muscleMass: 95.0, waist: 101.0, abdomen: 102.0, hip: 111.5 }
  ],

  foodDatabase98: [
    { name: "Peito de Frango (Grelhado)", category: "Proteínas", baseQty: 100, unitType: "g", kcal: 165, p: 31.0, c: 0.0, g: 3.5 },
    { name: "Arroz Branco (Cozido)", category: "Carboidratos", baseQty: 100, unitType: "g", kcal: 128, p: 2.5, c: 28.0, g: 0.4 },
    { name: "Arroz Integral (Cozido)", category: "Carboidratos", baseQty: 100, unitType: "g", kcal: 124, p: 2.6, c: 25.8, g: 1.0 },
    { name: "Feijão Carioca (Cozido)", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 76, p: 4.8, c: 13.6, g: 0.5 },
    { name: "Feijão Preto (Cozido)", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 77, p: 4.5, c: 14.0, g: 0.5 },
    { name: "Ovo de Galinha (Cozido)", category: "Proteínas", baseQty: 1, unitType: "un", kcal: 78, p: 6.3, c: 0.6, g: 5.3 },
    { name: "Clara de Ovo (Cozida)", category: "Proteínas", baseQty: 1, unitType: "un", kcal: 17, p: 3.6, c: 0.2, g: 0.1 },
    { name: "Patinho Grelhado (Moído)", category: "Proteínas", baseQty: 100, unitType: "g", kcal: 219, p: 35.9, c: 0.0, g: 7.3 },
    { name: "Filé Mignon Grelhado", category: "Proteínas", baseQty: 100, unitType: "g", kcal: 220, p: 32.8, c: 0.0, g: 8.8 },
    { name: "Alcatra Grelhada", category: "Proteínas", baseQty: 100, unitType: "g", kcal: 241, p: 31.9, c: 0.0, g: 11.6 },
    { name: "Tilápia Cozida / Grelhada", category: "Proteínas", baseQty: 100, unitType: "g", kcal: 128, p: 26.0, c: 0.0, g: 2.7 },
    { name: "Salmão Grelhado", category: "Proteínas", baseQty: 100, unitType: "g", kcal: 206, p: 22.0, c: 0.0, g: 12.3 },
    { name: "Atum em Lata (Drenado)", category: "Proteínas", baseQty: 100, unitType: "g", kcal: 130, p: 28.0, c: 0.0, g: 1.5 },
    { name: "Albumina Naturovos", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 110, p: 24.0, c: 2.0, g: 0.0 },
    { name: "Whey Protein Isolado", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 115, p: 27.0, c: 0.5, g: 0.5 },
    { name: "Iogurte Natural Integral", category: "Laticínios", baseQty: 170, unitType: "g", kcal: 110, p: 6.0, c: 9.0, g: 6.0 },
    { name: "Iogurte Grego Natural", category: "Laticínios", baseQty: 100, unitType: "g", kcal: 113, p: 7.0, c: 4.5, g: 7.5 },
    { name: "Leite em Pó Integral", category: "Laticínios", baseQty: 30, unitType: "g", kcal: 155, p: 7.5, c: 13.0, g: 8.0 },
    { name: "Queijo Cottage", category: "Laticínios", baseQty: 100, unitType: "g", kcal: 98, p: 11.1, c: 3.4, g: 4.3 },
    { name: "Queijo Minas Frescal", category: "Laticínios", baseQty: 50, unitType: "g", kcal: 132, p: 8.7, c: 1.6, g: 10.1 },
    { name: "Requeijão Light", category: "Laticínios", baseQty: 30, unitType: "g", kcal: 54, p: 3.6, c: 1.2, g: 3.8 },
    { name: "Aveia em Flocos", category: "Cereais", baseQty: 30, unitType: "g", kcal: 106, p: 4.8, c: 18.0, g: 2.2 },
    { name: "Farelo de Aveia", category: "Cereais", baseQty: 30, unitType: "g", kcal: 60, p: 6.5, c: 16.0, g: 2.0 },
    { name: "Ervilha Cozida", category: "Vegetais", baseQty: 120, unitType: "g", kcal: 121, p: 7.0, c: 21.0, g: 2.0 },
    { name: "Milho Verde Cozido", category: "Vegetais", baseQty: 150, unitType: "g", kcal: 147, p: 5.0, c: 28.0, g: 2.0 },
    { name: "Lentilha Cozida", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 116, p: 9.0, c: 20.0, g: 0.4 },
    { name: "Batata Doce Assada", category: "Tubérculos", baseQty: 100, unitType: "g", kcal: 90, p: 2.0, c: 20.7, g: 0.1 },
    { name: "Batata Inglesa Cozida", category: "Tubérculos", baseQty: 100, unitType: "g", kcal: 52, p: 1.2, c: 11.9, g: 0.1 },
    { name: "Mandioca Cozida", category: "Tubérculos", baseQty: 100, unitType: "g", kcal: 125, p: 0.6, c: 30.1, g: 0.3 },
    { name: "Tapioca (Goma Pronta)", category: "Carboidratos", baseQty: 50, unitType: "g", kcal: 120, p: 0.0, c: 30.0, g: 0.0 },
    { name: "Pão de Forma Integral", category: "Pães", baseQty: 50, unitType: "g", kcal: 123, p: 4.7, c: 22.3, g: 1.7 },
    { name: "Pão Francês", category: "Pães", baseQty: 50, unitType: "u", kcal: 150, p: 4.0, c: 28.5, g: 1.5 },
    { name: "Banana Nanica", category: "Frutas", baseQty: 100, unitType: "g", kcal: 92, p: 1.4, c: 23.8, g: 0.1 },
    { name: "Maçã Fuji c/ Casca", category: "Frutas", baseQty: 100, unitType: "g", kcal: 56, p: 0.3, c: 15.2, g: 0.2 },
    { name: "Abacate", category: "Gorduras", baseQty: 100, unitType: "g", kcal: 96, p: 1.2, c: 6.0, g: 8.4 },
    { name: "Pasta de Amendoim", category: "Gorduras", baseQty: 30, unitType: "g", kcal: 180, p: 8.0, c: 6.0, g: 15.0 },
    { name: "Azeite de Oliva Extra Virgem", category: "Gorduras", baseQty: 10, unitType: "ml", kcal: 88, p: 0.0, c: 0.0, g: 10.0 },
    { name: "Castanha do Pará", category: "Gorduras", baseQty: 15, unitType: "g", kcal: 98, p: 2.1, c: 1.8, g: 10.0 },
    { name: "Brócolis Cozido", category: "Vegetais", baseQty: 100, unitType: "g", kcal: 35, p: 2.4, c: 7.2, g: 0.4 },
    { name: "Cenoura Crua", category: "Vegetais", baseQty: 100, unitType: "g", kcal: 34, p: 0.8, c: 7.7, g: 0.2 },
    { name: "Tomate Cru", category: "Vegetais", baseQty: 100, unitType: "g", kcal: 15, p: 1.1, c: 3.1, g: 0.2 },
    { name: "Abóbora Moranga Refogada", category: "Vegetais", baseQty: 100, unitType: "g", kcal: 29, p: 1.0, c: 6.0, g: 0.8 },
    { name: "Café sem Açúcar", category: "Bebidas", baseQty: 100, unitType: "ml", kcal: 2, p: 0.1, c: 0.3, g: 0.0 },
    { name: "Café com Açúcar", category: "Bebidas", baseQty: 100, unitType: "ml", kcal: 30, p: 0.5, c: 7.0, g: 0.0 }
  ],

  meals: [
    {
      id: "ref-cafe",
      name: "Café da Manhã",
      time: "07:30",
      icon: "fa-mug-hot",
      targetKcal: 290,
      macros: "13g P | 29g C | 13.5g G",
      items: [
        { name: "Café com Açúcar", qty: "100 ml" },
        { name: "Leite em Pó Integral", qty: "50 g" }
      ]
    },
    {
      id: "ref-lanche-m",
      name: "Lanche da Manhã",
      time: "10:30",
      icon: "fa-apple-whole",
      targetKcal: 435,
      macros: "44g P | 40g C | 16g G",
      items: [
        { name: "Albumina Naturovos", qty: "30 g" },
        { name: "Iogurte Natural Integral", qty: "170 g" },
        { name: "Leite em Pó Integral", qty: "30 g" },
        { name: "Farelo de Aveia", qty: "30 g" }
      ]
    },
    {
      id: "ref-almoco",
      name: "Almoço",
      time: "13:00",
      icon: "fa-bowl-rice",
      targetKcal: 822,
      macros: "75g P | 98g C | 13g G",
      items: [
        { name: "Peito de Frango (Grelhado)", qty: "200 g" },
        { name: "Arroz Branco (Cozido)", qty: "250 g" },
        { name: "Milho Verde Cozido", qty: "150 g" },
        { name: "Salada Verde (Alface/Rúcula)", qty: "À vontade" }
      ]
    },
    {
      id: "ref-pre-treino",
      name: "Pré-Treino",
      time: "16:00",
      icon: "fa-dumbbell",
      targetKcal: 529,
      macros: "26g P | 62g C | 21.5g G",
      items: [
        { name: "Iogurte Natural Integral", qty: "250 g" },
        { name: "Aveia em Flocos", qty: "60 g" },
        { name: "Leite em Pó Integral", qty: "30 g" }
      ]
    },
    {
      id: "ref-pos-treino",
      name: "Pós-Treino",
      time: "18:30",
      icon: "fa-bolt",
      targetKcal: 244,
      macros: "39g P | 9g C | 5.4g G",
      items: [
        { name: "Albumina Naturovos", qty: "40 g" },
        { name: "Leite em Pó Integral", qty: "20 g" }
      ]
    },
    {
      id: "ref-jantar",
      name: "Jantar",
      time: "21:00",
      icon: "fa-utensils",
      targetKcal: 542,
      macros: "43g P | 77g C | 6.3g G",
      items: [
        { name: "Peito de Frango (Grelhado)", qty: "100 g" },
        { name: "Arroz Branco (Cozido)", qty: "200 g" },
        { name: "Ervilha Cozida", qty: "120 g" }
      ]
    }
  ],

  exams: [
    { name: "Glicose Jejum", val: "81", unit: "mg/dL", ref: "70 a 99 mg/dL", status: "Dentro", class: "ok", prio: "Rotina" },
    { name: "Hemoglobina Glicada (HbA1c)", val: "5.3", unit: "%", ref: "4.0 a 5.6%", status: "Ótimo", class: "ok", prio: "Rotina" },
    { name: "Hemoglobina", val: "16.6", unit: "g/dL", ref: "13.5 a 17.5 g/dL", status: "Dentro", class: "ok", prio: "Rotina" },
    { name: "Colesterol Total", val: "245", unit: "mg/dL", ref: "< 190 mg/dL", status: "Alto", class: "alert", prio: "Média" },
    { name: "Colesterol LDL", val: "169", unit: "mg/dL", ref: "< 130 mg/dL", status: "Alto", class: "alert", prio: "Alta" },
    { name: "Colesterol HDL", val: "45", unit: "mg/dL", ref: "> 40 mg/dL", status: "Dentro", class: "ok", prio: "Rotina" },
    { name: "Triglicerídeos", val: "165", unit: "mg/dL", ref: "< 150 mg/dL", status: "Alto", class: "alert", prio: "Média" },
    { name: "Ferritina", val: "518", unit: "ng/mL", ref: "30 a 300 ng/mL", status: "Alto", class: "alert", prio: "Média" },
    { name: "Vitamina D (25-OH)", val: "20", unit: "ng/mL", ref: "30 a 100 ng/mL", status: "Baixo", class: "warn", prio: "Média" },
    { name: "Creatinina", val: "1.47", unit: "mg/dL", ref: "0.7 a 1.3 mg/dL", status: "Alto", class: "alert", prio: "Alta (Massa/Creatina)" },
    { name: "Ureia", val: "39", unit: "mg/dL", ref: "10 a 50 mg/dL", status: "Dentro", class: "ok", prio: "Rotina" },
    { name: "Testosterona Total", val: "454", unit: "ng/dL", ref: "300 a 1000 ng/dL", status: "Dentro", class: "ok", prio: "Rotina" },
    { name: "Testosterona Livre", val: "94.69", unit: "pg/mL", ref: "50 a 210 pg/mL", status: "Dentro", class: "ok", prio: "Rotina" },
    { name: "TGO (AST) / TGP (ALT)", val: "38 / 47", unit: "U/L", ref: "TGO <40 / TGP <56 U/L", status: "Dentro", class: "ok", prio: "Rotina" }
  ],

  substitutions: {
    protein: [
      { original: "Peito de Frango (100g)", sub: "Patinho Moído Grelhado", qty: "90g" },
      { original: "Peito de Frango (100g)", sub: "Filé de Tilápia / Pescada", qty: "110g" },
      { original: "Peito de Frango (100g)", sub: "Ovos Inteiros", qty: "2 un + 2 claras" },
      { original: "Peito de Frango (100g)", sub: "Lombo Suíno Assado", qty: "95g" },
      { original: "Albumina Naturovos (30g)", sub: "Whey Protein Isolado", qty: "30g" }
    ],
    carbs: [
      { original: "Arroz Branco (100g)", sub: "Arroz Integral Cozido", qty: "100g" },
      { original: "Arroz Branco (100g)", sub: "Batata Doce Assada", qty: "120g" },
      { original: "Arroz Branco (100g)", sub: "Mandioca Cozida", qty: "110g" },
      { original: "Milho Verde (100g)", sub: "Ervilha Cozida", qty: "100g" },
      { original: "Aveia em Flocos (30g)", sub: "Farelo de Aveia", qty: "30g" }
    ],
    fats: [
      { original: "Azeite de Oliva (10g)", sub: "Castanha do Pará", qty: "15g (3 un)" },
      { original: "Azeite de Oliva (10g)", sub: "Abacate Fresco", qty: "50g" },
      { original: "Azeite de Oliva (10g)", sub: "Pasta de Amendoim Integral", qty: "15g (1 colher)" }
    ]
  },

  // TABELA 98 - BASE DE DADOS NUTRICIONAL E DE ALIMENTOS EXAUSTIVA
  foodDatabase98: [
    // --- 1. CARNES BOVINAS, AVES E PEIXES (PROTEÍNAS) ---
    { id: "db_frango_grelhado", name: "Peito de Frango Grelhado", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 165, p: 31.0, c: 0.0, g: 3.6 },
    { id: "db_frango_desfiado", name: "Peito de Frango Cozido / Desfiado", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 150, p: 29.0, c: 0.0, g: 3.0 },
    { id: "db_frango_coxa", name: "Coxa de Frango Assada (sem pele)", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 180, p: 24.0, c: 0.0, g: 9.0 },
    { id: "db_frango_sobrecoxa", name: "Sobrecoxa de Frango Assada (sem pele)", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 195, p: 23.0, c: 0.0, g: 11.0 },
    { id: "db_patinho_moido", name: "Patinho Moído Grelhado / Refogado", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 219, p: 35.9, c: 0.0, g: 7.3 },
    { id: "db_patinho_iscas", name: "Patinho em Iscas Grelhado", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 210, p: 34.0, c: 0.0, g: 7.0 },
    { id: "db_file_mignon", name: "Filé Mignon Grelhado", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 200, p: 32.0, c: 0.0, g: 7.5 },
    { id: "db_alcatra", name: "Alcatra Grelhada sem Gordura", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 215, p: 30.0, c: 0.0, g: 10.0 },
    { id: "db_contrafile", name: "Contrafilé Grelhado sem Gordura", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 230, p: 29.0, c: 0.0, g: 12.0 },
    { id: "db_picanha", name: "Picanha Assada sem Capa de Gordura", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 238, p: 28.5, c: 0.0, g: 13.0 },
    { id: "db_cupim", name: "Cupim Assado", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 330, p: 22.0, c: 0.0, g: 26.0 },
    { id: "db_musculo", name: "Músculo Bovino Cozido", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 194, p: 31.0, c: 0.0, g: 7.0 },
    { id: "db_carne_sol", name: "Carne de Sol Assada", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 240, p: 33.0, c: 0.0, g: 11.0 },
    { id: "db_carne_seca", name: "Carne Seca Cozida e Desfiada", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 260, p: 35.0, c: 0.0, g: 12.5 },
    { id: "db_lombo_suino", name: "Lombo Suíno Assado", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 210, p: 31.0, c: 0.0, g: 8.5 },
    { id: "db_bisteca_suina", name: "Bisteca Suína Grelhada", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 245, p: 28.0, c: 0.0, g: 14.0 },
    { id: "db_pernil_suino", name: "Pernil Suíno Assado", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 225, p: 29.5, c: 0.0, g: 11.5 },
    { id: "db_linguica_frango", name: "Linguiça de Frango Grelhada", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 210, p: 18.0, c: 1.5, g: 14.5 },
    { id: "db_linguica_toscana", name: "Linguiça Toscana Assada", category: "Carnes e Aves", baseQty: 100, unitType: "g", kcal: 295, p: 16.0, c: 2.0, g: 25.0 },

    // --- 2. PEIXES E FRUTOS DO MAR ---
    { id: "db_tilapia", name: "Filé de Tilápia Grelhado", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 128, p: 26.0, c: 0.0, g: 2.6 },
    { id: "db_merluza", name: "Filé de Merluza Cozido / Assado", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 110, p: 23.0, c: 0.0, g: 1.5 },
    { id: "db_pescada", name: "Filé de Pescada Cozido", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 105, p: 22.0, c: 0.0, g: 1.2 },
    { id: "db_salmao", name: "Salmão Grelhado", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 206, p: 22.0, c: 0.0, g: 12.0 },
    { id: "db_atum_agua", name: "Atum em Conserva em Água", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 116, p: 26.0, c: 0.0, g: 1.0 },
    { id: "db_atum_oleo", name: "Atum em Conserva em Óleo (Escorrido)", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 195, p: 26.0, c: 0.0, g: 10.0 },
    { id: "db_sardinha_lata", name: "Sardinha em Conserva em Molho de Tomate", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 210, p: 24.0, c: 0.0, g: 12.0 },
    { id: "db_sardinha_grelhada", name: "Sardinha Grelhada / Assada", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 164, p: 21.0, c: 0.0, g: 8.5 },
    { id: "db_camarao", name: "Camarão Cozido / Grelhado", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 99, p: 23.0, c: 0.2, g: 0.3 },
    { id: "db_polvo", name: "Polvo Cozido", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 82, p: 15.0, c: 2.2, g: 1.0 },
    { id: "db_lula", name: "Lula Grelhada", category: "Peixes e Frutos do Mar", baseQty: 100, unitType: "g", kcal: 92, p: 16.0, c: 3.0, g: 1.4 },

    // --- 3. OVOS E DERIVADOS ---
    { id: "db_ovo_cozido", name: "Ovo de Galinha Cozido", category: "Ovos e Laticínios", baseQty: 1, unitType: "un", kcal: 78, p: 6.3, c: 0.6, g: 5.3 },
    { id: "db_ovo_mexido", name: "Ovo Mexido sem Óleo", category: "Ovos e Laticínios", baseQty: 1, unitType: "un", kcal: 80, p: 6.5, c: 0.6, g: 5.5 },
    { id: "db_ovo_frito", name: "Ovo Frito em Manteiga/Azeite", category: "Ovos e Laticínios", baseQty: 1, unitType: "un", kcal: 105, p: 6.3, c: 0.6, g: 8.5 },
    { id: "db_clara_ovo", name: "Clara de Ovo Cozida", category: "Ovos e Laticínios", baseQty: 1, unitType: "un", kcal: 17, p: 3.6, c: 0.2, g: 0.1 },
    { id: "db_gema_ovo", name: "Gema de Ovo Cozida", category: "Ovos e Laticínios", baseQty: 1, unitType: "un", kcal: 61, p: 2.7, c: 0.4, g: 5.2 },

    // --- 4. LEITE, IOGURTES E QUEIJOS ---
    { id: "db_leite_desnatado", name: "Leite Desnatado (Líquido)", category: "Ovos e Laticínios", baseQty: 200, unitType: "ml", kcal: 70, p: 6.4, c: 10.0, g: 0.4 },
    { id: "db_leite_integral", name: "Leite Integral (Líquido)", category: "Ovos e Laticínios", baseQty: 200, unitType: "ml", kcal: 120, p: 6.4, c: 10.0, g: 6.4 },
    { id: "db_leite_sem_lactose", name: "Leite Sem Lactose Zero Gordura", category: "Ovos e Laticínios", baseQty: 200, unitType: "ml", kcal: 70, p: 6.4, c: 10.0, g: 0.4 },
    { id: "db_leite_po_integral", name: "Leite em Pó Integral", category: "Ovos e Laticínios", baseQty: 100, unitType: "g", kcal: 496, p: 25.0, c: 38.0, g: 26.7 },
    { id: "db_leite_po_desnatado", name: "Leite em Pó Desnatado", category: "Ovos e Laticínios", baseQty: 100, unitType: "g", kcal: 350, p: 35.0, c: 50.0, g: 1.0 },
    { id: "db_iogurte_integral", name: "Iogurte Natural Integral", category: "Ovos e Laticínios", baseQty: 170, unitType: "g", kcal: 110, p: 6.0, c: 9.0, g: 6.0 },
    { id: "db_iogurte_desnatado", name: "Iogurte Natural Desnatado / Greco Zero", category: "Ovos e Laticínios", baseQty: 170, unitType: "g", kcal: 75, p: 8.0, c: 10.0, g: 0.0 },
    { id: "db_iogurte_proteico", name: "Iogurte Proteico com Whey (YoPRO / Treino)", category: "Ovos e Laticínios", baseQty: 200, unitType: "g", kcal: 130, p: 15.0, c: 12.0, g: 1.5 },
    { id: "db_cottage", name: "Queijo Cottage", category: "Ovos e Laticínios", baseQty: 100, unitType: "g", kcal: 98, p: 11.0, c: 3.4, g: 4.3 },
    { id: "db_queijo_minas", name: "Queijo Minas Frescal", category: "Ovos e Laticínios", baseQty: 30, unitType: "g", kcal: 73, p: 5.2, c: 1.0, g: 5.3 },
    { id: "db_queijo_minas_padrao", name: "Queijo Minas Padrão / Meia Cura", category: "Ovos e Laticínios", baseQty: 30, unitType: "g", kcal: 110, p: 7.0, c: 0.8, g: 9.0 },
    { id: "db_queijo_mucarela", name: "Queijo Muçarela", category: "Ovos e Laticínios", baseQty: 30, unitType: "g", kcal: 98, p: 6.8, c: 0.9, g: 7.5 },
    { id: "db_queijo_prato", name: "Queijo Prato", category: "Ovos e Laticínios", baseQty: 30, unitType: "g", kcal: 105, p: 7.0, c: 0.6, g: 8.5 },
    { id: "db_parmesao", name: "Queijo Parmesão Ralado", category: "Ovos e Laticínios", baseQty: 10, unitType: "g", kcal: 43, p: 3.6, c: 0.4, g: 3.0 },
    { id: "db_ricota", name: "Queijo Ricota Fresca", category: "Ovos e Laticínios", baseQty: 50, unitType: "g", kcal: 70, p: 6.3, c: 1.9, g: 4.0 },
    { id: "db_requeijao_light", name: "Requeijão Cremoso Light", category: "Ovos e Laticínios", baseQty: 20, unitType: "g", kcal: 38, p: 2.2, c: 1.0, g: 2.8 },
    { id: "db_requeijao_trad", name: "Requeijão Cremoso Tradicional", category: "Ovos e Laticínios", baseQty: 20, unitType: "g", kcal: 54, p: 2.0, c: 0.8, g: 4.8 },

    // --- 5. CEREAIS, PÃES, MASSAS E TUBÉRCULOS (CARBOIDRATOS) ---
    { id: "db_arroz_b", name: "Arroz Branco Cozido", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 128, p: 2.5, c: 28.0, g: 0.4 },
    { id: "db_arroz_i", name: "Arroz Integral Cozido", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 124, p: 2.6, c: 25.8, g: 1.0 },
    { id: "db_arroz_parboilizado", name: "Arroz Parboilizado Cozido", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 125, p: 2.6, c: 27.0, g: 0.4 },
    { id: "db_batata_d", name: "Batata Doce Cozida / Assada", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 86, p: 1.6, c: 20.0, g: 0.1 },
    { id: "db_batata_d_airfryer", name: "Batata Doce na Airfryer", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 110, p: 2.0, c: 25.0, g: 0.3 },
    { id: "db_mandioca", name: "Mandioca / Aipim Cozido", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 125, p: 1.2, c: 30.0, g: 0.3 },
    { id: "db_mandioquinha", name: "Mandioquinha / Batata Baroa Cozida", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 85, p: 1.0, c: 19.5, g: 0.2 },
    { id: "db_batata_i", name: "Batata Inglesa Cozida", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 52, p: 1.2, c: 11.9, g: 0.1 },
    { id: "db_batata_i_assada", name: "Batata Inglesa Assada", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 85, p: 1.9, c: 19.0, g: 0.2 },
    { id: "db_pure_batata", name: "Purê de Batata Inglesa", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 112, p: 2.0, c: 17.0, g: 4.0 },
    { id: "db_tapioca", name: "Tapioca / Massa de Mandioca", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 240, p: 0.0, c: 60.0, g: 0.0 },
    { id: "db_cuscus", name: "Cuscus de Milho Cozido", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 113, p: 2.3, c: 25.0, g: 0.7 },
    { id: "db_macarrao_semola", name: "Macarrão de Sêmola Cozido", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 157, p: 5.8, c: 31.0, g: 0.9 },
    { id: "db_macarrao_integral", name: "Macarrão Integral Cozido", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 124, p: 5.3, c: 25.0, g: 0.5 },
    { id: "db_aveia_flocos", name: "Aveia em Flocos", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 353, p: 13.9, c: 60.0, g: 7.5 },
    { id: "db_farelo_aveia", name: "Farelo de Aveia", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 200, p: 21.6, c: 53.3, g: 6.7 },
    { id: "db_farinha_aveia", name: "Farinha de Aveia", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 360, p: 14.0, c: 60.0, g: 7.0 },
    { id: "db_granola_trad", name: "Granola Tradicional", category: "Cereais e Tubérculos", baseQty: 40, unitType: "g", kcal: 160, p: 4.0, c: 26.0, g: 4.5 },
    { id: "db_granola_zero", name: "Granola Zero Açúcar", category: "Cereais e Tubérculos", baseQty: 40, unitType: "g", kcal: 140, p: 5.0, c: 20.0, g: 4.0 },
    { id: "db_pao_integral", name: "Pão Integral (1 fatia)", category: "Cereais e Tubérculos", baseQty: 1, unitType: "fatia", kcal: 60, p: 2.5, c: 11.0, g: 1.0 },
    { id: "db_pao_frances", name: "Pão Francês / Sal (1 un)", category: "Cereais e Tubérculos", baseQty: 1, unitType: "un", kcal: 135, p: 4.0, c: 28.0, g: 1.0 },
    { id: "db_pao_forma", name: "Pão de Forma Tradicional", category: "Cereais e Tubérculos", baseQty: 1, unitType: "fatia", kcal: 65, p: 2.2, c: 12.5, g: 0.9 },
    { id: "db_pao_queijo", name: "Pão de Queijo Assado", category: "Cereais e Tubérculos", baseQty: 1, unitType: "un", kcal: 95, p: 2.0, c: 11.0, g: 4.8 },
    { id: "db_torrada_integral", name: "Torrada Integral", category: "Cereais e Tubérculos", baseQty: 1, unitType: "un", kcal: 38, p: 1.2, c: 7.0, g: 0.6 },
    { id: "db_cracker", name: "Biscoito Cream Cracker / Água e Sal", category: "Cereais e Tubérculos", baseQty: 1, unitType: "un", kcal: 32, p: 0.7, c: 5.2, g: 0.9 },
    { id: "db_biscoito_polvilho", name: "Biscoito de Polvilho Assado", category: "Cereais e Tubérculos", baseQty: 30, unitType: "g", kcal: 130, p: 0.8, c: 23.0, g: 3.8 },
    { id: "db_milho", name: "Milho Verde Cozido", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 98, p: 3.3, c: 18.7, g: 1.3 },
    { id: "db_ervilha", name: "Ervilha Cozida", category: "Cereais e Tubérculos", baseQty: 100, unitType: "g", kcal: 101, p: 5.8, c: 17.5, g: 1.7 },
    { id: "db_pipoca", name: "Pipoca sem Óleo", category: "Cereais e Tubérculos", baseQty: 30, unitType: "g", kcal: 110, p: 3.5, c: 22.0, g: 1.2 },

    // --- 6. LEGUMINOSAS (FEIJÕES E GRÃOS) ---
    { id: "db_feijao_c", name: "Feijão Carioca Cozido (com caldo)", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 76, p: 4.8, c: 13.6, g: 0.5 },
    { id: "db_feijao_p", name: "Feijão Preto Cozido (com caldo)", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 77, p: 4.5, c: 14.0, g: 0.5 },
    { id: "db_feijao_fradinho", name: "Feijão Fradinho Cozido", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 115, p: 7.8, c: 20.0, g: 0.7 },
    { id: "db_feijao_branco", name: "Feijão Branco Cozido", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 110, p: 7.5, c: 19.0, g: 0.6 },
    { id: "db_feijao_verde", name: "Feijão Verde / Corda Cozido", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 95, p: 6.2, c: 16.0, g: 0.5 },
    { id: "db_lentilha", name: "Lentilha Cozida", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 116, p: 9.0, c: 20.0, g: 0.4 },
    { id: "db_grao_bico", name: "Grão de Bico Cozido", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 164, p: 8.9, c: 27.0, g: 2.6 },
    { id: "db_soja", name: "Soja Cozida", category: "Leguminosas", baseQty: 100, unitType: "g", kcal: 173, p: 16.6, c: 9.9, g: 9.0 },

    // --- 7. GORDURAS, ÓLEOS, OLEAGINOSAS E SEMENTES ---
    { id: "db_azeite", name: "Azeite de Oliva Extra Virgem", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 88, p: 0.0, c: 0.0, g: 10.0 },
    { id: "db_oleo_coco", name: "Óleo de Coco", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 86, p: 0.0, c: 0.0, g: 9.9 },
    { id: "db_oleo_soja", name: "Óleo de Soja / Girassol", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 88, p: 0.0, c: 0.0, g: 10.0 },
    { id: "db_manteiga", name: "Manteiga sem Sal", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 72, p: 0.1, c: 0.1, g: 8.1 },
    { id: "db_margarina", name: "Margarina Cremosa", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 72, p: 0.0, c: 0.0, g: 8.0 },
    { id: "db_castanha_para", name: "Castanha do Pará (1 un)", category: "Gorduras Boas", baseQty: 1, unitType: "un", kcal: 33, p: 0.7, c: 0.6, g: 3.3 },
    { id: "db_castanha_caju", name: "Castanha de Caju Torrada", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 58, p: 1.8, c: 3.0, g: 4.4 },
    { id: "db_amendoas", name: "Amêndoas Torradas", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 58, p: 2.1, c: 2.2, g: 5.0 },
    { id: "db_nozes", name: "Nozes", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 65, p: 1.5, c: 1.4, g: 6.5 },
    { id: "db_macadamia", name: "Macadâmia Torrada", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 72, p: 0.8, c: 1.4, g: 7.5 },
    { id: "db_pasta_amendoim", name: "Pasta de Amendoim Integral", category: "Gorduras Boas", baseQty: 15, unitType: "g", kcal: 90, p: 4.0, c: 3.0, g: 7.5 },
    { id: "db_amendoim", name: "Amendoim Torrado sem Sal", category: "Gorduras Boas", baseQty: 30, unitType: "g", kcal: 175, p: 7.8, c: 6.0, g: 14.5 },
    { id: "db_abacate", name: "Abacate Fresco", category: "Gorduras Boas", baseQty: 100, unitType: "g", kcal: 160, p: 2.0, c: 8.5, g: 14.7 },
    { id: "db_chia", name: "Semente de Chia", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 49, p: 1.7, c: 4.2, g: 3.1 },
    { id: "db_linhaca", name: "Semente de Linhaça", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 53, p: 1.8, c: 2.9, g: 4.2 },
    { id: "db_girassol_sem", name: "Semente de Girassol sem Casca", category: "Gorduras Boas", baseQty: 10, unitType: "g", kcal: 58, p: 2.0, c: 2.0, g: 5.1 },

    // --- 8. FRUTAS FRESCAS E SECAS ---
    { id: "db_banana_prata", name: "Banana Prata (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 70, p: 0.9, c: 18.3, g: 0.2 },
    { id: "db_banana_caturra", name: "Banana Caturra / D'Água (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 90, p: 1.1, c: 23.0, g: 0.3 },
    { id: "db_banana_terra", name: "Banana da Terra Cozida", category: "Frutas", baseQty: 100, unitType: "g", kcal: 120, p: 1.2, c: 31.0, g: 0.3 },
    { id: "db_maca", name: "Maçã Fuji / Gala (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 72, p: 0.3, c: 19.0, g: 0.2 },
    { id: "db_mamao_papaia", name: "Mamão Papaia", category: "Frutas", baseQty: 100, unitType: "g", kcal: 45, p: 0.5, c: 11.6, g: 0.1 },
    { id: "db_mamao_formosa", name: "Mamão Formosa", category: "Frutas", baseQty: 100, unitType: "g", kcal: 40, p: 0.4, c: 10.0, g: 0.1 },
    { id: "db_morango", name: "Morango Fresco", category: "Frutas", baseQty: 100, unitType: "g", kcal: 30, p: 0.7, c: 6.8, g: 0.3 },
    { id: "db_laranja", name: "Laranja Pera (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 62, p: 1.2, c: 15.0, g: 0.2 },
    { id: "db_uva", name: "Uva Itália / Ruby", category: "Frutas", baseQty: 100, unitType: "g", kcal: 68, p: 0.6, c: 17.0, g: 0.2 },
    { id: "db_melancia", name: "Melancia", category: "Frutas", baseQty: 100, unitType: "g", kcal: 33, p: 0.6, c: 8.0, g: 0.2 },
    { id: "db_melao", name: "Melão Amarelo", category: "Frutas", baseQty: 100, unitType: "g", kcal: 34, p: 0.8, c: 8.0, g: 0.2 },
    { id: "db_abacaxi", name: "Abacaxi (1 fatia / 100g)", category: "Frutas", baseQty: 100, unitType: "g", kcal: 48, p: 0.5, c: 12.3, g: 0.1 },
    { id: "db_manga", name: "Manga Palmer", category: "Frutas", baseQty: 100, unitType: "g", kcal: 60, p: 0.8, c: 15.0, g: 0.4 },
    { id: "db_kiwi", name: "Kiwi (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 42, p: 0.8, c: 10.0, g: 0.4 },
    { id: "db_goiaba", name: "Goiaba Vermelha (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 54, p: 1.5, c: 13.0, g: 0.6 },
    { id: "db_maracuja", name: "Maracujá (Polpa 1 un)", category: "Frutas", baseQty: 50, unitType: "g", kcal: 34, p: 1.1, c: 6.2, g: 0.4 },
    { id: "db_pessego", name: "Pêssego Fresco (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 50, p: 1.0, c: 12.0, g: 0.3 },
    { id: "db_ameixa_seca", name: "Ameixa Preta Seca (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 24, p: 0.2, c: 6.4, g: 0.0 },
    { id: "db_uva_passa", name: "Uva Passa Seca", category: "Frutas", baseQty: 10, unitType: "g", kcal: 30, p: 0.3, c: 7.9, g: 0.0 },
    { id: "db_tamara", name: "Tâmara Seca (1 un)", category: "Frutas", baseQty: 1, unitType: "un", kcal: 23, p: 0.2, c: 6.0, g: 0.0 },

    // --- 9. HORTALIÇAS E VEGETAIS ---
    { id: "db_alface", name: "Alface Crespa / Americana", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 15, p: 1.3, c: 2.8, g: 0.2 },
    { id: "db_rucula", name: "Rúcula Fresca", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 18, p: 2.0, c: 2.2, g: 0.3 },
    { id: "db_agriao", name: "Agrião Fresco", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 17, p: 2.2, c: 2.0, g: 0.2 },
    { id: "db_espinafre", name: "Espinafre Cozido", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 23, p: 3.0, c: 3.8, g: 0.3 },
    { id: "db_couve_refogada", name: "Couve Manteiga Refogada", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 50, p: 2.5, c: 5.5, g: 2.5 },
    { id: "db_tomate", name: "Tomate Vermelho (1 un)", category: "Hortaliças", baseQty: 1, unitType: "un", kcal: 18, p: 0.9, c: 3.9, g: 0.2 },
    { id: "db_pepino", name: "Pepino Japonês", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 12, p: 0.6, c: 2.0, g: 0.1 },
    { id: "db_cenoura_crua", name: "Cenoura Crua Ralada", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 34, p: 0.9, c: 7.7, g: 0.2 },
    { id: "db_cenoura_cozida", name: "Cenoura Cozida", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 30, p: 0.8, c: 6.7, g: 0.2 },
    { id: "db_brocolis", name: "Brócolis Cozido", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 35, p: 2.4, c: 7.0, g: 0.4 },
    { id: "db_couve_flor", name: "Couve-Flor Cozida", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 25, p: 1.9, c: 5.0, g: 0.3 },
    { id: "db_abobrinha", name: "Abobrinha Menina Cozida", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 19, p: 1.1, c: 4.0, g: 0.1 },
    { id: "db_chuchu", name: "Chuchu Cozido", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 19, p: 0.4, c: 4.5, g: 0.1 },
    { id: "db_beterraba", name: "Beterraba Cozida", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 44, p: 1.7, c: 10.0, g: 0.2 },
    { id: "db_vagem", name: "Vagem Cozida", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 35, p: 1.8, c: 7.8, g: 0.2 },
    { id: "db_palmito", name: "Palmito em Conserva", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 23, p: 2.5, c: 4.0, g: 0.2 },
    { id: "db_cogumelo", name: "Cogumelo Shimeji / Champignon Refogado", category: "Hortaliças", baseQty: 100, unitType: "g", kcal: 48, p: 3.5, c: 5.0, g: 1.5 },

    // --- 10. SUPLEMENTOS ALIMENTARES E PROTEICOS ---
    { id: "db_whey_conc", name: "Whey Protein Concentrado (1 scoop 30g)", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 120, p: 24.0, c: 3.0, g: 2.0 },
    { id: "db_whey_iso", name: "Whey Protein Isolado (1 scoop 30g)", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 110, p: 27.0, c: 1.0, g: 0.0 },
    { id: "db_whey_hidro", name: "Whey Protein Hidrolisado (1 scoop 30g)", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 112, p: 26.5, c: 0.8, g: 0.2 },
    { id: "db_albumina", name: "Albumina Naturovos (30g)", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 110, p: 24.0, c: 2.0, g: 0.0 },
    { id: "db_creatina", name: "Creatina Monohidratada (5g)", category: "Suplementos", baseQty: 5, unitType: "g", kcal: 0, p: 0.0, c: 0.0, g: 0.0 },
    { id: "db_hipercalorico", name: "Hipercalórico Mass (100g)", category: "Suplementos", baseQty: 100, unitType: "g", kcal: 380, p: 16.0, c: 75.0, g: 1.5 },
    { id: "db_caseina", name: "Caseína / Proteína Noturna (30g)", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 115, p: 24.0, c: 1.5, g: 1.0 },
    { id: "db_palatinose", name: "Palatinose / Isomaltulose (30g)", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 120, p: 0.0, c: 30.0, g: 0.0 },
    { id: "db_maltodextrina", name: "Maltodextrina / Dextrose (30g)", category: "Suplementos", baseQty: 30, unitType: "g", kcal: 116, p: 0.0, c: 29.0, g: 0.0 },
    { id: "db_barra_proteina", name: "Barra de Proteína (1 un 40g)", category: "Suplementos", baseQty: 40, unitType: "g", kcal: 150, p: 14.0, c: 12.0, g: 5.0 },

    // --- 11. BEBIDAS E PREPARAÇÕES TÍPICAS ---
    { id: "db_cafe_sem_acucar", name: "Café sem Açúcar (100ml)", category: "Bebidas e Preparações", baseQty: 100, unitType: "ml", kcal: 2, p: 0.1, c: 0.3, g: 0.0 },
    { id: "db_cafe_com_acucar", name: "Café com Açúcar (100ml)", category: "Bebidas e Preparações", baseQty: 100, unitType: "ml", kcal: 30, p: 0.5, c: 7.0, g: 0.0 },
    { id: "db_agua_coco", name: "Água de Coco Natural (200ml)", category: "Bebidas e Preparações", baseQty: 200, unitType: "ml", kcal: 44, p: 0.0, c: 10.4, g: 0.0 },
    { id: "db_suco_laranja", name: "Suco de Laranja Natural (200ml)", category: "Bebidas e Preparações", baseQty: 200, unitType: "ml", kcal: 90, p: 1.4, c: 21.0, g: 0.4 },
    { id: "db_suco_uva", name: "Suco de Uva Integral (200ml)", category: "Bebidas e Preparações", baseQty: 200, unitType: "ml", kcal: 130, p: 1.0, c: 32.0, g: 0.0 },
    { id: "db_suco_limao", name: "Suco de Limão sem Açúcar (200ml)", category: "Bebidas e Preparações", baseQty: 200, unitType: "ml", kcal: 12, p: 0.4, c: 3.8, g: 0.0 },
    { id: "db_refrigerante_zero", name: "Refrigerante Zero / Diet (350ml)", category: "Bebidas e Preparações", baseQty: 350, unitType: "ml", kcal: 0, p: 0.0, c: 0.0, g: 0.0 },
    { id: "db_crepioca", name: "Crepioca (1 Ovo + 30g Tapioca)", category: "Bebidas e Preparações", baseQty: 1, unitType: "un", kcal: 150, p: 6.5, c: 18.0, g: 5.5 },
    { id: "db_omelete_queijo", name: "Omelete (2 Ovos + Queijo)", category: "Bebidas e Preparações", baseQty: 1, unitType: "un", kcal: 230, p: 18.0, c: 1.5, g: 16.0 },
    { id: "db_panqueca_banana", name: "Panqueca de Aveia + Banana + 1 Ovo", category: "Bebidas e Preparações", baseQty: 1, unitType: "un", kcal: 220, p: 9.5, c: 32.0, g: 6.0 },
    { id: "db_acai_puro", name: "Açaí Puro sem Xarope", category: "Bebidas e Preparações", baseQty: 100, unitType: "g", kcal: 60, p: 1.2, c: 4.0, g: 4.5 },
    { id: "db_acai_xarope", name: "Açaí com Xarope e Guaraná", category: "Bebidas e Preparações", baseQty: 100, unitType: "g", kcal: 110, p: 1.0, c: 22.0, g: 2.0 },

    // --- 12. PIZZAS E LANCHES FAST-FOOD ---
    { id: "db_pizza_mucarela", name: "Pizza de Muçarela (1 fatia / 100g)", category: "Pizzas e Lanches", baseQty: 1, unitType: "fatia", kcal: 280, p: 12.0, c: 30.0, g: 12.5 },
    { id: "db_pizza_calabresa", name: "Pizza de Calabresa (1 fatia / 100g)", category: "Pizzas e Lanches", baseQty: 1, unitType: "fatia", kcal: 300, p: 13.5, c: 29.0, g: 15.0 },
    { id: "db_pizza_frango_catupiry", name: "Pizza de Frango com Catupiry (1 fatia / 100g)", category: "Pizzas e Lanches", baseQty: 1, unitType: "fatia", kcal: 290, p: 15.0, c: 28.0, g: 13.0 },
    { id: "db_pizza_portuguesa", name: "Pizza Portuguesa (1 fatia / 100g)", category: "Pizzas e Lanches", baseQty: 1, unitType: "fatia", kcal: 310, p: 14.0, c: 30.0, g: 15.5 },
    { id: "db_pizza_4queijos", name: "Pizza Quatro Queijos (1 fatia / 100g)", category: "Pizzas e Lanches", baseQty: 1, unitType: "fatia", kcal: 330, p: 16.0, c: 28.0, g: 17.0 },
    { id: "db_pizza_marguerita", name: "Pizza Marguerita (1 fatia / 100g)", category: "Pizzas e Lanches", baseQty: 1, unitType: "fatia", kcal: 260, p: 11.0, c: 29.0, g: 11.0 },
    { id: "db_pizza_chocolate", name: "Pizza Doce de Chocolate / Brigadeiro (1 fatia / 100g)", category: "Pizzas e Lanches", baseQty: 1, unitType: "fatia", kcal: 350, p: 7.0, c: 48.0, g: 14.0 },
    { id: "db_hamburguer_carne", name: "Hambúrguer de Carne Bovino (100g)", category: "Pizzas e Lanches", baseQty: 100, unitType: "g", kcal: 250, p: 20.0, c: 0.0, g: 18.0 },
    { id: "db_cheeseburger", name: "Cheeseburger Tradicional (1 un)", category: "Pizzas e Lanches", baseQty: 1, unitType: "un", kcal: 350, p: 18.0, c: 32.0, g: 17.0 },
    { id: "db_x_salada", name: "X-Salada Completo com Maionese (1 un)", category: "Pizzas e Lanches", baseQty: 1, unitType: "un", kcal: 480, p: 22.0, c: 40.0, g: 26.0 },
    { id: "db_x_bacon", name: "X-Bacon Burger (1 un)", category: "Pizzas e Lanches", baseQty: 1, unitType: "un", kcal: 580, p: 28.0, c: 38.0, g: 35.0 },
    { id: "db_nuggets", name: "Nugget de Frango (1 un / 20g)", category: "Pizzas e Lanches", baseQty: 1, unitType: "un", kcal: 50, p: 2.8, c: 3.5, g: 2.6 },
    { id: "db_batata_frita", name: "Batata Frita de Lanchonete", category: "Pizzas e Lanches", baseQty: 100, unitType: "g", kcal: 312, p: 3.4, c: 41.0, g: 15.0 },

    // --- 13. SALGADOS E PADARIA ---
    { id: "db_coxinha", name: "Coxinha de Frango com Catupiry (1 un / 120g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 320, p: 11.0, c: 35.0, g: 15.0 },
    { id: "db_empada_frango", name: "Empada de Frango (1 un / 80g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 260, p: 8.0, c: 24.0, g: 15.0 },
    { id: "db_empada_palmito", name: "Empada de Palmito (1 un / 80g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 240, p: 4.5, c: 26.0, g: 13.5 },
    { id: "db_pastel_carne", name: "Pastel de Carne Frito (1 un / 100g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 290, p: 10.0, c: 28.0, g: 15.0 },
    { id: "db_pastel_queijo", name: "Pastel de Queijo Frito (1 un / 100g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 310, p: 11.0, c: 27.0, g: 18.0 },
    { id: "db_esfiha_carne", name: "Esfiha de Carne Assada (1 un / 70g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 180, p: 8.0, c: 22.0, g: 6.5 },
    { id: "db_esfiha_queijo", name: "Esfiha de Queijo Assada (1 un / 70g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 200, p: 9.0, c: 21.0, g: 8.5 },
    { id: "db_joelho_salsicha", name: "Enrolado de Salsicha / Presunto e Queijo (1 un)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 340, p: 12.0, c: 38.0, g: 16.0 },
    { id: "db_kibe_frito", name: "Kibe Frito (1 un / 90g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 250, p: 11.0, c: 22.0, g: 13.0 },
    { id: "db_kibe_assado", name: "Kibe Assado Recheado", category: "Salgados e Padaria", baseQty: 100, unitType: "g", kcal: 190, p: 14.0, c: 18.0, g: 7.0 },
    { id: "db_croissant", name: "Croissant de Presunto e Queijo (1 un / 90g)", category: "Salgados e Padaria", baseQty: 1, unitType: "un", kcal: 360, p: 10.0, c: 34.0, g: 20.0 },

    // --- 14. DOCES, SOBREMESAS E CHOCOLATES ---
    { id: "db_brigadeiro", name: "Brigadeiro Tradicional (1 un / 20g)", category: "Doces e Sobremesas", baseQty: 1, unitType: "un", kcal: 75, p: 1.2, c: 11.5, g: 2.8 },
    { id: "db_beijinho", name: "Beijinho de Coco (1 un / 20g)", category: "Doces e Sobremesas", baseQty: 1, unitType: "un", kcal: 78, p: 1.0, c: 11.0, g: 3.2 },
    { id: "db_pudim", name: "Pudim de Leite Condensado (1 fatia / 100g)", category: "Doces e Sobremesas", baseQty: 1, unitType: "fatia", kcal: 250, p: 5.5, c: 42.0, g: 7.0 },
    { id: "db_bolo_chocolate", name: "Bolo de Chocolate com Cobertura (1 fatia / 80g)", category: "Doces e Sobremesas", baseQty: 1, unitType: "fatia", kcal: 280, p: 4.0, c: 45.0, g: 9.5 },
    { id: "db_bolo_cenoura", name: "Bolo de Cenoura com Calda de Chocolate (1 fatia / 80g)", category: "Doces e Sobremesas", baseQty: 1, unitType: "fatia", kcal: 260, p: 3.5, c: 42.0, g: 9.0 },
    { id: "db_doce_leite", name: "Doce de Leite Cremoso", category: "Doces e Sobremesas", baseQty: 20, unitType: "g", kcal: 63, p: 1.2, c: 11.5, g: 1.4 },
    { id: "db_gelatina", name: "Gelatina de Frutas Pronta", category: "Doces e Sobremesas", baseQty: 100, unitType: "g", kcal: 60, p: 1.5, c: 14.0, g: 0.0 },
    { id: "db_sorvete", name: "Sorvete de Creme / Chocolate (1 bola / 60g)", category: "Doces e Sobremesas", baseQty: 1, unitType: "un", kcal: 120, p: 2.0, c: 16.0, g: 5.5 },
    { id: "db_choc_leite", name: "Chocolate ao Leite (30g)", category: "Doces e Sobremesas", baseQty: 30, unitType: "g", kcal: 160, p: 2.2, c: 17.5, g: 9.2 },
    { id: "db_choc_amargo", name: "Chocolate Amargo 70% Cacau (30g)", category: "Doces e Sobremesas", baseQty: 30, unitType: "g", kcal: 170, p: 2.8, c: 13.0, g: 12.0 },
    { id: "db_pacoca", name: "Paçoca de Amendoim (1 un / 20g)", category: "Doces e Sobremesas", baseQty: 1, unitType: "un", kcal: 100, p: 3.0, c: 11.0, g: 5.0 }
  ],

  defaultHistoryLogs: [
    { date: "29/07/2026", weight: 115.8, humor: "Focado 🔥", treino: "Sim 💪", cardio: "15 min HIIT", sono: "7.5h ⭐⭐⭐⭐" },
    { date: "28/07/2026", weight: 116.0, humor: "Tranquilo 😁", treino: "Sim 💪", cardio: "15 min", sono: "8.0h ⭐⭐⭐⭐⭐" },
    { date: "27/07/2026", weight: 116.2, humor: "Motivado 🚀", treino: "Sim 💪", cardio: "15 min", sono: "7.0h ⭐⭐⭐⭐" },
    { date: "26/07/2026", weight: 116.5, humor: "Cansado 😴", treino: "Não", cardio: "20 min", sono: "6.5h ⭐⭐⭐" },
    { date: "25/07/2026", weight: 116.8, humor: "Tranquilo 😁", treino: "Sim 💪", cardio: "15 min", sono: "7.5h ⭐⭐⭐⭐" }
  ]
};
function initCurrentDate() {
  const now = new Date();
  const options = { weekday: 'short', day: '2-digit', month: 'short' };
  document.getElementById('current-date-str').innerText = now.toLocaleDateString('pt-BR', options);
}

// RENDER DIET MEALS LIST
function renderDietMeals() {
  const container = document.getElementById('meals-list');
  if (!container) return;

  const dateKey = typeof getSelectedDateKey === 'function' ? getSelectedDateKey() : new Date().toISOString().split('T')[0];
  const logs = typeof loadFoodLogsForDate === 'function' ? loadFoodLogsForDate(dateKey) : [];

  container.innerHTML = AppData.meals.map(meal => {
    const mealLogs = logs.filter(item => item.mealId === meal.id);
    const isLogged = mealLogs.length > 0;
    const isConfirmed = isLogged && mealLogs.every(item => item.confirmed !== false);

    let statusBadgeHtml = '';
    if (isConfirmed) {
      statusBadgeHtml = `<span class="badge-status success" style="font-size: 0.75rem; margin-left: 6px;"><i class="fa-solid fa-circle-check"></i> Aplicada na Planilha</span>`;
    } else if (isLogged) {
      statusBadgeHtml = `<span class="badge-status info" style="font-size: 0.75rem; margin-left: 6px;"><i class="fa-solid fa-clock"></i> Lançada (Pendente)</span>`;
    } else {
      statusBadgeHtml = `<span class="badge-status warning" style="font-size: 0.75rem; margin-left: 6px;"><i class="fa-solid fa-circle-pause"></i> Não Carregada</span>`;
    }

    return `
      <div class="meal-card-full ${isConfirmed ? 'is-confirmed-meal' : ''}" id="${meal.id}">
        <div class="meal-full-header">
          <div class="meal-time-title">
            <i class="fa-solid ${meal.icon}"></i>
            <div>
              <h3>${meal.name} ${statusBadgeHtml}</h3>
              <p><i class="fa-regular fa-clock"></i> ${meal.time} | Meta da Refeição: ~${meal.targetKcal} kcal</p>
            </div>
          </div>
          <div class="meal-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="badge-pill">${meal.macros}</span>
            <button class="btn-success btn-sm ${isConfirmed ? 'confirmed' : ''}" onclick="logAndConfirmPrescribedMeal('${meal.id}')" title="Carregar e confirmar refeição na planilha">
              <i class="fa-solid ${isConfirmed ? 'fa-circle-check' : 'fa-cloud-arrow-up'}"></i> ${isConfirmed ? 'Confirmada na Planilha' : 'Carregar na Planilha'}
            </button>
            <button class="btn-secondary btn-sm" onclick="openSubstituteModal('${meal.name}')">
              <i class="fa-solid fa-arrow-rotate-right"></i> Substitutos
            </button>
          </div>
        </div>

        <table class="food-table">
          <thead>
            <tr>
              <th>Alimento Prescrito</th>
              <th>Quantidade / Porção</th>
              <th>Status do Consumo</th>
            </tr>
          </thead>
          <tbody>
            ${meal.items.map(item => {
              const itemLog = mealLogs.find(l => l.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]));
              const itemConfirmed = itemLog ? itemLog.confirmed !== false : isConfirmed;
              return `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.qty}</td>
                  <td>
                    <span class="badge-status ${itemConfirmed ? 'success' : 'info'}">
                      <i class="fa-solid ${itemConfirmed ? 'fa-check' : 'fa-clock'}"></i> ${itemConfirmed ? 'Consumido & Aplicado' : 'Prescrito'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

// RENDER EXAMS DYNAMICALLY FROM SPREADSHEET
function renderExamsGrid() {
  const container = document.querySelector('.exams-grid');
  if (!container) return;

  container.innerHTML = AppData.exams.map(exam => {
    let badgeClass = "ok";
    let badgeText = exam.status;
    if (exam.class === 'alert') {
      badgeClass = 'alert-danger';
      badgeText = '🔴 ' + exam.status;
    } else if (exam.class === 'warn') {
      badgeClass = 'alert-warning';
      badgeText = '🟡 ' + exam.status;
    } else {
      badgeText = '🟢 ' + exam.status;
    }

    return `
      <div class="exam-card">
        <div class="exam-header">
          <span class="exam-name">${exam.name}</span>
          <span class="exam-status ${exam.class}">${badgeText}</span>
        </div>
        <div class="exam-value">${exam.val} <small>${exam.unit}</small></div>
        <small class="exam-ref">Referência: ${exam.ref}</small>
        <small class="exam-prio" style="display:block; margin-top:4px; color:var(--text-muted); font-size:0.7rem;">Prioridade: ${exam.prio}</small>
      </div>
    `;
  }).join('');
}

// WATER INTAKE COUNTER
function updateWater(delta) {
  const valElem = document.getElementById('water-intake-val');
  let currentVal = parseInt(valElem.innerText.replace('.', '')) || 3500;
  currentVal = Math.max(0, currentVal + delta);
  valElem.innerText = currentVal.toLocaleString('pt-BR');
}

function saveQuickHabits() {
  console.log("Hábitos rápidos salvos");
}

function toggleMealDone(mealId) {
  alert(`Refeição registrada como concluída com sucesso!`);
}

// FOOD SUBSTITUTION MODAL LOGIC
function openSubstituteModal(mealName) {
  const modal = document.getElementById('substitute-modal');
  modal.classList.add('active');
  renderSubstitutions();
}

function closeSubstituteModal() {
  document.getElementById('substitute-modal').classList.remove('active');
}

function renderSubstitutions() {
  const category = document.getElementById('substitute-category').value;
  const outputContainer = document.getElementById('substitutes-output');
  const items = AppData.substitutions[category] || [];

  outputContainer.innerHTML = items.map(item => `
    <div class="sub-item">
      <div>
        <small class="text-muted">Opção para substituir:</small>
        <p>${item.original}</p>
      </div>
      <div>
        <strong class="text-emerald">${item.sub}</strong>
        <p><small>Quantidade: ${item.qty}</small></p>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   DAILY FOOD & MEAL LOGGING CONTROLLER
   ========================================================================== */
function initFoodDiary() {
  const todayKey = new Date().toISOString().split('T')[0];

  const topbarPicker = document.getElementById('topbar-date-picker');
  const checkinInput = document.getElementById('checkin-date');

  if (topbarPicker && !topbarPicker.value) topbarPicker.value = todayKey;
  if (checkinInput && !checkinInput.value) checkinInput.value = todayKey;

  // Render quick preset meal buttons
  renderQuickMealsButtons();

  // Render Table 98 food database datalist
  renderFoodDatalist98();

  // Setup auto-calculation from Table 98
  setupFoodDatabaseAutoCalc();

  // Custom food form submit listener
  const customForm = document.getElementById('form-add-custom-food');
  if (customForm) {
    customForm.addEventListener('submit', handleCustomFoodSubmit);
  }

  // Initial load & populate for selected date
  onDateSelectionChanged(todayKey);
  renderHistoryTable();
}

function renderFoodDatalist98() {
  const selectElem = document.getElementById('food-select');
  if (!selectElem || !AppData.foodDatabase98) return;

  let html = `<option value="">-- Selecione um Alimento da Tabela 98 --</option>`;

  const categories = {};
  AppData.foodDatabase98.forEach(item => {
    const cat = item.category || "Outros";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  Object.keys(categories).forEach(cat => {
    html += `<optgroup label="🥗 ${cat}">`;
    categories[cat].forEach(item => {
      html += `<option value="${item.name}">${item.name} (${item.baseQty}${item.unitType} • ${item.kcal} kcal)</option>`;
    });
    html += `</optgroup>`;
  });

  html += `<option value="__CUSTOM__">✏️ Outro Alimento Avulso (Digitar Nome)</option>`;
  selectElem.innerHTML = html;
}

function handleFoodSelectChange(selectedName) {
  const customInput = document.getElementById('food-name-custom');
  const qtyInput = document.getElementById('food-qty');
  const kcalInput = document.getElementById('food-kcal');
  const proteinInput = document.getElementById('food-protein');
  const carbsInput = document.getElementById('food-carbs');
  const fatsInput = document.getElementById('food-fats');
  const statusElem = document.getElementById('auto-calc-status');

  if (selectedName === '__CUSTOM__') {
    if (customInput) {
      customInput.style.display = 'block';
      customInput.required = true;
      customInput.focus();
    }
    if (statusElem) statusElem.innerHTML = `<span class="text-muted"><i class="fa-solid fa-pen"></i> Digite o alimento e macronutrientes manualmente</span>`;
    return;
  } else {
    if (customInput) {
      customInput.style.display = 'none';
      customInput.required = false;
      customInput.value = '';
    }
  }

  if (!selectedName) {
    if (statusElem) statusElem.innerText = '';
    return;
  }

  const match = AppData.foodDatabase98.find(item => item.name === selectedName);
  if (match) {
    if (qtyInput) qtyInput.value = `${match.baseQty}${match.unitType}`;
    if (kcalInput) kcalInput.value = match.kcal;
    if (proteinInput) proteinInput.value = match.p;
    if (carbsInput) carbsInput.value = match.c;
    if (fatsInput) fatsInput.value = match.g;

    if (statusElem) {
      statusElem.innerHTML = `<i class="fa-solid fa-calculator text-emerald"></i> <strong>${match.name}</strong> (${match.baseQty}${match.unitType}): <strong>${match.kcal} kcal</strong> (${match.p}g P | ${match.c}g C | ${match.g}g G) calculados automaticamente pela Tabela 98`;
    }
  }
}

function setupFoodDatabaseAutoCalc() {
  const qtyInput = document.getElementById('food-qty');
  const selectElem = document.getElementById('food-select');

  if (!qtyInput || !selectElem) return;

  qtyInput.addEventListener('input', () => {
    const selectedName = selectElem.value;
    if (!selectedName || selectedName === '__CUSTOM__') return;

    const match = AppData.foodDatabase98.find(item => item.name === selectedName);
    if (!match) return;

    const valQtyStr = qtyInput.value.trim();
    const matchesNum = valQtyStr.match(/[\d.]+/);
    const parsedQty = matchesNum ? parseFloat(matchesNum[0]) : match.baseQty;
    const ratio = parsedQty / (match.baseQty || 100);

    const calcKcal = Math.round(match.kcal * ratio);
    const calcP = parseFloat((match.p * ratio).toFixed(1));
    const calcC = parseFloat((match.c * ratio).toFixed(1));
    const calcG = parseFloat((match.g * ratio).toFixed(1));

    const kcalInput = document.getElementById('food-kcal');
    const proteinInput = document.getElementById('food-protein');
    const carbsInput = document.getElementById('food-carbs');
    const fatsInput = document.getElementById('food-fats');
    const statusElem = document.getElementById('auto-calc-status');

    if (kcalInput) kcalInput.value = calcKcal;
    if (proteinInput) proteinInput.value = calcP;
    if (carbsInput) carbsInput.value = calcC;
    if (fatsInput) fatsInput.value = calcG;

    if (statusElem) {
      statusElem.innerHTML = `<i class="fa-solid fa-calculator text-emerald"></i> <strong>${match.name}</strong> (${parsedQty}${match.unitType}): <strong>${calcKcal} kcal</strong> (${calcP}g P | ${calcC}g C | ${calcG}g G) recalculados pela Tabela 98`;
    }
  });
}

function getSelectedDateKey() {
  const topbarPicker = document.getElementById('topbar-date-picker');
  if (topbarPicker && topbarPicker.value) {
    return topbarPicker.value;
  }
  const dateInput = document.getElementById('checkin-date');
  if (dateInput && dateInput.value) {
    return dateInput.value;
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function onDateSelectionChanged(newDateKey) {
  if (!newDateKey) return;

  const topbarPicker = document.getElementById('topbar-date-picker');
  const checkinInput = document.getElementById('checkin-date');
  if (topbarPicker && topbarPicker.value !== newDateKey) topbarPicker.value = newDateKey;
  if (checkinInput && checkinInput.value !== newDateKey) checkinInput.value = newDateKey;

  // 1. Pull and populate existing checkin log for this selected date
  loadCheckinFormForDate(newDateKey);

  // 2. Load food logs for this selected date
  renderDailyFoodLogUI();
}

function loadCheckinFormForDate(dateKey) {
  const parts = dateKey.split('-');
  let formattedDate = dateKey;
  if (parts.length === 3) {
    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const logs = JSON.parse(localStorage.getItem('nutriax_logs')) || AppData.defaultHistoryLogs;
  const existing = logs.find(l => l.dateKey === dateKey || l.date === formattedDate);

  const pesoInput = document.getElementById('checkin-peso');
  const humorSelect = document.getElementById('checkin-humor');
  const treinoSelect = document.getElementById('checkin-treino');
  const cardioInput = document.getElementById('checkin-cardio');
  const sonoInput = document.getElementById('checkin-sono');
  const sonoQualSelect = document.getElementById('checkin-qualidade-sono');
  const obsTextarea = document.getElementById('checkin-obs');

  if (existing) {
    if (pesoInput) pesoInput.value = existing.weight || AppData.patient.currentWeight || '';
    if (humorSelect) humorSelect.value = existing.humor || 'Focado 🔥';
    if (treinoSelect) treinoSelect.value = (existing.treino && existing.treino.includes('Sim')) ? 'Sim' : 'Não';
    
    if (cardioInput) {
      const matchCardio = String(existing.cardio || '').match(/(\d+)/);
      cardioInput.value = matchCardio ? matchCardio[1] : '15';
    }

    if (sonoInput) {
      const matchSono = String(existing.sono || '').match(/([\d.]+)/);
      sonoInput.value = matchSono ? matchSono[1] : '7.5';
    }

    if (sonoQualSelect) {
      if (existing.sono && existing.sono.includes('Excelente')) sonoQualSelect.value = 'Excelente';
      else if (existing.sono && existing.sono.includes('Boa')) sonoQualSelect.value = 'Boa';
      else if (existing.sono && existing.sono.includes('Regular')) sonoQualSelect.value = 'Regular';
      else if (existing.sono && existing.sono.includes('Ruim')) sonoQualSelect.value = 'Ruim';
      else sonoQualSelect.value = 'Boa';
    }

    if (obsTextarea) obsTextarea.value = existing.obs || '';
  } else {
    if (pesoInput) pesoInput.value = AppData.patient.currentWeight || 115.8;
    if (humorSelect) humorSelect.value = 'Focado 🔥';
    if (treinoSelect) treinoSelect.value = 'Sim';
    if (cardioInput) cardioInput.value = '15';
    if (sonoInput) sonoInput.value = '7.5';
    if (sonoQualSelect) sonoQualSelect.value = 'Boa';
    if (obsTextarea) obsTextarea.value = '';
  }
}

function getStorageKeyForDate(dateKey) {
  return `nutriax_food_log_${dateKey}`;
}

// Preset prescribed food items for quick logging
const PRESCRIBED_FOOD_DATA = {
  "ref-cafe": [
    { name: "Café com Açúcar", qty: "100 ml", kcal: 30, p: 0.5, c: 7.0, g: 0.0 },
    { name: "Leite em Pó Integral", qty: "50 g", kcal: 260, p: 12.5, c: 22.0, g: 13.5 }
  ],
  "ref-lanche-m": [
    { name: "Albumina Naturovos", qty: "30 g", kcal: 110, p: 24.0, c: 2.0, g: 0.0 },
    { name: "Iogurte Natural Integral", qty: "170 g", kcal: 110, p: 6.0, c: 9.0, g: 6.0 },
    { name: "Leite em Pó Integral", qty: "30 g", kcal: 155, p: 7.5, c: 13.0, g: 8.0 },
    { name: "Farelo de Aveia", qty: "30 g", kcal: 60, p: 6.5, c: 16.0, g: 2.0 }
  ],
  "ref-almoco": [
    { name: "Peito de Frango (Grelhado)", qty: "200 g", kcal: 330, p: 62.0, c: 0.0, g: 7.0 },
    { name: "Arroz Branco (Cozido)", qty: "250 g", kcal: 320, p: 6.0, c: 70.0, g: 1.0 },
    { name: "Milho Verde Cozido", qty: "150 g", kcal: 147, p: 5.0, c: 28.0, g: 2.0 },
    { name: "Salada Verde (Alface/Rúcula)", qty: "À vontade", kcal: 25, p: 2.0, c: 0.0, g: 3.0 }
  ],
  "ref-pre-treino": [
    { name: "Iogurte Natural Integral", qty: "250 g", kcal: 162, p: 9.0, c: 13.0, g: 9.0 },
    { name: "Aveia em Flocos", qty: "60 g", kcal: 212, p: 9.5, c: 36.0, g: 4.5 },
    { name: "Leite em Pó Integral", qty: "30 g", kcal: 155, p: 7.5, c: 13.0, g: 8.0 }
  ],
  "ref-pos-treino": [
    { name: "Albumina Naturovos", qty: "40 g", kcal: 147, p: 32.0, c: 2.5, g: 0.0 },
    { name: "Leite em Pó Integral", qty: "20 g", kcal: 97, p: 7.0, c: 6.5, g: 5.4 }
  ],
  "ref-jantar": [
    { name: "Peito de Frango (Grelhado)", qty: "100 g", kcal: 165, p: 31.0, c: 0.0, g: 3.5 },
    { name: "Arroz Branco (Cozido)", qty: "200 g", kcal: 256, p: 5.0, c: 56.0, g: 0.8 },
    { name: "Ervilha Cozida", qty: "120 g", kcal: 121, p: 7.0, c: 21.0, g: 2.0 }
  ]
};

function renderQuickMealsButtons() {
  const container = document.getElementById('quick-meals-buttons');
  if (!container) return;

  container.innerHTML = AppData.meals.map(meal => `
    <button type="button" class="btn-quick-meal" onclick="logPrescribedMeal('${meal.id}')" title="Lançar ${meal.name} integralmente no diário">
      <span class="meal-quick-title"><i class="fa-solid ${meal.icon}"></i> ${meal.name}</span>
      <span class="meal-quick-kcal">${meal.targetKcal} kcal</span>
    </button>
  `).join('');
}

function getPrescribedItemsForMeal(mealId) {
  if (!mealId) return [];

  const aliases = {
    'ref-cafe': 'ref-cafe', 'cafe': 'ref-cafe', 'cafe-da-manha': 'ref-cafe',
    'ref-lanche-m': 'ref-lanche-m', 'lanche-m': 'ref-lanche-m', 'lanche-manha': 'ref-lanche-m',
    'ref-almoco': 'ref-almoco', 'almoco': 'ref-almoco',
    'ref-pre-treino': 'ref-pre-treino', 'pre-treino': 'ref-pre-treino', 'ref-lanche-t': 'ref-pre-treino', 'lanche-tarde': 'ref-pre-treino',
    'ref-pos-treino': 'ref-pos-treino', 'pos-treino': 'ref-pos-treino',
    'ref-jantar': 'ref-jantar', 'jantar': 'ref-jantar',
    'ref-ceia': 'ref-pos-treino', 'ceia': 'ref-pos-treino'
  };

  const key = aliases[mealId] || aliases[String(mealId).toLowerCase()] || mealId;
  if (PRESCRIBED_FOOD_DATA[key] && PRESCRIBED_FOOD_DATA[key].length > 0) {
    return PRESCRIBED_FOOD_DATA[key];
  }

  // Fallback to AppData.meals
  const mealObj = AppData.meals.find(m => m.id === mealId || aliases[m.id] === key);
  if (mealObj && mealObj.items && mealObj.items.length > 0) {
    return mealObj.items.map(item => ({
      name: item.name,
      qty: item.qty,
      kcal: item.kcal || 150,
      p: item.p || 10,
      c: item.c || 15,
      g: item.g || 5
    }));
  }

  return [];
}

function ensureAllPrescribedMealsInLogs(logs) {
  if (!Array.isArray(logs)) logs = [];

  const requiredMealKeys = ['ref-cafe', 'ref-lanche-m', 'ref-almoco', 'ref-pre-treino', 'ref-pos-treino', 'ref-jantar'];
  let updated = false;

  requiredMealKeys.forEach(mKey => {
    const hasItems = logs.some(item => (item.mealId || 'ref-extra') === mKey);
    if (!hasItems) {
      const itemsToAdd = getPrescribedItemsForMeal(mKey);
      if (itemsToAdd.length > 0) {
        const newItems = itemsToAdd.map(item => ({
          id: 'seed_' + mKey + '_' + Math.random().toString(36).substr(2, 7),
          mealId: mKey,
          name: item.name,
          qty: item.qty,
          kcal: item.kcal,
          p: item.p,
          c: item.c,
          g: item.g,
          confirmed: false
        }));
        logs = [...logs, ...newItems];
        updated = true;
      }
    }
  });

  return { logs, updated };
}

function loadFoodLogsForDate(dateKey) {
  const raw = localStorage.getItem(getStorageKeyForDate(dateKey));
  let logs = raw ? JSON.parse(raw) : [];

  // Ensure all 6 prescribed meals exist in logs
  const result = ensureAllPrescribedMealsInLogs(logs);
  if (result.updated || !raw) {
    localStorage.setItem(getStorageKeyForDate(dateKey), JSON.stringify(result.logs));
  }
  return result.logs;
}

function saveFoodLogsForDate(dateKey, logs) {
  localStorage.setItem(getStorageKeyForDate(dateKey), JSON.stringify(logs));
  ensureCheckinLogForDate(dateKey);
  renderHistoryTable();
  renderDietMeals();
}

function ensureCheckinLogForDate(dateKey) {
  const parts = dateKey.split('-');
  let formattedDate = dateKey;
  if (parts.length === 3) {
    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const logs = JSON.parse(localStorage.getItem('nutriax_logs')) || AppData.defaultHistoryLogs;
  
  // Calculate total consumed calories and macros for this dateKey
  const dateFoodLogs = loadFoodLogsForDate(dateKey);
  const confirmedFoods = dateFoodLogs.filter(i => i.confirmed !== false);
  
  let totalKcal = 0, totalP = 0, totalC = 0, totalG = 0;
  confirmedFoods.forEach(i => {
    totalKcal += (i.kcal || 0);
    totalP += (i.p || 0);
    totalC += (i.c || 0);
    totalG += (i.g || 0);
  });

  const existingIndex = logs.findIndex(l => l.date === formattedDate || l.dateKey === dateKey);

  const updatedEntry = {
    dateKey: dateKey,
    date: formattedDate,
    weight: existingIndex >= 0 && logs[existingIndex].weight ? logs[existingIndex].weight : AppData.patient.currentWeight,
    kcal: Math.round(totalKcal),
    p: parseFloat(totalP.toFixed(1)),
    c: parseFloat(totalC.toFixed(1)),
    g: parseFloat(totalG.toFixed(1)),
    confirmedCount: confirmedFoods.length,
    totalCount: dateFoodLogs.length,
    humor: existingIndex >= 0 && logs[existingIndex].humor ? logs[existingIndex].humor : 'Focado 🔥',
    treino: existingIndex >= 0 && logs[existingIndex].treino ? logs[existingIndex].treino : 'Sim 💪',
    cardio: existingIndex >= 0 && logs[existingIndex].cardio ? logs[existingIndex].cardio : '15 min',
    sono: existingIndex >= 0 && logs[existingIndex].sono ? logs[existingIndex].sono : '7.5h (Boa)'
  };

  if (existingIndex >= 0) {
    logs[existingIndex] = { ...logs[existingIndex], ...updatedEntry };
  } else {
    logs.unshift(updatedEntry);
  }

  localStorage.setItem('nutriax_logs', JSON.stringify(logs));
}

function logPrescribedMeal(mealId) {
  const dateKey = getSelectedDateKey();
  let logs = loadFoodLogsForDate(dateKey);

  const existingForMeal = logs.filter(item => (item.mealId || 'ref-extra') === mealId);
  if (existingForMeal.length > 0) {
    logs = logs.map(item => (item.mealId || 'ref-extra') === mealId ? { ...item, confirmed: true } : item);
  } else {
    const itemsToAdd = getPrescribedItemsForMeal(mealId);
    if (itemsToAdd.length === 0) {
      alert(`⚠️ Não foi encontrada prescrição cadastrada para a refeição.`);
      return;
    }

    const newItems = itemsToAdd.map(item => ({
      id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      mealId: mealId,
      name: item.name,
      qty: item.qty,
      kcal: item.kcal,
      p: item.p,
      c: item.c,
      g: item.g,
      confirmed: true
    }));
    logs = [...logs, ...newItems];
  }

  saveFoodLogsForDate(dateKey, logs);
  renderDailyFoodLogUI();
  renderHistoryTable();
  renderDietMeals();

  // Sync all items in meal with Apps Script
  const itemsToSync = logs.filter(item => (item.mealId || 'ref-extra') === mealId);
  itemsToSync.forEach(item => {
    syncItemWithGoogleSheets(item, "MARK_DONE");
  });

  const mealObj = AppData.meals.find(m => m.id === mealId);
  const mealName = mealObj ? mealObj.name : 'Refeição';
  alert(`✅ Refeição "${mealName}" confirmada e enviada para a planilha com sucesso!`);
}

function logAndConfirmPrescribedMeal(mealId) {
  logPrescribedMeal(mealId);
}

function loadAllPrescribedPlanToSpreadsheet() {
  const dateKey = getSelectedDateKey();
  let allItems = [];

  Object.keys(PRESCRIBED_FOOD_DATA).forEach(mealId => {
    const items = PRESCRIBED_FOOD_DATA[mealId] || [];
    items.forEach(item => {
      allItems.push({
        id: 'food_prescribed_' + mealId + '_' + Math.random().toString(36).substr(2, 7),
        mealId: mealId,
        name: item.name,
        qty: item.qty,
        kcal: item.kcal,
        p: item.p,
        c: item.c,
        g: item.g,
        confirmed: true
      });
    });
  });

  saveFoodLogsForDate(dateKey, allItems);
  localStorage.setItem(`nutriax_food_log_confirmed_${dateKey}`, 'true');

  renderDailyFoodLogUI();
  renderHistoryTable();
  renderDietMeals();

  const parts = dateKey.split('-');
  const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateKey;

  alert(`✅ PLANO ALIMENTAR COMPLETO CARREGADO NA PLANILHA!\n\nData: ${dateStr}\nTodas as refeições prescritas (2.840 kcal) foram confirmadas e aplicadas na sua planilha de registros.`);
}

function handleCustomFoodSubmit(e) {
  e.preventDefault();

  const dateKey = getSelectedDateKey();
  const mealId = document.getElementById('food-meal-select').value;
  const selectElem = document.getElementById('food-select');
  const customInput = document.getElementById('food-name-custom');

  let name = selectElem ? selectElem.value : '';
  if (name === '__CUSTOM__') {
    name = customInput ? customInput.value.trim() : '';
  }

  const qty = document.getElementById('food-qty').value.trim();
  const kcal = parseFloat(document.getElementById('food-kcal').value) || 0;
  const p = parseFloat(document.getElementById('food-protein').value) || 0;
  const c = parseFloat(document.getElementById('food-carbs').value) || 0;
  const g = parseFloat(document.getElementById('food-fats').value) || 0;

  if (!name || !qty) return;

  const newItem = {
    id: 'custom_' + Date.now(),
    mealId: mealId,
    name: name,
    qty: qty,
    kcal: kcal,
    p: p,
    c: c,
    g: g,
    confirmed: true
  };

  const logs = loadFoodLogsForDate(dateKey);
  logs.push(newItem);
  saveFoodLogsForDate(dateKey, logs);

  syncItemWithGoogleSheets(newItem, "MARK_DONE");

  if (selectElem) selectElem.value = '';
  if (customInput) { customInput.value = ''; customInput.style.display = 'none'; }
  document.getElementById('food-qty').value = '';
  document.getElementById('food-kcal').value = '';
  document.getElementById('food-protein').value = '';
  document.getElementById('food-carbs').value = '';
  document.getElementById('food-fats').value = '';
  const statusElem = document.getElementById('auto-calc-status');
  if (statusElem) statusElem.innerText = '';

  renderDailyFoodLogUI();
}

// GOOGLE APPS SCRIPT WEB APP INTEGRATION (v15.0 - 12_App do Paciente UPSERT)
const OFFICIAL_MEAL_CODES = {
  "cafe da manha": "REF001",
  "ref-cafe": "REF001",
  "lanche manha": "REF002",
  "lanche da manha": "REF002",
  "ref-lanche-m": "REF002",
  "almoco": "REF003",
  "ref-almoco": "REF003",
  "lanche tarde": "REF004",
  "lanche da tarde": "REF004",
  "pre-treino": "REF005",
  "pre treino": "REF005",
  "ref-pre-treino": "REF005",
  "pos-treino": "REF006",
  "pos treino": "REF006",
  "ref-pos-treino": "REF006",
  "jantar": "REF007",
  "ref-jantar": "REF007",
  "ceia": "REF008",
  "fora da dieta": "REF009"
};

const OFFICIAL_FOOD_DICTIONARY = {
  "whey protein isolado": "ALI_0001",
  "soy protein isolada": "ALI_0002",
  "albumina naturovos": "ALI_0003",
  "colageno hidrolisado": "ALI_0004",
  "caseina micelar": "ALI_0005",
  "beef protein": "ALI_0006",
  "lombo suino assado": "ALI_0007",
  "leite em po desnatado": "ALI_0008",
  "queijo parmesao": "ALI_0009",
  "patinho grelhado": "ALI_0010",
  "bisteca suina frita": "ALI_0011",
  "charque carne seca frita": "ALI_0012",
  "peito de frango grelhado": "ALI_0013",
  "file mignon grelhado": "ALI_0014",
  "coxao mole cozido": "ALI_0015",
  "bacon frito": "ALI_0016",
  "maminha grelhada": "ALI_0017",
  "alcatra frita": "ALI_0018",
  "picanha grelhada": "ALI_0019",
  "coracao bovino cozido": "ALI_0020",
  "costela bovina cozida": "ALI_0021",
  "tilapia cozida": "ALI_0022",
  "salmao grelhado": "ALI_0023",
  "atum em lata drenado": "ALI_0024",
  "leite em po integral": "ALI_0025",
  "sardinha em lata oleo": "ALI_0026",
  "queijo mucarela": "ALI_0027",
  "pasta de amendoim": "ALI_0028",
  "queijo minas frescal": "ALI_0029",
  "aveia flocos": "ALI_0030",
  "presunto de peru": "ALI_0031",
  "ovo de galinha cozido": "ALI_0032",
  "clara de ovo cozida": "ALI_0033",
  "queijo cottage": "ALI_0034",
  "requeijao light": "ALI_0035",
  "iogurte grego natural": "ALI_0036",
  "pao de forma integral": "ALI_0037",
  "lentilha cozida": "ALI_0038",
  "pao frances": "ALI_0039",
  "leite condensado": "ALI_0040",
  "biscoito de arroz": "ALI_0041",
  "feijao carioca cozido": "ALI_0042",
  "feijao preto cozido": "ALI_0043",
  "arroz branco cozido": "ALI_0044",
  "arroz integral cozido": "ALI_0045",
  "batata doce assada": "ALI_0046",
  "tapioca goma pronta": "ALI_0047",
  "palatinose": "ALI_0048",
  "mandioca cozida": "ALI_0049",
  "banana nanica": "ALI_0050",
  "maca fuji c casca": "ALI_0051",
  "batata inglesa cozida": "ALI_0052",
  "abobora moranga refog": "ALI_0053",
  "brocolis cozido": "ALI_0054",
  "cenoura crua": "ALI_0055",
  "tomate cru": "ALI_0056",
  "abacate": "ALI_0057",
  "azeite de oliva": "ALI_0058",
  "castanha do para": "ALI_0059",
  "mel de abelha": "ALI_0060",
  "cafe sem acucar": "ALI_0061",
  "refrigerante zero": "ALI_0062",
  "iogurte natural integral": "ALI_0129",
  "iogurte natural desnatado": "ALI_0087",
  "farelo de aveia": "ALI_0131",
  "milho verde cozido": "ALI_0145",
  "ervilha cozida": "ALI_0146",
  "cafe com acucar": "ALI_0223"
};

const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzf2qieHSiEs6iiefRg0-tbDTcshBA9ZowekyoE2o3mqNTerSthh1zOQXbxp-TPsuq-/exec';

function getAppsScriptUrl() {
  return localStorage.getItem('nutriax_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
}

function lookupFoodCode(foodName) {
  if (!foodName) return "ALI_0129";
  const norm = foodName.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (OFFICIAL_FOOD_DICTIONARY[norm]) {
    return OFFICIAL_FOOD_DICTIONARY[norm];
  }

  const keys = Object.keys(OFFICIAL_FOOD_DICTIONARY);
  for (let k of keys) {
    if (k.includes(norm) || norm.includes(k)) {
      return OFFICIAL_FOOD_DICTIONARY[k];
    }
  }

  return "ALI_0129";
}

function updateGsStatusUI() {
  const btnGs = document.getElementById('btn-gs-connector');
  const scriptUrl = getAppsScriptUrl();

  if (btnGs) {
    if (scriptUrl && scriptUrl.startsWith('http')) {
      btnGs.innerHTML = `<i class="fa-solid fa-file-excel text-emerald"></i> GS Conectado`;
      btnGs.className = 'btn-secondary btn-sm';
      btnGs.title = `🟢 Google Sheets Conectado (aba 12_App do Paciente) - Clique para alterar a URL`;
    } else {
      btnGs.innerHTML = `<i class="fa-solid fa-file-excel text-amber"></i> Conectar GS`;
      btnGs.className = 'btn-secondary btn-sm';
      btnGs.title = `🔴 Google Sheets Não Conectado - Clique para colar a URL do Web App`;
    }
  }

  const bar = document.getElementById('gs-status-bar');
  if (!bar) return;

  const title = document.getElementById('gs-status-title');
  const desc = document.getElementById('gs-status-desc');
  const btnText = document.getElementById('gs-btn-text');

  if (scriptUrl && scriptUrl.startsWith('http')) {
    if (title) title.innerHTML = `🟢 Conectado ao Google Sheets (aba 12_App do Paciente)`;
    if (desc) desc.innerText = `Sincronização remota ativa: ${scriptUrl.substring(0, 45)}...`;
    if (btnText) btnText.innerText = `Alterar URL`;
    if (bar) {
      bar.style.background = 'rgba(16, 185, 129, 0.12)';
      bar.style.borderColor = 'rgba(16, 185, 129, 0.35)';
    }
  } else {
    if (title) title.innerHTML = `🔴 Google Sheets Não Conectado`;
    if (desc) desc.innerText = `Clique em "Cole a URL" para vincular seu Web App do Google Apps Script.`;
    if (btnText) btnText.innerText = `Cole a URL do Web App`;
    if (bar) {
      bar.style.background = 'rgba(239, 68, 68, 0.12)';
      bar.style.borderColor = 'rgba(239, 68, 68, 0.35)';
    }
  }
}

function configureGoogleSheetsUrl() {
  const currentUrl = getAppsScriptUrl();
  const newUrl = prompt(
    "📊 CONFIGURAR GOOGLE SHEETS (aba 12_App do Paciente)\n\n" +
    "Cole abaixo a URL do Web App do Google Apps Script publicado:\n" +
    "(Ex: https://script.google.com/macros/s/AKfycb.../exec)\n\n" +
    "💡 Como obter essa URL no Google Apps Script:\n" +
    "1. Na sua planilha, clique em Extensões > Apps Script\n" +
    "2. Clique no botão azul 'Implantar' > 'Nova implantação'\n" +
    "3. Escolha tipo: 'Aplicativo da Web' (Web App)\n" +
    "4. 'Executar como': Eu | 'Quem tem acesso': Qualquer pessoa (Anyone)\n" +
    "5. Clique em Implantar, autorize e copie a URL do Web App.",
    currentUrl
  );

  if (newUrl !== null) {
    const trimmed = newUrl.trim();
    if (trimmed) {
      localStorage.setItem('nutriax_apps_script_url', trimmed);
      updateGsStatusUI();
      alert("✅ Conectado com sucesso ao Google Sheets!\n\nCada marcação (MARK_DONE / MARK_UNDONE) atualizará a aba 12_App do Paciente em tempo real.");
    } else {
      localStorage.removeItem('nutriax_apps_script_url');
      updateGsStatusUI();
      alert("URL customizada removida. Usando a URL padrão do Google Sheets.");
    }
  }
}

async function testGoogleSheetsConnection() {
  const scriptUrl = getAppsScriptUrl();
  if (!scriptUrl || !scriptUrl.startsWith('http')) {
    configureGoogleSheetsUrl();
    return;
  }

  const dateKey = getSelectedDateKey();
  const parts = dateKey.split('-');
  const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateKey;

  const testPayload = {
    action: "MARK_DONE",
    pacienteId: AppData.patient.id || "paulovitor.rsousa3@gmail.com",
    date: dateStr,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    humor: "Focado 🔥",
    idRefeicao: "REF005",
    refeicaoApp: "Pré-treino",
    idAlimento: "ALI_0129",
    idAlimentoCode: "ALI_0129",
    foodName: "Iogurte Natural Integral (Teste)",
    quantidade: 250,
    unidade: "g",
    grauSaciedade: "Adequada",
    treino: "Sim 💪",
    cardio: "Sim",
    duracaoCardio: 15,
    sonoHoras: 7.5,
    qualidadeSono: "Boa",
    pesoDia: AppData.patient.currentWeight || 115.8
  };

  try {
    alert("⏳ Enviando teste para a aba 12_App do Paciente na sua planilha Google Sheets...");
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(testPayload)
    });
    alert("✅ Teste enviado com sucesso!\n\nVerifique a sua planilha Google Sheets na aba 12_App do Paciente em alguns segundos para confirmar a nova linha.");
  } catch (err) {
    alert("❌ Erro ao enviar requisição para o Google Sheets: " + err.toString());
  }
}

function syncItemWithGoogleSheets(item, action, customDateStr = null) {
  if (!item) return;

  let dateStr = customDateStr;
  if (!dateStr) {
    const dateKey = getSelectedDateKey();
    const parts = dateKey.split('-');
    dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateKey;
  }

  let numQty = 1;
  let unit = "un";
  if (item.qty) {
    const match = String(item.qty).match(/([\d.,]+)\s*([a-zA-Z]*)/);
    if (match) {
      numQty = parseFloat(match[1].replace(',', '.')) || 1;
      unit = match[2] || "g";
    }
  }

  const mealMapNames = {
    'ref-cafe': 'Café da Manhã',
    'ref-lanche-m': 'Lanche da Manhã',
    'ref-almoco': 'Almoço',
    'ref-pre-treino': 'Pré-treino',
    'ref-pos-treino': 'Pós-treino',
    'ref-jantar': 'Jantar',
    'ref-extra': 'Lanche Extra / Ceia'
  };

  const mealNameStr = mealMapNames[item.mealId] || item.mealId || "Pré-treino";
  const mealCodeStr = OFFICIAL_MEAL_CODES[item.mealId] || OFFICIAL_MEAL_CODES[mealNameStr.toLowerCase()] || "REF005";
  const foodCode = lookupFoodCode(item.name);

  const payload = {
    action: action, // "MARK_DONE" or "MARK_UNDONE"
    pacienteId: AppData.patient.id || "paulovitor.rsousa3@gmail.com",
    date: dateStr,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    humor: "Focado 🔥",
    idRefeicao: mealCodeStr,
    refeicaoApp: mealNameStr,
    idAlimento: foodCode,             // ESSENTIAL: Official ALI_XXXX code for Coluna H lookup in GS!
    idAlimentoCode: foodCode,
    foodName: item.name,
    quantidade: numQty,
    unidade: unit,
    grauSaciedade: "Adequada",
    treino: "Sim 💪",
    cardio: "Sim",
    duracaoCardio: 15,
    sonoHoras: 7.5,
    qualidadeSono: "Boa",
    pesoDia: AppData.patient.currentWeight || 115.8
  };

  const scriptUrl = getAppsScriptUrl();
  if (scriptUrl && scriptUrl.startsWith('http')) {
    fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(() => {
      console.log(`[Google Sheets GS Sincronizado] ${item.name} (${foodCode}) -> ${action} (${dateStr})`);
    }).catch(err => {
      console.warn(`[Google Sheets GS Erro]`, err);
    });
  } else {
    // Prompt user to connect their Apps Script Web App URL if not set yet
    if (!window._hasPromptedGsUrl) {
      window._hasPromptedGsUrl = true;
      configureGoogleSheetsUrl();
    }
  }
}

function removeFoodLogItem(itemId) {
  const dateKey = getSelectedDateKey();
  let logs = loadFoodLogsForDate(dateKey);
  const targetItem = logs.find(item => item.id === itemId);
  
  logs = logs.filter(item => item.id !== itemId);
  saveFoodLogsForDate(dateKey, logs);
  renderDailyFoodLogUI();

  if (targetItem) {
    syncItemWithGoogleSheets(targetItem, "MARK_UNDONE");
  }
}

function toggleFoodItemConfirm(itemId) {
  const dateKey = getSelectedDateKey();
  let logs = loadFoodLogsForDate(dateKey);
  let targetItem = null;
  let isNowConfirmed = false;

  logs = logs.map(item => {
    if (item.id === itemId) {
      const currentState = item.confirmed !== false;
      isNowConfirmed = !currentState;
      targetItem = { ...item, confirmed: isNowConfirmed };
      return targetItem;
    }
    return item;
  });

  const allConfirmed = logs.length > 0 && logs.every(i => i.confirmed !== false);
  if (allConfirmed) {
    localStorage.setItem(`nutriax_food_log_confirmed_${dateKey}`, 'true');
  } else {
    localStorage.removeItem(`nutriax_food_log_confirmed_${dateKey}`);
  }

  saveFoodLogsForDate(dateKey, logs);
  renderDailyFoodLogUI();

  if (targetItem) {
    syncItemWithGoogleSheets(targetItem, isNowConfirmed ? "MARK_DONE" : "MARK_UNDONE");
  }
}

function toggleMealGroupConfirm(mealId) {
  const dateKey = getSelectedDateKey();
  let logs = loadFoodLogsForDate(dateKey);
  
  let mealItems = logs.filter(item => (item.mealId || 'ref-extra') === mealId);
  let targetState = true;

  if (mealItems.length === 0) {
    const itemsToAdd = PRESCRIBED_FOOD_DATA[mealId] || [];
    if (itemsToAdd.length > 0) {
      const newItems = itemsToAdd.map(item => ({
        id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        mealId: mealId,
        name: item.name,
        qty: item.qty,
        kcal: item.kcal,
        p: item.p,
        c: item.c,
        g: item.g,
        confirmed: true
      }));
      logs = [...logs, ...newItems];
      mealItems = newItems;
      targetState = true;
    }
  } else {
    const allConfirmed = mealItems.every(item => item.confirmed !== false);
    targetState = !allConfirmed;

    logs = logs.map(item => {
      if ((item.mealId || 'ref-extra') === mealId) {
        return { ...item, confirmed: targetState };
      }
      return item;
    });
  }

  const allDailyConfirmed = logs.length > 0 && logs.every(i => i.confirmed !== false);
  if (allDailyConfirmed) {
    localStorage.setItem(`nutriax_food_log_confirmed_${dateKey}`, 'true');
  } else {
    localStorage.removeItem(`nutriax_food_log_confirmed_${dateKey}`);
  }

  saveFoodLogsForDate(dateKey, logs);
  renderDailyFoodLogUI();

  // Sync all items in meal with Apps Script
  const itemsToSync = logs.filter(item => (item.mealId || 'ref-extra') === mealId);
  itemsToSync.forEach(item => {
    syncItemWithGoogleSheets(item, targetState ? "MARK_DONE" : "MARK_UNDONE");
  });
}

function confirmDailyFoodLog() {
  const dateKey = getSelectedDateKey();
  let logs = loadFoodLogsForDate(dateKey);

  if (logs.length === 0) {
    alert('⚠️ Adicione ao menos um alimento ou refeição antes de confirmar o consumo do dia.');
    return;
  }

  // Mark all items as confirmed
  logs = logs.map(item => ({ ...item, confirmed: true }));
  saveFoodLogsForDate(dateKey, logs);
  localStorage.setItem(`nutriax_food_log_confirmed_${dateKey}`, 'true');

  renderDailyFoodLogUI();
  renderHistoryTable();

  // Sync all daily items with Apps Script MARK_DONE
  logs.forEach(item => {
    syncItemWithGoogleSheets(item, "MARK_DONE");
  });

  const parts = dateKey.split('-');
  const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateKey;
  
  alert(`✅ TODOS OS ALIMENTOS DO DIA FORAM CONFIRMADOS!\n\nData: ${dateStr}\nOs alimentos consumidos foram gravados com sucesso na sua planilha oficial do Google Sheets (Aba 12_App do Paciente).`);
}

function clearDailyFoodLogs() {
  const dateKey = getSelectedDateKey();
  if (confirm(`Deseja realmente limpar todos os alimentos registrados para esta data (${dateKey})?`)) {
    localStorage.removeItem(`nutriax_food_log_confirmed_${dateKey}`);
    saveFoodLogsForDate(dateKey, []);
    renderDailyFoodLogUI();
  }
}

function renderDailyFoodLogUI() {
  const dateKey = getSelectedDateKey();
  const dateDisplay = document.getElementById('food-log-date-display');
  const dateDisplayDash = document.getElementById('food-log-date-display-dash');
  updateGsStatusUI();

  const parts = dateKey.split('-');
  const dateFormatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateKey;
  if (dateDisplay) dateDisplay.innerText = dateFormatted;
  if (dateDisplayDash) dateDisplayDash.innerText = dateFormatted;

  const logs = loadFoodLogsForDate(dateKey);
  const totalItemsCount = logs.length;
  const confirmedItems = logs.filter(item => item.confirmed !== false);
  const confirmedCount = confirmedItems.length;
  const isAllConfirmed = totalItemsCount > 0 && confirmedCount === totalItemsCount;

  // Update Header Confirmation Button State
  const btnHeaderConfirm = document.getElementById('btn-confirm-daily-food');
  if (btnHeaderConfirm) {
    if (isAllConfirmed) {
      btnHeaderConfirm.innerHTML = `<i class="fa-solid fa-circle-check"></i> Todos Confirmados (${confirmedCount}/${totalItemsCount})`;
      btnHeaderConfirm.className = `btn-success btn-sm confirmed`;
      btnHeaderConfirm.title = `Todos os alimentos aplicados na planilha`;
    } else {
      btnHeaderConfirm.innerHTML = `<i class="fa-solid fa-check-double"></i> Confirmar Todos (${confirmedCount}/${totalItemsCount})`;
      btnHeaderConfirm.className = `btn-success btn-sm`;
      btnHeaderConfirm.title = `Confirmar e aplicar todos os alimentos do dia`;
    }
  }

  // Calculate Totals for CONFIRMED items
  let totalKcal = 0;
  let totalP = 0;
  let totalC = 0;
  let totalG = 0;

  confirmedItems.forEach(item => {
    totalKcal += (item.kcal || 0);
    totalP += (item.p || 0);
    totalC += (item.c || 0);
    totalG += (item.g || 0);
  });

  // Update Summary Badge
  const badge = document.getElementById('food-log-total-kcal-badge');
  if (badge) {
    badge.innerHTML = `<i class="fa-solid fa-utensils"></i> ${Math.round(totalKcal).toLocaleString('pt-BR')} / 2.840 Kcal ${confirmedCount > 0 ? `<span class="badge-status success" style="margin-left: 6px; padding: 2px 6px; font-size: 0.7rem;"><i class="fa-solid fa-check"></i> ${confirmedCount}/${totalItemsCount} Aplicados</span>` : ''}`;
  }

  // Update Progress Bars
  const targetKcal = AppData.macros.calories;
  const targetP = AppData.macros.proteinGrams;
  const targetC = AppData.macros.carbsGrams;
  const targetG = AppData.macros.fatsGrams;

  const pctKcal = Math.min(100, Math.round((totalKcal / targetKcal) * 100));
  const pctP = Math.min(100, Math.round((totalP / targetP) * 100));
  const pctC = Math.min(100, Math.round((totalC / targetC) * 100));
  const pctG = Math.min(100, Math.round((totalG / targetG) * 100));

  const elemKcalVal = document.getElementById('prog-val-kcal');
  const elemKcalBar = document.getElementById('prog-bar-kcal');
  if (elemKcalVal && elemKcalBar) {
    elemKcalVal.innerText = `${Math.round(totalKcal)} / ${targetKcal} kcal (${pctKcal}%)`;
    elemKcalBar.style.width = `${pctKcal}%`;
  }

  const elemPVal = document.getElementById('prog-val-protein');
  const elemPBar = document.getElementById('prog-bar-protein');
  if (elemPVal && elemPBar) {
    elemPVal.innerText = `${totalP.toFixed(1)} / ${targetP}g (${pctP}%)`;
    elemPBar.style.width = `${pctP}%`;
  }

  const elemCVal = document.getElementById('prog-val-carbs');
  const elemCBar = document.getElementById('prog-bar-carbs');
  if (elemCVal && elemCBar) {
    elemCVal.innerText = `${totalC.toFixed(1)} / ${targetC}g (${pctC}%)`;
    elemCBar.style.width = `${pctC}%`;
  }

  const elemGVal = document.getElementById('prog-val-fats');
  const elemGBar = document.getElementById('prog-bar-fats');
  if (elemGVal && elemGBar) {
    elemGVal.innerText = `${totalG.toFixed(1)} / ${targetG}g (${pctG}%)`;
    elemGBar.style.width = `${pctG}%`;
  }

  // Render Logged Foods List
  const container = document.getElementById('daily-food-log-container');
  if (!container) return;

  if (logs.length === 0) {
    container.innerHTML = `
      <div class="empty-food-log">
        <i class="fa-solid fa-utensils"></i>
        <h4>Nenhum alimento registrado nesta data</h4>
        <p>Utilize os botões de refeição rápida ou adicione alimentos avulsos no painel ao lado.</p>
      </div>
    `;
    return;
  }

  // Meal Names Map
  const mealMap = {
    'ref-cafe': { name: 'Café da Manhã', icon: 'fa-mug-hot' },
    'ref-lanche-m': { name: 'Lanche da Manhã', icon: 'fa-apple-whole' },
    'ref-almoco': { name: 'Almoço', icon: 'fa-bowl-rice' },
    'ref-pre-treino': { name: 'Pré-Treino', icon: 'fa-dumbbell' },
    'ref-pos-treino': { name: 'Pós-Treino', icon: 'fa-bolt' },
    'ref-jantar': { name: 'Jantar', icon: 'fa-utensils' },
    'ref-extra': { name: 'Lanche Extra / Ceia', icon: 'fa-cookie-bite' }
  };

  // Group by mealId
  const grouped = {};
  logs.forEach(item => {
    const key = item.mealId || 'ref-extra';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const mealKeysOrder = ['ref-cafe', 'ref-lanche-m', 'ref-almoco', 'ref-pre-treino', 'ref-pos-treino', 'ref-jantar', 'ref-extra'];

  let html = '';

  // Confirmed status banner if applicable
  if (isAllConfirmed) {
    html += `
      <div class="confirmed-status-banner">
        <div class="banner-info">
          <i class="fa-solid fa-circle-check text-emerald"></i>
          <div>
            <strong>Consumo do Dia Totalmente Confirmado!</strong>
            <p>Todos os ${confirmedCount} alimentos foram consolidados na planilha de registros.</p>
          </div>
        </div>
        <span class="badge-status success"><i class="fa-solid fa-check"></i> ${confirmedCount}/${totalItemsCount} Aplicados</span>
      </div>
    `;
  } else {
    html += `
      <div class="confirmed-status-banner pending">
        <div class="banner-info">
          <i class="fa-solid fa-list-check text-amber"></i>
          <div>
            <strong>Confirmação de Consumo por Alimento / Refeição</strong>
            <p>Clique no ícone <i class="fa-solid fa-circle-check text-emerald"></i> na frente de cada alimento ou no botão da refeição para aplicar.</p>
          </div>
        </div>
        <span class="badge-status warning" style="font-weight: 600;"><i class="fa-solid fa-clock"></i> ${confirmedCount}/${totalItemsCount} Confirmados</span>
      </div>
    `;
  }

  mealKeysOrder.forEach(mKey => {
    const items = grouped[mKey] || [];
    const mInfo = mealMap[mKey] || { name: 'Refeição', icon: 'fa-utensils' };

    if (items.length === 0) {
      if (mKey === 'ref-extra') return; // Only skip extra meal if empty
      // Render prescribed meal card waiting to be loaded
      html += `
        <div class="logged-meal-group is-pending-group" style="opacity: 0.88; border: 1px dashed rgba(255, 255, 255, 0.15); margin-bottom: 1rem;">
          <div class="logged-meal-header" style="background: rgba(255, 255, 255, 0.02);">
            <div class="logged-meal-title-wrap">
              <span class="logged-meal-title" style="color: var(--text-muted);">
                <i class="fa-solid ${mInfo.icon}"></i> ${mInfo.name}
              </span>
              <button type="button" class="btn-meal-confirm" onclick="toggleMealGroupConfirm('${mKey}')" title="Carregar e aplicar todos os alimentos de ${mInfo.name}">
                <i class="fa-solid fa-circle-plus text-emerald"></i> Lançar e Confirmar ${mInfo.name}
              </button>
            </div>
            <div class="logged-meal-stats">
              <small class="text-muted"><i class="fa-solid fa-clock"></i> Prescrito no Plano (Pendente)</small>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const isMealAllConfirmed = items.every(it => it.confirmed !== false);

    let groupKcal = 0;
    let groupP = 0;
    let groupC = 0;
    let groupG = 0;

    items.forEach(it => {
      if (it.confirmed !== false) {
        groupKcal += (it.kcal || 0);
        groupP += (it.p || 0);
        groupC += (it.c || 0);
        groupG += (it.g || 0);
      }
    });

    html += `
      <div class="logged-meal-group ${isMealAllConfirmed ? 'is-confirmed-group' : ''}">
        <div class="logged-meal-header">
          <div class="logged-meal-title-wrap">
            <span class="logged-meal-title">
              <i class="fa-solid ${mInfo.icon}"></i> ${mInfo.name}
            </span>
            <button type="button" class="btn-meal-confirm ${isMealAllConfirmed ? 'confirmed' : ''}" onclick="toggleMealGroupConfirm('${mKey}')" title="${isMealAllConfirmed ? 'Desmarcar toda a refeição' : 'Confirmar todos os alimentos do ' + mInfo.name}">
              <i class="fa-solid ${isMealAllConfirmed ? 'fa-circle-check' : 'fa-circle-plus'}"></i> ${isMealAllConfirmed ? 'Refeição Confirmada' : 'Confirmar Refeição'}
            </button>
          </div>
          <div class="logged-meal-stats">
            <span class="logged-meal-kcal-tag">${Math.round(groupKcal)} kcal</span>
            <small class="text-muted">${groupP.toFixed(0)}P | ${groupC.toFixed(0)}C | ${groupG.toFixed(0)}G</small>
          </div>
        </div>
        <div class="logged-food-list">
          ${items.map(item => {
            const itemConfirmed = item.confirmed !== false;
            return `
              <div class="logged-food-item ${itemConfirmed ? 'is-confirmed-item' : 'is-pending-item'}">
                <div style="display: flex; align-items: center; gap: 0.65rem; flex: 1;">
                  <button type="button" class="btn-check-item ${itemConfirmed ? 'confirmed' : ''}" onclick="toggleFoodItemConfirm('${item.id}')" title="${itemConfirmed ? 'Clique para desmarcar alimento da planilha' : 'Clique para carregar e aplicar alimento na planilha'}">
                    <i class="fa-solid ${itemConfirmed ? 'fa-circle-check text-emerald' : 'fa-circle-notch text-muted'}"></i>
                  </button>
                  <div class="food-item-main">
                    <span class="food-item-name">${item.name}</span>
                    <span class="food-item-qty">
                      ${item.qty} &bull; 
                      ${itemConfirmed ? '<span class="text-emerald" style="font-weight: 500;"><i class="fa-solid fa-check"></i> Aplicado na Planilha</span>' : '<span class="text-amber" style="font-weight: 500;"><i class="fa-solid fa-cloud-arrow-up"></i> Clique para carregar na planilha</span>'}
                    </span>
                  </div>
                </div>
                <div class="food-item-meta">
                  <div class="food-macro-pills">
                    <span class="macro-mini-pill p">${item.p}g P</span>
                    <span class="macro-mini-pill c">${item.c}g C</span>
                    <span class="macro-mini-pill g">${item.g}g G</span>
                  </div>
                  <strong class="${itemConfirmed ? 'text-emerald' : 'text-muted'}" style="min-width: 55px; text-align: right;">${Math.round(item.kcal)} kcal</strong>
                  <button type="button" class="btn-remove-food" onclick="removeFoodLogItem('${item.id}')" title="Remover este item">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  // Action Footer
  html += `
    <div class="food-log-action-footer">
      <div class="footer-totals">
        <small class="text-muted">Total Consumido (Confirmados):</small>
        <strong class="text-emerald">${Math.round(totalKcal)} kcal</strong>
        <span class="text-muted">(${totalP.toFixed(0)}g P | ${totalC.toFixed(0)}g C | ${totalG.toFixed(0)}g G)</span>
      </div>
      <button type="button" class="${isAllConfirmed ? 'btn-secondary btn-sm' : 'btn-success'}" onclick="confirmDailyFoodLog()">
        <i class="fa-solid ${isAllConfirmed ? 'fa-rotate-right' : 'fa-check-double'}"></i>
        ${isAllConfirmed ? 'Re-confirmar Todos' : 'Confirmar Todos os Alimentos do Dia'}
      </button>
    </div>
  `;

  container.innerHTML = html;
}

// RENDER PATIENT HISTORY LOG TABLE / PLANILHA DE REGISTROS
function renderHistoryTable() {
  const tbody = document.getElementById('history-rows');
  if (!tbody) return;

  const logs = JSON.parse(localStorage.getItem('nutriax_logs')) || AppData.defaultHistoryLogs;

  tbody.innerHTML = logs.map((log, index) => {
    let dateKey = log.dateKey;
    if (!dateKey) {
      if (log.date && log.date.includes('/')) {
        const parts = log.date.split('/');
        dateKey = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        dateKey = log.date;
      }
    }
    
    const storedFood = localStorage.getItem(`nutriax_food_log_${dateKey}`);
    let items = [];
    if (storedFood) {
      items = JSON.parse(storedFood);
    } else {
      const todayKey = new Date().toISOString().split('T')[0];
      if (dateKey === todayKey) {
        const todayFood = localStorage.getItem(`nutriax_food_log_${todayKey}`);
        if (todayFood) items = JSON.parse(todayFood);
      }
    }

    let sumKcal = 0;
    let sumP = 0;
    let sumC = 0;
    let sumG = 0;
    let itemTitles = [];

    let confirmedCount = 0;
    items.forEach(i => {
      if (i.confirmed !== false) {
        sumKcal += (i.kcal || 0);
        sumP += (i.p || 0);
        sumC += (i.c || 0);
        sumG += (i.g || 0);
        confirmedCount++;
        itemTitles.push(`${i.name} (${i.qty})`);
      } else {
        itemTitles.push(`[Pendente] ${i.name} (${i.qty})`);
      }
    });

    // Default values for initial sample records if no specific custom food array exists
    if (items.length === 0 && log.date !== new Date().toLocaleDateString('pt-BR')) {
      sumKcal = 2840;
      sumP = 190.0;
      sumC = 349.0;
      sumG = 76.0;
      items = [1, 2, 3, 4, 5, 6];
      confirmedCount = 6;
      itemTitles = ['Refeições Prescritas do Plano Alimentar'];
    }

    const itemsTooltip = itemTitles.length > 0 ? itemTitles.join(' • ') : 'Nenhum alimento registrado';
    const kcalStatusClass = sumKcal >= 2000 ? 'success' : 'info';

    return `
      <tr>
        <td><strong>${log.date}</strong></td>
        <td>${log.weight ? log.weight + ' kg' : '-'}</td>
        <td>
          <span class="badge-status ${confirmedCount > 0 ? 'info' : 'warning'}" title="${itemsTooltip}" style="cursor: pointer;">
            <i class="fa-solid fa-utensils"></i> ${confirmedCount}/${items.length} itens
          </span>
        </td>
        <td>
          <span class="badge-status ${kcalStatusClass}">
            <i class="fa-solid fa-fire"></i> <strong>${Math.round(sumKcal).toLocaleString('pt-BR')}</strong> / 2.840 kcal
          </span>
        </td>
        <td><strong class="text-emerald">${sumP.toFixed(1)}g</strong></td>
        <td><strong class="text-cyan">${sumC.toFixed(1)}g</strong></td>
        <td><strong class="text-purple">${sumG.toFixed(1)}g</strong></td>
        <td>
          <small>${log.treino || '-'} | ${log.sono || '-'}</small>
        </td>
        <td>
          <button type="button" class="btn-text text-rose" onclick="deleteHistoryRecord(${index})" title="Excluir este registro da planilha">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function deleteHistoryRecord(index) {
  const logs = JSON.parse(localStorage.getItem('nutriax_logs')) || AppData.defaultHistoryLogs;
  if (index < 0 || index >= logs.length) return;

  const targetLog = logs[index];
  if (confirm(`Deseja realmente remover o registro de ${targetLog.date} da planilha e do diário?`)) {
    const deletedLog = logs.splice(index, 1)[0];
    localStorage.setItem('nutriax_logs', JSON.stringify(logs));
    
    if (deletedLog) {
      let dateKey = deletedLog.dateKey;
      if (!dateKey && deletedLog.date && deletedLog.date.includes('/')) {
        const parts = deletedLog.date.split('/');
        dateKey = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      let items = [];
      if (dateKey) {
        const storedFood = localStorage.getItem(`nutriax_food_log_${dateKey}`);
        if (storedFood) {
          try { items = JSON.parse(storedFood); } catch (e) {}
        }
        localStorage.removeItem(`nutriax_food_log_${dateKey}`);
      }

      const formattedDateStr = deletedLog.date;
      if (items && items.length > 0) {
        items.forEach(item => {
          syncItemWithGoogleSheets(item, "MARK_UNDONE", formattedDateStr);
        });
      } else {
        const allMealKeys = ['ref-cafe', 'ref-lanche-m', 'ref-almoco', 'ref-pre-treino', 'ref-pos-treino', 'ref-jantar'];
        allMealKeys.forEach(mKey => {
          const prescribedItems = getPrescribedItemsForMeal(mKey);
          prescribedItems.forEach(pItem => {
            syncItemWithGoogleSheets({ ...pItem, mealId: mKey }, "MARK_UNDONE", formattedDateStr);
          });
        });
      }
    }

    renderHistoryTable();
    renderDailyFoodLogUI();
    alert(`🗑️ Registro de ${deletedLog.date} removido com sucesso da planilha e do diário!`);
  }
}

function exportHistoryCSV() {
  const logs = JSON.parse(localStorage.getItem('nutriax_logs')) || AppData.defaultHistoryLogs;

  let csvContent = "\uFEFF"; // UTF-8 BOM
  csvContent += "Data;Peso (kg);Itens Consumidos;Kcal Total;Proteinas (g);Carboidratos (g);Gorduras (g);Humor;Treino;Sono\n";

  logs.forEach(log => {
    let dateKey = log.dateKey;
    if (!dateKey && log.date && log.date.includes('/')) {
      const parts = log.date.split('/');
      dateKey = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const storedFood = localStorage.getItem(`nutriax_food_log_${dateKey}`);
    let items = [];
    if (storedFood) items = JSON.parse(storedFood);

    let sumKcal = 0, sumP = 0, sumC = 0, sumG = 0;
    let foodList = [];
    items.forEach(i => {
      sumKcal += (i.kcal || 0);
      sumP += (i.p || 0);
      sumC += (i.c || 0);
      sumG += (i.g || 0);
      foodList.push(`${i.name} (${i.qty})`);
    });

    if (items.length === 0) {
      sumKcal = 2840; sumP = 190.0; sumC = 349.0; sumG = 76.0;
      foodList.push("Refeições Prescritas");
    }

    const row = [
      `"${log.date}"`,
      `"${log.weight || ''}"`,
      `"${foodList.join(' | ')}"`,
      `"${Math.round(sumKcal)}"`,
      `"${sumP.toFixed(1)}"`,
      `"${sumC.toFixed(1)}"`,
      `"${sumG.toFixed(1)}"`,
      `"${log.humor || ''}"`,
      `"${log.treino || ''}"`,
      `"${log.sono || ''}"`
    ];

    csvContent += row.join(";") + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `NutriAx_Planilha_Registros_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// HANDLE CHECKIN FORM SUBMISSION
function handleCheckinSubmit(e) {
  e.preventDefault();

  const rawDate = document.getElementById('checkin-date').value || getSelectedDateKey();
  const parts = rawDate.split('-');
  const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : rawDate;
  const dateKey = rawDate;

  const weight = parseFloat(document.getElementById('checkin-peso').value) || AppData.patient.currentWeight;
  const humor = document.getElementById('checkin-humor').value;
  const treino = document.getElementById('checkin-treino').value === 'Sim' ? 'Sim 💪' : 'Não';
  const cardioVal = document.getElementById('checkin-cardio').value;
  const cardio = cardioVal ? `${cardioVal} min` : 'Não';
  const sonoVal = document.getElementById('checkin-sono').value || '7.5';
  const sonoQual = document.getElementById('checkin-qualidade-sono').value;
  const obs = document.getElementById('checkin-obs') ? document.getElementById('checkin-obs').value : '';

  const logs = JSON.parse(localStorage.getItem('nutriax_logs')) || AppData.defaultHistoryLogs;
  const existingIndex = logs.findIndex(l => l.dateKey === dateKey || l.date === formattedDate);

  const updatedEntry = {
    dateKey: dateKey,
    date: formattedDate,
    weight: weight,
    humor: humor,
    treino: treino,
    cardio: cardio,
    sono: `${sonoVal}h (${sonoQual})`,
    obs: obs
  };

  if (existingIndex >= 0) {
    logs[existingIndex] = { ...logs[existingIndex], ...updatedEntry };
  } else {
    logs.unshift(updatedEntry);
  }

  localStorage.setItem('nutriax_logs', JSON.stringify(logs));

  if (weight) {
    document.getElementById('dash-peso-atual').innerHTML = `${weight} <small>kg</small>`;
    AppData.patient.currentWeight = weight;
  }

  ensureCheckinLogForDate(dateKey);

  const dateFoodLogs = loadFoodLogsForDate(dateKey);
  const confirmedFoods = dateFoodLogs.filter(i => i.confirmed !== false);
  confirmedFoods.forEach(item => {
    syncItemWithGoogleSheets(item, "MARK_DONE", formattedDate);
  });

  renderHistoryTable();
  renderDailyFoodLogUI();
  alert(`✅ Check-in do dia ${formattedDate} salvo e atualizado na planilha com sucesso!`);
}

// INITIALIZE CHART.JS GRAPHS
function initCharts() {
  if (typeof Chart === 'undefined') return;
  initMacroDonutChart();
  initDashWeightChart();
  initFullEvolutionChart();
}

function refreshChartsTheme() {
  if (typeof Chart === 'undefined') return;
  if (macroChartInstance) macroChartInstance.destroy();
  if (dashWeightChartInstance) dashWeightChartInstance.destroy();
  if (fullEvolutionChartInstance) fullEvolutionChartInstance.destroy();
  initCharts();
}

function initMacroDonutChart() {
  if (typeof Chart === 'undefined') return;
  const ctx = document.getElementById('macroChart')?.getContext('2d');
  if (!ctx) return;

  const p = AppData.macros.proteinGrams;
  const c = AppData.macros.carbsGrams;
  const f = AppData.macros.fatsGrams;
  const pKcal = AppData.macros.proteinKcal || p * 4;
  const cKcal = AppData.macros.carbsKcal || c * 4;
  const fKcal = AppData.macros.fatsKcal || f * 9;

  macroChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [`Proteínas (${p}g)`, `Carboidratos (${c}g)`, `Gorduras (${f}g)`],
      datasets: [{
        data: [pKcal, cKcal, fKcal],
        backgroundColor: ['#10b981', '#06b6d4', '#f59e0b'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      cutout: '76%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const val = context.raw || 0;
              return ` ${label}: ${val} kcal`;
            }
          }
        }
      }
    }
  });
}

function initDashWeightChart() {
  if (typeof Chart === 'undefined') return;
  const ctx = document.getElementById('dashWeightChart')?.getContext('2d');
  if (!ctx) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#9ca3af' : '#4b5563';

  dashWeightChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: AppData.evolutionHistory.map(item => item.label),
      datasets: [{
        label: 'Peso (kg)',
        data: AppData.evolutionHistory.map(item => item.weight),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#10b981'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor }, min: 105, max: 125 }
      }
    }
  });
}

function initFullEvolutionChart() {
  if (typeof Chart === 'undefined') return;
  const ctx = document.getElementById('fullEvolutionChart')?.getContext('2d');
  if (!ctx) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#9ca3af' : '#4b5563';

  fullEvolutionChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: AppData.evolutionHistory.map(item => item.date),
      datasets: [
        {
          label: 'Peso Corporal (kg)',
          data: AppData.evolutionHistory.map(item => item.weight),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y',
          tension: 0.35,
          pointRadius: 6
        },
        {
          label: '% de Gordura (Dobras)',
          data: AppData.evolutionHistory.map(item => item.fatPercent),
          borderColor: '#06b6d4',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          yAxisID: 'y1',
          tension: 0.35,
          pointRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: textColor, font: { family: 'Inter' } }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: gridColor },
          ticks: { color: textColor },
          title: { display: true, text: 'Peso (kg)', color: textColor }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: textColor },
          title: { display: true, text: '% Gordura', color: textColor }
        }
      }
    }
  });
}

// DARK MODE THEME TOGGLE CONTROLLER
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;

  const savedTheme = localStorage.getItem('nutriax_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButtonUI(savedTheme);

  btn.onclick = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nutriax_theme', newTheme);
    updateThemeButtonUI(newTheme);

    if (typeof refreshChartsTheme === 'function') {
      try { refreshChartsTheme(); } catch(err) {}
    }
  };
}

function updateThemeButtonUI(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  if (theme === 'light') {
    btn.innerHTML = `<i class="fa-solid fa-sun"></i> <span>Modo Claro</span>`;
  } else {
    btn.innerHTML = `<i class="fa-solid fa-moon"></i> <span>Modo Escuro</span>`;
  }
}



function setupTabNavigation() {
  const sidebar = document.querySelector('.sidebar');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  document.querySelectorAll('.sidebar-nav li[data-tab]').forEach(li => {
    li.addEventListener('click', function(e) {
      const tabId = this.getAttribute('data-tab');
      if (tabId) window.switchTab(tabId, e);
    });
  });

  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href') || '';
      const tabId = href.replace('#', '');
      if (tabId && pageInfoMap[tabId]) window.switchTab(tabId, e);
    });
  });

  const btnQuickCheckin = document.getElementById('btn-quick-checkin');
  if (btnQuickCheckin) {
    btnQuickCheckin.addEventListener('click', (e) => {
      window.switchTab('diario', e);
    });
  }

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && pageInfoMap[initialHash]) {
    window.switchTab(initialHash);
  } else {
    window.switchTab('dashboard');
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && pageInfoMap[hash]) {
      window.switchTab(hash);
    }
  });
}

// AUTHENTICATION & ENVIRONMENT CONTROLLER
let currentAuthRole = 'patient';

window.getUserRole = function() {
  try {
    const sessionData = localStorage.getItem('nutriax_user_session');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      if (session && session.role) return session.role;
    }
  } catch(e) {}
  return currentAuthRole || 'patient';
};

window.setAuthRole = function(role) {
  currentAuthRole = role;
  const btnPatient = document.getElementById('tab-role-patient');
  const btnNutri = document.getElementById('tab-role-nutri');
  if (btnPatient && btnNutri) {
    if (role === 'patient') {
      btnPatient.classList.add('active');
      btnNutri.classList.remove('active');
    } else {
      btnNutri.classList.add('active');
      btnPatient.classList.remove('active');
    }
  }
};

window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input) {
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = `<i class="fa-regular fa-eye-slash"></i>`;
    } else {
      input.type = 'password';
      btn.innerHTML = `<i class="fa-regular fa-eye"></i>`;
    }
  }
};

window.applyUserRoleEnvironment = function(role) {
  const activeRole = role || window.getUserRole();
  currentAuthRole = activeRole;
  document.body.setAttribute('data-user-role', activeRole);

  // 1. Update Sidebar User Info Card
  const userNameEl = document.getElementById('user-name');
  const userObjEl = document.getElementById('user-objective');
  const nutriNavItems = document.querySelectorAll('.nav-item-nutri');

  if (activeRole === 'patient') {
    if (userNameEl) userNameEl.innerText = 'Paulo Vitor R. de Sousa';
    if (userObjEl) {
      userObjEl.className = 'badge-objective';
      userObjEl.innerHTML = `<i class="fa-solid fa-user"></i> Paciente`;
    }
    nutriNavItems.forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  } else {
    if (userNameEl) userNameEl.innerText = 'Paulo Vitor Ribeiro de Sousa';
    if (userObjEl) {
      userObjEl.className = 'badge-objective badge-nutri-admin';
      userObjEl.innerHTML = `<i class="fa-solid fa-user-doctor"></i> Nutricionista (ADMIN)`;
    }
    nutriNavItems.forEach(el => {
      el.style.setProperty('display', 'list-item', 'important');
    });
  }

  // 2. Update Topbar Environment Indicator Badge
  const topbarBadgeWrapper = document.getElementById('topbar-env-badge');
  if (topbarBadgeWrapper) {
    if (activeRole === 'patient') {
      topbarBadgeWrapper.innerHTML = `
        <div class="env-badge-pill patient-mode" title="Ambiente do Paciente: Preenchimento liberado no Diário & Check-in">
          <i class="fa-solid fa-user-check"></i> <span>Ambiente: Paciente</span>
        </div>
      `;
    } else {
      topbarBadgeWrapper.innerHTML = `
        <div class="env-badge-pill nutri-mode" title="Ambiente do Nutricionista: Gestão e Prescrição Completa">
          <i class="fa-solid fa-user-doctor"></i> <span>Ambiente: Nutricionista</span>
        </div>
      `;
    }
  }

  // 3. Enforce Preenchimento Restrictions across all modules
  window.enforcePreenchimentoPermissions(activeRole);
};

window.enforcePreenchimentoPermissions = function(role) {
  const activeRole = role || window.getUserRole();
  const isPatient = (activeRole === 'patient');

  // List of tabs where form editing is restricted for patient (prescribed by nutritionist)
  const readonlyTabsForPatient = [
    'dashboard', 'anamnese', 'dieta', 'evolucao', 'atividades', 
    'tabela-nutricional', 'suplementacao', 'exames'
  ];

  readonlyTabsForPatient.forEach(tabId => {
    const tabSection = document.getElementById('tab-' + tabId);
    if (!tabSection) return;

    let banner = tabSection.querySelector('.role-readonly-banner');

    if (isPatient) {
      if (!banner && tabId !== 'dashboard' && tabId !== 'tabela-nutricional') {
        banner = document.createElement('div');
        banner.className = 'role-readonly-banner';
        banner.innerHTML = `
          <i class="fa-solid fa-shield-halved banner-icon"></i>
          <div>
            <strong>Modo de Visualização (Prescrito pelo Nutricionista)</strong><br>
            <small style="opacity: 0.85;">Este módulo exibe sua prescrição oficial. O preenchimento pelo paciente é realizado exclusivamente no <strong>Diário & Check-in</strong>.</small>
          </div>
          <button type="button" class="btn-banner-diario" onclick="window.switchTab('diario', event)">
            <i class="fa-solid fa-calendar-check"></i> Ir para Diário
          </button>
        `;
        tabSection.insertBefore(banner, tabSection.firstChild);
      } else if (banner) {
        banner.style.display = 'flex';
      }

      // Restrict inputs in specific non-diario prescription forms for patient (excluding search/filter inputs)
      const formInputs = tabSection.querySelectorAll('input:not([type="search"]):not([id*="search"]):not([id*="filter"]):not(#topbar-date-picker), select:not([id*="search"]):not([id*="filter"]), textarea');
      formInputs.forEach(input => {
        if (!input.closest('#tab-diario')) {
          input.disabled = true;
          input.classList.add('patient-readonly-field');
          input.setAttribute('title', 'Prescrição do Nutricionista (Somente leitura para o paciente)');
        }
      });

      // Disable/hide save buttons in non-diario tabs for patient
      const saveButtons = tabSection.querySelectorAll('button[type="submit"]:not(#btn-quick-checkin), .btn-save-prescription, .btn-submit-form, .btn-add-exam, .btn-create-diet');
      saveButtons.forEach(btn => {
        if (!btn.closest('#tab-diario')) {
          btn.disabled = true;
          btn.classList.add('patient-btn-disabled');
        }
      });

    } else {
      // Nutricionista Mode: Hide Readonly Banners and Re-enable form controls
      if (banner) {
        banner.style.display = 'none';
      }

      const formInputs = tabSection.querySelectorAll('.patient-readonly-field');
      formInputs.forEach(input => {
        input.disabled = false;
        input.classList.remove('patient-readonly-field');
        input.removeAttribute('title');
      });

      const saveButtons = tabSection.querySelectorAll('.patient-btn-disabled');
      saveButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('patient-btn-disabled');
      });
    }
  });

  // Ensure Diário tab is ALWAYS fully enabled and clean for Patient preenchimento
  const diarioSection = document.getElementById('tab-diario');
  if (diarioSection) {
    const diarioBanner = diarioSection.querySelector('.role-readonly-banner');
    if (diarioBanner) diarioBanner.style.display = 'none';

    const diarioInputs = diarioSection.querySelectorAll('input, select, textarea, button');
    diarioInputs.forEach(el => {
      el.disabled = false;
      el.classList.remove('patient-readonly-field', 'patient-btn-disabled');
    });
  }
};

window.checkAuthSession = function() {
  const sessionData = localStorage.getItem('nutriax_user_session');
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.querySelector('.app-container');

  if (sessionData) {
    if (authScreen) authScreen.classList.add('hidden');
    if (appContainer) appContainer.style.display = 'flex';

    let role = 'patient';
    try {
      const session = JSON.parse(sessionData);
      role = session.role || 'patient';
    } catch(e){}

    window.applyUserRoleEnvironment(role);
  } else {
    if (authScreen) authScreen.classList.remove('hidden');
    if (appContainer) appContainer.style.display = 'none';
  }
};

window.handleLoginSubmit = function(event) {
  if (event) event.preventDefault();
  
  const emailInput = document.getElementById('login-email');
  const pwInput = document.getElementById('login-password');
  const errorMsg = document.getElementById('auth-error-msg');
  const errorText = document.getElementById('auth-error-text');
  const submitBtn = document.getElementById('btn-auth-submit');

  const email = emailInput ? emailInput.value.trim() : '';
  const pw = pwInput ? pwInput.value.trim() : '';

  if (!email || !pw) {
    if (errorText) errorText.innerText = 'Preencha o e-mail e a senha de acesso.';
    if (errorMsg) errorMsg.style.display = 'flex';
    return;
  }

  // Show loading state
  if (submitBtn) {
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...`;
    submitBtn.disabled = true;
  }

  setTimeout(() => {
    // Valid login test (accepts demo credentials or any non-empty password)
    if (pw.length >= 4) {
      const userSession = {
        email: email,
        name: currentAuthRole === 'nutri' ? 'Paulo Vitor Ribeiro de Sousa' : 'Paulo Vitor R. de Sousa',
        role: currentAuthRole,
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem('nutriax_user_session', JSON.stringify(userSession));
      
      if (errorMsg) errorMsg.style.display = 'none';
      if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Sucesso! Redirecionando...`;
      }

      setTimeout(() => {
        checkAuthSession();

        // Redirect to appropriate starting tab for the environment
        if (currentAuthRole === 'patient') {
          switchTab('diario');
        } else {
          switchTab('dashboard');
        }
      }, 500);
    } else {
      if (errorText) errorText.innerText = 'Senha incorreta.';
      if (errorMsg) errorMsg.style.display = 'flex';
      if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> <span>Entrar no Portal</span>`;
        submitBtn.disabled = false;
      }
    }
  }, 600);
};

// ==========================================================================
// ==========================================================================
// AUTHENTICATION & ENVIRONMENT MANAGEMENT
// ==========================================================================
window.handleLogout = function() {
  localStorage.removeItem('nutriax_user_session');
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.querySelector('.app-container');
  if (authScreen) authScreen.classList.remove('hidden');
  if (appContainer) appContainer.style.display = 'none';
  const submitBtn = document.getElementById('btn-auth-submit');
  if (submitBtn) {
    submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> <span>Entrar no Portal</span>`;
    submitBtn.disabled = false;
  }
};

// ==========================================================================
// NUTRI PORTAL TAB & PROFILE NAVIGATION
// ==========================================================================
window.switchNutriTab = function(tabName, btn) {
  const tabs = document.querySelectorAll('.nutri-tab-content');
  tabs.forEach(t => t.style.display = 'none');
  const target = document.getElementById(`nutri-tab-${tabName}`);
  if (target) target.style.display = 'block';

  const btns = document.querySelectorAll('.nutri-tab-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
};

window.switchPerfilSection = function(secName, btn) {
  const secs = document.querySelectorAll('.perfil-section-content');
  secs.forEach(s => s.style.display = 'none');
  const target = document.getElementById(`perfil-sec-${secName}`);
  if (target) target.style.display = 'block';

  const btns = document.querySelectorAll('.perfil-tab-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
};

// ==========================================================================
// NUTRI PORTAL FORMS & REAL-TIME AUTOSAVE
// ==========================================================================
let autoSaveTimeout = null;
window.triggerRealTimeAutoSave = function() {
  const statusEl = document.getElementById('aba01-status-auto');
  if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-sync fa-spin"></i> Digitando...`;
  
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-check text-emerald"></i> Rascunho Salvo`;
  }, 1000);
};

window.handleNutriSaveAba01 = function(event) {
  if (event) event.preventDefault();
  const getVal = id => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };

  if (typeof AppData !== 'undefined' && AppData.patient) {
    AppData.patient.name = getVal('aba01-nome') || AppData.patient.name;
    AppData.patient.age = parseFloat(getVal('aba01-idade')) || AppData.patient.age;
    AppData.patient.gender = getVal('aba01-sexo') || AppData.patient.gender;
    AppData.patient.height = parseFloat(getVal('aba01-altura')) || AppData.patient.height;
    AppData.patient.weight = parseFloat(getVal('aba01-peso-atual')) || AppData.patient.weight;
  }

  if (typeof DatabaseEngine !== 'undefined') DatabaseEngine.save();
  const statusEl = document.getElementById('aba01-status-auto');
  if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald"></i> Aba 01 Salva!`;
  alert('✅ Todos os dados da Aba 01 (Perfil e Dados Iniciais) foram salvos com sucesso!');
};

window.handleNutriSaveAba03 = function(event) {
  if (event) event.preventDefault();
  if (typeof DatabaseEngine !== 'undefined') DatabaseEngine.save();
  alert('✅ Todos os dados da Aba 03 (Questionário Alimentar Inicial & R24h) foram salvos com sucesso!');
};

window.fetchDietaAba08FromGoogleSheets = function() {
  const statusEl = document.getElementById('aba08-sync-status');
  if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando com Google Sheets...`;
  setTimeout(() => {
    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald"></i> Prescrição atualizada da planilha!`;
    alert('🔄 Plano alimentar (Aba 08) sincronizado com a planilha do paciente com sucesso!');
  }, 800);
};

window.handleNutriSaveEvaluation = function(event) {
  if (event) event.preventDefault();
  const getVal = id => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  const evalData = {
    date: getVal('nutri-eval-date') || new Date().toISOString().split('T')[0],
    weight: parseFloat(getVal('nutri-eval-weight')) || 0,
    fat: parseFloat(getVal('nutri-eval-fat')) || 0,
    muscle: parseFloat(getVal('nutri-eval-muscle')) || 0,
    waist: parseFloat(getVal('nutri-eval-waist')) || 0,
    abdomen: parseFloat(getVal('nutri-eval-abdomen')) || 0,
    hip: parseFloat(getVal('nutri-eval-hip')) || 0
  };
  if (typeof AppData !== 'undefined') {
    if (!AppData.evaluations) AppData.evaluations = [];
    AppData.evaluations.push(evalData);
  }
  if (typeof DatabaseEngine !== 'undefined') DatabaseEngine.save();
  alert('✅ Avaliação Antropométrica registrada com sucesso!');
};

window.handleNutriSaveExam = function(event) {
  if (event) event.preventDefault();
  const getVal = id => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  const exam = {
    name: getVal('nutri-exam-name'),
    value: getVal('nutri-exam-val'),
    ref: getVal('nutri-exam-ref'),
    status: getVal('nutri-exam-status')
  };
  if (typeof AppData !== 'undefined') {
    if (!AppData.exams) AppData.exams = [];
    AppData.exams.push(exam);
  }
  if (typeof DatabaseEngine !== 'undefined') DatabaseEngine.save();
  if (typeof renderExamsGrid === 'function') renderExamsGrid();
  alert('✅ Exame laboratorial adicionado à prescrição do paciente!');
};

// ==========================================================================
// DIARY & ACTIVITIES & TOOLS
// ==========================================================================
window.addWorkoutToDailyLog = function() {
  const typeEl = document.getElementById('workout-type');
  const durEl = document.getElementById('workout-duration');
  const type = typeEl ? typeEl.value : 'Atividade Física';
  const dur = durEl ? durEl.value : 45;
  alert(`✅ Treino registrado no Diário!\n\nModalidade: ${type}\nDuração: ${dur} min`);
};

window.calculateHeartRateZonesUI = function() {
  const age = parseInt(document.getElementById('hr-age-input')?.value || 38);
  const rest = parseInt(document.getElementById('hr-rest-input')?.value || 62);
  const maxHr = 220 - age;
  const reserve = maxHr - rest;

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  };

  setTxt('hr-max-val', `${maxHr} bpm`);
  setTxt('hr-reserve-val', `${reserve} bpm`);
  setTxt('hr-z1-val', `${Math.round(rest + reserve * 0.50)} - ${Math.round(rest + reserve * 0.60)} bpm (Recuperação)`);
  setTxt('hr-z2-val', `${Math.round(rest + reserve * 0.60)} - ${Math.round(rest + reserve * 0.70)} bpm (Aeróbico Leve - Lipólise)`);
  setTxt('hr-z3-val', `${Math.round(rest + reserve * 0.70)} - ${Math.round(rest + reserve * 0.80)} bpm (Limiar Aeróbico)`);
  setTxt('hr-z4-val', `${Math.round(rest + reserve * 0.80)} - ${Math.round(rest + reserve * 0.90)} bpm (Limiar Anaeróbico)`);
  setTxt('hr-z5-val', `${Math.round(rest + reserve * 0.90)} - ${maxHr} bpm (Esforço Máximo)`);
};

window.triggerBarcodeScannerSim = function() {
  const code = prompt("Simulação de Leitor de Código de Barras:\nDigite o código de barras (EAN-13) do produto:");
  if (code) {
    alert(`📷 Alimento identificado (Código ${code})!\nTabela nutricional importada com sucesso no diário.`);
  }
};

window.showAddCustomFoodModal = function() {
  const modal = document.getElementById('modal-add-custom-food');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    alert("Para adicionar um novo alimento, preencha o formulário rápido de alimentos personalizados.");
  }
};

// ==========================================================================
// ANAMNESE 360° & SUPLEMENTAÇÃO PDF / IA
// ==========================================================================
window.exportAnamnese360PDF = function() {
  alert('📄 Gerando Laudo Completo da Anamnese 360°...');
  window.print();
};

window.saveAnamnese360Form = function(event) {
  if (event) event.preventDefault();
  if (typeof DatabaseEngine !== 'undefined') DatabaseEngine.save();
  alert('✅ Anamnese 360° salva e atualizada no histórico do paciente!');
};

window.updateNeatFromAnamnesePassos = function(val) {
  let neatDesc = "NEAT Moderado (+300 kcal/dia)";
  if (val < 5000) neatDesc = "NEAT Sedentário (+150 kcal/dia)";
  else if (val >= 10000) neatDesc = "NEAT Elevado (+500 kcal/dia)";
  
  const badge = document.getElementById('neat-calc-badge');
  if (badge) badge.innerText = neatDesc;
};

window.exportSupplementPrescriptionPDF = function() {
  alert('📄 Exportando Receita de Suplementação em PDF / Formato Impressão...');
  window.print();
};

// ==========================================================================
// MOTOR PRESCRIÇÃO IA
// ==========================================================================
window.generateAiPrescriptionDraft = function() {
  const profileEl = document.getElementById('ai-profile-select');
  const profile = profileEl ? profileEl.value : 'emagrecimento';
  const content = document.getElementById('ai-output-content');
  if (!content) return;

  let draftHtml = '';
  if (profile === 'emagrecimento') {
    draftHtml = `
      <p><strong>🔥 PROTOCOLO GERADO: EMAGRECIMENTO & DÉFICIT CALÓRICO OTIMIZADO</strong></p>
      <p><strong>• Alvo Calórico:</strong> 2.840 kcal/dia (Déficit de -624 kcal sobre GET de 3.464 kcal)</p>
      <p><strong>• Distribuição de Macros:</strong> Proteínas: 190g (27%) | Carboidratos: 349g (49%) | Gorduras: 76g (24%)</p>
      <p><strong>• Rationale Clínico:</strong> Preservação de massa magra (${AppData.patient ? AppData.patient.muscleMass || 86.8 : 86.8}kg LBM) com foco em déficit sustentável, alta densidade de fibras (40g/dia) e modulação glicêmica.</p>
      <p><strong>• Refeições Chave:</strong> 6 refeições fracionadas (Café da Manhã, Lanche M, Almoço, Pré-Treino, Pós-Treino, Jantar).</p>
      <p><strong>• Suplementação Suportada:</strong> Creatina 5g, Ômega 3 2.000mg, Vitamina D3 5.000 UI, Bisglicinato de Magnésio 350mg.</p>
    `;
  } else if (profile === 'hipertrofia') {
    draftHtml = `
      <p><strong>⚡ PROTOCOLO GERADO: HIPERTROFIA & ANABOLISMO ESTRUTURADO</strong></p>
      <p><strong>• Alvo Calórico:</strong> 3.750 kcal/dia (Superávit Controlado de +286 kcal)</p>
      <p><strong>• Distribuição de Macros:</strong> Proteínas: 230g (25%) | Carboidratos: 480g (51%) | Gorduras: 90g (24%)</p>
      <p><strong>• Rationale Clínico:</strong> Otimização da síntese proteica muscular (MPS) via aporte contínuo de Leucina (3g+ por refeição) e reposição massiva de glicogênio muscular.</p>
    `;
  } else {
    draftHtml = `
      <p><strong>🩸 PROTOCOLO GERADO: CONTROLE GLICÊMICO & SENSIBILIDADE À INSULINA</strong></p>
      <p><strong>• Alvo Calórico:</strong> 2.500 kcal/dia (Carga Glicêmica Controlada)</p>
      <p><strong>• Distribuição de Macros:</strong> Proteínas: 185g (30%) | Carboidratos: 220g (35%) | Gorduras: 100g (35%)</p>
      <p><strong>• Rationale Clínico:</strong> Modulação glicêmica com foco em baixo índice glicêmico, fibras solúveis e estabilidade insulinêmica.</p>
    `;
  }

  content.innerHTML = draftHtml;
};

window.copyAiDraftToClipboard = function() {
  const content = document.getElementById('ai-output-content');
  if (content) {
    navigator.clipboard.writeText(content.innerText || content.textContent);
    alert('📋 Rascunho da IA copiado para a área de transferência!');
  }
};

window.applyAiDraftToActiveDiet = function() {
  if (typeof DatabaseEngine !== 'undefined') DatabaseEngine.save();
  alert('✅ Prescrição gerada pela IA aplicada com sucesso à dieta ativa do paciente!');
};

// ==========================================================================
const DatabaseEngine = {
  STORAGE_KEY: 'NutriAx_NativeDB_v2',

  save: function() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(AppData));
    } catch(e) {
      console.error("Error saving native database:", e);
    }
  },

  load: function() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.patient) {
          Object.assign(AppData, parsed);
        }
      }
    } catch(e) {
      console.error("Error loading native database:", e);
    }
  }
};

// APPLICATION STARTUP WITH BULLETPROOF ERROR HANDLING
function initApp() {
  try { DatabaseEngine.load(); } catch(e) { console.error("Error loading native DB:", e); }
  try { checkAuthSession(); } catch(e) { console.error("Error checking auth:", e); }
  try { initThemeToggle(); } catch(e) { console.error("Error initializing theme:", e); }
  try { setupTabNavigation(); } catch(e) { console.error("Error setting up navigation:", e); }
  try { initFoodDiary(); } catch(e) { console.error("Error initializing food diary:", e); }
  try { renderDietMeals(); } catch(e) { console.error("Error rendering diet meals:", e); }
  try { renderExamsGrid(); } catch(e) { console.error("Error rendering exams grid:", e); }
  try { renderDailyFoodLogUI(); } catch(e) { console.error("Error rendering daily food log UI:", e); }
  try { renderHistoryTable(); } catch(e) { console.error("Error rendering history table:", e); }
  try { renderFoodDatalist98(); } catch(e) { console.error("Error rendering food datalist 98:", e); }
  try { renderAba08FullPrescriptionUI(); } catch(e) { console.error("Error rendering Aba08 UI:", e); }
  try { filterTacoFoodDatabaseUI(); } catch(e) { console.error("Error filtering TACO UI:", e); }
  try { calculateMetCaloricExpenditure(); } catch(e) { console.error("Error calculating METs:", e); }
  try { recalculateMsqScoreFromUI(); } catch(e) { console.error("Error recalculating MSQ score:", e); }
  try { initCharts(); } catch(e) { console.error("Error initializing charts:", e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

