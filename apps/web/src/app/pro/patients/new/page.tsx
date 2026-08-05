'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function NewPatientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: 'male',
    height_m: '',
    activity_level: 'moderately_active',
    goal: 'muscle_gain',
    occupation: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user: nutritionist } } = await supabase.auth.getUser();
      if (!nutritionist) throw new Error('Não autenticado');

      // 1. Create Supabase Auth user for the patient
      // NOTE: In production, use a service-role server action instead
      // For now we create just the profile records
      const patientUserId = crypto.randomUUID();

      // 2. Create user profile
      const { error: userError } = await supabase.from('users').insert({
        id: patientUserId,
        email: form.email,
        role: 'patient',
        full_name: form.full_name,
        phone: form.phone || null,
      });

      if (userError) throw new Error(`Erro ao criar usuário: ${userError.message}`);

      // 3. Create patient record
      const { data: patient, error: patientError } = await supabase.from('patients').insert({
        user_id: patientUserId,
        nutritionist_id: nutritionist.id,
        birth_date: form.birth_date || null,
        gender: form.gender as 'male' | 'female' | 'other',
        height_m: form.height_m ? parseFloat(form.height_m) : null,
        activity_level: form.activity_level as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active',
        goal: form.goal as 'fat_loss' | 'muscle_gain' | 'maintenance' | 'health' | 'performance',
        occupation: form.occupation || null,
      }).select('id').single();

      if (patientError) throw new Error(`Erro ao criar paciente: ${patientError.message}`);

      router.push(`/pro/patients/${patient?.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  const genderOptions = [
    { value: 'male', label: '♂ Masculino' },
    { value: 'female', label: '♀ Feminino' },
    { value: 'other', label: '⚧ Outro' },
  ];

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentário (pouco ou nenhum exercício)' },
    { value: 'lightly_active', label: 'Levemente Ativo (1-3x/semana)' },
    { value: 'moderately_active', label: 'Moderadamente Ativo (3-5x/semana)' },
    { value: 'very_active', label: 'Muito Ativo (6-7x/semana)' },
    { value: 'extremely_active', label: 'Extremamente Ativo (2x/dia)' },
  ];

  const goalOptions = [
    { value: 'fat_loss', label: '🔥 Emagrecimento' },
    { value: 'muscle_gain', label: '💪 Hipertrofia' },
    { value: 'maintenance', label: '⚖️ Manutenção' },
    { value: 'health', label: '❤️ Saúde Geral' },
    { value: 'performance', label: '🏆 Performance' },
  ];

  return (
    <>
      <div className="content-header">
        <div className="flex items-center gap-4">
          <a href="/pro/patients" className="btn btn-ghost btn-icon" title="Voltar">←</a>
          <h1 className="page-title">Novo Paciente</h1>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h2 className="card-title">👤 Dados Pessoais</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label htmlFor="full_name" className="form-label">Nome Completo *</label>
                <input id="full_name" type="text" className="form-input" required
                  placeholder="Nome completo do paciente"
                  value={form.full_name} onChange={e => update('full_name', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input id="email" type="email" className="form-input" required
                    placeholder="paciente@email.com"
                    value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Telefone</label>
                  <input id="phone" type="tel" className="form-input"
                    placeholder="(11) 99999-9999"
                    value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="birth_date" className="form-label">Data de Nascimento</label>
                  <input id="birth_date" type="date" className="form-input"
                    value={form.birth_date} onChange={e => update('birth_date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="gender" className="form-label">Sexo *</label>
                  <select id="gender" className="form-input" value={form.gender} onChange={e => update('gender', e.target.value)}>
                    {genderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="height_m" className="form-label">Altura (m)</label>
                  <input id="height_m" type="number" className="form-input" step="0.01" min="0.5" max="2.50"
                    placeholder="1.78"
                    value={form.height_m} onChange={e => update('height_m', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="occupation" className="form-label">Profissão</label>
                <input id="occupation" type="text" className="form-input"
                  placeholder="Ex: Desenvolvedor de Software"
                  value={form.occupation} onChange={e => update('occupation', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Objetivos */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h2 className="card-title">🎯 Objetivo & Atividade</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Objetivo Principal *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                  {goalOptions.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => update('goal', o.value)}
                      className="btn"
                      style={{
                        background: form.goal === o.value ? 'var(--color-primary-50)' : 'var(--bg-surface-raised)',
                        border: `1px solid ${form.goal === o.value ? 'var(--color-primary)' : 'var(--border-default)'}`,
                        color: form.goal === o.value ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                        padding: 'var(--space-3)',
                        justifyContent: 'flex-start',
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="activity_level" className="form-label">Nível de Atividade Física *</label>
                <select id="activity_level" className="form-input" value={form.activity_level} onChange={e => update('activity_level', e.target.value)}>
                  {activityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          {error && (
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              <span className="form-error" style={{ fontSize: 'var(--text-sm)' }}>{error}</span>
            </div>
          )}

          <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
            <a href="/pro/patients" className="btn btn-secondary">Cancelar</a>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Salvando...' : '✅ Cadastrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
