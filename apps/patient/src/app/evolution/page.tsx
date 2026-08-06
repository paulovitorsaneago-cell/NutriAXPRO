import React from 'react';

export default function PatientEvolutionPage() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-5 pb-20">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-emerald-400" />
          Minha Evolução Física
        </h2>
        <p className="text-xs text-slate-400 mt-1">Histórico de Reavaliações Físicas & Dobras Cutâneas</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase text-slate-400 font-semibold">Peso Inicial vs Atual</span>
          <h3 className="text-xl font-extrabold text-emerald-400 mt-1">115.8 <span className="text-xs">kg</span></h3>
          <p className="text-[10px] text-rose-400 mt-0.5">↓ 6.2 kg eliminados</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase text-slate-400 font-semibold">% Gordura (Pollock 7)</span>
          <h3 className="text-xl font-extrabold text-cyan-400 mt-1">17.9%</h3>
          <p className="text-[10px] text-emerald-400 mt-0.5">↓ 6.6% reduzido</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase">Composição Corporal Atual</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Massa Magra (Músculos/Órgãos)</span>
            <span className="font-bold text-emerald-400">95.03 kg</span>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span>Massa Gorda</span>
            <span className="font-bold text-rose-400">20.77 kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
