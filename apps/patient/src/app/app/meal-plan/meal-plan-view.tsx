'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface MealPlanViewProps {
  plan: any;
  todayLogs: any[];
  patientId: string;
}

export default function MealPlanView({ plan, todayLogs }: MealPlanViewProps) {
  if (!plan) {
    return (
      <>
        <div className="app-header">
          <h1>🍽️ Meu Cardápio</h1>
        </div>
        <div className="app-content">
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📋</div>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Nenhum plano ativo</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Aguardando seu nutricionista publicar seu plano alimentar.
            </p>
          </div>
        </div>
      </>
    );
  }

  const meals = plan.prescriptions?.sort((a: any, b: any) => a.meal_order - b.meal_order) ?? [];
  const completedMeals = new Set(todayLogs.filter(l => l.status === 'completed').map(l => l.meal_name));

  const totalKcal = plan.target_kcal ?? 0;
  const consumedKcal = todayLogs.reduce((s: number, l: any) => s + (l.total_kcal ?? 0), 0);
  const pct = totalKcal > 0 ? Math.round((consumedKcal / totalKcal) * 100) : 0;

  const today = new Date();
  const dayLabel = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <div className="app-header">
        <h1>🍽️ Meu Cardápio</h1>
        <p className="subtitle">{dayLabel}</p>
      </div>

      <div className="app-content">
        {/* Daily Progress */}
        <div className="card animate-fade-in" style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
            <ProgressRing value={pct} size={100} strokeWidth={8}>
              <span className="value">{pct}%</span>
            </ProgressRing>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            {consumedKcal} / {totalKcal} kcal consumidas
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-5)' }}>
            <MacroMini label="P" value={plan.protein_g} consumed={todayLogs.reduce((s: number, l: any) => s + (l.total_protein_g ?? 0), 0)} color="#3b82f6" />
            <MacroMini label="C" value={plan.carb_g} consumed={todayLogs.reduce((s: number, l: any) => s + (l.total_carb_g ?? 0), 0)} color="#f59e0b" />
            <MacroMini label="G" value={plan.lipid_g} consumed={todayLogs.reduce((s: number, l: any) => s + (l.total_lipid_g ?? 0), 0)} color="#ef4444" />
          </div>
        </div>

        {/* Meal List */}
        <div className="stagger">
          {meals.map((meal: any) => {
            const items = meal.prescription_items?.sort((a: any, b: any) => a.item_order - b.item_order) ?? [];
            const isCompleted = completedMeals.has(meal.meal_name);

            return (
              <div key={meal.id} className="meal-card" style={{ opacity: isCompleted ? 0.6 : 1 }}>
                <div className="meal-header">
                  <div>
                    <div className="meal-name">
                      {isCompleted && '✅ '}{meal.meal_name}
                    </div>
                    {meal.instructions && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>{meal.instructions}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="meal-time">{meal.meal_time?.slice(0, 5)}</span>
                    {isCompleted && <span className="badge badge-success">Feito</span>}
                  </div>
                </div>

                <div className="meal-items">
                  {items.map((item: any) => (
                    <div key={item.id} className="meal-item">
                      <div>
                        <div className="meal-item-name">{item.food_name}</div>
                        <div className="meal-item-portion">{item.portion_description}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                        {item.calories_kcal} kcal
                      </div>
                    </div>
                  ))}
                </div>

                <div className="meal-macros">
                  <span><span className="macro-dot kcal" />{meal.total_kcal ?? 0} kcal</span>
                  <span><span className="macro-dot protein" />{meal.total_protein_g ?? 0}g P</span>
                  <span><span className="macro-dot carb" />{meal.total_carb_g ?? 0}g C</span>
                  <span><span className="macro-dot fat" />{meal.total_lipid_g ?? 0}g G</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function MacroMini({ label, value, consumed, color }: { label: string; value: number; consumed: number; color: string }) {
  const pct = value > 0 ? Math.min(Math.round((consumed / value) * 100), 100) : 0;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{consumed}<span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>/{value}g</span></div>
      <div style={{ width: 50, height: 4, borderRadius: 2, background: 'var(--bg-surface-raised)', margin: '4px auto 0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function ProgressRing({ value, size, strokeWidth, children }: { value: number; size: number; strokeWidth: number; children: React.ReactNode }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const color = value >= 90 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-surface-raised)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}
