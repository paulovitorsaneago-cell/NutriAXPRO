'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AiMeal {
  meal_name: string;
  meal_time: string;
  items: { food_name: string; portion_description: string; weight_g: number; calories_kcal: number; protein_g: number; carb_g: number; lipid_g: number }[];
  total_kcal: number;
  total_protein_g: number;
  total_carb_g: number;
  total_lipid_g: number;
}

interface AiResult {
  meals: AiMeal[];
  total_daily_kcal: number;
  total_daily_protein_g: number;
  total_daily_carb_g: number;
  total_daily_lipid_g: number;
  clinical_considerations?: string[];
  notes?: string;
}

export default function AiCopilotPage() {
  const [patientId, setPatientId] = useState('');
  const [targetKcal, setTargetKcal] = useState(2500);
  const [proteinG, setProteinG] = useState(180);
  const [carbG, setCarbG] = useState(300);
  const [lipidG, setLipidG] = useState(70);
  const [mealsCount, setMealsCount] = useState(6);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-prescription', {
        body: {
          patient_id: patientId,
          caloric_targets: { target_kcal: targetKcal, protein_g: proteinG, carb_g: carbG, lipid_g: lipidG, meals_count: mealsCount },
          additional_instructions: instructions || null,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.prescription) {
        setResult(data.prescription);
      } else {
        setError(data?.error ?? 'Erro desconhecido na geração.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="page-title">🤖 AI Copilot</h1>
        </div>
        <div className="header-actions">
          <span className="badge badge-accent" style={{ padding: '4px 12px', fontSize: 'var(--text-sm)' }}>
            Prescrição Assistida por IA
          </span>
        </div>
      </div>

      <div className="page-content">
        <div className="grid grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Input Panel */}
          <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-8))' }}>
            <div className="card-header">
              <h2 className="card-title">Parâmetros da Geração</h2>
            </div>

            <form className="auth-form" onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">ID do Paciente</label>
                <input
                  className="form-input"
                  placeholder="UUID do paciente"
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Meta Calórica (kcal)</label>
                  <input type="number" className="form-input" value={targetKcal} onChange={e => setTargetKcal(+e.target.value)} min={800} max={8000} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nº Refeições</label>
                  <input type="number" className="form-input" value={mealsCount} onChange={e => setMealsCount(+e.target.value)} min={3} max={8} required />
                </div>
              </div>

              <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#3b82f6' }}>Proteína (g)</label>
                  <input type="number" className="form-input" value={proteinG} onChange={e => setProteinG(+e.target.value)} min={0} required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#f59e0b' }}>Carboidrato (g)</label>
                  <input type="number" className="form-input" value={carbG} onChange={e => setCarbG(+e.target.value)} min={0} required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#ef4444' }}>Gordura (g)</label>
                  <input type="number" className="form-input" value={lipidG} onChange={e => setLipidG(+e.target.value)} min={0} required />
                </div>
              </div>

              {/* Macro visual bar */}
              <div style={{ display: 'flex', height: 8, borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${(proteinG * 4 / targetKcal * 100)}%`, background: '#3b82f6' }} />
                <div style={{ width: `${(carbG * 4 / targetKcal * 100)}%`, background: '#f59e0b' }} />
                <div style={{ width: `${(lipidG * 9 / targetKcal * 100)}%`, background: '#ef4444' }} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
                P: {Math.round(proteinG * 4 / targetKcal * 100)}% | C: {Math.round(carbG * 4 / targetKcal * 100)}% | G: {Math.round(lipidG * 9 / targetKcal * 100)}%
                {' '}({(proteinG * 4 + carbG * 4 + lipidG * 9).toFixed(0)} kcal calculado)
              </div>

              <div className="form-group">
                <label className="form-label">Instruções Adicionais (opcional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Ex: Paciente tem LDL elevado, priorizar gorduras insaturadas. Treina às 18h, incluir pré-treino..."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              {error && <div className="form-error" style={{ textAlign: 'center' }}>{error}</div>}

              <button type="submit" className="btn btn-accent btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                    Gerando prescrição...
                  </span>
                ) : (
                  '🤖 Gerar Prescrição com IA'
                )}
              </button>
            </form>
          </div>

          {/* Result Panel */}
          <div>
            {loading && (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', animation: 'pulse-glow 2s infinite' }}>🤖</div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                  Gerando prescrição personalizada...
                </h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                  A IA está analisando o perfil do paciente e montando o cardápio.
                </p>
                <div className="progress-bar" style={{ marginTop: 'var(--space-6)', maxWidth: 300, margin: 'var(--space-6) auto 0' }}>
                  <div className="progress-fill" style={{ width: '60%', animation: 'skeleton-shimmer 2s infinite' }} />
                </div>
              </div>
            )}

            {result && (
              <div className="flex flex-col gap-4 stagger-children animate-fade-in">
                {/* Daily Totals */}
                <div className="card" style={{ borderColor: 'var(--color-accent-50)', background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(16,185,129,0.05))' }}>
                  <div className="card-header">
                    <h3 className="card-title">✨ Prescrição Gerada pela IA</h3>
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm">✅ Aprovar e Salvar</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setResult(null)}>✏️ Editar</button>
                    </div>
                  </div>
                  <div className="grid grid-4" style={{ gap: 'var(--space-3)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Calorias</div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-primary)' }}>{result.total_daily_kcal}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: '#3b82f6' }}>Proteína</div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>{result.total_daily_protein_g}g</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: '#f59e0b' }}>Carboidrato</div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>{result.total_daily_carb_g}g</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: '#ef4444' }}>Gordura</div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>{result.total_daily_lipid_g}g</div>
                    </div>
                  </div>
                </div>

                {/* Clinical Considerations */}
                {result.clinical_considerations && result.clinical_considerations.length > 0 && (
                  <div className="card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>⚠️ Considerações Clínicas</h4>
                    <ul style={{ paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {result.clinical_considerations.map((c, i) => (
                        <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Meals */}
                {result.meals.map((meal, i) => (
                  <div key={i} className="meal-card">
                    <div className="meal-header">
                      <div>
                        <div className="meal-name">{meal.meal_name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="meal-time">{meal.meal_time}</span>
                        <span className="badge badge-accent">🤖 IA</span>
                      </div>
                    </div>
                    <div className="meal-items">
                      {meal.items.map((item, j) => (
                        <div key={j} className="meal-item">
                          <div>
                            <div className="meal-item-name">{item.food_name}</div>
                            <div className="meal-item-portion">{item.portion_description} ({item.weight_g}g)</div>
                          </div>
                          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            {item.calories_kcal} kcal
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="meal-macros">
                      <span className="macro-pill"><span className="macro-dot kcal" />{meal.total_kcal} kcal</span>
                      <span className="macro-pill"><span className="macro-dot protein" />{meal.total_protein_g}g P</span>
                      <span className="macro-pill"><span className="macro-dot carb" />{meal.total_carb_g}g C</span>
                      <span className="macro-pill"><span className="macro-dot fat" />{meal.total_lipid_g}g G</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !result && (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)', opacity: 0.3 }}>🤖</div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                  Prescrição Assistida por IA
                </h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', maxWidth: 400, margin: '0 auto' }}>
                  Configure os parâmetros ao lado e clique em &quot;Gerar&quot; para receber uma sugestão de cardápio personalizado.
                  Você sempre revisa e aprova antes de publicar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
