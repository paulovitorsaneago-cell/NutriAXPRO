import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch nutritionist data
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('*').eq('id', user?.id ?? '').single();

  // Fetch patients count
  const { count: patientsCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('nutritionist_id', user?.id ?? '');

  // Fetch active plans count
  const { count: activePlansCount } = await supabase
    .from('nutritional_plans')
    .select('*', { count: 'exact', head: true })
    .eq('nutritionist_id', user?.id ?? '')
    .eq('is_active', true);

  // Fetch recent food logs (adherence indicator)
  const { data: recentLogs } = await supabase
    .from('food_logs')
    .select('id, patient_id, log_date, meal_name, status')
    .order('log_date', { ascending: false })
    .limit(20);

  // Fetch altered exams
  const { data: alteredExams } = await supabase
    .from('clinical_exams')
    .select('id, patient_id, exam_name, category, status_flag, priority, exam_date')
    .in('status_flag', ['attention', 'altered'])
    .order('priority', { ascending: false })
    .limit(10);

  // Fetch patients list for recent activity
  const { data: patients } = await supabase
    .from('patients')
    .select('id, user_id, goal, is_active, users!patients_user_id_fkey(full_name)')
    .eq('nutritionist_id', user?.id ?? '')
    .eq('is_active', true)
    .limit(8);

  const completedLogs = recentLogs?.filter(l => l.status === 'completed').length ?? 0;
  const totalLogs = recentLogs?.length ?? 1;
  const adherenceRate = Math.round((completedLogs / Math.max(totalLogs, 1)) * 100);

  const goalLabels: Record<string, string> = {
    fat_loss: 'Emagrecimento',
    muscle_gain: 'Hipertrofia',
    maintenance: 'Manutenção',
    health: 'Saúde Geral',
    performance: 'Performance',
  };

  return (
    <>
      {/* Header */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="header-actions">
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Olá, {profile?.full_name?.split(' ')[0] ?? 'Nutricionista'} 👋
          </span>
        </div>
      </div>

      <div className="page-content">
        {/* Stats Grid */}
        <div className="grid grid-4 stagger-children" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: 'var(--color-primary-50)' }}>👥</div>
            <span className="stat-label">Pacientes Ativos</span>
            <span className="stat-value">{patientsCount ?? 0}</span>
          </div>

          <div className="stat-card" style={{ '--stat-color': 'var(--color-info)' } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>📋</div>
            <span className="stat-label">Planos Ativos</span>
            <span className="stat-value">{activePlansCount ?? 0}</span>
          </div>

          <div className="stat-card" style={{ '--stat-color': adherenceRate >= 80 ? 'var(--color-success)' : 'var(--color-warning)' } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: adherenceRate >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
              {adherenceRate >= 80 ? '✅' : '⚠️'}
            </div>
            <span className="stat-label">Adesão Média</span>
            <span className="stat-value">{adherenceRate}%</span>
            <div className="progress-bar">
              <div
                className={`progress-fill ${adherenceRate < 60 ? 'danger' : adherenceRate < 80 ? 'warning' : ''}`}
                style={{ width: `${adherenceRate}%` }}
              />
            </div>
          </div>

          <div className="stat-card" style={{ '--stat-color': 'var(--color-danger)' } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>🔬</div>
            <span className="stat-label">Exames Alterados</span>
            <span className="stat-value">{alteredExams?.length ?? 0}</span>
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
          {/* Patients List */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Pacientes Ativos</h2>
                <p className="card-subtitle">Seus pacientes em acompanhamento</p>
              </div>
              <a href="/pro/patients" className="btn btn-secondary btn-sm">Ver todos</a>
            </div>

            {patients && patients.length > 0 ? (
              <div className="flex flex-col gap-3">
                {patients.map((patient) => {
                  const userName = (patient.users as unknown as { full_name: string })?.full_name ?? 'Paciente';
                  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <a
                      key={patient.id}
                      href={`/pro/patients/${patient.id}`}
                      className="flex items-center gap-3"
                      style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', transition: 'background var(--transition-fast)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="avatar">{initials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          {userName}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                          {goalLabels[patient.goal] ?? patient.goal}
                        </div>
                      </div>
                      <span className="badge badge-success">Ativo</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-icon">👥</div>
                <p className="empty-title">Nenhum paciente ainda</p>
                <p className="empty-text">Cadastre seu primeiro paciente para começar.</p>
                <a href="/pro/patients" className="btn btn-primary">Adicionar Paciente</a>
              </div>
            )}
          </div>

          {/* Altered Exams Alerts */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Alertas de Exames</h2>
                <p className="card-subtitle">Marcadores que requerem atenção</p>
              </div>
            </div>

            {alteredExams && alteredExams.length > 0 ? (
              <div className="flex flex-col gap-3">
                {alteredExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center gap-3"
                    style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface-raised)' }}
                  >
                    <span style={{ fontSize: 'var(--text-lg)' }}>
                      {exam.status_flag === 'altered' ? '🔴' : '🟡'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                        {exam.exam_name}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {exam.category} • {new Date(exam.exam_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span className={`badge ${exam.status_flag === 'altered' ? 'badge-danger' : 'badge-warning'}`}>
                      {exam.status_flag === 'altered' ? 'Alterado' : 'Atenção'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-icon">✅</div>
                <p className="empty-title">Nenhum alerta</p>
                <p className="empty-text">Todos os exames estão dentro da faixa.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
