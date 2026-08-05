import { createClient } from '@/lib/supabase/server';
import MealPlanView from './meal-plan-view';

export default async function MealPlanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get patient_id from user
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user?.id ?? '')
    .single();

  if (!patient) {
    return (
      <>
        <div className="app-header">
          <h1>🍽️ Meu Cardápio</h1>
        </div>
        <div className="app-content">
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📋</div>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Nenhum plano encontrado</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Seu nutricionista ainda não publicou um plano alimentar.
            </p>
          </div>
        </div>
      </>
    );
  }

  // Fetch active plan with meals
  const { data: plan } = await supabase
    .from('nutritional_plans')
    .select(`
      *,
      prescriptions(
        *,
        prescription_items(*)
      )
    `)
    .eq('patient_id', patient.id)
    .eq('is_active', true)
    .single();

  // Fetch today's food logs
  const today = new Date().toISOString().split('T')[0];
  const { data: todayLogs } = await supabase
    .from('food_logs')
    .select('*')
    .eq('patient_id', patient.id)
    .eq('log_date', today);

  return (
    <MealPlanView
      plan={plan}
      todayLogs={todayLogs ?? []}
      patientId={patient.id}
    />
  );
}
