'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type LogStatus = 'completed' | 'partial' | 'skipped' | 'substituted';

const mealNames = [
  'Café da Manhã', 'Lanche da Manhã', 'Almoço',
  'Lanche da Tarde / Pré-Treino', 'Pós-Treino', 'Jantar', 'Ceia',
];

const statusOptions: { value: LogStatus; icon: string; label: string }[] = [
  { value: 'completed', icon: '✅', label: 'Comi tudo' },
  { value: 'partial', icon: '⚠️', label: 'Comi parcialmente' },
  { value: 'skipped', icon: '❌', label: 'Pulei esta refeição' },
  { value: 'substituted', icon: '🔄', label: 'Substituí alimentos' },
];

export default function FoodLogPage() {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [status, setStatus] = useState<LogStatus>('completed');
  const [hungerLevel, setHungerLevel] = useState(5);
  const [waterMl, setWaterMl] = useState(300);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedMeals, setSavedMeals] = useState<string[]>([]);

  const supabase = createClient();

  async function handleSubmit() {
    if (!selectedMeal) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!patient) { setLoading(false); return; }

    const today = new Date().toISOString().split('T')[0];

    await supabase.from('food_logs').insert({
      patient_id: patient.id,
      log_date: today,
      meal_name: selectedMeal,
      status,
      hunger_level: hungerLevel,
      water_ml: waterMl,
      notes: notes || null,
    });

    setSavedMeals([...savedMeals, selectedMeal]);
    setSelectedMeal(null);
    setStatus('completed');
    setHungerLevel(5);
    setWaterMl(300);
    setNotes('');
    setLoading(false);
  }

  return (
    <>
      <div className="app-header">
        <h1>✏️ Diário Alimentar</h1>
        <p className="subtitle">Registre suas refeições de hoje</p>
      </div>

      <div className="app-content">
        {/* Meal Selection */}
        {!selectedMeal ? (
          <div className="stagger">
            {mealNames.map(name => {
              const isSaved = savedMeals.includes(name);
              return (
                <button
                  key={name}
                  className={`btn-check ${isSaved ? 'checked' : ''}`}
                  onClick={() => !isSaved && setSelectedMeal(name)}
                  disabled={isSaved}
                  style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>{isSaved ? '✅' : '⏳'} {name}</span>
                  {isSaved && <span className="badge badge-success">Registrado</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Check-in Form */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontWeight: 700 }}>{selectedMeal}</h3>
                <button onClick={() => setSelectedMeal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.875rem' }}>
                  ← Voltar
                </button>
              </div>

              {/* Status */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                  Como foi esta refeição?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                  {statusOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`btn-check ${status === opt.value ? 'checked' : ''}`}
                      onClick={() => setStatus(opt.value)}
                      style={{ fontSize: '0.8125rem', padding: 'var(--space-3)' }}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hunger Level */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Nível de fome antes da refeição: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{hungerLevel}</span>/10
                </div>
                <input
                  type="range" min={1} max={10} value={hungerLevel}
                  onChange={e => setHungerLevel(+e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  <span>Sem fome</span><span>Faminto</span>
                </div>
              </div>

              {/* Water */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  💧 Água nesta refeição
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {[200, 300, 500, 700].map(ml => (
                    <button
                      key={ml}
                      className={`btn-check ${waterMl === ml ? 'checked' : ''}`}
                      onClick={() => setWaterMl(ml)}
                      style={{ flex: 1, padding: 'var(--space-2)', fontSize: '0.8125rem' }}
                    >
                      {ml}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Observações (opcional)
                </div>
                <textarea
                  className="form-input"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Troquei algum alimento? Alguma observação?"
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Submit */}
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: '100%', padding: 'var(--space-4)' }}
              >
                {loading ? 'Salvando...' : '✅ Salvar Registro'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
