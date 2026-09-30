import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

export async function POST(req:NextRequest){
  try{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!url||!anon||!service)return NextResponse.json({error:'Configuração administrativa do Supabase ausente.'},{status:500});

    const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
    if(!token)return NextResponse.json({error:'Não autorizado.'},{status:401});

    const authClient=createClient(url,anon,{auth:{persistSession:false}});
    const{data:{user},error:userError}=await authClient.auth.getUser(token);
    if(userError||!user)return NextResponse.json({error:'Sessão inválida.'},{status:401});

    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const{data:profile}=await admin.from('profiles').select('role,ativo').eq('id',user.id).single();
    if(!profile?.ativo||profile.role!=='admin')return NextResponse.json({error:'Apenas administradores podem redefinir senhas.'},{status:403});

    const body=await req.json();
    const userId=String(body.userId||'');
    const password=String(body.password||'');
    if(!userId||password.length<8)return NextResponse.json({error:'Informe uma senha temporária com pelo menos 8 caracteres.'},{status:400});
    if(userId===user.id)return NextResponse.json({error:'Para alterar sua própria senha, use Minha conta.'},{status:400});

    const{error:authError}=await admin.auth.admin.updateUserById(userId,{password});
    if(authError)return NextResponse.json({error:authError.message},{status:400});

    const{error:profileError}=await admin.from('profiles').update({must_change_password:true}).eq('id',userId);
    if(profileError)return NextResponse.json({error:'Senha alterada, mas não foi possível exigir a troca no próximo acesso.'},{status:500});

    await admin.from('auditoria').insert({
      usuario_id:user.id,
      acao:'REDEFINICAO_SENHA_TEMPORARIA',
      entidade:'profiles',
      entidade_id:userId,
      dados_novos:{must_change_password:true}
    });
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:'Erro interno ao redefinir a senha.'},{status:500})}
}
