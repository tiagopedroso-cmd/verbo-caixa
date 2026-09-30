-- v0.11 - senha temporaria administrada
alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

-- Usuários existentes não são forçados a trocar a senha.
update public.profiles
set must_change_password = false
where must_change_password is null;
