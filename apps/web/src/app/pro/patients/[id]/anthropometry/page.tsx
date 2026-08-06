import React from 'react';

export default async function AnthropometryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-weight-scale text-emerald-400" />
            Avaliação Antropométrica (Jackson Pollock 7)
          </h1>
          <p className="text-xs text-slate-400">Calculadora de Dobras, Perímetros e Composição Corporal (Paciente ID: {id})</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2">
          <i className="fa-solid fa-floppy-disk" />
          <span>Salvar Avaliação</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pollock 7 & Circumferences Inputs */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-ruler-combined text-emerald-400" />
              1. Dobras Cutâneas (mm) - Jackson Pollock 7
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tricipital (TR)</label>
                <input type="number" defaultValue={14} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Subescapular (SE)</label>
                <input type="number" defaultValue={18} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Supra-ilíaca (SI)</label>
                <input type="number" defaultValue={22} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Abdominal (AB)</label>
                <input type="number" defaultValue={28} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Coxa (CX)</label>
                <input type="number" defaultValue={16} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Peitoral (PT)</label>
                <input type="number" defaultValue={12} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Axilar Média (AM)</label>
                <input type="number" defaultValue={15} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Soma das Dobras (Σ7)</label>
                <input type="text" readOnly value="125 mm" className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-bold" />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-tape text-emerald-400" />
              2. Perímetros Corporais (cm)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cintura</label>
                <input type="number" defaultValue={101.0} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Abdômen</label>
                <input type="number" defaultValue={102.0} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Quadril</label>
                <input type="number" defaultValue={111.5} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Peitoral</label>
                <input type="number" defaultValue={118.0} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold" />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Calculated Metrics */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-calculator text-emerald-400" />
            Resultados em Tempo Real
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">% Gordura (Siri / Pollock)</span>
              <span className="text-sm font-extrabold text-cyan-400">17.94%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Massa Magra ($kg$)</span>
              <span className="text-sm font-extrabold text-emerald-400">95.03 kg</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Massa Gorda ($kg$)</span>
              <span className="text-sm font-extrabold text-rose-400">20.77 kg</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">IMC (Índice Massa Corporal)</span>
              <span className="text-sm font-extrabold text-amber-400">31.09 kg/m²</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">RCQ (Cintura/Quadril)</span>
              <span className="text-sm font-extrabold text-emerald-400">0.91 (Baixo Risco)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">FFMI (Índice Massa Livre Gordura)</span>
              <span className="text-sm font-extrabold text-purple-400">25.5 (Excelente)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
