'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FoodItem {
  id: string;
  name: string;
  category: string;
  source: string;
  kcal_100g: number;
  protein_100g: number;
  carb_100g: number;
  lipid_100g: number;
  fiber_100g: number | null;
  sodium_mg_100g: number | null;
}

export default function FoodDatabasePage() {
  const [search, setSearch] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionG, setPortionG] = useState(100);

  const supabase = createClient();

  const categories = [
    'all', 'Cereais e derivados', 'Leguminosas', 'Carnes e ovos',
    'Laticínios', 'Frutas', 'Hortaliças', 'Óleos e gorduras',
    'Oleaginosas', 'Açúcares e doces',
  ];

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('food_database').select('*').order('name');

    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }
    if (category !== 'all') {
      query = query.eq('category', category);
    }

    query = query.limit(50);
    const { data } = await query;
    setFoods(data ?? []);
    setLoading(false);
  }, [search, category, supabase]);

  useEffect(() => {
    const timer = setTimeout(fetchFoods, 300);
    return () => clearTimeout(timer);
  }, [fetchFoods]);

  function calcPortion(value: number): number {
    return Math.round((value / 100) * portionG * 10) / 10;
  }

  return (
    <>
      <div className="content-header">
        <div><h1 className="page-title">Base de Alimentos</h1></div>
        <div className="header-actions">
          <span className="badge badge-neutral" style={{ padding: '4px 10px', fontSize: 'var(--text-sm)' }}>
            TACO 4ª Ed. + Customizados
          </span>
        </div>
      </div>

      <div className="page-content">
        <div className="grid grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Search & Results */}
          <div>
            {/* Search bar */}
            <div className="flex gap-3" style={{ marginBottom: 'var(--space-4)' }}>
              <input
                type="search"
                className="form-input"
                placeholder="🔍 Buscar alimento... (ex: frango, arroz, banana)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            {/* Category filters */}
            <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setCategory(cat)}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  {cat === 'all' ? 'Todas' : cat}
                </button>
              ))}
            </div>

            {/* Results table */}
            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <div className="skeleton" style={{ width: '60%', height: 16, margin: '0 auto var(--space-3)' }} />
                <div className="skeleton" style={{ width: '40%', height: 12, margin: '0 auto' }} />
              </div>
            ) : foods.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Alimento</th>
                      <th>Cat.</th>
                      <th style={{ textAlign: 'right' }}>Kcal</th>
                      <th style={{ textAlign: 'right', color: '#3b82f6' }}>P</th>
                      <th style={{ textAlign: 'right', color: '#f59e0b' }}>C</th>
                      <th style={{ textAlign: 'right', color: '#ef4444' }}>G</th>
                      <th style={{ textAlign: 'right' }}>Fibra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map(food => (
                      <tr
                        key={food.id}
                        onClick={() => { setSelectedFood(food); setPortionG(100); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{food.name}</td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                            {food.category.split(' ')[0]}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{food.kcal_100g}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#3b82f6' }}>{food.protein_100g}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>{food.carb_100g}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#ef4444' }}>{food.lipid_100g}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{food.fiber_100g ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">🍎</div>
                  <p className="empty-title">Nenhum alimento encontrado</p>
                  <p className="empty-text">Tente buscar por outro termo ou categoria.</p>
                </div>
              </div>
            )}

            <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
              Valores por 100g • Fonte: TACO 4ª Edição / UNICAMP • {foods.length} resultados
            </div>
          </div>

          {/* Detail Panel */}
          <div style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-8))' }}>
            {selectedFood ? (
              <div className="card animate-fade-in">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{selectedFood.name}</h3>
                    <p className="card-subtitle">{selectedFood.category} • {selectedFood.source.toUpperCase()}</p>
                  </div>
                </div>

                {/* Portion Calculator */}
                <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                    Calcular por porção:
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="form-input"
                      value={portionG}
                      onChange={e => setPortionG(Math.max(1, +e.target.value))}
                      min={1}
                      style={{ width: 80, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>gramas</span>
                    <div className="flex gap-1" style={{ marginLeft: 'auto' }}>
                      {[30, 50, 100, 150, 200].map(g => (
                        <button key={g} className="btn btn-ghost btn-sm" onClick={() => setPortionG(g)}
                          style={{ fontSize: '10px', padding: '2px 6px', minWidth: 0 }}>{g}g</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nutritional values */}
                <div className="flex flex-col gap-3">
                  <NutrientRow label="Calorias" value100={selectedFood.kcal_100g} portionG={portionG} unit="kcal" color="var(--color-primary)" bold />
                  <NutrientRow label="Proteína" value100={selectedFood.protein_100g} portionG={portionG} unit="g" color="#3b82f6" />
                  <NutrientRow label="Carboidrato" value100={selectedFood.carb_100g} portionG={portionG} unit="g" color="#f59e0b" />
                  <NutrientRow label="Gordura" value100={selectedFood.lipid_100g} portionG={portionG} unit="g" color="#ef4444" />
                  {selectedFood.fiber_100g != null && (
                    <NutrientRow label="Fibra" value100={selectedFood.fiber_100g} portionG={portionG} unit="g" color="var(--text-tertiary)" />
                  )}
                  {selectedFood.sodium_mg_100g != null && (
                    <NutrientRow label="Sódio" value100={selectedFood.sodium_mg_100g} portionG={portionG} unit="mg" color="var(--text-tertiary)" />
                  )}
                </div>

                {/* Macro bar */}
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                    Distribuição calórica ({portionG}g)
                  </div>
                  {(() => {
                    const pKcal = calcPortion(selectedFood.protein_100g) * 4;
                    const cKcal = calcPortion(selectedFood.carb_100g) * 4;
                    const gKcal = calcPortion(selectedFood.lipid_100g) * 9;
                    const total = pKcal + cKcal + gKcal || 1;
                    return (
                      <>
                        <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ width: `${(pKcal / total) * 100}%`, background: '#3b82f6' }} />
                          <div style={{ width: `${(cKcal / total) * 100}%`, background: '#f59e0b' }} />
                          <div style={{ width: `${(gKcal / total) * 100}%`, background: '#ef4444' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>
                          <span>P: {Math.round(pKcal / total * 100)}%</span>
                          <span>C: {Math.round(cKcal / total * 100)}%</span>
                          <span>G: {Math.round(gKcal / total * 100)}%</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: 'var(--space-4)' }}>🍎</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  Clique em um alimento para ver os detalhes nutricionais e calcular por porção.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function NutrientRow({ label, value100, portionG, unit, color, bold }: {
  label: string; value100: number; portionG: number; unit: string; color: string; bold?: boolean;
}) {
  const portionValue = Math.round((value100 / 100) * portionG * 10) / 10;
  return (
    <div className="flex items-center justify-between" style={{ padding: 'var(--space-1) 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: bold ? 700 : 400 }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: color, marginRight: 8 }} />
        {label}
      </span>
      <div className="flex gap-4">
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: 60, textAlign: 'right' }}>
          {value100} {unit}
        </span>
        <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: bold ? 800 : 600, color: color, width: 80, textAlign: 'right' }}>
          {portionValue} {unit}
        </span>
      </div>
    </div>
  );
}
