-- Execute após o schema.sql
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,nome,role,ativo) values(new.id,coalesce(new.raw_user_meta_data->>'nome',split_part(new.email,'@',1)),'operador',true)
  on conflict(id) do nothing;
  return new;
end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Garante perfil para usuários que tenham sido criados antes desta migration
insert into public.profiles(id,nome,role,ativo)
select id,coalesce(raw_user_meta_data->>'nome',split_part(email,'@',1)),'operador',true from auth.users
on conflict(id) do nothing;

create or replace function public.current_role() returns public.user_role language sql stable security definer set search_path=public as $$select role from public.profiles where id=auth.uid()$$;

-- políticas mais restritivas
drop policy if exists "authenticated profiles" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using(true);
create policy "admins update profiles" on public.profiles for update to authenticated using(public.current_role()='admin') with check(public.current_role()='admin');

drop policy if exists "authenticated movements read" on public.movimentacoes;
drop policy if exists "authenticated movements insert" on public.movimentacoes;
create policy "movements read" on public.movimentacoes for select to authenticated using(true);
create policy "movements insert own" on public.movimentacoes for insert to authenticated with check(auth.uid()=usuario_id and exists(select 1 from public.profiles p where p.id=auth.uid() and p.ativo));
create policy "movements update treasury" on public.movimentacoes for update to authenticated using(public.current_role() in ('admin','tesouraria')) with check(public.current_role() in ('admin','tesouraria'));

drop policy if exists "authenticated audit read" on public.auditoria;
create policy "audit read treasury" on public.auditoria for select to authenticated using(public.current_role() in ('admin','tesouraria'));

create or replace function public.audit_movimentacao() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_op='INSERT' then
   insert into public.auditoria(usuario_id,acao,entidade,entidade_id,dados_novos) values(auth.uid(),'CRIOU','movimentacao',new.id::text,to_jsonb(new)); return new;
 elsif tg_op='UPDATE' then
   insert into public.auditoria(usuario_id,acao,entidade,entidade_id,dados_anteriores,dados_novos) values(auth.uid(),'ALTEROU','movimentacao',new.id::text,to_jsonb(old),to_jsonb(new)); return new;
 end if; return null;
end;$$;
drop trigger if exists trg_audit_movimentacao on public.movimentacoes;
create trigger trg_audit_movimentacao after insert or update on public.movimentacoes for each row execute procedure public.audit_movimentacao();

create index if not exists idx_mov_data on public.movimentacoes(data_movimentacao desc);
create index if not exists idx_mov_usuario on public.movimentacoes(usuario_id);
create index if not exists idx_audit_created on public.auditoria(created_at desc);
