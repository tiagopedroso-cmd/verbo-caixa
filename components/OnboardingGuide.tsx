'use client';
import {useEffect,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase-client';

const STORAGE_KEY='verbo-caixa-guide-step';
const steps=[
{title:'Bem-vindo ao Gestão de Caixa',text:'Este guia rápido mostra como registrar e acompanhar as movimentações do caixa em espécie.',path:'/dashboard'},
{title:'1. Novo lançamento',text:'Use “+ Novo lançamento” sempre que entrar ou sair dinheiro físico do caixa.',path:'/dashboard'},
{title:'2. Entrada ou saída',text:'Na tela de lançamento, escolha Entrada quando o dinheiro entrar no caixa e Saída quando houver retirada ou pagamento.',path:'/lancamentos'},
{title:'3. Data, valor e descrição',text:'Informe a data real da movimentação, o valor e uma descrição clara para facilitar conferências futuras.',path:'/lancamentos'},
{title:'4. Registrar lançamento',text:'Revise os dados antes de registrar. Depois de salvo, o lançamento passa a compor saldo, fluxo e relatórios.',path:'/lancamentos'},
{title:'5. Movimentações',text:'Consulte os registros realizados e use os filtros para localizar lançamentos específicos.',path:'/movimentacoes'},
{title:'6. Fluxo de caixa',text:'Acompanhe a evolução das entradas, saídas e do saldo ao longo do período.',path:'/fluxo-caixa'},
{title:'7. Relatórios',text:'Filtre por período, tipo ou usuário e exporte os dados quando precisar prestar contas ou conferir o caixa.',path:'/relatorios'},
{title:'Guia concluído',text:'Pronto! Você já conhece o fluxo principal. Este guia continua disponível no menu do seu usuário.',path:'/dashboard'}
];

export default function OnboardingGuide({open,onClose}:{open:boolean;onClose:()=>void}){
 const router=useRouter(),path=usePathname();
 const[step,setStep]=useState(0);
 useEffect(()=>{
   if(!open)return;
   const saved=Number(sessionStorage.getItem(STORAGE_KEY));
   setStep(Number.isInteger(saved)&&saved>=0&&saved<steps.length?saved:0);
 },[open]);
 if(!open)return null;
 const item=steps[step];
 async function finish(){
   sessionStorage.removeItem(STORAGE_KEY);
   try{const s=createClient();const{data:{user}}=await s.auth.getUser();if(user)await s.from('profiles').update({onboarding_completed:true}).eq('id',user.id)}catch{}
   onClose();
 }
 function move(n:number){
   const next=Math.max(0,Math.min(steps.length-1,step+n));
   sessionStorage.setItem(STORAGE_KEY,String(next));
   setStep(next);
   if(steps[next].path!==path)router.push(steps[next].path);
 }
 return <div className="guideBackdrop"><section className="guideCard" role="dialog" aria-modal="true" aria-label="Guia do sistema"><button className="guideClose" onClick={finish} aria-label="Fechar guia">×</button><div className="guideProgress"><span style={{width:`${((step+1)/steps.length)*100}%`}}/></div><small>GUIA DO SISTEMA · {step+1}/{steps.length}</small><h2>{item.title}</h2><p>{item.text}</p><div className="guideActions">{step>0?<button className="btn light" onClick={()=>move(-1)}>← Voltar</button>:<button className="btn light" onClick={finish}>Fechar guia</button>}<button className="btn" onClick={()=>step===steps.length-1?finish():move(1)}>{step===steps.length-1?'Concluir':'Seguir →'}</button></div></section></div>
}
