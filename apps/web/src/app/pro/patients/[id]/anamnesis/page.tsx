import React from 'react';

export default async function AnamnesisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const examCategories = [
    {
      category: 'Glicêmico & Metabólico',
      exams: [
        { name: 'Glicose em Jejum', val: '81 mg/dL', ref: '70 - 99 mg/dL', status: 'OK', flagColor: 'emerald', notes: 'Sensibilidade à insulina preservada.' },
        { name: 'Hemoglobina Glicada (HbA1c)', val: '5.3%', ref: '4.0 - 5.6%', status: 'OK', flagColor: 'emerald', notes: 'Excelente controle glicêmico médio.' },
      ]
    },
    {
      category: 'Lipidograma',
      exams: [
        { name: 'Colesterol Total', val: '245 mg/dL', ref: '< 190 mg/dL', status: 'HIGH', flagColor: 'rose', notes: 'Discretamente elevado.' },
        { name: 'Colesterol LDL', val: '169 mg/dL', ref: '< 130 mg/dL', status: 'HIGH', flagColor: 'rose', notes: 'Aporte de saturadas alto; focar em ômega 3 e fibras solúveis.' },
        { name: 'Colesterol HDL', val: '45 mg/dL', ref: '> 40 mg/dL', status: 'OK', flagColor: 'emerald', notes: 'Aporte protetor adequado.' },
        { name: 'Triglicerídeos', val: '165 mg/dL', ref: '< 150 mg/dL', status: 'HIGH', flagColor: 'amber', notes: 'Moderar frutose concentrada e carboidratos refinados.' },
      ]
    },
    {
      category: 'Vitaminas & Micronutrientes',
      exams: [
        { name: 'Vitamina D (25-OH)', val: '20 ng/mL', ref: '30 - 100 ng/mL', status: 'LOW', flagColor: 'amber', notes: 'Subótimo; iniciar suplementação de 5.000 UI/dia.' },
        { name: 'Ferritina Sérica', val: '518 ng/mL', ref: '30 - 300 ng/mL', status: 'HIGH', flagColor: 'amber', notes: 'Investigar marcador inflamatório crônico de baixo grau.' },
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-clipboard-question text-emerald-400" />
            Anamnese 360° & Módulo de Exames Bioquímicos
          </h1>
          <p className="text-xs text-slate-400">Prontuário Clínico Integrado (Paciente ID: {id})</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2">
          <i className="fa-solid fa-floppy-disk" />
          <span>Salvar Prontuário</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anamnesis 360° Form */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-user-doctor text-emerald-400" />
            1. Anamnese Clínica, Esportiva & Estilo de Vida
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Histórico Clínico & Queixas</label>
            <textarea
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              defaultValue="Sem comorbidades graves relatas. Foco em emagrecimento, melhora do perfil lipídico e redução de gordura abdominal."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Rotina de Treino & Cardio</label>
            <textarea
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              defaultValue="Musculação 6x/semana (ABC, Vol. Alto) + Cardio HIIT 4x/semana (15 min, intensidade moderada)."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Qualidade do Sono</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200">
                <option value="BOA">BOA (7-8h reparadoras)</option>
                <option value="REGULAR">REGULAR (5-6h)</option>
                <option value="RUIM">RUIM (Insônia / Despertar)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nível de Estresse</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200">
                <option value="MODERADO">MODERADO</option>
                <option value="BAIXO">BAIXO</option>
                <option value="ALTO">ALTO / CORTISOL ELEVADO</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lab Exams Module */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <i className="fa-solid fa-vial text-teal-400" />
              2. Marcadores Bioquímicos & Exames
            </h2>
            <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700">
              + Adicionar Exame
            </button>
          </div>

          <div className="space-y-4">
            {examCategories.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">{cat.category}</h3>
                <div className="space-y-2">
                  {cat.exams.map((ex, exIdx) => (
                    <div key={exIdx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-200">{ex.name}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-${ex.flagColor}-500/10 text-${ex.flagColor}-400 border border-${ex.flagColor}-500/30`}>
                          {ex.val} ({ex.status})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Ref: {ex.ref}</p>
                      <p className="text-xs text-slate-300 font-medium italic mt-1">Interpretação: {ex.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
