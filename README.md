# Verbo Caixa v0.5 — Responsividade e imagens

Correções desta versão:
- imagens renderizadas de forma explícita e estável no desktop e mobile;
- logo transparente na sidebar, sem quadrado branco;
- favicon/logo da igreja na guia do navegador;
- login responsivo com hero no topo em celular;
- sidebar off-canvas corrigida;
- dashboard, cards, filtros, lançamentos e fluxo adaptados para tablet/celular;
- tabelas com rolagem horizontal segura em telas pequenas;
- correções de overflow e larguras.

## Rodar
1. Copie seu `.env.local` para a raiz.
2. `npm install`
3. `npm run dev`

Não há novo SQL nesta versão.

## v0.6 — configuração adicional
Para criar usuários pelo painel, configure `SUPABASE_SERVICE_ROLE_KEY` somente no servidor/Vercel (Secret, sem prefixo NEXT_PUBLIC). Nunca exponha essa chave no navegador.

Para popular o ano de 2026 com dados fictícios de teste, execute `supabase/004_dados_ficticios_2026.sql` uma vez no SQL Editor do Supabase. Os registros ficam identificados com `[TESTE 2026]`.
