import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: patients } = await supabase
    .from('patients')
    .select(`
      id, user_id, birth_date, gender, height_m, activity_level, goal, is_active, created_at,
      users!patients_user_id_fkey(full_name, email, phone)
    `)
    .eq('nutritionist_id', user?.id ?? '')
    .order('created_at', { ascending: false });

  const goalLabels: Record<string, string> = {
    fat_loss: '🔥 Emagrecimento',
    muscle_gain: '💪 Hipertrofia',
    maintenance: '⚖️ Manutenção',
    health: '❤️ Saúde Geral',
    performance: '🏆 Performance',
  };

  const activityLabels: Record<string, string> = {
    sedentary: 'Sedentário',
    lightly_active: 'Levemente Ativo',
    moderately_active: 'Moderadamente Ativo',
    very_active: 'Muito Ativo',
    extremely_active: 'Extremamente Ativo',
  };

  function calculateAge(birthDate: string | null): number | null {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
        </div>
        <div className="header-actions">
          <Link href="/pro/patients/new" className="btn btn-primary">
            ＋ Novo Paciente
          </Link>
        </div>
      </div>

      <div className="page-content">
        {patients && patients.length > 0 ? (
          <div className="grid grid-auto stagger-children">
            {patients.map((patient) => {
              const userData = patient.users as unknown as { full_name: string; email: string; phone: string | null };
              const name = userData?.full_name ?? 'Paciente';
              const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              const age = calculateAge(patient.birth_date);

              return (
                <Link key={patient.id} href={`/pro/patients/${patient.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-interactive">
                    <div className="flex items-center gap-4" style={{ marginBottom: 'var(--space-4)' }}>
                      <div className="avatar avatar-lg">{initials}</div>
                      <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{name}</h3>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {age ? `${age} anos` : ''}{patient.gender === 'male' ? ' • Masculino' : patient.gender === 'female' ? ' • Feminino' : ''}
                          {patient.height_m ? ` • ${patient.height_m}m` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                      <span className="badge badge-info">{goalLabels[patient.goal] ?? patient.goal}</span>
                      <span className="badge badge-neutral">{activityLabels[patient.activity_level] ?? patient.activity_level}</span>
                      {patient.is_active ? (
                        <span className="badge badge-success">Ativo</span>
                      ) : (
                        <span className="badge badge-neutral">Inativo</span>
                      )}
                    </div>

                    <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {userData?.email}
                      {userData?.phone && ` • ${userData.phone}`}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p className="empty-title">Nenhum paciente cadastrado</p>
              <p className="empty-text">Adicione seu primeiro paciente para começar a prescrever planos alimentares.</p>
              <Link href="/pro/patients/new" className="btn btn-primary">＋ Adicionar Paciente</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
