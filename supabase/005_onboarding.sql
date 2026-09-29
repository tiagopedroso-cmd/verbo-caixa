-- v0.7 — controla a exibição automática do guia por usuário
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
-- Usuários existentes verão o guia uma vez no próximo acesso.
