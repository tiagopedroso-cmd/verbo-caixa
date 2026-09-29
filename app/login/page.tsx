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

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <main className="login">
      <section className="loginbox">

        {/* IMAGEM LATERAL */}
        <div className="loginhero">
          <img
            src="/login-verbo-v2.jpg?v=2"
            alt="Igreja Verbo da Vida"
          />
        </div>

        {/* FORMULÁRIO */}
        <form
          className="loginform"
          onSubmit={handleSubmit}
        >
          <span
            className="accentLine"
            aria-hidden="true"
          />

          <h1>Bem-vindo</h1>

          <p className="loginDescription">
            Acesse sua conta para continuar
            <br />
            no sistema de gestão de caixa
            <br />
            (em espécie) da Igreja Verbo da Vida.
          </p>

          {/* E-MAIL */}
          <div className="loginField">
            <label htmlFor="email">
              E-mail
            </label>

            <div className="loginInput">
              <span
                className="loginInputIcon"
                aria-hidden="true"
              >
                ✉
              </span>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* SENHA */}
          <div className="loginField">
            <label htmlFor="password">
              Senha
            </label>

            <div className="loginInput">
              <span
                className="loginInputIcon"
                aria-hidden="true"
              >
                ♙
              </span>

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="passwordToggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? 'Ocultar senha'
                    : 'Mostrar senha'
                }
              >
                {showPassword ? '◉' : '◎'}
              </button>
            </div>
          </div>

          {/* ERRO */}
          {error && (
            <p
              className="loginError"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* ENTRAR */}
          <button
            type="submit"
            disabled={loading}
            className="loginBtn"
          >
            {loading
              ? 'Entrando...'
              : 'Entrar  →'}
          </button>

          {/* RECUPERAR SENHA */}
          <button
            type="button"
            className="forgot"
          >
            Esqueceu sua senha?
          </button>

        </form>
      </section>
    </main>
  );
}