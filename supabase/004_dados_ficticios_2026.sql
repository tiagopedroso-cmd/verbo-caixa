-- DADOS FICTÍCIOS PARA TESTES — ANO DE 2026
-- Execute uma única vez no SQL Editor do Supabase.
-- Usa o primeiro perfil administrador como responsável pelos lançamentos.
DO $$
DECLARE admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM public.profiles WHERE role='admin' AND ativo=true ORDER BY created_at LIMIT 1;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Nenhum administrador ativo encontrado.'; END IF;

  INSERT INTO public.movimentacoes(tipo,valor,descricao,data_movimentacao,usuario_id,status)
  SELECT
    CASE WHEN extract(day from d)::int % 3 = 0 THEN 'saida'::public.movement_type ELSE 'entrada'::public.movement_type END,
    CASE WHEN extract(day from d)::int % 3 = 0
      THEN (180 + (extract(month from d)::numeric * 37) + (extract(day from d)::numeric * 4.25))
      ELSE (650 + (extract(month from d)::numeric * 95) + (extract(day from d)::numeric * 11.50)) END,
    CASE WHEN extract(day from d)::int % 3 = 0
      THEN '[TESTE 2026] Despesa operacional / material'
      ELSE '[TESTE 2026] Oferta, dízimo ou evento' END,
    d + interval '19 hours', admin_id, 'ativo'
  FROM generate_series('2026-01-03'::date,'2026-12-28'::date,interval '5 days') d
  WHERE NOT EXISTS (
    SELECT 1 FROM public.movimentacoes m
    WHERE m.descricao LIKE '[TESTE 2026]%' AND m.data_movimentacao::date=d::date
  );
END $$;

-- Para remover todos os dados fictícios depois dos testes:
-- DELETE FROM public.movimentacoes WHERE descricao LIKE '[TESTE 2026]%';
