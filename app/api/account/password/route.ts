import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

export async function POST(req:NextRequest){
  try{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!url||!anon||!service)return NextResponse.json({error:'Configuração do Supabase ausente.'},{status:500});
    const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
    if(!token)return NextResponse.json({error:'Não autorizado.'},{status:401});
    const authClient=createClient(url,anon,{auth:{persistSession:false}});
    const{data:{user},error}=await authClient.auth.getUser(token);
    if(error||!user)return NextResponse.json({error:'Sessão inválida.'},{status:401});
    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const{error:updateError}=await admin.from('profiles').update({must_change_password:false}).eq('id',user.id);
    if(updateError)return NextResponse.json({error:'Não foi possível concluir a troca obrigatória.'},{status:500});
    await admin.from('auditoria').insert({usuario_id:user.id,acao:'TROCA_SENHA_OBRIGATORIA',entidade:'profiles',entidade_id:user.id,dados_novos:{must_change_password:false}});
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:'Erro interno ao concluir a troca de senha.'},{status:500})}
}
