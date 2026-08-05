'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EvolutionViewProps {
  evolution: any[];
  anthropometrics: any[];
}

export default function EvolutionView({ evolution, anthropometrics }: EvolutionViewProps) {
  const latest = anthropometrics[0];
  const previous = anthropometrics[1];

  const metrics = [
    { label: 'Peso', key: 'weight_kg', unit: 'kg', icon: '⚖️' },
    { label: '% Gordura', key: 'bf_percentage', unit: '%', icon: '📊' },
    { label: 'Massa Magra', key: 'muscle_mass_kg', unit: 'kg', icon: '💪' },
    { label: 'Massa Gorda', key: 'fat_mass_kg', unit: 'kg', icon: '🔥' },
    { label: 'IMC', key: 'bmi', unit: '', icon: '📏' },
    { label: 'FFMI', key: 'ffmi', unit: '', icon: '🏆' },
  ];

  return (
    <>
      <div className="app-header">
        <h1>📈 Minha Evolução</h1>
        <p className="subtitle">Acompanhe seu progresso corporal</p>
      </div>

      <div className="app-content">
        {/* Current Stats */}
        {latest ? (
          <div className="stagger">
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Última avaliação: {new Date(latest.assessment_date + 'T12:00:00').toLocaleDateString('pt-BR')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                {metrics.map(m => {
                  const current = latest[m.key];
                  const prev = previous?.[m.key];
                  const delta = current != null && prev != null ? current - prev : null;
                  return (
                    <div key={m.key} style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ fontSize: '1.25rem', marginBottom: 2 }}>{m.icon}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{m.label}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.125rem', marginTop: 2 }}>
                        {current != null ? (typeof current === 'number' ? current.toFixed(1) : current) : '—'}
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{m.unit}</span>
                      </div>
                      {delta != null && (
                        <div style={{ fontSize: '0.625rem', fontWeight: 600, marginTop: 2, color: delta > 0 ? (m.key === 'muscle_mass_kg' ? '#10b981' : '#ef4444') : (m.key === 'muscle_mass_kg' ? '#ef4444' : '#10b981') }}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(1)}{m.unit}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evolution Timeline */}
            {evolution.length > 1 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>📊 Histórico de Evolução</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.625rem', textTransform: 'uppercase' }}>Data</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.625rem' }}>Peso</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.625rem' }}>%GC</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.625rem' }}>M.Magra</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.625rem' }}>Δ Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evolution.map((ev: any, i: number) => (
                        <tr key={i}>
                          <td style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                            {new Date(ev.assessment_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {ev.weight_kg?.toFixed(1)}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {ev.bf_percentage?.toFixed(1)}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {ev.muscle_mass_kg?.toFixed(1)}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: ev.delta_weight_kg > 0 ? '#ef4444' : ev.delta_weight_kg < 0 ? '#10b981' : 'var(--text-muted)' }}>
                            {ev.delta_weight_kg != null ? `${ev.delta_weight_kg > 0 ? '+' : ''}${ev.delta_weight_kg.toFixed(1)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Circumferences comparison */}
            {latest.circumferences_cm && (
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>📏 Circunferências (cm)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                  {Object.entries(latest.circumferences_cm as Record<string, number>).map(([key, val]) => {
                    const labels: Record<string, string> = {
                      neck: 'Pescoço', chest: 'Tórax', waist: 'Cintura', hip: 'Quadril',
                      arm_relaxed_r: 'Braço', arm_contracted_r: 'Braço Cont.', forearm_r: 'Antebraço',
                      thigh_proximal_r: 'Coxa', calf_r: 'Panturrilha',
                    };
                    const prevVal = previous?.circumferences_cm?.[key];
                    const delta = prevVal ? val - prevVal : null;
                    return (
                      <div key={key} style={{ padding: 'var(--space-2)', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{labels[key] ?? key}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{val}</div>
                        {delta != null && (
                          <div style={{ fontSize: '0.5625rem', color: delta > 0 ? '#3b82f6' : '#ef4444' }}>
                            {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', opacity: 0.3 }}>📈</div>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Nenhuma avaliação ainda</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Sua primeira avaliação antropométrica aparecerá aqui.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
