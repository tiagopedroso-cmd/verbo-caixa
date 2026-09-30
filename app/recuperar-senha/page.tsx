'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    const redirectTo = `${window.location.origin}/redefinir-senha`;
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);

    if (error) {
      setError('Não foi possível enviar o link agora. Tente novamente em alguns minutos.');
      return;
    }
    setSent(true);
  }

  return (
    <main className="login loginV09">
      <section className="loginV09Content" aria-label="Recuperação de senha">
        <div className="loginV09Form loginV10Recovery">
          {!sent ? (
            <form onSubmit={handleSubmit}>
              <h1>Recuperar senha</h1>
              <p className="loginV09Description">Informe o e-mail cadastrado no sistema. Enviaremos um link para você criar uma nova senha.</p>
              <div className="loginV09Input">
                <span aria-hidden="true">✉</span>
                <input type="email" autoComplete="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="E-mail" />
              </div>
              {error && <p className="loginV09Error" role="alert">{error}</p>}
              <button type="submit" disabled={loading} className="loginV09Button">{loading ? 'Enviando...' : 'Enviar link de recuperação  →'}</button>
              <Link href="/login" className="loginV09Forgot">← Voltar para o login</Link>
            </form>
          ) : (
            <div className="loginV10Message">
              <div className="loginV10SuccessIcon">✓</div>
              <h1>Verifique seu e-mail</h1>
              <p className="loginV09Description">Se o endereço estiver cadastrado, você receberá um link para redefinir sua senha.</p>
              <button type="button" className="loginV09Button" onClick={() => setSent(false)}>Enviar novamente</button>
              <Link href="/login" className="loginV09Forgot">← Voltar para o login</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
