import React from 'react';

export default function PatientAnamnesisPage() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-5 pb-20">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <i className="fa-solid fa-clipboard-user text-emerald-400" />
          Minha Anamnese & Exames
        </h2>
        <p className="text-xs text-slate-400 mt-1">Preenchimento de Hábitos & Envio de Laudos</p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase">Qualidade do Sono & Estresse</h3>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Horas Média de Sono por Noite</label>
          <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200">
            <option>7 a 8 horas (Recomendado)</option>
            <option>Menos de 6 horas</option>
            <option>Mais de 8 horas</option>
          </select>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase">Upload de Laudos / Exames</h3>
        <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center space-y-2 hover:border-emerald-500 transition-colors cursor-pointer">
          <i className="fa-solid fa-cloud-arrow-up text-2xl text-emerald-400" />
          <p className="text-xs text-slate-300 font-semibold">Arraste seu PDF ou Foto do Exame</p>
          <p className="text-[10px] text-slate-500">Formatos aceitos: PDF, PNG, JPG (máx. 10MB)</p>
        </div>
      </div>
    </div>
  );
}
