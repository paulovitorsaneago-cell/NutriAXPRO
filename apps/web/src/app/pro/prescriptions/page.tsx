import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function PrescriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plans } = await supabase
    .from('nutritional_plans')
    .select(`
      *,
      patients!inner(
        id,
        users!patients_user_id_fkey(full_name)
      ),
      prescriptions(id)
    `)
    .eq('nutritionist_id', user?.id ?? '')
    .order('created_at', { ascending: false });

  const goalLabels: Record<string, string> = {
    fat_loss: '🔥 Emagrecimento', muscle_gain: '💪 Hipertrofia',
    maintenance: '⚖️ Manutenção', health: '❤️ Saúde', performance: '🏆 Performance',
  };

  return (
    <>
      <div className="content-header">
        <div><h1 className="page-title">Prescrições</h1></div>
        <div className="header-actions">
          <Link href="/pro/ai-copilot" className="btn btn-accent">🤖 Gerar com IA</Link>
        </div>
      </div>

      <div className="page-content">
        {plans && plans.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Plano</th>
                  <th>Calorias</th>
                  <th>P / C / G</th>
                  <th>Refeições</th>
                  <th>Status</th>
                  <th>Fórmula</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => {
                  const patientName = (plan.patients as unknown as { users: { full_name: string } })?.users?.full_name ?? '—';
                  const patientId = (plan.patients as unknown as { id: string })?.id;
                  const mealsCount = (plan.prescriptions as unknown as { id: string }[])?.length ?? 0;

                  return (
                    <tr key={plan.id}>
                      <td>
                        <Link href={`/pro/patients/${patientId}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {patientName}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{plan.plan_name ?? 'Plano sem nome'}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {plan.target_kcal} <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>kcal</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                        <span style={{ color: '#3b82f6' }}>{plan.protein_g}g</span>
                        {' / '}
                        <span style={{ color: '#f59e0b' }}>{plan.carb_g}g</span>
                        {' / '}
                        <span style={{ color: '#ef4444' }}>{plan.lipid_g}g</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>{mealsCount}</td>
                      <td>
                        {plan.is_active ? (
                          <span className="badge badge-success">Ativo</span>
                        ) : (
                          <span className="badge badge-neutral">Inativo</span>
                        )}
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {plan.bmr_formula?.replace('_', '-') ?? '—'}
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p className="empty-title">Nenhuma prescrição criada</p>
              <p className="empty-text">Use o AI Copilot para gerar planos alimentares personalizados.</p>
              <Link href="/pro/ai-copilot" className="btn btn-accent">🤖 Gerar com IA</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
