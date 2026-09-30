'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase-client';

export default function AlterarSenhaObrigatoria(){
  const router=useRouter();
  const[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[show,setShow]=useState(false),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false);
  async function submit(e:FormEvent){
    e.preventDefault();setMsg('');
    if(password.length<8){setMsg('A nova senha deve ter pelo menos 8 caracteres.');return}
    if(password!==confirm){setMsg('As senhas não coincidem.');return}
    setLoading(true);const s=createClient();
    const{error}=await s.auth.updateUser({password});
    if(error){setLoading(false);setMsg('Não foi possível alterar a senha. Tente novamente.');return}
    const{data:{session}}=await s.auth.getSession();
    if(!session){setLoading(false);setMsg('Sua sessão expirou. Entre novamente.');return}
    const res=await fetch('/api/account/password',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`}});
    const body=await res.json();setLoading(false);
    if(!res.ok){setMsg(body.error||'Não foi possível concluir a troca.');return}
    router.replace('/dashboard');router.refresh();
  }
  async function logout(){await createClient().auth.signOut();router.replace('/login');router.refresh()}
  return <main className="login loginV09"><section className="loginV09Content"><form className="loginV09Form" onSubmit={submit}><h1>Crie sua nova senha</h1><p className="loginV09Description">Por segurança, a senha fornecida pelo administrador é temporária.<br/>Defina uma senha pessoal para continuar.</p><div className="loginV09Input"><span>▣</span><input type={show?'text':'password'} minLength={8} placeholder="Nova senha" value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" className="loginV09Eye" onClick={()=>setShow(v=>!v)}>{show?'◉':'◎'}</button></div><div className="loginV09Input"><span>▣</span><input type={show?'text':'password'} minLength={8} placeholder="Confirmar nova senha" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></div>{msg&&<p className="loginV09Error" role="alert">{msg}</p>}<button className="loginV09Button" disabled={loading}>{loading?'Salvando...':'Criar nova senha  →'}</button><button type="button" className="loginV09Forgot loginLinkButton" onClick={logout}>Sair da conta</button></form></section></main>
}
