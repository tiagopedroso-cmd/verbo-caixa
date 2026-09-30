-- v0.12: separacao entre notas e moedas + reforco do primeiro acesso
alter table public.movimentacoes add column if not exists forma_especie text not null default 'nota';
alter table public.movimentacoes drop constraint if exists movimentacoes_forma_especie_check;
alter table public.movimentacoes add constraint movimentacoes_forma_especie_check check (forma_especie in ('nota','moeda'));

-- Lançamentos anteriores ficam como notas; uma amostra dos dados fictícios vira moedas para teste.
update public.movimentacoes set forma_especie='nota' where forma_especie is null or forma_especie not in ('nota','moeda');
update public.movimentacoes set forma_especie='moeda' where descricao ilike '%[TESTE 2026]%' and mod(id,4)=0;
update public.movimentacoes set forma_especie='nota' where descricao ilike '%[TESTE 2026]%' and mod(id,4)<>0;

-- Reforço: novos profiles exigem troca de senha por padrão.
alter table public.profiles alter column must_change_password set default true;
