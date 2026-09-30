import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request:NextRequest){
 let response=NextResponse.next({request})
 const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}})
 const {data:{user}}=await supabase.auth.getUser()
 const publicAuthRoutes=['/login','/recuperar-senha','/redefinir-senha']
 const isPublicAuthRoute=publicAuthRoutes.includes(request.nextUrl.pathname)
 const isLogin=request.nextUrl.pathname==='/login'
 if(!user&&!isPublicAuthRoute){const url=request.nextUrl.clone();url.pathname='/login';return NextResponse.redirect(url)}
 if(user&&isLogin){const url=request.nextUrl.clone();url.pathname='/dashboard';return NextResponse.redirect(url)}
 return response
}

// Arquivos públicos precisam ficar fora do middleware de autenticação.
// Antes, JPGs como /login-verbo-v2.jpg eram interceptados e redirecionados
// para /login quando não havia sessão, fazendo a imagem quebrar justamente antes do login.
export const config={matcher:['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)']}
