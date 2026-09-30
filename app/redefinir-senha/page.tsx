'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

export default function RedefinirSenha() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function prepareSession() {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && active) setError('Este link de recuperação é inválido ou expirou. Solicite um novo link.');
        if (active) setReady(!error);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (active) {
        if (data.session) setReady(true);
        else setError('Este link de recuperação é inválido ou expirou. Solicite um novo link.');
      }
    }

    prepareSession();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('A nova senha deve ter pelo menos 8 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError('Não foi possível alterar a senha. Solicite um novo link de recuperação.'); return; }
    await supabase.auth.signOut();
    setSuccess(true);
  }

  return (
    <main className="login loginV09">
      <section className="loginV09Content" aria-label="Redefinição de senha">
        <div className="loginV09Form loginV10Recovery">
          {success ? (
            <div className="loginV10Message">
              <div className="loginV10SuccessIcon">✓</div>
              <h1>Senha alterada</h1>
              <p className="loginV09Description">Sua nova senha foi cadastrada com sucesso. Agora você já pode entrar no sistema.</p>
              <Link href="/login" className="loginV09Button loginV10ButtonLink">Voltar para o login  →</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1>Crie uma nova senha</h1>
              <p className="loginV09Description">Digite uma nova senha com pelo menos 8 caracteres.</p>
              <div className="loginV09Input">
                <span aria-hidden="true">▣</span>
                <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={!ready} />
                <button type="button" className="loginV09Eye" onClick={() => setShowPassword(v => !v)}>{showPassword ? '◉' : '◎'}</button>
              </div>
              <div className="loginV09Input">
                <span aria-hidden="true">▣</span>
                <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={!ready} />
              </div>
              {error && <p className="loginV09Error" role="alert">{error}</p>}
              <button type="submit" disabled={loading || !ready} className="loginV09Button">{loading ? 'Alterando...' : 'Alterar senha  →'}</button>
              {!ready && !error && <p className="loginV10Hint">Validando link de recuperação...</p>}
              <Link href="/login" className="loginV09Forgot">← Voltar para o login</Link>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
