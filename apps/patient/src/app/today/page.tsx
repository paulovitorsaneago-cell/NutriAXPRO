import React from 'react';

export default function PatientTodayPage() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-5 pb-20">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Diário de Hoje 🥗</h2>
          <p className="text-xs text-slate-400">Meta: 2.840 kcal (Déficit Orientado)</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-400">94% Adesão</span>
          <p className="text-[10px] text-slate-500">🔥 14 dias seguidos</p>
        </div>
      </div>

      {/* Progress Doughnut / Caloric & Hydration Bars */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>🔥 Caloria do Dia</span>
            <span className="font-bold text-amber-400">2.140 / 2.840 kcal (75%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full w-[75%]" />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>💧 Hidratação Diária</span>
            <span className="font-bold text-cyan-400">3.800 / 5.300 ml (71%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full w-[71%]" />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>🍗 Proteínas Acumuladas</span>
            <span className="font-bold text-emerald-400">145 / 190 g (76%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full w-[76%]" />
          </div>
        </div>
      </div>

      {/* Meal Checklist */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">Refeições Prescritas</h3>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-100">☕ Café da Manhã (07:30)</h4>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
              ✓ Consumido
            </span>
          </div>
          <p className="text-xs text-slate-400">3 Ovos mexidos + 2 Fatias de Pão Integral + Mamão</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-100">🍗 Almoço Principal (13:00)</h4>
            <button className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">
              Check-in
            </button>
          </div>
          <p className="text-xs text-slate-400">200g Patinho moído + 180g Arroz + Feijão + Salada</p>
          <div className="pt-2 flex gap-2">
            <button className="text-[11px] text-blue-400 font-medium underline">
              🔄 Registra Troca / Substituição
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
