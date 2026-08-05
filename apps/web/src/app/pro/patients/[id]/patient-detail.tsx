'use client';

import { useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PatientDetailProps {
  patient: any;
  anamnesis: any;
  anamnesisSports: any;
  anamnesisRoutine: any;
  anthropometrics: any[];
  exams: any[];
  activePlan: any;
  evolution: any[];
  foodLogs: any[];
}

type TabId = 'overview' | 'anamnesis' | 'exams' | 'anthropometry' | 'prescription' | 'adherence';

export default function PatientDetail({
  patient, anamnesis, anamnesisSports, anamnesisRoutine,
  anthropometrics, exams, activePlan, evolution, foodLogs
}: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const userData = patient.users as { full_name: string; email: string; phone: string | null };
  const name = userData?.full_name ?? 'Paciente';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const latestAnthro = anthropometrics[0];

  const goalLabels: Record<string, string> = {
    fat_loss: '🔥 Emagrecimento', muscle_gain: '💪 Hipertrofia',
    maintenance: '⚖️ Manutenção', health: '❤️ Saúde', performance: '🏆 Performance',
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'anamnesis', label: 'Anamnese', icon: '📝' },
    { id: 'exams', label: 'Exames', icon: '🔬' },
    { id: 'anthropometry', label: 'Antropometria', icon: '📏' },
    { id: 'prescription', label: 'Prescrição', icon: '📋' },
    { id: 'adherence', label: 'Adesão', icon: '✅' },
  ];

  const alteredExams = exams.filter(e => e.status_flag !== 'normal');
  const completedLogs = foodLogs.filter(l => l.status === 'completed').length;
  const adherenceRate = foodLogs.length > 0 ? Math.round((completedLogs / foodLogs.length) * 100) : 0;

  const age = patient.birth_date
    ? Math.floor((Date.now() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <>
      {/* Header */}
      <div className="content-header">
        <div className="flex items-center gap-4">
          <a href="/pro/patients" className="btn btn-ghost btn-icon" title="Voltar">←</a>
          <div className="avatar avatar-lg">{initials}</div>
          <div>
            <h1 className="page-title">{name}</h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              {age ? `${age} anos` : ''} • {goalLabels[patient.goal] ?? patient.goal}
              {latestAnthro ? ` • ${latestAnthro.weight_kg}kg` : ''}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <a href={`/pro/ai-copilot?patient=${patient.id}`} className="btn btn-accent">🤖 AI Copilot</a>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ marginRight: 'var(--space-2)' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'overview' && (
            <OverviewTab
              patient={patient} latestAnthro={latestAnthro} activePlan={activePlan}
              alteredExams={alteredExams} adherenceRate={adherenceRate} evolution={evolution}
            />
          )}
          {activeTab === 'anamnesis' && (
            <AnamnesisTab anamnesis={anamnesis} sports={anamnesisSports} routine={anamnesisRoutine} />
          )}
          {activeTab === 'exams' && <ExamsTab exams={exams} />}
          {activeTab === 'anthropometry' && <AnthropometryTab assessments={anthropometrics} />}
          {activeTab === 'prescription' && <PrescriptionTab plan={activePlan} />}
          {activeTab === 'adherence' && <AdherenceTab foodLogs={foodLogs} plan={activePlan} />}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   Tab: Overview
   ============================================================================ */
function OverviewTab({ patient, latestAnthro, activePlan, alteredExams, adherenceRate, evolution }: any) {
  return (
    <div className="grid grid-4 stagger-children" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
        <span className="stat-label">Peso Atual</span>
        <span className="stat-value">{latestAnthro?.weight_kg ?? '—'}<small style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>kg</small></span>
        {evolution.length >= 2 && (
          <span className={`stat-change ${evolution[evolution.length-1]?.delta_weight_kg < 0 ? 'negative' : 'positive'}`}>
            {evolution[evolution.length-1]?.delta_weight_kg > 0 ? '+' : ''}{evolution[evolution.length-1]?.delta_weight_kg?.toFixed(1)}kg
          </span>
        )}
      </div>
      <div className="stat-card" style={{ '--stat-color': 'var(--color-accent)' } as React.CSSProperties}>
        <span className="stat-label">% Gordura</span>
        <span className="stat-value">{latestAnthro?.bf_percentage ?? '—'}<small style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>%</small></span>
      </div>
      <div className="stat-card" style={{ '--stat-color': 'var(--color-info)' } as React.CSSProperties}>
        <span className="stat-label">Meta Calórica</span>
        <span className="stat-value">{activePlan?.target_kcal ?? '—'}<small style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>kcal</small></span>
      </div>
      <div className="stat-card" style={{ '--stat-color': adherenceRate >= 80 ? 'var(--color-success)' : 'var(--color-warning)' } as React.CSSProperties}>
        <span className="stat-label">Adesão</span>
        <span className="stat-value">{adherenceRate}%</span>
        <div className="progress-bar">
          <div className={`progress-fill ${adherenceRate < 60 ? 'danger' : adherenceRate < 80 ? 'warning' : ''}`} style={{ width: `${adherenceRate}%` }} />
        </div>
      </div>

      {/* Macro distribution */}
      {activePlan && (
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Distribuição de Macros</h3>
            <span className="badge badge-info">{activePlan.plan_name ?? 'Plano Ativo'}</span>
          </div>
          <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
            <MacroCard label="Proteína" value={activePlan.protein_g} unit="g" pct={activePlan.protein_pct} color="#3b82f6" perKg={activePlan.protein_per_kg} />
            <MacroCard label="Carboidrato" value={activePlan.carb_g} unit="g" pct={activePlan.carb_pct} color="#f59e0b" />
            <MacroCard label="Gordura" value={activePlan.lipid_g} unit="g" pct={activePlan.lipid_pct} color="#ef4444" perKg={activePlan.lipid_per_kg} />
          </div>
        </div>
      )}

      {/* Altered exams alert */}
      {alteredExams.length > 0 && (
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">⚠️ Exames que Requerem Atenção</h3>
          </div>
          <div className="flex flex-col gap-2">
            {alteredExams.slice(0, 5).map((exam: any) => (
              <div key={exam.id} className="flex items-center gap-3" style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-md)' }}>
                <span>{exam.status_flag === 'altered' ? '🔴' : '🟡'}</span>
                <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{exam.exam_name}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {exam.result_value} {exam.unit}
                </span>
                <span className={`badge ${exam.status_flag === 'altered' ? 'badge-danger' : 'badge-warning'}`}>
                  P{exam.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MacroCard({ label, value, unit, pct, color, perKg }: { label: string; value: number; unit: string; pct?: number; color: string; perKg?: number }) {
  return (
    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-lg)', borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginTop: 'var(--space-1)' }}>
        {value}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{unit}</span>
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
        {pct != null && `${pct.toFixed(0)}%`}
        {perKg != null && ` • ${perKg}g/kg`}
      </div>
    </div>
  );
}

/* ============================================================================
   Tab: Anamnesis
   ============================================================================ */
function AnamnesisTab({ anamnesis, sports, routine }: any) {
  if (!anamnesis && !sports && !routine) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p className="empty-title">Anamnese não preenchida</p>
          <p className="empty-text">Aguardando preenchimento pelo paciente ou nutricionista.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Clinical */}
      {anamnesis && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">🏥 Anamnese Clínica</h3></div>
          <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
            <InfoField label="Histórico Clínico" value={anamnesis.clinical_history} />
            <InfoField label="Medicamentos em Uso" value={anamnesis.current_medications} />
            <InfoField label="Alergias" value={anamnesis.allergies?.join(', ')} />
            <InfoField label="Intolerâncias" value={anamnesis.food_intolerances?.join(', ')} />
            <InfoField label="Histórico Familiar" value={anamnesis.family_history} />
            <InfoField label="Funcionamento Intestinal" value={anamnesis.intestinal_function?.replace('type_', 'Tipo ')} />
            <InfoField label="Frequência Intestinal" value={anamnesis.bowel_frequency} />
            <InfoField label="Água Diária" value={anamnesis.daily_water_ml ? `${anamnesis.daily_water_ml}ml (meta: ${anamnesis.water_goal_ml}ml)` : null} />
          </div>
          {anamnesis.food_preferences && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <InfoField label="Preferências Alimentares" value={anamnesis.food_preferences} />
              <InfoField label="Aversões Alimentares" value={anamnesis.food_aversions} />
            </div>
          )}
        </div>
      )}

      {/* Sports */}
      {sports && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">🏋️ Anamnese Esportiva</h3></div>
          <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
            <InfoField label="Modalidade Principal" value={sports.primary_modality} />
            <InfoField label="Frequência Semanal" value={sports.weekly_frequency ? `${sports.weekly_frequency} dias/semana` : null} />
            <InfoField label="Duração da Sessão" value={sports.session_duration_min ? `${sports.session_duration_min} min` : null} />
            <InfoField label="Horário do Treino" value={sports.training_time} />
            <InfoField label="Experiência" value={sports.training_experience} />
            <InfoField label="PSE (1-10)" value={sports.perceived_effort?.toString()} />
            <InfoField label="Ergogênicos" value={sports.uses_ergogenics ? sports.ergogenics_details || 'Sim' : 'Não'} />
            <InfoField label="Objetivo Esportivo" value={sports.sports_goals} />
            <InfoField label="Histórico de Lesões" value={sports.injuries_history} />
          </div>
        </div>
      )}

      {/* Routine */}
      {routine && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">🌙 Rotina & Hábitos</h3></div>
          <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
            <InfoField label="Horário de Acordar" value={routine.wake_time} />
            <InfoField label="Horário de Dormir" value={routine.sleep_time} />
            <InfoField label="Horas de Sono" value={routine.sleep_hours ? `${routine.sleep_hours}h` : null} />
            <InfoField label="Qualidade do Sono" value={routine.sleep_quality} />
            <InfoField label="Nível de Estresse" value={routine.stress_level} />
            <InfoField label="Fontes de Estresse" value={routine.stress_sources?.join(', ')} />
            <InfoField label="Rotina de Trabalho" value={routine.work_schedule} />
            <InfoField label="Quem Cozinha" value={routine.who_cooks} />
            <InfoField label="Consumo de Álcool" value={routine.alcohol_consumption} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ padding: 'var(--space-2) 0' }}>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-sm)', color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {value || '—'}
      </div>
    </div>
  );
}

/* ============================================================================
   Tab: Exams
   ============================================================================ */
function ExamsTab({ exams }: { exams: any[] }) {
  if (exams.length === 0) {
    return (
      <div className="card"><div className="empty-state">
        <div className="empty-icon">🔬</div>
        <p className="empty-title">Nenhum exame cadastrado</p>
      </div></div>
    );
  }

  const categoryLabels: Record<string, string> = {
    hemograma: '🩸 Hemograma', lipidograma: '🫀 Lipidograma', glicemico: '🍬 Glicêmico',
    hepatico: '🫁 Hepático', renal: '🫘 Renal', hormonal: '⚡ Hormonal',
    inflamatorio: '🔥 Inflamatório', vitaminas_minerais: '💊 Vitaminas/Minerais',
    tireoidiano: '🦋 Tireoidiano', outros: '📋 Outros',
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Exames Laboratoriais</h3>
        <button className="btn btn-primary btn-sm">＋ Adicionar Exame</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Exame</th>
              <th>Categoria</th>
              <th>Resultado</th>
              <th>Referência</th>
              <th>Interpretação</th>
              <th>Prioridade</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => (
              <tr key={exam.id}>
                <td>
                  <span style={{ fontSize: 'var(--text-lg)' }}>
                    {exam.status_flag === 'altered' ? '🔴' : exam.status_flag === 'attention' ? '🟡' : '🟢'}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{exam.exam_name}</td>
                <td><span className="badge badge-neutral">{categoryLabels[exam.category] ?? exam.category}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>
                  {exam.result_value != null ? `${exam.result_value} ${exam.unit ?? ''}` : exam.result_text ?? '—'}
                </td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {exam.ref_min != null && exam.ref_max != null ? `${exam.ref_min} - ${exam.ref_max}` : exam.ref_text ?? '—'}
                </td>
                <td style={{ fontSize: 'var(--text-xs)', maxWidth: 200 }} className="truncate">
                  {exam.nutritionist_interpretation ?? '—'}
                </td>
                <td>
                  {exam.priority > 0 && (
                    <span className={`badge ${exam.priority >= 4 ? 'badge-danger' : exam.priority >= 2 ? 'badge-warning' : 'badge-neutral'}`}>
                      P{exam.priority}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
   Tab: Anthropometry
   ============================================================================ */
function AnthropometryTab({ assessments }: { assessments: any[] }) {
  if (assessments.length === 0) {
    return (
      <div className="card"><div className="empty-state">
        <div className="empty-icon">📏</div>
        <p className="empty-title">Nenhuma avaliação antropométrica</p>
      </div></div>
    );
  }

  const latest = assessments[0];
  const skinfolds = latest.skinfolds_mm as Record<string, number> | null;
  const circumferences = latest.circumferences_cm as Record<string, number> | null;

  const skinfoldLabels: Record<string, string> = {
    triceps: 'Tríceps', subscapular: 'Subescapular', chest: 'Peitoral',
    axillary: 'Axilar Média', suprailiac: 'Suprailíaca',
    abdominal: 'Abdominal', thigh: 'Coxa', calf: 'Panturrilha',
  };
  const circumLabels: Record<string, string> = {
    neck: 'Pescoço', chest: 'Tórax', waist: 'Cintura', hip: 'Quadril',
    abdomen: 'Abdômen', arm_relaxed_r: 'Braço Relaxado', arm_contracted_r: 'Braço Contraído',
    forearm_r: 'Antebraço', thigh_proximal_r: 'Coxa Proximal', calf_r: 'Panturrilha',
  };

  const protocolLabels: Record<string, string> = {
    jackson_pollock_7: 'Jackson-Pollock 7 Dobras', jackson_pollock_3: 'Jackson-Pollock 3 Dobras',
    guedes: 'Guedes', petroski: 'Petroski', faulkner: 'Faulkner', durnin_womersley: 'Durnin-Womersley',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-4 stagger-children">
        <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
          <span className="stat-label">Peso</span>
          <span className="stat-value">{latest.weight_kg}<small style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>kg</small></span>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--color-accent)' } as React.CSSProperties}>
          <span className="stat-label">% Gordura</span>
          <span className="stat-value">{latest.bf_percentage ?? '—'}<small style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>%</small></span>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--color-info)' } as React.CSSProperties}>
          <span className="stat-label">Massa Magra</span>
          <span className="stat-value">{latest.muscle_mass_kg ?? '—'}<small style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>kg</small></span>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--color-warning)' } as React.CSSProperties}>
          <span className="stat-label">FFMI</span>
          <span className="stat-value">{latest.ffmi ?? '—'}</span>
        </div>
      </div>

      {/* Indices */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Índices Calculados</h3>
          <span className="badge badge-neutral">
            {protocolLabels[latest.protocol_used] ?? latest.protocol_used ?? 'N/A'}
          </span>
        </div>
        <div className="grid grid-4" style={{ gap: 'var(--space-4)' }}>
          <InfoField label="IMC" value={latest.bmi?.toFixed(1)} />
          <InfoField label="FFMI" value={latest.ffmi?.toFixed(1)} />
          <InfoField label="RCQ" value={latest.waist_hip_ratio?.toFixed(3)} />
          <InfoField label="RCEst" value={latest.waist_height_ratio?.toFixed(3)} />
        </div>
      </div>

      {/* Skinfolds */}
      {skinfolds && Object.keys(skinfolds).length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Dobras Cutâneas (mm)</h3></div>
          <div className="grid grid-4" style={{ gap: 'var(--space-3)' }}>
            {Object.entries(skinfolds).map(([key, val]) => (
              <div key={key} style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{skinfoldLabels[key] ?? key}</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{val} mm</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Circumferences */}
      {circumferences && Object.keys(circumferences).length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Circunferências (cm)</h3></div>
          <div className="grid grid-4" style={{ gap: 'var(--space-3)' }}>
            {Object.entries(circumferences).map(([key, val]) => (
              <div key={key} style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{circumLabels[key] ?? key}</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{val} cm</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   Tab: Prescription
   ============================================================================ */
function PrescriptionTab({ plan }: { plan: any }) {
  if (!plan) {
    return (
      <div className="card"><div className="empty-state">
        <div className="empty-icon">📋</div>
        <p className="empty-title">Nenhum plano ativo</p>
        <p className="empty-text">Crie um plano nutricional para este paciente.</p>
        <button className="btn btn-primary">Criar Plano</button>
      </div></div>
    );
  }

  const meals = plan.prescriptions?.sort((a: any, b: any) => a.meal_order - b.meal_order) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Plan Summary */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{plan.plan_name ?? 'Plano Nutricional'}</h3>
            <p className="card-subtitle">Meta: {plan.target_kcal} kcal • P: {plan.protein_g}g • C: {plan.carb_g}g • G: {plan.lipid_g}g</p>
          </div>
          <span className="badge badge-success">Ativo</span>
        </div>
      </div>

      {/* Meals */}
      <div className="flex flex-col gap-4 stagger-children">
        {meals.map((meal: any) => {
          const items = meal.prescription_items?.sort((a: any, b: any) => a.item_order - b.item_order) ?? [];
          return (
            <div key={meal.id} className="meal-card">
              <div className="meal-header">
                <div>
                  <div className="meal-name">{meal.meal_name}</div>
                  {meal.instructions && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{meal.instructions}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="meal-time">{meal.meal_time?.slice(0, 5)}</span>
                  {meal.generated_by_ai && <span className="badge badge-accent">🤖 IA</span>}
                </div>
              </div>
              <div className="meal-items">
                {items.map((item: any) => (
                  <div key={item.id} className="meal-item">
                    <div>
                      <div className="meal-item-name">{item.food_name}</div>
                      <div className="meal-item-portion">{item.portion_description}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {item.calories_kcal} kcal
                    </div>
                  </div>
                ))}
              </div>
              <div className="meal-macros">
                <span className="macro-pill"><span className="macro-dot kcal" />
                  {meal.total_kcal ?? items.reduce((s: number, i: any) => s + (i.calories_kcal ?? 0), 0)} kcal
                </span>
                <span className="macro-pill"><span className="macro-dot protein" />
                  {meal.total_protein_g ?? items.reduce((s: number, i: any) => s + (i.protein_g ?? 0), 0)}g P
                </span>
                <span className="macro-pill"><span className="macro-dot carb" />
                  {meal.total_carb_g ?? items.reduce((s: number, i: any) => s + (i.carb_g ?? 0), 0)}g C
                </span>
                <span className="macro-pill"><span className="macro-dot fat" />
                  {meal.total_lipid_g ?? items.reduce((s: number, i: any) => s + (i.lipid_g ?? 0), 0)}g G
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   Tab: Adherence
   ============================================================================ */
function AdherenceTab({ foodLogs, plan }: { foodLogs: any[]; plan: any }) {
  if (foodLogs.length === 0) {
    return (
      <div className="card"><div className="empty-state">
        <div className="empty-icon">✅</div>
        <p className="empty-title">Nenhum registro alimentar</p>
        <p className="empty-text">O paciente ainda não registrou refeições.</p>
      </div></div>
    );
  }

  // Group by date
  const byDate = foodLogs.reduce((acc: Record<string, any[]>, log) => {
    (acc[log.log_date] ??= []).push(log);
    return acc;
  }, {});

  const statusIcons: Record<string, string> = {
    completed: '✅', partial: '⚠️', skipped: '❌', substituted: '🔄',
  };
  const statusLabels: Record<string, string> = {
    completed: 'Completa', partial: 'Parcial', skipped: 'Pulou', substituted: 'Substituiu',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Daily summary */}
      {plan && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Comparativo: Consumido vs. Prescrito</h3>
          </div>
          <div className="grid grid-4" style={{ gap: 'var(--space-4)' }}>
            {(['total_kcal', 'total_protein_g', 'total_carb_g', 'total_lipid_g'] as const).map(key => {
              const labels: Record<string, string> = { total_kcal: 'Calorias', total_protein_g: 'Proteína', total_carb_g: 'Carboidrato', total_lipid_g: 'Gordura' };
              const planKeys: Record<string, string> = { total_kcal: 'target_kcal', total_protein_g: 'protein_g', total_carb_g: 'carb_g', total_lipid_g: 'lipid_g' };
              const units: Record<string, string> = { total_kcal: 'kcal', total_protein_g: 'g', total_carb_g: 'g', total_lipid_g: 'g' };
              const latestDate = Object.keys(byDate).sort().reverse()[0];
              const dayLogs = byDate[latestDate] ?? [];
              const consumed = dayLogs.reduce((s: number, l: any) => s + (l[key] ?? 0), 0);
              const target = plan[planKeys[key]] ?? 0;
              const pct = target > 0 ? Math.round((consumed / target) * 100) : 0;
              return (
                <div key={key} style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>{labels[key]}</div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>{consumed.toFixed(0)}<span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}> / {target} {units[key]}</span></div>
                  <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
                    <div className={`progress-fill ${pct > 110 ? 'danger' : pct < 80 ? 'warning' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day-by-day logs */}
      {Object.entries(byDate).sort(([a], [b]) => b.localeCompare(a)).map(([date, logs]) => (
        <div key={date} className="card">
          <div className="card-header">
            <h3 className="card-title">{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            <span className="badge badge-neutral">{logs.length} refeições</span>
          </div>
          <div className="flex flex-col gap-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3" style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-raised)' }}>
                <span>{statusIcons[log.status] ?? '❓'}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 'var(--text-sm)' }}>{log.meal_name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {log.total_kcal ?? 0} kcal
                </span>
                <span className={`badge ${log.status === 'completed' ? 'badge-success' : log.status === 'skipped' ? 'badge-danger' : 'badge-warning'}`}>
                  {statusLabels[log.status] ?? log.status}
                </span>
              </div>
            ))}
            {logs.some((l: any) => l.notes) && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic', padding: 'var(--space-1) var(--space-3)' }}>
                {logs.filter((l: any) => l.notes).map((l: any) => `${l.meal_name}: ${l.notes}`).join(' | ')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
