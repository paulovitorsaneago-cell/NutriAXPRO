import React from 'react';

export default async function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const prescribedMeals = [
    {
      name: 'Café da Manhã (Desjejum Proteico)',
      time: '07:30',
      targetKcal: 550,
      foods: [
        { name: 'Ovos de galinha inteiros mexidos', qty: '3 unidades (150g)', kcal: 231, protein: 19.2, carbs: 1.5, fats: 16.5 },
        { name: 'Pão de Forma 100% Integral', qty: '2 fatias (50g)', kcal: 118, protein: 5.4, carbs: 21.0, fats: 1.4 },
        { name: 'Mamão Papaia in natura', qty: '1/2 unidade (140g)', kcal: 63, protein: 1.1, carbs: 16.2, fats: 0.1 },
        { name: 'Café Preto Sem Açúcar', qty: '1 xícara (150ml)', kcal: 4, protein: 0.3, carbs: 0.6, fats: 0.0 }
      ]
    },
    {
      name: 'Almoço Principal (Recomposição)',
      time: '13:00',
      targetKcal: 850,
      foods: [
        { name: 'Arroz integral cozido', qty: '180g (6 colheres de sopa)', kcal: 223, protein: 4.7, carbs: 46.4, fats: 1.8 },
        { name: 'Feijão carioca cozido com caldo', qty: '130g (1 concha)', kcal: 98, protein: 6.2, carbs: 17.6, fats: 0.65 },
        { name: 'Patinho bovino moído grelhado', qty: '200g (2 bifes médios)', kcal: 438, protein: 71.8, carbs: 0.0, fats: 14.6 },
        { name: 'Azeite de Oliva Extra Virgem', qty: '1 colher de sopa (10ml)', kcal: 88, protein: 0.0, carbs: 0.0, fats: 10.0 }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-utensils text-emerald-400" />
            Prescrição Nutricional & Copiloto IA
          </h1>
          <p className="text-xs text-slate-400">Montador de Cardápios & Validação de Metas (Paciente ID: {id})</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-wand-magic-sparkles" />
            <span>Gerar com IA</span>
          </button>
          <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2">
            <i className="fa-solid fa-floppy-disk" />
            <span>Salvar Cardápio</span>
          </button>
        </div>
      </div>

      {/* Energy Metrics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 uppercase font-bold">TMB (Katch-McArdle)</span>
          <h3 className="text-xl font-extrabold text-amber-400 mt-1">2.423 <span className="text-xs">kcal</span></h3>
          <p className="text-[10px] text-slate-500">Massa Magra: 95.0 kg</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 uppercase font-bold">GET / TDEE (AF 1.43)</span>
          <h3 className="text-xl font-extrabold text-teal-400 mt-1">3.464 <span className="text-xs">kcal</span></h3>
          <p className="text-[10px] text-slate-500">Musculação 6x + HIIT 4x</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <span className="text-xs text-emerald-400 uppercase font-bold">Meta Calórica Diária</span>
          <h3 className="text-xl font-extrabold text-emerald-400 mt-1">2.840 <span className="text-xs">kcal</span></h3>
          <p className="text-[10px] text-slate-400">Déficit -624 kcal</p>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
          <span className="text-xs text-purple-400 uppercase font-bold">Total Prescrito Atual</span>
          <h3 className="text-xl font-extrabold text-purple-400 mt-1">2.840 <span className="text-xs">kcal</span></h3>
          <p className="text-[10px] text-emerald-400 font-bold">✓ 100% Coerente</p>
        </div>
      </div>

      {/* TACO Builder & Meal Cards */}
      <div className="space-y-4">
        {prescribedMeals.map((meal, mIdx) => (
          <div key={mIdx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <i className="fa-solid fa-utensils text-emerald-400" />
                  {meal.name}
                </h3>
                <span className="text-xs text-slate-400">Horário: {meal.time} | Meta: ~{meal.targetKcal} kcal</span>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700">
                + Alimento TACO
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-950/40">
                    <th className="p-2">Alimento Prescrito</th>
                    <th className="p-2 text-center">Porção / Gramas</th>
                    <th className="p-2 text-center">Calorias</th>
                    <th className="p-2 text-center">Proteínas</th>
                    <th className="p-2 text-center">Carbos</th>
                    <th className="p-2 text-center">Gorduras</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {meal.foods.map((food, fIdx) => (
                    <tr key={fIdx}>
                      <td className="p-2 font-semibold text-slate-200">{food.name}</td>
                      <td className="p-2 text-center text-slate-400">{food.qty}</td>
                      <td className="p-2 text-center text-amber-400 font-bold">{food.kcal} kcal</td>
                      <td className="p-2 text-center text-emerald-400 font-semibold">{food.protein}g</td>
                      <td className="p-2 text-center text-cyan-400">{food.carbs}g</td>
                      <td className="p-2 text-center text-purple-400">{food.fats}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
