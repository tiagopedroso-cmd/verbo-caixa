'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <main className="login loginV09">
      <section className="loginV09Content" aria-label="Acesso ao sistema de gestão de caixa">
        <form className="loginV09Form" onSubmit={handleSubmit}>
          <h1>Bem-vindo</h1>
          <p className="loginV09Description">
            Acesse sua conta para continuar<br />
            no sistema de gestão de caixa<br />
            (em espécie) da Igreja Verbo da Vida.
          </p>

          <div className="loginV09Input">
            <span aria-hidden="true">✉</span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="E-mail"
            />
          </div>

          <div className="loginV09Input">
            <span aria-hidden="true">▣</span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Senha"
            />
            <button
              type="button"
              className="loginV09Eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? '◉' : '◎'}
            </button>
          </div>

          {error && <p className="loginV09Error" role="alert">{error}</p>}

          <button type="submit" disabled={loading} className="loginV09Button">
            {loading ? 'Entrando...' : 'Entrar  →'}
          </button>

          <button type="button" className="loginV09Forgot">Esqueceu sua senha?</button>
        </form>
      </section>
    </main>
  );
}
