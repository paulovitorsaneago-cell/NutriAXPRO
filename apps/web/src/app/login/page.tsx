'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos.'
        : authError.message);
      setLoading(false);
      return;
    }

    router.push('/pro/dashboard');
    router.refresh();
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
          <h1 className="auth-title">Bem-vindo ao NutriAX Pro</h1>
          <p className="auth-subtitle">
            Acesse o painel profissional de nutrição
          </p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          {error && (
            <div className="form-error" style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {loading ? (
              <>
                <span className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Ainda não tem conta?{' '}
          <a href="/register">Criar conta</a>
        </div>
      </div>
    </div>
  );
}
