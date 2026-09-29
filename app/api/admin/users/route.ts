import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export async function POST(req:NextRequest){
  try{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!url||!anon||!service)return NextResponse.json({error:'Configuração administrativa do Supabase ausente.'},{status:500});
    const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token)return NextResponse.json({error:'Não autorizado.'},{status:401});
    const authClient=createClient(url,anon,{auth:{persistSession:false}});const{data:{user},error:userError}=await authClient.auth.getUser(token);if(userError||!user)return NextResponse.json({error:'Sessão inválida.'},{status:401});
    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});const{data:profile}=await admin.from('profiles').select('role,ativo').eq('id',user.id).single();if(!profile?.ativo||profile.role!=='admin')return NextResponse.json({error:'Apenas administradores podem criar usuários.'},{status:403});
    const body=await req.json();const nome=String(body.nome||'').trim(),email=String(body.email||'').trim().toLowerCase(),password=String(body.password||''),role=['admin','tesouraria','operador'].includes(body.role)?body.role:'operador';
    if(!nome||!email||password.length<8)return NextResponse.json({error:'Preencha nome, e-mail e uma senha com pelo menos 8 caracteres.'},{status:400});
    const{data:created,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{nome}});if(error)return NextResponse.json({error:error.message},{status:400});
    if(created.user)await admin.from('profiles').upsert({id:created.user.id,nome,role,ativo:true},{onConflict:'id'});
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:'Erro interno ao criar usuário.'},{status:500})}
}
