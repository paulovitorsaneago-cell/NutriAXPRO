import React from 'react';

export default function PatientPlanPage() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-5 pb-20">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <i className="fa-solid fa-utensils text-emerald-400" />
          Meu Plano Nutricional
        </h2>
        <p className="text-xs text-slate-400 mt-1">Prescrição de precisão por Paulo Vitor (Nutricionista)</p>
      </div>

      <div className="space-y-4">
        {/* Meal 1 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-200 text-sm">🍳 Desjejum Proteico (07:30)</h3>
            <span className="text-xs font-semibold text-emerald-400">550 kcal</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• 3 Ovos mexidos (150g)</li>
            <li>• 2 Fatias de Pão Integral (50g)</li>
            <li>• 1/2 Mamão Papaia (140g)</li>
          </ul>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong className="text-slate-300">Substitutos Autorizados:</strong> 150g Peito de frango desfiado / 160g Iogurte Proteico YoPRO.
          </div>
        </div>

        {/* Meal 2 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-200 text-sm">🥗 Almoço (13:00)</h3>
            <span className="text-xs font-semibold text-emerald-400">850 kcal</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• 200g Patinho moído / Frango grelhado</li>
            <li>• 180g Arroz integral cozido</li>
            <li>• 130g Feijão carioca com caldo</li>
            <li>• Salada verde à vontade + 10ml Azeite</li>
          </ul>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong className="text-slate-300">Substitutos Autorizados:</strong> 220g Mandioca cozida em substituição ao arroz.
          </div>
        </div>
      </div>
    </div>
  );
}
