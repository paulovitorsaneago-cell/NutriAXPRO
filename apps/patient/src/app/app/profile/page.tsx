import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: patient } = await supabase
    .from('patients')
    .select('*, users!patients_nutritionist_id_fkey(full_name, crn)')
    .eq('user_id', user.id)
    .single();

  const nutritionist = patient?.users as unknown as { full_name: string; crn: string | null } | null;

  return (
    <>
      <div className="app-header">
        <h1>👤 Meu Perfil</h1>
      </div>

      <div className="app-content">
        <div className="stagger">
          {/* User Info */}
          <div className="card" style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto var(--space-3)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800, color: 'white',
            }}>
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile?.full_name ?? 'Paciente'}</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{profile?.email}</p>
            {profile?.phone && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 2 }}>{profile.phone}</p>
            )}
          </div>

          {/* Nutritionist Info */}
          {nutritionist && (
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Meu Nutricionista
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 700, color: 'white',
                }}>
                  {nutritionist.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{nutritionist.full_name}</div>
                  {nutritionist.crn && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{nutritionist.crn}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Patient details */}
          {patient && (
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Dados do Perfil
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <ProfileField label="Objetivo" value={patient.goal === 'muscle_gain' ? '💪 Hipertrofia' : patient.goal === 'fat_loss' ? '🔥 Emagrecimento' : patient.goal} />
                <ProfileField label="Atividade" value={patient.activity_level} />
                <ProfileField label="Altura" value={patient.height_m ? `${patient.height_m}m` : null} />
                <ProfileField label="Gênero" value={patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : patient.gender} />
              </div>
            </div>
          )}

          {/* Logout */}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                width: '100%', padding: 'var(--space-4)',
                background: 'var(--bg-surface-raised)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)', color: 'var(--color-danger)',
                fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
              }}
            >
              🚪 Sair da conta
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{value ?? '—'}</div>
    </div>
  );
}
