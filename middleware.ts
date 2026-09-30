import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request:NextRequest){
 let response=NextResponse.next({request})
 const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}})
 const {data:{user}}=await supabase.auth.getUser()
 const path=request.nextUrl.pathname
 const isLogin=path==='/login'
 const isForcedPassword=path==='/alterar-senha-obrigatoria'
 if(!user&&!isLogin){const url=request.nextUrl.clone();url.pathname='/login';return NextResponse.redirect(url)}
 if(user){
   const{data:profile}=await supabase.from('profiles').select('must_change_password').eq('id',user.id).single()
   if(profile?.must_change_password&&!isForcedPassword){const url=request.nextUrl.clone();url.pathname='/alterar-senha-obrigatoria';return NextResponse.redirect(url)}
   if(!profile?.must_change_password&&isForcedPassword){const url=request.nextUrl.clone();url.pathname='/dashboard';return NextResponse.redirect(url)}
   if(isLogin){const url=request.nextUrl.clone();url.pathname='/dashboard';return NextResponse.redirect(url)}
 }
 return response
}
export const config={matcher:['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)']}
