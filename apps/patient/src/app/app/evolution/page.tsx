import { createClient } from '@/lib/supabase/server';
import EvolutionView from './evolution-view';

export default async function EvolutionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user?.id ?? '')
    .single();

  if (!patient) {
    return (
      <>
        <div className="app-header">
          <h1>📈 Evolução</h1>
        </div>
        <div className="app-content">
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📈</div>
            <h3 style={{ fontWeight: 700 }}>Dados indisponíveis</h3>
          </div>
        </div>
      </>
    );
  }

  const { data: evolution } = await supabase
    .from('body_evolution')
    .select('*')
    .eq('patient_id', patient.id)
    .order('assessment_date', { ascending: true });

  const { data: anthropometrics } = await supabase
    .from('anthropometrics')
    .select('*')
    .eq('patient_id', patient.id)
    .order('assessment_date', { ascending: false })
    .limit(2);

  return <EvolutionView evolution={evolution ?? []} anthropometrics={anthropometrics ?? []} />;
}
