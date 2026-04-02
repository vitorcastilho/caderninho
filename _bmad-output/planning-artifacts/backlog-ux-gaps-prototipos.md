# Backlog UX — Lacunas entre Protótipos e Implementação

**Data:** 2026-04-02
**Origem:** Revisão UX da Story 2.5.4 (Auditoria Visual Exaustiva)
**Revisora:** Sally (UX Designer)

---

## Contexto

Os protótipos HTML (`_bmad-output/prototypes/proto-*.html`) representam a visão final do produto com dados reais e funcionalidades completas. A implementação atual (Épicos 1 e 2) cobre cadastro/CRUD das entidades e a estrutura visual. As lacunas abaixo são funcionalidades visuais que dependem de dados transacionais e features dos Épicos 3+.

**Nenhum item abaixo é bug ou desvio da Story 2.5.4.** São features futuras que precisam ser endereçadas para que as telas cheguem à paridade visual com os protótipos.

---

## 1. Dashboard — Gap ALTO

**Protótipo:** `proto-05-dashboard-desktop.html`, `proto-06-dashboard-mobile.html`
**Implementação atual:** 3 cards placeholder com R$ 0,00

### Lacunas

| # | Elemento | Protótipo | Prioridade | Depende de |
|---|----------|-----------|------------|------------|
| 1.1 | Month picker | Seletor Jan-Mai com setas navegação | Alta | Modelo de mês/período |
| 1.2 | Botão "+ Registrar gasto" | CTA principal no topo | Alta | Épico 3 — fluxo de registro |
| 1.3 | 4 summary cards | Saldo Total, Saídas do Mês, Orçamento Restante, Disponível Livre | Alta | Transações + orçamentos |
| 1.4 | Layout 2 colunas | Esquerda (resumo + orçamentos + contas a pagar) / Direita (regra de ouro + visão tamires + transações) | Alta | Dados agregados |
| 1.5 | Resumo Financeiro card | Saldo - contas a pagar - faturas - orçamentos = disponível livre | Alta | Transações + faturas |
| 1.6 | Orçamentos do Mês | Lista de categorias com budget bars coloridas (verde/amarelo/laranja/vermelho) | Alta | Épico 3 — orçamentos |
| 1.7 | Contas a Pagar | Lista com status (pago/vence amanhã/pendente) + banner de urgência + barra progresso | Média | Épico 3 — checklist |
| 1.8 | Gauge "Regra de Ouro" | SVG semicírculo com % comprometimento em cartões + badge status | Média | Faturas de cartão |
| 1.9 | Visão Tamires | Gastos regulares (ok) vs fora do planejado (badges alerta) | Média | Transações categorizadas |
| 1.10 | Últimas Transações | Lista com ícone + nome + categoria + valor + método (brand badge) | Alta | Épico 3 — transações |

### Nota UX
O Dashboard é a tela mais visitada e hoje é vazia. Priorizar ao menos 1.3 (summary cards com dados reais) e 1.10 (últimas transações) para dar sensação de utilidade ao usuário.

---

## 2. Cartões de Crédito — Gap MÉDIO

**Protótipo:** `proto-12a-credit-cards-list.html`
**Implementação atual:** Grid de cards com nome, brand (texto), limite, datas

### Lacunas

| # | Elemento | Protótipo | Prioridade | Depende de |
|---|----------|-----------|------------|------------|
| 2.1 | Summary cards row | Limite Total, Disponível, Fatura Atual, Próximo Vencimento | Média | Faturas de cartão |
| 2.2 | Brand badge colorido | Visa (azul #1A1F71), Mastercard (preto com círculos), Elo (amarelo) | Baixa | Componente visual |
| 2.3 | Final do cartão | Exibir **** 4532 | Baixa | Campo no modelo |
| 2.4 | Barra de limite | Preenchimento colorido (ok/warning/danger) com Disponível/Limite | Média | Faturas de cartão |
| 2.5 | Fatura atual | Valor + badge status (Estimativa/Fechada/Aberta) | Alta | Épico 3 — faturas |
| 2.6 | Footer "Ver detalhes →" | Link para detalhamento do cartão | Média | Tela de detalhe |

### Nota UX
O `CreditCardBrandBadge` já existe como componente. O item 2.2 é questão de integrar no card da lista (hoje só aparece no onboarding). Os items 2.4 e 2.5 são os mais impactantes pra UX — sem eles o card parece incompleto.

---

## 3. Categorias — Gap MÉDIO

**Protótipo:** `proto-14-categorias.html`
**Implementação atual:** Árvore colapsável 3 níveis com CRUD e total orçamento por classificação

### Lacunas

| # | Elemento | Protótipo | Prioridade | Depende de |
|---|----------|-----------|------------|------------|
| 3.1 | Botão "Colapsar tudo" | Toggle global para fechar todas as classificações | Baixa | Componente visual |
| 3.2 | Budget bars por classificação | Barra horizontal com cor por faixa de uso | Média | Transações categorizadas |
| 3.3 | Budget bars por categoria | Gasto / Orçamento com cores semânticas | Alta | Transações categorizadas |
| 3.4 | Budget bars por subcategoria | Gasto vs orçamento herdado | Média | Transações categorizadas |
| 3.5 | Percentuais de uso | "70% — atenção", "100% — em dia" | Média | Transações categorizadas |
| 3.6 | Estimativa de subcategoria | "6,05% de Moradia" quando sem orçamento próprio | Baixa | Transações categorizadas |
| 3.7 | Status labels coloridos | Badge por faixa (verde/amarelo/laranja/vermelho) | Média | Transações categorizadas |

### Nota UX
A árvore colapsável está bem implementada. O item 3.3 (budget bars por categoria) é o mais impactante — é o core visual da página de categorias nos protótipos. Sem ele a tela é CRUD, com ele vira ferramenta de gestão orçamentária.

---

## 4. Onboarding — Gap BAIXO

**Protótipo:** `proto-08-onboarding.html`
**Implementação atual:** Wizard 5 steps mobile-first

### Lacunas

| # | Elemento | Protótipo | Prioridade | Depende de |
|---|----------|-----------|------------|------------|
| 4.1 | Versão desktop (800px frame) | Card centralizado em frame maior, títulos 22-26px | Baixa | Apenas CSS responsivo |
| 4.2 | Título desktop Welcome | 26px vs 20px atual | Baixa | Apenas CSS |
| 4.3 | Título desktop steps | 22px vs 18px atual | Baixa | Apenas CSS |

### Nota UX
O onboarding é usado uma vez por usuário. A versão mobile (que é o caso de uso principal) está fiel. A adaptação desktop é refinamento, não urgência.

---

## 5. Login/Register — Gap BAIXO

**Protótipo:** `proto-01-login.html`, `proto-02-signup.html`

### Lacunas

| # | Elemento | Protótipo | Prioridade | Depende de |
|---|----------|-----------|------------|------------|
| 5.1 | Link "Esqueci minha senha" | Presente no protótipo, ausente na implementação | Baixa | Feature de reset de senha |

### Nota UX
A tela de login está quase pixel-perfect. O "Esqueci minha senha" é feature, não desvio visual.

---

## 6. Inconsistências Cross-Screen (menores)

| # | Observação | Telas afetadas | Prioridade |
|---|-----------|----------------|------------|
| 6.1 | `CreditCardList` tem loading visual (`opacity-50` durante `isPending`), outras 3 listas não | BankAccountList, InvestmentList, IncomeSourceList | Baixa |
| 6.2 | `CreditCardBrandBadge` usado no onboarding mas não no `CreditCardCard` da lista principal | CreditCardCard vs CreditCardsStep | Baixa |
| 6.3 | Onboarding usa `centsToDisplayValue` para exibição, cards usam `formatCurrency` — resultado visual idêntico mas helpers diferentes | Onboarding steps vs Card components | Baixa (cosmético no código) |

---

## Priorização Sugerida

### Épico 3 (pré-requisito para maioria dos gaps)
Transações, faturas e dados agregados são o pré-requisito para quase todos os gaps acima. Sem eles, não há dados para popular as visualizações.

### Ordem de impacto UX (após Épico 3)
1. **1.3 + 1.10** — Dashboard com summary cards reais + últimas transações (transforma a tela mais visitada)
2. **3.3** — Budget bars nas categorias (transforma CRUD em ferramenta de gestão)
3. **2.4 + 2.5** — Barra de limite + fatura nos cartões (completa a experiência)
4. **1.6** — Orçamentos do Mês no dashboard (feedback visual de controle)
5. **1.7 + 1.8** — Contas a Pagar + Regra de Ouro (alertas proativos)
6. Todo o resto (refinamentos visuais menores)
