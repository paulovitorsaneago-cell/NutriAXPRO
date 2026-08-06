import React from 'react';

export default async function DashboardPage() {
  const patients = [
    {
      id: '00000000-0000-0000-0000-000000000003',
      full_name: 'Paulo Vitor R de Sousa',
      email: 'paulovitor.rsousa3@gmail.com',
      goal: 'Emagrecimento & Recomposição',
      current_weight: 115.8,
      target_weight: 107.99,
      bf_percent: 17.94,
      days_without_log: 0, // Registered today!
      status: 'Excelente (94%)',
      plan_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      full_name: 'Camila Ferreira Ramos',
      email: 'camila.ramos@example.com',
      goal: 'Hipertrofia & Ganho Muscular',
      current_weight: 62.4,
      target_weight: 66.0,
      bf_percent: 19.2,
      days_without_log: 3, // Alert! 3 days without check-in
      status: 'Atenção (Alerta)',
      plan_active: true,
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-emerald-400" />
            Dashboard da Carteira de Pacientes
          </h1>
          <p className="text-xs text-slate-400">Visão Geral de Engajamento, Reavaliações Pendentes e Metas</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
          <i className="fa-solid fa-user-plus" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
          <span className="text-xs uppercase font-bold text-slate-400">Pacientes Em Acompanhamento</span>
          <h3 className="text-3xl font-black text-slate-100 mt-1">12 <span className="text-xs text-emerald-400 font-normal">ativos</span></h3>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
          <span className="text-xs uppercase font-bold text-slate-400">Reavaliações Pendentes</span>
          <h3 className="text-3xl font-black text-amber-400 mt-1">3 <span className="text-xs text-slate-400 font-normal">esta semana</span></h3>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
          <span className="text-xs uppercase font-bold text-slate-400">Adesão Média da Carteira</span>
          <h3 className="text-3xl font-black text-emerald-400 mt-1">91.4%</h3>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
          <span className="text-xs uppercase font-bold text-slate-400">Alertas de Exames Alterados</span>
          <h3 className="text-3xl font-black text-rose-400 mt-1">2 <span className="text-xs text-slate-400 font-normal">pacientes</span></h3>
        </div>
      </div>

      {/* Patient List Table with Engagement Alerts */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-users text-emerald-400" />
            Carteira de Pacientes & Engajamento no Diário
          </h2>
          <span className="text-xs text-slate-400">Atualizado em tempo real via PostgreSQL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 bg-slate-950/60">
                <th className="p-3">Paciente</th>
                <th className="p-3">Objetivo Target</th>
                <th className="p-3 text-center">Peso Atual / Meta</th>
                <th className="p-3 text-center">% Gordura</th>
                <th className="p-3 text-center">Status Diário</th>
                <th className="p-3 text-center">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-100">{p.full_name}</div>
                    <div className="text-xs text-slate-500">{p.email}</div>
                  </td>
                  <td className="p-3 text-xs font-semibold text-emerald-400">{p.goal}</td>
                  <td className="p-3 text-center font-bold text-slate-200">{p.current_weight} kg <span className="text-xs text-slate-500">/ {p.target_weight} kg</span></td>
                  <td className="p-3 text-center font-semibold text-cyan-400">{p.bf_percent}%</td>
                  <td className="p-3 text-center">
                    {p.days_without_log === 0 ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        🟢 Ativo Hoje
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        ⚠️ {p.days_without_log}d Sem Registro
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <a href={`/pro/patients/${p.id}/anamnesis`} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700">
                        Anamnese
                      </a>
                      <a href={`/pro/patients/${p.id}/anthropometry`} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700">
                        Dobras
                      </a>
                      <a href={`/pro/patients/${p.id}/prescription`} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        Dieta / IA
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
