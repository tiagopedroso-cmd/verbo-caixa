-- Verbo Caixa v0.3 — reforços de auditoria e consistência
-- Execute uma única vez após 002_auth_auditoria.sql.

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_touch_movimentacao on public.movimentacoes;
create trigger trg_touch_movimentacao before update on public.movimentacoes for each row execute procedure public.touch_updated_at();

-- Impede exclusão física de movimentações pelo frontend. Correções devem usar status=cancelado.
revoke delete on public.movimentacoes from authenticated;

-- Audita alterações de perfil feitas por administradores.
create or replace function public.audit_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.auditoria(usuario_id,acao,entidade,entidade_id,dados_anteriores,dados_novos)
  values(auth.uid(),'ALTEROU PERFIL','profile',new.id::text,to_jsonb(old),to_jsonb(new));
  return new;
end;$$;
drop trigger if exists trg_audit_profile on public.profiles;
create trigger trg_audit_profile after update on public.profiles for each row execute procedure public.audit_profile();
