---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# Caderninho - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Caderninho, decomposing the requirements from the PRD, UX Design and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: O usuario pode cadastrar contas bancarias com nome, banco e saldo inicial
FR2: O usuario pode cadastrar cartoes de credito com nome, bandeira, limite total, data de fechamento e data de vencimento da fatura
FR3: O usuario pode cadastrar investimentos com nome, instituicao, tipo, saldo atual, data de atualizacao e data de vencimento opcional
FR4: O usuario pode cadastrar fontes de receita com nome, tipo de vinculo, recorrencia, valor base mensal e dia habitual de pagamento
FR5: O usuario pode cadastrar classificacoes, categorias, subcategorias e estabelecimentos em estrutura hierarquica (FR38). Cada nivel pode ter, opcionalmente, orcamento mensal planejado (valor fixo ou faixa) e metodo de pagamento padrao. Ex.: Essenciais -> Alimentacao (R$5.500) -> Supermercado (R$2.500 a R$3.000, Latam Pass) -> Pao de Acucar
FR6: O usuario pode editar qualquer item da estrutura financeira. Exclusao funciona como arquivamento
FR7: O usuario pode visualizar o saldo atualizado de cada conta bancaria
FR8: O usuario pode visualizar de cada cartao de credito: limite total, utilizado, disponivel, fatura estimada do ciclo atual, utilizado liquido e parcelas futuras agrupadas por mes de referencia
FR9: O usuario pode registrar transacoes de saida (gastos) com valor, categoria, subcategoria, estabelecimento/contexto e metodo de pagamento
FR10: O usuario pode registrar transacoes de entrada (receitas) com valor, origem e conta de destino
FR11: O usuario pode registrar gastos parcelados no cartao de credito com numero de parcelas, gerando parcelas automaticas com contagem regressiva
FR12: O usuario pode associar cada transacao a um metodo de pagamento especifico (cartao de credito, debito, Pix, Flash)
FR13: O sistema exibe feedback do impacto da transacao antes da confirmacao — saldo/limite restante e consumo dos orcamentos afetados (cada nivel da hierarquia da transacao com orcamento definido) (< 500ms)
FR14: O usuario pode registrar estabelecimentos e o sistema sugere os 5 estabelecimentos mais utilizados na subcategoria (ultimos 90 dias)
FR15: O usuario pode editar qualquer transacao registrada
FR16: O usuario pode excluir transacoes registradas
FR17: O sistema recalcula todos os totalizadores, saldos e orcamentos ao registrar, editar ou excluir transacoes (< 500ms)
FR18: O usuario pode cadastrar gastos recorrentes mensais do tipo fixo imutavel
FR19: O usuario pode cadastrar gastos recorrentes mensais do tipo variavel com base
FR20: O usuario pode cadastrar gastos recorrentes mensais do tipo fixo minimo + variavel
FR21: O usuario pode cadastrar gastos recorrentes nao-mensais com frequencia fixa, a cada N meses, ou anual com mes fixo
FR22: O sistema posiciona automaticamente os gastos recorrentes nao-mensais na timeline de projecao futura. Horizonte configuravel ate 5 anos (60 meses) para fluxo de caixa e ate 10 anos (120 meses) para projecao de investimentos
FR23: O sistema gera automaticamente a checklist do mes com todos os gastos recorrentes categorizados por tipo de pagamento
FR24: O sistema aplica confirmacao diferenciada por tipo de conta
FR25: O usuario pode atualizar o valor real de gastos variaveis conforme as informacoes chegam
FR26: O sistema exibe o progresso da checklist mensal (X de Y contas confirmadas)
FR27: O usuario pode visualizar a visao "o que falta pagar"
FR28: O sistema notifica o usuario em 3 momentos para cada conta: 1 dia antes, no dia, e quando atrasa
FR29: O usuario pode marcar contas como pagas a partir da notificacao ou dentro do app
FR30: O usuario pode visualizar o total gasto no mes por nivel da hierarquia (classificacao, categoria, subcategoria) com barra de progresso quando houver orcamento
FR31: O usuario pode fazer drill-down de uma categoria para ver distribuicao por subcategoria e estabelecimento
FR32: O usuario pode visualizar o total de contas a pagar restantes no mes
FR33: O usuario pode visualizar a Regra de Ouro: comprometimento em cartoes vs. saldo disponivel
FR34: O sistema atualiza o dashboard quando outro usuario registra, edita ou exclui transacoes (< 2s)
FR35: O usuario pode visualizar a timeline de parcelas ativas com cartao associado, parcela atual/total e data de termino
FR36: O sistema exibe quando uma parcela termina e quanto de orcamento sera liberado mensalmente
FR37: O sistema exibe os gastos recorrentes nao-mensais posicionados na timeline com valor estimado e data prevista
FR38: O usuario pode organizar gastos em hierarquia de ate 4 niveis: classificacao de essencialidade (ex.: Essenciais) -> categoria, o grande grupo (ex.: Alimentacao, Transporte) -> subcategoria, o tipo de gasto (ex.: Supermercado, Gasolina, Pedagio) -> estabelecimento, onde gastou (ex.: Pao de Acucar). Toda transacao de gasto tem classificacao, categoria e subcategoria; o estabelecimento e opcional
FR39: O sistema oferece classificacoes de essencialidade padrao iniciais (7 classificacoes)
FR40: O usuario pode criar, renomear, mesclar e arquivar classificacoes de essencialidade
FR41: O usuario pode reclassificar uma categoria com efeito retroativo em todas as visualizacoes
FR42: O sistema recalcula todas as analises e graficos ao alterar a classificacao de uma categoria (< 500ms)
FR43: O usuario pode fazer drill-down analitico seguindo a hierarquia completa
FR44: (Fase 2) O usuario pode definir metas financeiras familiares baseadas nas classificacoes de essencialidade
FR45: O usuario pode criar conta via login social ou email/senha
FR46: O usuario pode fazer login com sessao persistente e logout com encerramento completo da sessao
FR47: O usuario pode conceder permissoes a outro usuario com dois modos: acesso total ou acesso configuravel por tipo de dado
FR48: O usuario pode revogar permissoes concedidas a qualquer momento
FR49: Dados de um usuario sao visiveis apenas para ele ate que ele conceda acesso explicito
FR50: O sistema registra trilha de auditoria imutavel para toda acao
FR51: O administrador pode visualizar todos os usuarios cadastrados com status, data de criacao e ultimo acesso
FR52: O administrador pode impersonar qualquer usuario nos ambientes de teste e homologacao
FR53: O administrador pode restaurar a base de dados de producao para ambientes de teste ou homologacao (< 30 minutos)
FR54: O sistema bloqueia impersonation no ambiente de producao
FR55: O usuario pode iniciar a reconciliacao de fatura de um cartao inserindo o valor real da fatura
FR56: No fechamento do mes, o sistema apresenta o saldo final e o usuario registra destino da sobra ou origem da cobertura
FR57: O administrador pode visualizar o status dos backups e acionar restauracao manual
FR58: O usuario pode registrar transferencias entre contas proprias e entre membros — nao contabilizadas como receita nem despesa
FR59: O usuario pode tocar/clicar em qualquer valor exibido no dashboard para ver composicao e origem
FR60: O sistema acompanha gasto realizado vs. orcamento planejado em cada nivel com orcamento e exibe o valor disponivel livre
FR61: O usuario pode configurar quais widgets exibir no dashboard e filtrar por perspectiva
FR62: O sistema calcula e exibe a margem disponivel projetada por mes
FR63: O sistema exibe mensagem de erro especifica quando uma operacao falha, preserva os dados digitados e oferece opcao de retry
FR64: O sistema atribui automaticamente o mes de referencia a cada transacao de cartao baseado na data de fechamento
FR65: O sistema calcula a fatura estimada do ciclo atual somando todas as transacoes cujo mes de referencia corresponde ao ciclo
FR66: Ao confirmar a reconciliacao de fatura, o sistema gera automaticamente uma conta a pagar no checklist mensal
FR67: Apos o pagamento da fatura anterior, o sistema recalcula as metricas do cartao
FR68: O usuario pode desmarcar transacoes durante a reconciliacao que nao apareceram na fatura real
FR69: O usuario pode adicionar transacoes nao registradas diretamente na tela de reconciliacao
FR70: O sistema exibe a diferenca entre o total reconciliado e o valor real da fatura em tempo real durante a reconciliacao
FR71: O usuario pode definir, opcionalmente, metodo de pagamento padrao em qualquer nivel da hierarquia. No registro, o metodo e preenchido do nivel mais especifico ao mais geral (estabelecimento -> subcategoria -> categoria -> classificacao): em cada nivel, o definido; senao, o habito (3 ultimos registros com o mesmo metodo); senao, sobe um nivel. Atalhos 'ultimo usado' e 'padrao do nivel acima'. Apos 90 dias como o mais usado num nivel, sugere defini-lo como padrao
FR72: Quando um nivel tem orcamento e niveis abaixo tambem tem, o sistema exibe o saldo nao alocado. Nivel sem orcamento exibe barra neutra com percentual relativo ao nivel acima

### NonFunctional Requirements

NFR-P1: Carregamento inicial do dashboard: < 2 segundos apos login
NFR-P2: Registro de transacao (fluxo cascata completo): feedback visual em < 100ms, confirmacao do servidor em < 1 segundo
NFR-P3: Recalculo de totalizadores, saldos e orcamentos apos registro/edicao/exclusao: < 500ms
NFR-P4: Propagacao real-time para outros usuarios conectados: < 2 segundos
NFR-P5: Navegacao entre telas: transicao em < 300ms, sem recarregamento de pagina
NFR-P6: Drill-down analitico (essencialidade -> categoria -> subcategoria -> estabelecimento): < 1 segundo por nivel
NFR-P7: Checklist mensal e visao "o que falta pagar": carregamento < 1 segundo
NFR-S1: Sessoes com expiracao (default: 7 dias, configuravel) e renovacao automatica
NFR-S2: HTTPS obrigatorio em todos os ambientes
NFR-S3: Dados financeiros criptografados em repouso com AES-256 ou equivalente
NFR-S4: Protecao contra ataques comuns: CSRF, XSS, SQL injection, brute force. Passar scan OWASP Top 10 sem vulnerabilidades criticas ou altas
NFR-C1: Disponibilidade alvo: 99.5%
NFR-C2: Backup automatico diario com retencao minima de 90 dias
NFR-C3: Backup completo semanal com retencao de 1 ano
NFR-C4: Recuperacao de backup testavel — RTO < 4 horas, RPO < 24 horas
NFR-C5: Zero perda de dados transacionais — toda transacao confirmada e persistida de forma duravel
NFR-M1: Nenhum componente de apresentacao acessa diretamente a camada de persistencia; toda comunicacao via servicos/APIs internas
NFR-M2: Tres ambientes isolados (testes, homologacao, producao) com deploy controlado
NFR-M3: Restauracao de base de producao para ambientes nao-producao em < 30 minutos
NFR-M4: Cada modulo de dominio em diretorio proprio, sem dependencias circulares entre modulos
NFR-U1: Registro de transacao no celular: < 10 segundos (meta: ~5 segundos)
NFR-U2: Linguagem visual consistente: mesmos componentes, cores, tipografia e padroes de interacao em todas as telas, seguindo um design system unificado
NFR-U3: Tamires localiza o status de gastos do mes e responde "a gente pode gastar X?" em < 30 segundos no primeiro uso sem instrucao
NFR-U4: Feedback visual para toda acao: confirmacao de sucesso em < 1 segundo, alertas com acao sugerida, erros com descricao do problema e opcao de retry

### Additional Requirements

**Da Arquitetura:**
- Starter template: create-next-app com TypeScript, Tailwind, ESLint, App Router, src-dir, Turbopack — deve ser a primeira story de implementacao
- Stack completo: Next.js 16 + Supabase (PostgreSQL) + Drizzle ORM + Better Auth (Organizations) + Supabase Realtime + Vitest + Playwright + shadcn/ui
- Precisao financeira: valores monetarios em centavos (inteiros), percentuais com 2 casas (inteiros), sem floating point em nenhuma operacao financeira
- Autorizacao em 2 camadas obrigatorias: RLS no PostgreSQL + Middleware de autorizacao na aplicacao (defesa em profundidade)
- Server Actions como padrao de comunicacao cliente-servidor (sem REST manual)
- Result Pattern para erros de negocio (nunca throw para erros esperados)
- Clean Architecture + DDD com separacao explicita server/ vs client/
- TDD obrigatorio: teste primeiro, implementa depois, refatora (Red-Green-Refactor)
- 3 ambientes isolados: Development (Supabase CLI + Docker local), Staging (Vercel preview + Supabase staging), Production (Vercel + Supabase producao)
- CI/CD: GitHub Actions (lint + type-check + testes) + Vercel (deploy automatico)
- Trilha de auditoria imutavel (tabela audit_log, somente INSERT) em toda mutacao
- README como single source of truth operacional
- Naming conventions: snake_case no banco, camelCase no TypeScript, PascalCase para componentes e tipos, kebab-case para rotas e pastas
- 11 dominios DDD mapeados: accounts, transactions, credit-cards, recurring, checklist, categories, budgets, notifications, users, admin, reconciliation
- Sequencia de implementacao recomendada: projeto -> banco -> auth -> infraestrutura transversal -> dominios de negocio -> real-time -> CI/CD -> README

**Da UX:**
- 14 componentes customizados a criar: CascadeInput, BudgetProgressBar, TapToTracePanel, GoldenRuleGauge, SpendingTreemap, HorizontalRollerPicker, MonthChecklist, BillNotificationSystem, CreditCardDetail, FaturaReconciliation, GravityScale, SummaryCard, BottomNavigation, ImpactPreview
- Design tokens: paleta Stone & Indigo, fonte Inter (tabular-nums obrigatorio para valores financeiros), espacamento base 4px
- Densidade configuravel pelo usuario (Compacto para desktop/power user, Espacado para mobile/consulta)
- Sidebar colapsavel (desktop 220px / tablet 60px) + Bottom Navigation com FAB central (mobile 56px)
- 3 breakpoints: mobile < 768px, tablet 768-1023px, desktop >= 1024px
- View Modes: Cards (grid uniforme 2 colunas), Mapa (treemap proporcional), Lista (tabela ordenavel), Timeline (eixo temporal)
- Acessibilidade WCAG 2.1 AA com ARIA roles por componente
- Prototipos HTML como fonte da verdade visual (15 prototipos)
- PWA: manifest.json + service worker para cache basico + "Adicionar a tela inicial"

**Regras de Processo (acordadas com o usuario):**
- UX valida obrigatoriamente toda tela e/ou componente visual desenvolvido pelo dev — nenhum componente visual e considerado "done" sem validacao da UX
- Dev obrigatoriamente valida contra o prototipo HTML correspondente antes de considerar pronto — prototipos sao a fonte da verdade visual
- Cada story: branch a partir de `staging` -> PR para `staging` -> validacao em staging (atualizado em 2026-11-15)
- Ao finalizar o epico, sem pendencias em staging: PR `staging` -> `main` (merge commit, nunca squash; nao apagar `staging`) -> validacao em producao

### FR Coverage Map

FR1: Epic 2 — Cadastro de contas bancarias
FR2: Epic 2 — Cadastro de cartoes de credito (estrutura)
FR3: Epic 2 — Cadastro de investimentos
FR4: Epic 2 — Cadastro de fontes de receita
FR5: Epic 2 — Cadastro da hierarquia | Epic 3 (Story 3.5) — orcamento e metodo opcionais nos 4 niveis
FR6: Epic 2 — Edicao e arquivamento de itens da estrutura financeira
FR7: Epic 2 — Visualizacao de saldo atualizado de contas
FR8: Epic 5 — Metricas calculadas do cartao de credito (utilizado, disponivel, fatura estimada, utilizado liquido)
FR9: Epic 3 — Registro de transacoes de saida (gastos)
FR10: Epic 3 — Registro de transacoes de entrada (receitas)
FR11: Epic 5 — Registro de gastos parcelados no cartao com parcelas automaticas e mes de referencia
FR12: Epic 3 — Associacao de transacao a metodo de pagamento
FR13: Epic 3 — Feedback de impacto antes da confirmacao
FR14: Epic 3 — Sugestao de estabelecimentos frequentes por subcategoria
FR15: Epic 3 — Edicao de transacoes
FR16: Epic 3 — Exclusao de transacoes
FR17: Epic 3 — Recalculo de totalizadores apos registro/edicao/exclusao
FR18: Epic 4 — Gastos recorrentes mensais tipo fixo imutavel
FR19: Epic 4 — Gastos recorrentes mensais tipo variavel com base
FR20: Epic 4 — Gastos recorrentes mensais tipo fixo minimo + variavel
FR21: Epic 4 — Gastos recorrentes nao-mensais com frequencia configuravel
FR22: Epic 4 — Posicionamento automatico de recorrentes nao-mensais na timeline
FR23: Epic 4 — Geracao automatica da checklist mensal
FR24: Epic 4 — Confirmacao diferenciada por tipo de conta
FR25: Epic 4 — Atualizacao de valor real de gastos variaveis
FR26: Epic 4 — Progresso da checklist mensal
FR27: Epic 4 — Visao "o que falta pagar"
FR28: Epic 4 — Notificacoes em 3 momentos (vespera, dia, atraso)
FR29: Epic 4 — Marcar contas como pagas via notificacao ou app
FR30: Epic 6 — Total gasto por nivel da hierarquia com barra de progresso
FR31: Epic 6 — Drill-down por subcategoria e estabelecimento
FR32: Epic 6 — Total de contas a pagar restantes no mes
FR33: Epic 6 — Regra de Ouro (cartoes vs. saldo)
FR34: Epic 6 — Atualizacao real-time do dashboard
FR35: Epic 7 — Timeline de parcelas ativas
FR36: Epic 7 — Indicador de termino de parcela e liberacao de orcamento
FR37: Epic 7 — Gastos recorrentes nao-mensais na timeline
FR38: Epic 2 — Hierarquia de 4 niveis (essencialidade -> categoria -> subcategoria -> estabelecimento)
FR39: Epic 2 — Classificacoes de essencialidade padrao (7 classificacoes)
FR40: Epic 2 — CRUD de classificacoes de essencialidade
FR41: Epic 3 — Reclassificacao retroativa de categorias
FR42: Epic 3 — Recalculo de analises apos reclassificacao
FR43: Epic 6 — Drill-down analitico pela hierarquia completa
FR44: Fase 2 — Metas financeiras por classificacao de essencialidade (excluido do MVP)
FR45: Epic 1 — Criacao de conta via login social ou email/senha
FR46: Epic 1 — Login com sessao persistente e logout
FR47: Epic 8 — Concessao de permissoes com dois modos
FR48: Epic 8 — Revogacao de permissoes
FR49: Epic 8 — Dados visiveis apenas para o dono ate concessao explicita
FR50: Epic 1 — Trilha de auditoria imutavel
FR51: Epic 9 — Visualizacao de usuarios cadastrados
FR52: Epic 9 — Impersonation em ambientes nao-producao
FR53: Epic 9 — Restauracao de base de producao para outros ambientes
FR54: Epic 9 — Bloqueio de impersonation em producao
FR55: Epic 5 — Inicio de reconciliacao de fatura
FR56: Epic 5 — Fechamento de mes com saldo final
FR57: Epic 9 — Monitoramento de backups
FR58: Epic 3 — Transferencias entre contas (nao contabilizadas como receita/despesa)
FR59: Epic 6 — Tap to trace (composicao e origem de qualquer valor)
FR60: Epic 3 — Acompanhamento de orcamento realizado vs. planejado
FR61: Epic 6 — Dashboard configuravel com filtro de perspectiva
FR62: Epic 7 — Margem disponivel projetada por mes
FR63: Epic 6 — Mensagem de erro especifica com retry
FR64: Epic 5 — Mes de referencia automatico por transacao de cartao
FR65: Epic 5 — Fatura estimada do ciclo atual
FR66: Epic 5 — Fatura confirmada gera conta a pagar no checklist
FR67: Epic 5 — Recalculo de metricas apos pagamento de fatura
FR68: Epic 5 — Desmarcar transacoes na reconciliacao
FR69: Epic 5 — Adicionar transacoes nao registradas na reconciliacao
FR70: Epic 5 — Diferenca em tempo real durante reconciliacao
FR71: Epic 2 (padrao por categoria) + Epic 3 (Stories 3.5 e 3.6 — todos os niveis e regra no registro)
FR72: Epic 3 (Story 3.9) — Saldo nao alocado e barra neutra

## Epic List

### Epic 1: Fundacao, Autenticacao e Infraestrutura
O usuario pode criar conta, fazer login com seguranca e acessar a aplicacao. Inclui toda a infraestrutura fundacional: inicializacao do projeto (create-next-app), setup Supabase + Drizzle + migrations + RLS, Better Auth + Organizations, infraestrutura transversal (Result Pattern, trilha de auditoria, rate limiting, middleware de autorizacao), CI/CD (GitHub Actions + Vercel), README operacional, design system base (shadcn/ui, tokens, layout responsivo com sidebar + bottom nav).
**FRs cobertos:** FR45, FR46, FR50

### Epic 2: Estrutura Financeira e Categorizacao
O usuario pode configurar todo o perfil financeiro — contas bancarias, cartoes de credito (estrutura), investimentos, fontes de receita, categorias com orcamento e classificacoes de essencialidade. Inclui o fluxo de onboarding guiado. Nota: FR2 cria o cartao (estrutura), mas as metricas calculadas (FR8) ficam no Epic 5 porque dependem do modelo de mes de referencia.
**FRs cobertos:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR38, FR39, FR40, FR71

### Epic 3: Registro e Gestao de Transacoes
O usuario pode registrar gastos e receitas rapidamente (~5s), editar, excluir, transferir entre contas, reclassificar categorias retroativamente e acompanhar orcamento realizado vs. planejado. Jornada 1 (registro rapido) e Jornada 3 (correcao de erro) ficam completas.
**FRs cobertos:** FR9, FR10, FR12, FR13, FR14, FR15, FR16, FR17, FR41, FR42, FR58, FR60, FR71 (todos os niveis), FR72

### Epic 4: Gastos Recorrentes e Checklist Mensal
O usuario pode cadastrar gastos recorrentes (5 tipos de recorrencia), ter a checklist mensal gerada automaticamente com confirmacao diferenciada por tipo de conta, acompanhar progresso de pagamentos e receber notificacoes nos 3 momentos (vespera, dia, atraso). Jornada 2 (ciclo mensal) fica completa.
**FRs cobertos:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29

### Epic 5: Cartao de Credito e Reconciliacao de Fatura
Modelo completo de cartao de credito — mes de referencia automatico, fatura estimada em tempo real, parcelas com contagem regressiva e mes de referencia automatico na criacao, reconciliacao guiada (loop ate diferenca zero), fatura confirmada vira conta a pagar no checklist, fechamento de mes com destino de sobra ou cobertura de deficit. Jornada 9 (reconciliacao de fatura) fica completa.
**FRs cobertos:** FR8, FR11, FR55, FR56, FR64, FR65, FR66, FR67, FR68, FR69, FR70

### Epic 6: Dashboard, Analise e Transparencia
O usuario pode ver o status financeiro completo no dashboard, fazer drill-down analitico pela hierarquia de 4 niveis, rastrear a origem de qualquer valor (tap to trace), visualizar a Regra de Ouro, configurar widgets e filtros de perspectiva, e ver atualizacoes em tempo real quando outro usuario faz alteracoes. Jornadas 4 (Tamires — "a gente pode?"), 5 (gastos altos), 7 (tap to trace) e 8 (drill-down analitico) ficam completas.
**FRs cobertos:** FR30, FR31, FR32, FR33, FR34, FR43, FR59, FR61, FR63

### Epic 7: Projecao Futura e Timeline
O usuario pode visualizar a timeline de parcelas ativas com data de termino e liberacao de orcamento, ver gastos recorrentes nao-mensais posicionados no futuro e acompanhar a margem disponivel projetada por mes considerando todos os compromissos. Jornada 6 (projecao de longo prazo — parte MVP) fica completa.
**FRs cobertos:** FR35, FR36, FR37, FR62

### Epic 8: Permissoes e Compartilhamento Familiar
O usuario pode convidar membros para a familia, conceder permissoes granulares (acesso total ou configuravel por tipo de dado), revogar permissoes a qualquer momento e controlar o que cada pessoa ve — privacidade como padrao, compartilhamento por consentimento explicito.
**FRs cobertos:** FR47, FR48, FR49

### Epic 9: Administracao e Operacoes
O administrador pode visualizar todos os usuarios cadastrados, impersonar qualquer usuario em ambientes nao-producao (bloqueado em producao), restaurar base de dados de producao para ambientes de teste/homologacao e monitorar status dos backups.
**FRs cobertos:** FR51, FR52, FR53, FR54, FR57

---

## Epic 1: Fundacao e Autenticacao

O usuario pode criar conta, fazer login com seguranca e acessar a aplicacao. Inclui toda a infraestrutura fundacional do projeto.

### Story 1.1: Inicializacao do Projeto e Estrutura Base

As a developer,
I want the project initialized with the correct stack and folder structure,
So that I can start building features on a solid architectural foundation.

**Acceptance Criteria:**

**Given** o projeto nao existe
**When** o desenvolvedor executa o setup inicial
**Then** o projeto e criado com `npx create-next-app@latest caderninho --typescript --tailwind --eslint --app --src-dir --turbopack`
**And** path aliases estao configurados no tsconfig (@/server, @/client, @/shared, @/app)
**And** a estrutura de pastas segue a arquitetura definida: `src/server/`, `src/client/`, `src/shared/`, `src/app/`
**And** o tipo `Result<T>` esta implementado em `src/shared/types/result.ts`
**And** Vitest esta configurado e rodando com pelo menos 1 teste de exemplo
**And** `.env.example` existe com todas as variaveis documentadas (sem valores reais)
**And** `.gitignore` inclui `.env.local`, `node_modules`, `.next`

### Story 1.2: Design System e Layout Responsivo

As a user,
I want a consistent and responsive interface,
So that I can use the app comfortably on both desktop and mobile.

**Acceptance Criteria:**

**Given** o projeto esta inicializado (Story 1.1)
**When** o design system e configurado
**Then** shadcn/ui esta instalado com componentes base (Button, Input, Card, Sheet, Dialog, Toast, Tabs, Badge, Select, Table)
**And** design tokens estao configurados no Tailwind: paleta Stone & Indigo, fonte Inter com `tabular-nums`, espacamento base 4px
**And** sidebar colapsavel funciona no desktop (220px expandida, 56px recolhida) com transicao animada ~200ms
**And** bottom navigation com FAB central (48px) funciona no mobile (< 768px)
**And** 3 breakpoints estao configurados: mobile (< 768px), tablet (768-1023px), desktop (>= 1024px)
**And** skeleton screens sao exibidos durante carregamento (nunca tela em branco)
**And** modo de densidade configuravel (compacto/espacado) esta implementado
**And** o layout e validado contra os prototipos `proto-05-dashboard-desktop.html` e `proto-06-dashboard-mobile.html`
**And** a UX valida o layout implementado

### Story 1.3: Banco de Dados e Supabase Local

As a developer,
I want the database configured with Supabase running locally via Docker,
So that I can develop and test with a real PostgreSQL instance.

**Acceptance Criteria:**

**Given** o projeto esta inicializado (Story 1.1)
**When** o desenvolvedor executa `supabase start`
**Then** PostgreSQL, Auth e Realtime estao rodando localmente via Docker
**And** Drizzle ORM esta configurado em `src/server/infrastructure/database/client.ts`
**And** `supabase/config.toml` esta configurado para o projeto
**And** `drizzle.config.ts` esta na raiz do projeto apontando para o banco local
**And** o primeiro migration roda com sucesso criando as tabelas base do Better Auth (users, sessions, accounts, organizations, members)
**And** RLS esta habilitado nas tabelas com policies base de isolamento por organizacao
**And** o comando `npm run db:push` ou `npm run db:migrate` funciona corretamente

### Story 1.4: Registro e Login com Email/Senha

As a user,
I want to create an account with email/password and login securely,
So that I can access my financial data with confidence.

**Acceptance Criteria:**

**Given** o banco esta configurado (Story 1.3)
**When** o usuario acessa a pagina de registro
**Then** pode criar conta com email e senha (FR45)
**And** a senha e validada com requisitos minimos de seguranca

**Given** o usuario tem uma conta
**When** faz login com email e senha
**Then** uma sessao persistente e criada com expiracao de 7 dias e renovacao automatica (FR46, NFR-S1)
**And** o usuario e redirecionado ao dashboard

**Given** o usuario esta logado
**When** clica em logout
**Then** a sessao e encerrada completamente e o usuario e redirecionado a tela de login (FR46)

**Given** um usuario nao autenticado
**When** tenta acessar qualquer rota protegida
**Then** e redirecionado a pagina de login

**And** Better Auth esta configurado com Drizzle adapter e Organizations plugin
**And** a tela de login e validada contra `proto-01-login.html`
**And** a tela de registro e validada contra `proto-02-signup.html`
**And** a UX valida as telas implementadas
**And** toda comunicacao usa HTTPS (NFR-S2)

### Story 1.5: Login Social (Google)

As a user,
I want to login with my Google account,
So that I can access the app without creating a separate password.

**Acceptance Criteria:**

**Given** a pagina de login esta disponivel (Story 1.4)
**When** o usuario clica em "Entrar com Google"
**Then** o fluxo OAuth e iniciado com o provedor Google
**And** ao autorizar, a conta e criada automaticamente se nao existir (FR45)
**And** se ja existe conta com o mesmo email, as contas sao vinculadas

**Given** o usuario logou via Google anteriormente
**When** clica em "Entrar com Google" novamente
**Then** o login e feito diretamente sem pedir autorizacao novamente
**And** a sessao persistente e criada com as mesmas regras do login email/senha (NFR-S1)

**And** botao de login social esta presente nas telas de login e registro
**And** a UX valida a integracao visual

### Story 1.6: Auditoria e Seguranca

As a system,
I want audit logging and security protections in place,
So that every action is traceable and the application is protected against common attacks.

**Acceptance Criteria:**

**Given** o banco e a autenticacao estao configurados (Stories 1.3, 1.4)
**When** qualquer mutacao de dados ocorre
**Then** um registro imutavel e criado na tabela `audit_logs` com: quem fez, quando, o que foi alterado, valor anterior e valor novo (FR50)
**And** a tabela `audit_logs` so aceita INSERT (nunca UPDATE ou DELETE)

**Given** a aplicacao esta rodando
**When** requisicoes chegam
**Then** rate limiting esta ativo via middleware do Next.js (mapa em memoria)
**And** headers de seguranca estao configurados no `next.config` (CSP, HSTS, X-Frame-Options)
**And** protecao contra CSRF, XSS, SQL injection esta ativa (NFR-S4)
**And** middleware de autorizacao verifica sessao valida antes de executar Server Actions

### Story 1.7: Validacao, Logging e Infraestrutura Compartilhada

As a developer,
I want structured logging and shared validation infrastructure,
So that the application has consistent error handling and input validation.

**Acceptance Criteria:**

**Given** a infraestrutura base esta configurada (Stories anteriores)
**When** qualquer servico precisa validar input ou registrar log
**Then** logger estruturado em JSON esta implementado em `src/server/infrastructure/logging/logger.ts`
**And** logs nunca contem dados sensiveis (senhas, tokens, dados pessoais)
**And** Zod esta configurado como infraestrutura de validacao compartilhada em `src/shared/schemas/`
**And** Result Pattern esta implementado em `src/shared/result.ts` para erros de negocio (nunca throw para erros esperados)

### Story 1.8: CI/CD Pipeline, Ambientes e README

As a developer,
I want automated quality checks, multi-environment deployment, and comprehensive documentation,
So that code quality is enforced and the project is maintainable long-term.

**Acceptance Criteria:**

**Given** o projeto esta completo com auth e infraestrutura (Stories anteriores)
**When** um push e feito em uma feature branch
**Then** GitHub Actions executa: ESLint, TypeScript type-check e Vitest
**And** Vercel cria um preview deploy automaticamente

**Given** as checks passam
**When** um PR e mergeado em `main`
**Then** Vercel faz deploy em producao

**And** `.github/workflows/ci.yml` esta configurado com lint + type-check + testes
**And** variaveis de ambiente estao configuradas por ambiente na Vercel
**And** ambiente de staging esta configurado (projeto Supabase separado, Vercel preview)
**And** README contem: visao geral, pre-requisitos, setup local completo, variaveis de ambiente, como rodar testes, fluxo de trabalho (branching), deploy, e visao da arquitetura


### Hotfixes pós-Epic 1 (1.9 a 1.12)

Criados depois do Epic 1 com os ambientes de staging e produção no ar (detalhes em `implementation-artifacts/`): 1.9 cookie de sessão `__Secure-` no proxy, 1.10 pool de conexões no modo transação do pooler, 1.11 rate limit por tipo de requisição + error boundary.

### Story 1.12: Login com Google em Staging e Producao

_(Criada no code review de 2026-11-15; era a Task 5.3 da Story 1.9.)_

As a user,
I want to sign in with Google in staging and production,
So that I don't need a separate password.

**Acceptance Criteria:**

**Given** um ambiente sem credenciais do Google
**When** as telas de login e registro carregam
**Then** o botao "Entrar com Google" nao aparece e o provedor nao e registrado

**Given** staging e producao com cliente OAuth proprio e variaveis na Vercel por ambiente
**When** o usuario entra com o Google
**Then** volta autenticado (conta nova -> onboarding; conta existente -> mesmos dados via account linking)
**And** cancelar no Google mostra a mensagem de cancelamento

**And** TDD para o botao/provedor condicional; validacao em staging; producao na release do Epic 3

---

## Epic 2: Estrutura Financeira e Categorizacao

O usuario pode configurar todo o perfil financeiro — contas, cartoes, investimentos, fontes de receita, categorias com orcamento e classificacoes de essencialidade. Inclui o onboarding guiado.

### Story 2.1: Cadastro e Gestao de Contas Bancarias

As a user,
I want to create, edit, and view my bank accounts,
So that I can track my balances and organize my financial structure.

**Acceptance Criteria:**

**Given** o usuario esta autenticado
**When** acessa a tela de contas
**Then** pode cadastrar conta bancaria com nome, banco e saldo inicial (FR1)
**And** pode visualizar o saldo atualizado de cada conta (FR7)
**And** pode editar nome, banco e saldo de qualquer conta (FR6)
**And** pode arquivar uma conta (nao aparece para novas transacoes, historico preservado) (FR6)
**And** pode reativar uma conta arquivada (FR6)

**Given** o usuario tenta excluir uma conta
**When** confirma a acao
**Then** a conta e arquivada (nunca excluida definitivamente) (FR6)

**And** schema Drizzle `accounts` criado com: id, name, bank, balance_cents (integer), status (active/archived), organization_id, created_at, updated_at
**And** schema Zod de validacao em `src/shared/schemas/account.schema.ts`
**And** Server Action + Use Case + Repository implementados seguindo Clean Architecture
**And** testes unitarios escritos antes da implementacao (TDD)
**And** valores monetarios armazenados em centavos (inteiros)
**And** trilha de auditoria registrada para toda mutacao
**And** a UX valida a tela implementada

### Story 2.2: Cadastro e Gestao de Cartoes de Credito (Estrutura)

As a user,
I want to create and manage my credit cards,
So that I can organize my card payments and track limits.

**Acceptance Criteria:**

**Given** o usuario esta autenticado
**When** acessa a gestao de cartoes
**Then** pode cadastrar cartao com nome, bandeira, limite total, data de fechamento e data de vencimento da fatura (FR2)
**And** pode editar qualquer campo do cartao (FR6)
**And** pode arquivar um cartao (FR6)
**And** pode reativar um cartao arquivado

**Given** o usuario visualiza a lista de cartoes
**When** os cartoes sao exibidos
**Then** mostra nome, bandeira e limite total de cada cartao
**And** cartoes arquivados nao aparecem na lista principal

**And** schema Drizzle `credit_cards` criado com: id, name, brand, limit_cents (integer), closing_day, due_day, status (active/archived), organization_id, created_at, updated_at
**And** schema Zod de validacao em `src/shared/schemas/credit-card.schema.ts`
**And** nota: as metricas calculadas (utilizado, disponivel, fatura estimada) serao implementadas no Epic 5
**And** TDD, Clean Architecture, auditoria
**And** a UX valida a tela implementada

### Story 2.3: Cadastro de Investimentos e Fontes de Receita

As a user,
I want to register my investments and income sources,
So that I have a complete picture of my financial structure.

**Acceptance Criteria:**

**Given** o usuario esta autenticado
**When** acessa a gestao de investimentos
**Then** pode cadastrar investimento com nome, instituicao, tipo (renda fixa / renda variavel / reserva), saldo atual, data de atualizacao e data de vencimento opcional (FR3)
**And** tracking diferenciado por tipo: reserva e renda fixa rastreiam rendimento previsivel (ex: % CDI), renda variavel rastreia apenas saldo (FR3)
**And** pode editar qualquer campo do investimento (FR6)
**And** pode arquivar um investimento (FR6)

**Given** o usuario esta autenticado
**When** acessa a gestao de fontes de receita
**Then** pode cadastrar fonte de receita com nome, tipo de vinculo (PJ propria / CLT / freelance / outro), recorrencia, valor base mensal (opcional) e dia habitual de pagamento (opcional) (FR4)
**And** fonte de receita funciona como etiqueta de origem — sem saldo proprio (FR4)
**And** pode editar e arquivar fontes de receita (FR6)

**And** schemas Drizzle para `investments` e `income_sources`
**And** schemas Zod correspondentes
**And** TDD, Clean Architecture, auditoria
**And** a UX valida as telas implementadas

### Story 2.4: Categorias, Subcategorias e Classificacoes de Essencialidade

As a user,
I want to organize my expenses into a hierarchical category structure with essentiality classifications,
So that I can budget by category and understand where my money goes.

**Acceptance Criteria:**

**Given** o usuario esta autenticado
**When** acessa a gestao de categorias
**Then** pode criar categorias e subcategorias em estrutura hierarquica (FR5, FR38)
**And** pode definir orcamento mensal planejado por categoria — valor fixo ou faixa (ex: R$2.500 a R$3.000) (FR5)
**And** a mesma subcategoria pode existir em categorias diferentes com classificacao de essencialidade diferente (FR38)

**Given** o sistema e inicializado para o usuario
**When** as classificacoes de essencialidade sao carregadas
**Then** 7 classificacoes padrao estao disponiveis: Essenciais, Qualidade de Vida, Investimentos, Protecao, Doacoes, Impostos e Obrigacoes, Dividas (FR39)

**Given** o usuario quer personalizar classificacoes
**When** acessa a gestao de essencialidade
**Then** pode criar novas classificacoes (FR40)
**And** pode renomear classificacoes (nome altera, historico preservado) (FR40)
**And** pode mesclar classificacoes (migra categorias e transacoes para outra, desativa a original) (FR40)
**And** pode arquivar classificacoes (inativa, historico preservado, pode reativar) (FR40)
**And** classificacoes nunca sao excluidas definitivamente (FR40)

**And** hierarquia de 4 niveis: classificacao de essencialidade -> categoria -> subcategoria -> estabelecimento/contexto (FR38)
**And** schemas Drizzle para `essentiality_classifications`, `categories`, `subcategories`
**And** schemas Zod correspondentes
**And** TDD, Clean Architecture, auditoria
**And** a UX valida a tela implementada

**⚠️ Correção (correct-course 2026-11-15, `sprint-change-proposal-2026-11-15.md`):** orcamento e metodo de pagamento sao opcionais em todos os niveis (Stories 3.5 e 3.6). O exemplo "R$2.500 a R$3.000" e de subcategoria (Supermercado), nao de categoria.

### Story 2.5: Configuracao de Metodo de Pagamento Padrao por Categoria

As a user,
I want to set a default payment method per category,
So that common purchases are registered faster with fewer taps.

**Acceptance Criteria:**

**Given** o usuario tem categorias e cartoes/contas cadastrados
**When** edita uma categoria
**Then** pode configurar um metodo de pagamento padrao (cartao de credito, debito, Pix) para aquela categoria
**And** o default e sugerido automaticamente no fluxo de registro de transacao (usado no Epic 3)

**Given** uma categoria tem pagamento padrao configurado
**When** o usuario seleciona essa categoria ao registrar um gasto
**Then** o metodo de pagamento vem pre-selecionado (o usuario so confirma ou altera quando for excecao)

**And** campo `default_payment_method_id` na tabela de categorias
**And** TDD, auditoria
**And** a UX valida a interacao

**⚠️ Correção (correct-course 2026-11-15, `sprint-change-proposal-2026-11-15.md`):** o metodo padrao vale para todos os niveis (classificacao, categoria, subcategoria, estabelecimento), com regra de preenchimento por especificidade e habito (FR71) — Stories 3.5 e 3.6.

### Story 2.6: Onboarding — Setup Inicial Guiado

As a new user,
I want a guided setup flow,
So that I can configure the basics quickly and start using the app.

**Acceptance Criteria:**

**Given** o usuario acabou de criar a conta (primeiro acesso)
**When** acessa o app pela primeira vez
**Then** e apresentado ao fluxo de onboarding com tom calmo: "Vamos configurar o basico. Leva ~5 minutos."

**Given** o fluxo de onboarding esta ativo
**When** o usuario percorre as etapas
**Then** Etapa 1: Adiciona contas bancarias com nome e saldo
**And** Etapa 2: Adiciona cartoes de credito com nome, limite, fechamento e vencimento
**And** Etapa 3: Revisa categorias sugeridas com valores base editaveis e define orcamento
**And** Etapa 4 (opcional): Configura pagamento padrao por categoria
**And** Etapa 5: Lista gastos fixos mensais (escola, internet, etc.) com valor, vencimento e metodo
**And** Resumo: "X contas, Y cartoes, Z categorias, W fixos configurados"
**And** Ao finalizar, dashboard carrega com os dados iniciais

**Given** o usuario esta no meio do onboarding
**When** fecha o app ou navega para outra tela
**Then** o progresso e salvo e retoma de onde parou

**And** nenhuma etapa bloqueia o uso — "Depois" e sempre opcao
**And** o minimo para funcionar: 1 conta
**And** o layout e validado contra `proto-08-onboarding.html`
**And** a UX valida o fluxo implementado

**⚠️ Correção (correct-course 2026-11-15, `sprint-change-proposal-2026-11-15.md`):** as categorias sugeridas devem seguir a hierarquia (ex.: Alimentacao › Supermercado, nao Supermercado como categoria) — Story 3.7.

---

## Epic 3: Registro e Gestao de Transacoes

O usuario pode registrar gastos e receitas rapidamente (~5s), editar, excluir, transferir entre contas, reclassificar categorias retroativamente e acompanhar orcamento realizado vs. planejado. Jornadas 1 e 3 completas.

### Story 3.1: Registro de Gastos (Cascade Input)

As a user,
I want to register an expense quickly through a cascade flow,
So that I can capture spending in ~5 seconds at the moment it happens.

**Acceptance Criteria:**

**Given** o usuario esta autenticado e tem contas/cartoes/categorias configurados
**When** toca no FAB (+) no mobile ou botao "Registrar gasto" no desktop
**Then** o sheet/modal abre com teclado numerico ativo

**Given** o usuario digita um valor > 0
**When** confirma o valor
**Then** categorias frequentes aparecem como chips selecionaveis

**Given** o usuario seleciona uma categoria
**When** a categoria e selecionada
**Then** os 5 estabelecimentos mais utilizados naquela categoria (ultimos 90 dias) sao sugeridos (FR14)
**And** o metodo de pagamento padrao da categoria vem pre-selecionado (se configurado)
_(Corrigido em 2026-11-15: estabelecimentos sugeridos por subcategoria; metodo pela regra do FR71 — Story 3.6.)_

**Given** o usuario selecionou valor, categoria, estabelecimento e metodo de pagamento
**When** o painel de impacto e exibido (antes de confirmar)
**Then** mostra saldo/limite restante do metodo de pagamento e barra de progresso do orcamento da categoria (FR13)
**And** o feedback de impacto aparece em < 100ms (NFR-P2)
**And** se o orcamento estoura, a barra muda de cor (atencao, nao panico)

**Given** o usuario confirma a transacao
**When** toca em "Confirmar"
**Then** a transacao e registrada com valor, categoria, subcategoria, estabelecimento e metodo de pagamento (FR9, FR12)
**And** todos os totalizadores, saldos e orcamentos sao recalculados em < 500ms (FR17, NFR-P3)
**And** feedback breve de sucesso (checkmark) e sheet fecha
**And** toast com "Desfazer" por 5 segundos

**Given** ocorre um erro de rede ou servidor ao confirmar a transacao
**When** a operacao falha
**Then** o sistema exibe mensagem de erro especifica, preserva todos os dados digitados (valor, categoria, estabelecimento, metodo) e oferece opcao de retry (FR63)

**And** fluxo completo em 3-5 toques, < 10 segundos (NFR-U1)
**And** componente CascadeInput implementado com progressive disclosure
**And** componente ImpactPreview implementado
**And** validado contra `proto-07-cascade-input.html`
**And** a UX valida o fluxo implementado

### Story 3.2: Registro de Receitas e Transferencias

As a user,
I want to register income and transfers between accounts,
So that my balances reflect reality accurately.

**Acceptance Criteria:**

**Given** o usuario esta autenticado
**When** registra uma transacao de entrada (receita)
**Then** pode informar valor, origem (fonte de receita) e conta de destino (FR10)
**And** o saldo da conta de destino e atualizado automaticamente
**And** totalizadores recalculados em < 500ms (FR17)

**Given** o usuario quer transferir entre contas proprias
**When** seleciona "Transferencia"
**Then** pode escolher conta de origem e conta de destino (FR58)
**And** a transferencia nao e contabilizada como receita nem despesa (FR58)
**And** apenas os saldos das contas envolvidas sao afetados

**Given** o usuario quer registrar transferencia entre membros
**When** seleciona membro de destino
**Then** a transferencia e registrada entre as contas dos dois membros (FR58)

**And** TDD, Clean Architecture, auditoria
**And** a UX valida as telas implementadas

### Story 3.3: Edicao e Exclusao de Transacoes

As a user,
I want to edit or delete any registered transaction,
So that I can correct mistakes and keep my data accurate.

**Acceptance Criteria:**

**Given** o usuario tem transacoes registradas
**When** seleciona uma transacao para editar
**Then** pode alterar valor, categoria, subcategoria, estabelecimento e metodo de pagamento (FR15)
**And** o impacto da alteracao e mostrado antes de confirmar (ImpactPreview)
**And** todos os totalizadores sao recalculados em < 500ms apos confirmar (FR17, NFR-P3)

**Given** o usuario quer excluir uma transacao
**When** confirma a exclusao (dialog de confirmacao)
**Then** a transacao e removida (FR16)
**And** todos os totalizadores sao recalculados em < 500ms (FR17)
**And** toast com "Desfazer" por 5 segundos

**And** trilha de auditoria registra a alteracao/exclusao com valores anteriores
**And** TDD, Clean Architecture

### Story 3.4: Listagem e Historico de Transacoes

As a user,
I want to view my transaction history with filters,
So that I can find and review past expenses and income.

**Acceptance Criteria:**

**Given** o usuario esta autenticado
**When** acessa a tela de transacoes
**Then** ve a lista de transacoes ordenada por data (mais recente primeiro)
**And** cada transacao mostra: valor, categoria, estabelecimento, metodo de pagamento e data

**Given** o usuario quer filtrar transacoes
**When** utiliza os filtros contextuais (chips horizontais)
**Then** pode filtrar por: categoria, metodo de pagamento, periodo (mes) e tipo (entrada/saida)
**And** filtros ativos sao visiveis como chips selecionados
**And** "Limpar filtros" aparece quando qualquer filtro esta ativo

**Given** o usuario quer buscar uma transacao especifica
**When** utiliza o campo de busca
**Then** pode buscar por nome, categoria, valor ou data
**And** busca com debounce de 300ms

**And** paginacao ou scroll infinito para listas grandes
**And** a UX valida a tela implementada

### Stories corretivas entregues (3.1b a 3.4f)

Criadas durante a execucao do Epic 3 (detalhes em `implementation-artifacts/`): 3.1b entidade estabelecimento e correcoes de categorias, 3.1c cascade input alinhado ao proto-07, 3.1d budget bars na arvore de categorias, 3.1e side sheets e emoji picker, 3.4b componentes DS de transacoes, 3.4c refatoracao da tela de transacoes, 3.4d busca por nomes relacionados e empty state, 3.4e subcategorias sugeridas e criacao inline (sugestoes substituidas pela Story 3.7), 3.4f ajustes mobile, a11y e sidebar.

### Story 3.5: Hierarquia Completa — Orcamento e Metodo Opcionais nos 4 Niveis

_(Nova — correct-course 2026-11-15. Alinha o sistema a `decisao-modelo-categorizacao-v2.md`, ampliada.)_

As a user,
I want to optionally set a budget and a default payment method at any level of my spending hierarchy,
So that I can plan and register expenses at the level of detail that makes sense for me.

**Acceptance Criteria:**

**Given** o usuario esta em `/categories`
**When** edita uma classificacao, categoria, subcategoria ou estabelecimento
**Then** pode definir, opcionalmente, orcamento mensal (valor fixo ou faixa) (FR5)
**And** pode definir, opcionalmente, metodo de pagamento padrao (FR5, FR71)
**And** pode remover qualquer um dos dois; o padrao e "sem orcamento / sem metodo"

**Given** a hierarquia e exibida
**When** um nivel tem orcamento ou metodo definido
**Then** o valor aparece no proprio nivel (ex.: Supermercado — R$3.000 — Latam Pass)

**Given** o modelo de dados
**When** a story e entregue
**Then** classificacao tem orcamento e metodo; subcategoria tem orcamento; estabelecimento separa metodo **definido** de metodo **aprendido**
**And** toda transacao de gasto continua exigindo subcategoria; estabelecimento opcional (FR38)

**Given** o sistema ainda nao foi lancado
**When** a migration e aplicada
**Then** o banco de staging e zerado (sem migracao de dados); o de producao e zerado na release do Epic 3

**And** TDD, Clean Architecture, auditoria
**And** a UX valida as telas implementadas

### Story 3.6: Registro Rapido — Subcategorias Frequentes e Metodo de Pagamento

_(Nova — correct-course 2026-11-15.)_

As a user,
I want the expense form to offer my frequent subcategories and pre-fill the payment method I actually use,
So that I register an expense in ~3-5 seconds and only change what is an exception.

**Acceptance Criteria:**

**Given** o usuario digitou o valor no Novo Gasto
**When** os atalhos sao exibidos
**Then** aparecem as subcategorias mais usadas como chips com a categoria de contexto (ex.: "Supermercado · Alimentacao"); um toque define categoria e subcategoria
**And** "Todas as categorias" abre o caminho completo (categoria -> subcategoria, com criacao inline da 3.4e)
**And** os estabelecimentos sugeridos sao os 5 mais usados na subcategoria (FR14) e o estabelecimento continua opcional

**Given** o usuario registra um gasto e escolhe a subcategoria (e opcionalmente o estabelecimento)
**When** o metodo e resolvido
**Then** o sistema percorre estabelecimento -> subcategoria -> categoria -> classificacao; em cada nivel usa o metodo definido, senao o habito (3 ultimos registros naquele nivel com o mesmo metodo), senao sobe um nivel (FR71)
**And** o primeiro encontrado vem preenchido; se nenhum, o campo fica vazio

**Given** ha alternativas ao metodo preenchido
**When** o campo de metodo e exibido
**Then** aparecem atalhos de um toque: "Ultimo usado" (subcategoria, ou estabelecimento quando informado) e o padrao do nivel acima quando diferente (ex.: "Alelo — padrao de Alimentacao"), sem repetir o metodo preenchido

**Given** um metodo e o mais usado num nivel nos ultimos 90 dias e difere do padrao daquele nivel (ou nao ha padrao)
**When** o usuario registra um gasto naquele nivel
**Then** o sistema sugere: "Voce costuma pagar Supermercado com Latam Pass. Definir como padrao?"
**And** se aceitar, o padrao do nivel e atualizado (com auditoria); se dispensar, a sugestao so volta se outro metodo passar a ser o mais usado

**And** o usuario sempre pode trocar o metodo no registro
**And** TDD da regra cobrindo: primeiras compras (padrao da categoria), habito apos 3 usos seguidos, quebra do habito, definido vence habito no mesmo nivel, sugestao com e sem padrao existente
**And** a UX valida a interacao

### Story 3.7: Onboarding com a Hierarquia Correta

_(Nova — correct-course 2026-11-15. Substitui as sugestoes da Story 3.4e.)_

As a new user,
I want the onboarding to suggest a spending structure that follows classification -> category -> subcategory,
So that I start with a correct structure and can register my first expense right away.

**Acceptance Criteria:**

**Given** o usuario esta na etapa de categorias do onboarding
**When** as sugestoes sao exibidas
**Then** seguem a hierarquia (ex.: Essenciais › Alimentacao › Supermercado, Padaria, Hortifruti; Essenciais › Transporte › Gasolina, Pedagio, Estacionamento) — lista final aprovada pelo PO na story
**And** nenhuma subcategoria aparece como categoria (ex.: Supermercado e Gasolina nunca sao categorias)
**And** toda categoria sugerida nasce com pelo menos uma subcategoria
**And** orcamentos sugeridos podem estar em qualquer nivel (FR5)

**And** a criacao de subcategoria inline no Novo Gasto (Story 3.4e) continua funcionando
**And** TDD, validado contra `proto-08-onboarding.html`, a UX valida o fluxo

### Story 3.8: Reclassificacao Retroativa de Categorias

_(Era a Story 3.5 — renumerada em 2026-11-15.)_

As a user,
I want to reclassify a category's essentiality level with retroactive effect,
So that my historical analysis reflects the correct classification.

**Acceptance Criteria:**

**Given** o usuario tem categorias com transacoes registradas
**When** altera a classificacao de essencialidade de uma categoria (ex: "Assinaturas" de "Essenciais" para "Qualidade de Vida")
**Then** a mudanca e aplicada retroativamente em todas as visualizacoes — passado, presente e futuro (FR41)
**And** percentuais de essencialidade sao recalculados retroativamente
**And** todas as analises e graficos sao recalculados em < 500ms (FR42, NFR-P3)

**Given** o usuario reclassifica uma categoria
**When** o impacto e calculado
**Then** ImpactPreview mostra o efeito antes de confirmar (ex: "gastos nao essenciais sobem de 35% para 42%")

**And** trilha de auditoria registra a reclassificacao
**And** TDD com testes que validam o recalculo retroativo

### Story 3.9: Acompanhamento de Orcamento Multinivel

_(Era a Story 3.6 "Acompanhamento de Orcamento por Categoria" — renumerada e reescrita em 2026-11-15.)_

As a user,
I want to track my spending against the budgets I set at any level of the hierarchy,
So that I know how much I can still spend and what's my free available amount.

**Acceptance Criteria:**

**Given** o usuario tem orcamentos definidos em um ou mais niveis e transacoes registradas
**When** visualiza os orcamentos
**Then** ve gasto realizado vs. planejado em cada nivel com orcamento, com barra de progresso (FR60)
**And** quando um nivel e seus filhos tem orcamento, ve o saldo nao alocado do nivel (FR72)
**And** nivel sem orcamento mostra barra neutra (sem julgamento de cor) com percentual relativo ao nivel acima (FR72)
**And** estouro mostra a parte alem de 100% em vermelho, com "+R$ X acima (Y%)"
**And** a escala de cores segue o padrao canonico do DS (definido na revisao de UX deste correct-course)

**Given** o usuario esta registrando um gasto
**When** o painel de impacto e exibido
**Then** mostra o consumo de todos os niveis da hierarquia da transacao que tem orcamento (FR13)

**Given** o sistema calcula o valor disponivel livre
**When** os dados sao apresentados
**Then** o valor disponivel livre e: saldo total - despesas realizadas - despesas fixas pendentes - orcamentos planejados restantes (FR60)
**And** quando um nivel estoura o planejado, o impacto e refletido no disponivel livre, sem contar o mesmo gasto duas vezes entre niveis

**And** componente BudgetProgressBar com variantes Inline, Expanded e Mini
**And** validado contra `proto-09-budgets.html`
**And** a UX valida o componente implementado

---

## Epic 4: Gastos Recorrentes e Checklist Mensal

O usuário pode cadastrar gastos recorrentes (5 tipos de recorrência), ter a checklist mensal gerada automaticamente com confirmação diferenciada por tipo de conta, acompanhar progresso de pagamentos e receber notificações nos 3 momentos (véspera, dia, atraso). Jornada 2 completa.

### Story 4.1: Cadastro de Gastos Recorrentes Mensais (3 Tipos)

As a user,
I want to register monthly recurring expenses with different behaviors,
So that they are automatically pre-filled each month and reduce manual work.

**Acceptance Criteria:**

**Given** o usuário está autenticado
**When** cadastra um gasto recorrente mensal
**Then** pode escolher entre 3 tipos:
- **Fixo imutável** (ex: escola R$2.800): auto-preenchido mensalmente com valor exato (FR18)
- **Variável com base** (ex: luz ~R$250): pré-preenchido com valor base, sinalizado "atualizar quando souber" (FR19)
- **Fixo mínimo + variável** (ex: plano de saúde R$1.890 + extras): pré-preenchido com valor mínimo, aceita acréscimo (FR20)

**Given** o gasto recorrente está cadastrado
**When** um novo mês inicia
**Then** os recorrentes são instanciados automaticamente com seus valores base

**And** cada recorrente tem: nome, valor (centavos), tipo de recorrência, categoria e subcategoria (estabelecimento opcional), dia de vencimento, método de pagamento, tipo de conta (débito automático / agendado / recorrente no cartão / variável-fatura / manual)
**And** schema Drizzle `recurring_expenses` com campos adequados
**And** TDD, Clean Architecture, auditoria

### Story 4.2: Gastos Recorrentes Não-Mensais

As a user,
I want to register non-monthly recurring expenses (quarterly, semi-annual, annual, etc.),
So that I can plan for irregular expenses like car insurance and school enrollment.

**Acceptance Criteria:**

**Given** o usuário está autenticado
**When** cadastra um gasto recorrente não-mensal
**Then** pode definir frequência: fixa (semanal, quinzenal, mensal, bimestral, trimestral, semestral, anual), a cada N meses, ou anual com mês fixo (sazonal) (FR21)
**And** cada recorrente tem valor estimado
**And** a próxima ocorrência é calculada a partir da última realizada (FR21)

**Given** gastos não-mensais estão cadastrados
**When** o sistema calcula a timeline
**Then** posiciona automaticamente na timeline de projeção futura (FR22)
**And** horizonte configurável: opções rápidas de 6, 12 e 24 meses, configurável até 5 anos (FR22)

**And** TDD com testes para cada tipo de frequência e cálculo de próxima ocorrência
**And** a UX valida a tela implementada

### Story 4.3: Checklist Mensal com Tipos de Conta

As a user,
I want an automatic monthly checklist of bills organized by payment type,
So that I can track what's been paid and what's pending efficiently.

**Acceptance Criteria:**

**Given** o mês inicia e existem gastos recorrentes cadastrados
**When** o sistema gera a checklist
**Then** todos os gastos recorrentes aparecem categorizados por tipo de pagamento (FR23):
- **Débito automático**: pré-confirmados, usuário valida que foram debitados
- **Agendado no banco**: pré-confirmados, usuário valida execução
- **Recorrente no cartão**: confirmados automaticamente via reconciliação de fatura
- **Variável (fatura)**: sinalizados para atualização de valor
- **Manual**: aguarda registro de pagamento pelo usuário

**Given** a checklist está ativa
**When** o usuário visualiza
**Then** vê o progresso: "Abril: X de Y contas confirmadas" com lista de pendentes (FR26)
**And** card dedicado mostra: valor total faltante, progresso monetário (R$X de R$Y), contagem e pendentes agrupadas por proximidade de vencimento (FR27)

**Given** um gasto variável chega com valor diferente
**When** o usuário atualiza o valor real (FR25)
**Then** o impacto da alteração no total do mês é mostrado antes de confirmar
**And** totalizadores recalculam em < 500ms

**And** componente MonthChecklist implementado
**And** validado contra `proto-10-checklist.html`
**And** a UX valida o componente implementado

### Story 4.4: Confirmação de Pagamentos e Marcação

As a user,
I want to confirm payments with different workflows per account type,
So that I can efficiently validate each bill according to how it's paid.

**Acceptance Criteria:**

**Given** a checklist tem itens pendentes
**When** o usuário confirma um item de débito automático ou agendado
**Then** valida que o pagamento foi executado com 1 toque (FR24)

**Given** um item é do tipo variável (fatura)
**When** o valor real chega (ex: fatura de luz)
**Then** o usuário atualiza o valor e confirma o pagamento (FR24, FR25)

**Given** um item é do tipo manual
**When** o usuário registra o pagamento
**Then** marca como pago e o saldo da conta é atualizado (FR24)

**Given** todos os itens estão confirmados
**When** a checklist está completa
**Then** card atualiza: "R$0 — Tudo em dia — Y de Y confirmadas"

**And** o usuário pode marcar contas como pagas a partir de qualquer ponto do app (FR29)
**And** TDD, auditoria

### Story 4.5: Notificações de Contas a Pagar

As a user,
I want to be notified about upcoming, due, and overdue bills,
So that I never miss a payment.

**Acceptance Criteria:**

**Given** existem contas na checklist com datas de vencimento
**When** o sistema verifica diariamente
**Then** gera notificações em 3 momentos (FR28):
- **1 dia antes**: "Amanhã vence: Plano de saúde R$1.890 — Agendado no banco Itaú" (informativo, azul)
- **No dia**: "Hoje vence: Internet R$158 — Débito automático Itaú" (atenção, indigo)
- **Atrasado**: "Conta atrasada: Condomínio R$980 — venceu há 2 dias" (crítico, vermelho)

**Given** notificações existem
**When** o usuário visualiza
**Then** badge/sininho mostra contagem de alertas pendentes
**And** lista de alertas permanece visível até a conta ser confirmada (FR28)
**And** o dashboard exibe card dedicado com total faltante e progresso visual (FR28)

**Given** o usuário vê uma notificação
**When** marca como pago
**Then** a notificação é resolvida e a checklist atualizada (FR29)

**And** componente BillNotificationSystem implementado com banner + card + badge
**And** a UX valida o componente implementado

---

## Epic 5: Cartão de Crédito e Reconciliação de Fatura

Modelo completo de cartão de crédito — mês de referência automático, fatura estimada em tempo real, parcelas com contagem regressiva, reconciliação guiada (loop até diferença zero), fatura confirmada vira conta a pagar, fechamento de mês. Jornada 9 completa.

### Story 5.1: Mês de Referência Automático e Fatura Estimada

As a user,
I want transactions on my credit card to be automatically assigned to the correct billing cycle,
So that I always know which invoice each purchase belongs to.

**Acceptance Criteria:**

**Given** o usuário tem um cartão com data de fechamento configurada (Epic 2)
**When** registra uma transação nesse cartão
**Then** o sistema atribui automaticamente o mês de referência baseado na data de fechamento: transações entre o fechamento anterior e o atual pertencem ao ciclo seguinte (FR64)

**Given** existem transações atribuídas a um ciclo
**When** o sistema calcula a fatura estimada
**Then** soma todas as transações (avulsas, parcelas e recorrentes no cartão) cujo mês de referência = ciclo atual (FR65)
**And** o status da fatura é "Estimativa" até o valor real ser inserido via reconciliação (FR65)

**Given** o usuário visualiza um cartão
**When** acessa o detalhe do cartão
**Then** vê: limite total, utilizado (todas as transações não liquidadas incluindo parcelas futuras), disponível (limite - utilizado), fatura estimada do ciclo atual, utilizado líquido (utilizado - parcelas de ciclos futuros) e parcelas futuras agrupadas por mês de referência (FR8)

**And** componente CreditCardDetail implementado
**And** validado contra `proto-12-credit-card.html`
**And** a UX valida o componente implementado
**And** TDD com testes para cálculo de mês de referência em datas-limite (dia do fechamento, dia anterior, dia seguinte)

### Story 5.2: Gastos Parcelados no Cartão de Crédito

As a user,
I want to register installment purchases on my credit card,
So that each installment is automatically tracked with the correct billing cycle and countdown.

**Acceptance Criteria:**

**Given** o usuário está registrando um gasto no cartão de crédito
**When** indica que é parcelado e informa o número de parcelas
**Then** o sistema gera parcelas automáticas com contagem regressiva (ex: 1/12, 2/12... 12/12) (FR11)
**And** cada parcela recebe automaticamente seu mês de referência na criação: parcela 1 = próximo fechamento, parcela 2 = fechamento +1 mês, etc. (FR11, FR64)
**And** o valor de cada parcela é arredondado em centavos (soma das parcelas = valor total exato)

**Given** parcelas estão ativas
**When** o usuário visualiza o cartão
**Then** parcelas futuras aparecem agrupadas por mês de referência com valor e contagem (FR8)
**And** cada parcela mostra: parcela atual/total, valor e data de término

**Given** o usuário visualiza a timeline (Epic 7)
**When** parcelas estão ativas
**Then** cada parcela aparece posicionada no mês correto da timeline (FR35)

**And** TDD com testes para: arredondamento de parcelas em centavos, atribuição de mês de referência por parcela, edge case de parcela criada no dia do fechamento

### Story 5.3: Reconciliação de Fatura — Início e Comparação

As a user,
I want to start a credit card invoice reconciliation by entering the real invoice amount,
So that I can compare it against the system's estimate and identify discrepancies.

**Acceptance Criteria:**

**Given** o cartão tem uma fatura estimada para o ciclo atual
**When** o usuário inicia a reconciliação inserindo o valor real da fatura (FR55)
**Then** o sistema mostra comparação lado a lado: estimativa vs. real
**And** lista todas as transações do ciclo (baseado no mês de referência) com checkboxes (FR55)
**And** cada transação mostra: data, descrição, valor e status (marcada/desmarcada)

**Given** a reconciliação está ativa
**When** o sistema calcula
**Then** exibe a diferença entre o total reconciliado (soma das marcadas) e o valor real em tempo real (FR70)
**And** a diferença atualiza instantaneamente ao marcar/desmarcar transações

**Given** ocorre um erro de rede ou servidor ao iniciar a reconciliacao ou carregar transacoes
**When** a operacao falha
**Then** o sistema exibe mensagem de erro especifica, preserva o valor real digitado e oferece opcao de retry (FR63)

**And** componente FaturaReconciliation implementado
**And** validado contra `proto-12-credit-card.html` (seção de reconciliação)
**And** a UX valida o componente implementado

### Story 5.4: Reconciliação de Fatura — Ajustes e Confirmação

As a user,
I want to adjust transactions during reconciliation until the difference is zero,
So that my records exactly match the real invoice.

**Acceptance Criteria:**

**Given** a reconciliação está em andamento com diferença != 0
**When** o usuário desmarca uma transação que não apareceu na fatura real
**Then** a transação tem seu mês de referência atualizado automaticamente para o próximo ciclo (FR68)
**And** o total reconciliado é recalculado e a diferença atualiza em tempo real (FR70)

**Given** faltam transações na estimativa
**When** o usuário adiciona transações não registradas diretamente na tela de reconciliação (FR69)
**Then** a transação é criada com o mês de referência do ciclo atual
**And** o total reconciliado é recalculado

**Given** o total reconciliado = valor real da fatura (diferença = R$0,00)
**When** o usuário confirma a reconciliação
**Then** a confirmação é permitida (FR70)
**And** a fatura estimada é substituída pela fatura confirmada (FR65)
**And** a fatura confirmada gera automaticamente uma conta a pagar no checklist mensal com valor confirmado e data de vencimento do cartão (FR66)

**Given** a diferença != 0
**When** o usuário tenta confirmar
**Then** a confirmação é bloqueada com indicação da diferença restante (FR70)

**Given** ocorre um erro de rede ou servidor ao desmarcar, adicionar transacao ou confirmar reconciliacao
**When** a operacao falha
**Then** o sistema exibe mensagem de erro especifica, preserva o estado atual da reconciliacao e oferece opcao de retry (FR63)

**And** TDD com testes para: fluxo de desmarcar e mover para próximo ciclo, adição de transação na reconciliação, bloqueio de confirmação com diferença != 0

### Story 5.5: Pós-Reconciliação e Recálculo de Métricas

As a user,
I want the credit card metrics to be recalculated after invoice payment,
So that my available limit and projections are always accurate.

**Acceptance Criteria:**

**Given** a fatura foi reconciliada e gerou conta a pagar no checklist
**When** o pagamento da fatura é confirmado via checklist (FR67)
**Then** o sistema recalcula as métricas do cartão:
- Utilizado líquido e fatura do próximo mês se igualam (não há mais fatura anterior pendente a subtrair) (FR67)
- Limite disponível é atualizado
- Parcelas futuras agrupadas por mês são recalculadas

**Given** as métricas foram recalculadas
**When** o usuário visualiza o cartão
**Then** todos os valores refletem o estado pós-pagamento (FR8)

**And** TDD com testes para recálculo completo pós-pagamento
**And** auditoria registra a transição de estados da fatura (estimativa -> confirmada -> paga)

### Story 5.6: Fechamento de Mês com Saldo Final

As a user,
I want to close the month by recording where the surplus goes or where the deficit coverage comes from,
So that I have a complete and accurate picture of each month's resolution.

**Acceptance Criteria:**

**Given** o mês está chegando ao fim e todas as faturas foram reconciliadas
**When** o sistema apresenta o saldo final do mês (FR56)
**Then** mostra: receitas totais, despesas totais e saldo (positivo ou negativo)

**Given** o saldo é positivo (sobra)
**When** o usuário fecha o mês
**Then** registra o destino da sobra: qualquer conta ou investimento cadastrado (FR56)
**And** os saldos são atualizados conforme o destino escolhido

**Given** o saldo é negativo (déficit)
**When** o usuário fecha o mês
**Then** registra a origem da cobertura: transferência de outro membro ou resgate de reserva/investimento (FR56)
**And** os saldos são atualizados conforme a origem

**And** fechamento do mês é registrado na trilha de auditoria
**And** TDD, Clean Architecture

---

## Epic 6: Dashboard, Análise e Transparência

O usuário pode ver o status financeiro completo no dashboard, fazer drill-down analítico pela hierarquia de 4 níveis, rastrear a origem de qualquer valor (tap to trace), visualizar a Regra de Ouro, configurar widgets e filtros de perspectiva, e ver atualizações em tempo real quando outro usuário faz alterações. Jornadas 4, 5, 7 e 8 completas.

### Story 6.1: Dashboard Principal com Widgets Configuráveis

As a user,
I want a dashboard that shows my financial status at a glance with configurable widgets,
So that I can quickly understand where I stand and customize the view to my needs.

**Acceptance Criteria:**

**Given** o usuário está autenticado e tem dados financeiros
**When** acessa o dashboard
**Then** vê widgets com: total gasto no mês por nível da hierarquia (classificação, categoria, subcategoria) com barra de progresso (gasto/orçamento/restante) quando houver orçamento (FR30, FR72)
**And** vê total de contas a pagar restantes no mês com progresso (FR32)
**And** dashboard carrega em < 2 segundos após login (NFR-P1)

**Given** o usuário quer personalizar o dashboard
**When** acessa as configurações de widgets
**Then** pode escolher quais widgets exibir (FR61)
**And** pode filtrar por perspectiva: meus gastos / gastos da família / todos (FR61)

**Given** o dashboard está carregado
**When** o usuário navega entre perspectivas
**Then** os dados são filtrados e atualizados em < 300ms (NFR-P5)

**And** componente SummaryCard implementado
**And** validado contra `proto-05-dashboard-desktop.html` e `proto-06-dashboard-mobile.html`
**And** a UX valida o dashboard implementado
**And** skeleton screens exibidos durante carregamento

### Story 6.2: Drill-Down Analítico pela Hierarquia Completa

As a user,
I want to drill down from essentiality classification to category to subcategory to establishment,
So that I can discover exactly where my money is going at every level.

**Acceptance Criteria:**

**Given** o dashboard mostra gastos por classificação de essencialidade
**When** o usuário toca em uma classificação (ex: "Qualidade de Vida R$5.400")
**Then** abre as categorias dentro dessa classificação com valores e percentuais (FR43)

**Given** o usuário está no nível de categoria
**When** toca em uma categoria (ex: "Restaurante R$1.800")
**Then** abre subcategorias com distribuição: Fast Food R$720, Delivery R$630, etc. (FR31, FR43)

**Given** o usuário está no nível de subcategoria
**When** toca em uma subcategoria (ex: "Fast Food R$720")
**Then** abre os estabelecimentos com valores e percentuais: McDonald's R$480 (67%), etc. (FR31, FR43)

**Given** o drill-down está em qualquer nível
**When** o tempo de resposta é medido
**Then** cada nível carrega em < 1 segundo (NFR-P6)

**And** navegação com breadcrumb para voltar a qualquer nível
**And** cada nível mostra valores absolutos e percentuais
**And** componente SpendingTreemap implementado (view mode Mapa)
**And** a UX valida a interação de drill-down

### Story 6.3: Regra de Ouro — Cartões vs. Saldo

As a user,
I want to see the Golden Rule indicator comparing card commitments against available balance,
So that I know if I'm over-leveraged on credit.

**Acceptance Criteria:**

**Given** o usuário tem cartões de crédito e contas bancárias
**When** o dashboard é carregado
**Then** a Regra de Ouro é exibida: comprometimento em cartões (soma das faturas atuais/abertas) vs. saldo disponível (soma dos saldos de todas as contas-corrente) (FR33)

**Given** o comprometimento atinge o limiar configurado
**When** o alerta visual é avaliado
**Then** alerta visual aparece quando comprometimento >= X% do saldo disponível, onde X é configurável pelo usuário (FR33)

**Given** o usuário quer ajustar o limiar
**When** acessa configurações da Regra de Ouro
**Then** pode definir o percentual de alerta (ex: padrão 80%)

**And** componente GoldenRuleGauge implementado
**And** componente GravityScale implementado (balança visual)
**And** a UX valida os componentes implementados

### Story 6.4: Tap to Trace — Rastreabilidade de Qualquer Valor

As a user,
I want to tap on any value in the dashboard to see its composition and origin,
So that every number is transparent and traceable — no black boxes.

**Acceptance Criteria:**

**Given** o dashboard exibe valores consolidados
**When** o usuário toca/clica em qualquer valor (ex: "Valor disponível livre: R$320")
**Then** abre a composição com cada componente (FR59):
- Saldo total contas: R$19.200
- Contas a pagar restantes: -R$8.400
- Faturas de cartão abertas: -R$7.180
- Orçamentos restantes: -R$3.300
- = Disponível livre: R$320

**Given** a composição está aberta
**When** o usuário toca em uma linha da composição (ex: "Faturas de cartão abertas: R$7.180")
**Then** abre o próximo nível de detalhe: decomposição por cartão (FR59)

**Given** o drill-down de trace está em qualquer nível
**When** o usuário quer ver mais detalhe
**Then** pode continuar navegando até o nível de transação individual (FR59)

**And** componente TapToTracePanel implementado com navegação hierárquica
**And** cada linha tocável tem indicador visual de "expansível"
**And** a UX valida o componente implementado

### Story 6.5: Atualizações Real-Time no Dashboard

As a user,
I want the dashboard to update automatically when another family member makes changes,
So that I always see current data without refreshing.

**Acceptance Criteria:**

**Given** dois usuários estão conectados ao mesmo dashboard familiar
**When** um usuário registra, edita ou exclui uma transação
**Then** o outro vê a mudança refletida no dashboard em < 2 segundos (FR34, NFR-P4)
**And** totalizadores, barras de progresso e widgets atualizam sem recarregar a página

**Given** uma atualização real-time chega
**When** o dashboard atualiza
**Then** a mudança é sutil e não interrompe a navegação do outro usuário
**And** indicador visual discreto mostra que dados foram atualizados

**And** Supabase Realtime configurado para subscriptions nos canais relevantes
**And** TDD com testes para propagação de eventos

### Story 6.6: Tratamento de Erros com Retry e Preservação de Dados

As a user,
I want clear error messages that preserve my input and offer retry,
So that I never lose data I've already typed when something goes wrong.

**Acceptance Criteria:**

**Given** o usuário está preenchendo um formulário (qualquer fluxo do app)
**When** uma operação falha (erro de rede, timeout, erro do servidor)
**Then** uma mensagem de erro específica é exibida descrevendo o problema (FR63)
**And** todos os dados digitados pelo usuário são preservados (FR63)
**And** um botão "Tentar novamente" é oferecido (FR63)

**Given** o usuário clica em "Tentar novamente"
**When** a operação é reexecutada
**Then** usa os mesmos dados preservados sem que o usuário precise redigitar

**Given** o erro persiste após retry
**When** o usuário tenta novamente
**Then** mensagem atualizada sugere ação alternativa (ex: "Verifique sua conexão e tente novamente")

**And** feedback visual para toda ação: confirmação de sucesso em < 1 segundo (NFR-U4)
**And** erros nunca são genéricos — sempre descrevem o problema específico
**And** TDD com testes para cenários de falha

---

## Epic 7: Projeção Futura e Timeline

O usuário pode visualizar a timeline de parcelas ativas com data de término e liberação de orçamento, ver gastos recorrentes não-mensais posicionados no futuro e acompanhar a margem disponível projetada por mês considerando todos os compromissos. Jornada 6 (parte MVP) completa.

### Story 7.1: Timeline de Parcelas Ativas

As a user,
I want to see a timeline of my active installments with end dates and budget release indicators,
So that I can plan ahead knowing when financial commitments end and budget frees up.

**Acceptance Criteria:**

**Given** o usuário tem parcelas ativas em cartões de crédito
**When** acessa a visão de projeção futura / timeline
**Then** vê todas as parcelas ativas com: cartão associado, parcela atual/total (ex: 5/12), valor mensal e data de término (FR35)

**Given** uma parcela está próxima de terminar
**When** o sistema calcula a liberação
**Then** exibe indicador de quando a parcela termina e quanto de orçamento será liberado mensalmente (FR36)
**And** ex: "TV Samsung — última parcela em jul/2026 — libera R$450/mês"

**Given** o usuário visualiza a timeline
**When** parcelas de múltiplos cartões coexistem
**Then** parcelas são agrupáveis por cartão ou visíveis em timeline unificada
**And** horizonte configurável com opções rápidas de 6, 12 e 24 meses

**And** TDD com testes para cálculo de data de término e valor liberado
**And** a UX valida a tela implementada

### Story 7.2: Gastos Recorrentes Não-Mensais na Timeline

As a user,
I want to see my non-monthly recurring expenses positioned on the future timeline,
So that I can anticipate irregular expenses like car insurance and school enrollment.

**Acceptance Criteria:**

**Given** o usuário tem gastos recorrentes não-mensais cadastrados (Epic 4)
**When** acessa a timeline de projeção futura
**Then** vê os gastos posicionados na data prevista com valor estimado (FR37)
**And** ex: "Seguro do carro — set/2026 — ~R$2.800", "Rematrícula — nov/2026 — ~R$1.200"

**Given** a timeline mostra gastos futuros
**When** parcelas e recorrentes não-mensais coexistem
**Then** ambos são visíveis na mesma timeline integrada
**And** gastos recorrentes não-mensais são visualmente distintos das parcelas (cor/ícone diferente)

**Given** o horizonte de projeção é alterado
**When** o usuário seleciona 6, 12, 24 meses ou até 5 anos
**Then** a timeline expande/contrai mostrando os gastos no horizonte selecionado (FR22)

**And** TDD com testes para posicionamento correto na timeline
**And** a UX valida a integração visual na timeline

### Story 7.3: Margem Disponível Projetada por Mês

As a user,
I want to see the projected available margin per month considering all known commitments,
So that I can identify tight months ahead and plan accordingly.

**Acceptance Criteria:**

**Given** o usuário tem receitas, despesas recorrentes, parcelas e gastos sazonais cadastrados
**When** acessa a projeção de margem
**Then** o sistema calcula e exibe a margem disponível projetada por mês: receitas - recorrentes mensais - parcelas - recorrentes não-mensais do mês (FR62)
**And** horizonte configurável conforme FR22

**Given** a projeção está visível
**When** um mês tem margem negativa (ex: setembro com seguro do carro)
**Then** o mês é destacado visualmente como "apertado" (alerta amarelo/vermelho)
**And** a composição do mês é visível ao tocar (tap to trace)

**Given** os dados mudam (nova parcela, novo recorrente, etc.)
**When** a projeção é recalculada
**Then** a margem de todos os meses é atualizada em < 500ms

**And** TDD com testes para cálculo de margem com múltiplos tipos de compromisso
**And** a UX valida a visualização implementada

---

## Epic 8: Permissões e Compartilhamento Familiar

O usuário pode convidar membros para a família, conceder permissões granulares (acesso total ou configurável por tipo de dado), revogar permissões a qualquer momento e controlar o que cada pessoa vê — privacidade como padrão, compartilhamento por consentimento explícito.

### Story 8.1: Convite de Membros e Privacidade como Padrão

As a user,
I want to invite another person to my family group while keeping all my data private by default,
So that I control exactly what is shared and nothing is exposed without my explicit consent.

**Acceptance Criteria:**

**Given** o usuário está autenticado
**When** convida outro usuário para a família (via Better Auth Organizations)
**Then** o convite é enviado e o membro pode aceitar

**Given** um membro aceitou o convite
**When** acessa o app
**Then** nenhum dado do outro membro é visível automaticamente (FR49)
**And** cada usuário vê apenas seus próprios dados até que o dono conceda acesso explícito (FR49)

**Given** dois membros estão na mesma família
**When** um visualiza o dashboard
**Then** a perspectiva padrão é "meus gastos" — dados do outro membro não aparecem sem permissão

**And** Better Auth Organizations gerencia a estrutura familiar
**And** RLS no PostgreSQL garante isolamento por padrão (defesa em profundidade)
**And** TDD com testes para isolamento de dados entre membros
**And** auditoria registra convites e aceitações

### Story 8.2: Concessão de Permissões Granulares

As a user,
I want to grant permissions to family members with two modes (full access or configurable),
So that I can share what's relevant while protecting sensitive data.

**Acceptance Criteria:**

**Given** dois membros estão na mesma família
**When** o dono dos dados configura permissões
**Then** pode escolher entre dois modos (FR47):
- **Acesso total**: visualização e edição de todos os dados
- **Acesso configurável por tipo de dado**: ex: compartilhar contas e orçamentos mas restringir investimentos pessoais

**Given** o modo configurável está selecionado
**When** o dono define as permissões
**Then** pode selecionar individualmente quais tipos de dados compartilhar: contas, cartões, transações, orçamentos, investimentos, fontes de receita

**Given** permissões foram concedidas
**When** o membro com acesso visualiza o app
**Then** vê apenas os dados para os quais tem permissão
**And** pode usar a perspectiva "gastos da família" ou "todos" no dashboard (FR61)

**And** tabela de permissões no banco com RLS correspondente
**And** middleware de autorização valida permissões antes de cada Server Action
**And** TDD com testes para cada combinação de permissão
**And** auditoria registra toda concessão de permissão

### Story 8.3: Revogação de Permissões

As a user,
I want to revoke permissions granted to family members at any time,
So that I maintain full control over my financial data.

**Acceptance Criteria:**

**Given** o usuário concedeu permissões a outro membro
**When** decide revogar acesso
**Then** pode revogar permissões a qualquer momento — efeito imediato (FR48)
**And** o membro perde acesso instantaneamente aos dados revogados

**Given** permissões foram revogadas
**When** o membro tenta acessar dados revogados
**Then** os dados não são mais visíveis — nem via dashboard nem via API/Server Actions
**And** RLS bloqueia o acesso no nível do banco (defesa em profundidade)

**Given** o dono revogou e quer restaurar
**When** concede permissões novamente
**Then** o fluxo de concessão é idêntico ao original (Story 8.2)

**And** auditoria registra toda revogação com timestamp
**And** TDD com testes para revogação imediata e tentativa de acesso pós-revogação

---

## Epic 9: Administração e Operações

O administrador pode visualizar todos os usuários cadastrados, impersonar qualquer usuário em ambientes não-produção (bloqueado em produção), restaurar base de dados de produção para ambientes de teste/homologação e monitorar status dos backups.

### Story 9.1: Painel de Usuários e Monitoramento

As an admin,
I want to view all registered users with their status and activity,
So that I can monitor who is using the system and when.

**Acceptance Criteria:**

**Given** o administrador está autenticado
**When** acessa o painel administrativo
**Then** vê a lista de todos os usuários cadastrados com: nome, email, status (ativo/inativo), data de criação e último acesso (FR51)

**Given** a lista de usuários está visível
**When** o administrador consulta
**Then** pode ordenar por qualquer coluna (nome, data de criação, último acesso)
**And** pode filtrar por status (ativo/inativo)

**And** painel administrativo acessível apenas para o administrador (role-based)
**And** rota `/admin` protegida por middleware de verificação de role
**And** TDD, auditoria de acesso ao painel

### Story 9.2: Impersonation em Ambientes Não-Produção

As an admin,
I want to impersonate any user in test and staging environments,
So that I can reproduce issues and debug with the exact same view the user sees.

**Acceptance Criteria:**

**Given** o administrador está no ambiente de teste ou homologação
**When** seleciona um usuário para impersonar (FR52)
**Then** assume a identidade, permissões e visão completa daquele usuário
**And** um banner visual indica claramente que está em modo impersonation
**And** pode encerrar a impersonation a qualquer momento voltando à sessão de admin

**Given** o administrador está no ambiente de produção
**When** tenta impersonar um usuário
**Then** a ação é bloqueada com mensagem explicativa (FR54)
**And** o sistema nunca permite impersonation em produção — bloqueio no middleware e na UI

**Given** o administrador está impersonando
**When** realiza ações como o usuário
**Then** todas as ações são registradas na trilha de auditoria com identificação de que foi via impersonation

**And** variável de ambiente `ENVIRONMENT` define o bloqueio (production = bloqueado)
**And** TDD com testes para bloqueio em produção e permissão em não-produção

### Story 9.3: Restauração de Base de Dados entre Ambientes

As an admin,
I want to restore the production database to test or staging environments,
So that I can debug issues with real data in a safe environment.

**Acceptance Criteria:**

**Given** o administrador está no painel admin
**When** aciona a restauração de base de produção para teste ou homologação (FR53)
**Then** o processo inicia com confirmação explícita ("Isso substituirá todos os dados do ambiente X")
**And** a restauração completa em < 30 minutos (NFR-M3)
**And** ao final, um relatório mostra: tempo total, tabelas restauradas, contagem de registros

**Given** a restauração está em andamento
**When** o administrador acompanha
**Then** vê progresso da operação (ex: "Restaurando tabela transactions... 45%")

**Given** a restauração falha
**When** o erro é detectado
**Then** mensagem específica indica o problema e o ambiente anterior é preservado (rollback)

**And** dados sensíveis (senhas, tokens) são sanitizados durante a restauração para ambientes não-produção
**And** auditoria registra toda restauração com timestamp e ambiente de destino
**And** TDD com testes para o fluxo de confirmação e tratamento de erro

### Story 9.4: Monitoramento de Backups

As an admin,
I want to view backup status and trigger manual restoration,
So that I can ensure data safety and recover from incidents.

**Acceptance Criteria:**

**Given** o administrador acessa o painel admin
**When** navega para a seção de backups
**Then** vê: último backup realizado (data/hora), próximo agendado, resultado de integridade do último backup (FR57)

**Given** os backups estão configurados
**When** o status é exibido
**Then** backup diário automático está ativo com retenção mínima de 90 dias (NFR-C2)
**And** backup semanal completo está ativo com retenção de 1 ano (NFR-C3)
**And** indicador visual: verde (backup saudável), amarelo (último backup > 24h), vermelho (falha no último backup)

**Given** o administrador precisa restaurar
**When** aciona restauração manual (FR57)
**Then** pode selecionar o ponto de restauração (data/hora)
**And** confirmação explícita antes de iniciar
**And** RTO < 4 horas, RPO < 24 horas (NFR-C4)

**And** TDD, auditoria de acesso e ações de backup
