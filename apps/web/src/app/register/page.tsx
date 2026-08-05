'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [crn, setCrn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'nutritionist', crn },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        role: 'nutritionist',
        full_name: fullName,
        crn: crn || null,
      });

      setSuccess(true);
      setTimeout(() => router.push('/pro/dashboard'), 1500);
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card animate-scale-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
          <h2 className="auth-title">Conta criada com sucesso!</h2>
          <p className="auth-subtitle">Redirecionando para o painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-scale-in">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="sidebar-logo">
              <div className="logo-icon">N</div>
            </div>
          </div>
          <h1 className="auth-title">Criar Conta Profissional</h1>
          <p className="auth-subtitle">
            Cadastre-se como nutricionista no NutriAX Pro
          </p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Nome Completo</label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              placeholder="Dr(a). Nome Sobrenome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="regEmail" className="form-label">Email</label>
            <input
              id="regEmail"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="crn" className="form-label">CRN (opcional)</label>
            <input
              id="crn"
              type="text"
              className="form-input"
              placeholder="CRN-3 12345"
              value={crn}
              onChange={(e) => setCrn(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="regPassword" className="form-label">Senha</label>
            <input
              id="regPassword"
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="form-error" style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta?{' '}
          <a href="/login">Fazer login</a>
        </div>
      </div>
    </div>
  );
}
