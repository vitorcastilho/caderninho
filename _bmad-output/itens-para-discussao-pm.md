# Itens para Discussão com PM

Pontos descobertos durante o desenvolvimento que precisam de decisão de produto.

---

## 1. Método de pagamento padrão: categoria vs subcategoria

**Contexto:** Story 2.5 implementou método de pagamento padrão por **categoria**. Durante uso real, percebemos que o padrão faz mais sentido por **subcategoria**.

**Exemplos concretos:**
- **Moradia** → Aluguel (débito em conta) vs Internet (cartão de crédito) — mesma categoria, métodos diferentes
- **Alimentação** → Restaurante (Visa Flash) vs Supermercado (cartão Pão de Açúcar) — mesma categoria, cartões diferentes

**Opções:**
- A) Mover o default de categoria para subcategoria
- B) Manter na categoria como fallback e adicionar override na subcategoria
- C) Manter como está (por categoria) — aceitar que o usuário vai trocar manualmente em alguns casos

**Impacto:** Story 3.1 (registro de gastos) usa o default para pré-seleção. A decisão precisa ser tomada antes ou durante o Epic 3.

**Origem:** Observação durante desenvolvimento da Story 2.5 (Epic 2).

---

## Pontos de Melhoria

### PM-1. Logo de bancos brasileiros no lugar de iniciais

**Contexto:** No onboarding (Story 2.6) e nas telas de contas bancárias, o ícone da conta mostra as 2 primeiras letras do nome do banco (ex: "In" para Inter, "It" para Itaú). Visualmente fica pobre e confuso — bancos diferentes ficam parecidos.

**Proposta:** Criar um componente `BankLogo` (similar ao `CreditCardBrandBadge` que já existe para bandeiras de cartão) que:
- Mapeia nomes de bancos conhecidos (Nubank, Itaú, Bradesco, BB, Santander, Inter, C6, Caixa, Sicoob, Sicredi, etc.) para cores e identidade visual
- Exibe badge com cor institucional do banco + sigla estilizada ou ícone SVG inline
- Fallback para iniciais genéricas quando o banco não é reconhecido

**Escopo:** ~15-20 bancos mais usados no Brasil. Sem dependência externa (SVGs inline, sem API, sem CDN).

**Onde impacta:** Onboarding Step 2 (BankAccountsStep), tela de contas bancárias (/accounts), e futuramente qualquer lugar que exiba contas.

**Origem:** Observação durante testes da Story 2.6 (Epic 2).

### PM-2. Suporte a cartão de débito no cadastro de cartões

**Contexto:** O step de cartões de crédito no onboarding (e o CRUD de cartões em geral) só suporta cartão de crédito. O schema atual tem campos específicos de crédito: `limitCents`, `closingDay`, `dueDay`. Não existe campo `type` para diferenciar crédito de débito.

**Problema:** Muitos cartões brasileiros são débito ou múltiplos (crédito + débito). O usuário que quer registrar um cartão de débito não tem como fazer isso hoje.

**Opções:**
- A) Adicionar campo `type` (`credit` | `debit` | `both`) à tabela `credit_cards` — campos de fatura (`closingDay`, `dueDay`, `limitCents`) ficam opcionais para débito. Renomear entidade para `Card` ou `PaymentCard`
- B) Não cadastrar cartão de débito separado — débito é inerente à **conta bancária**. O método de pagamento "débito" aponta para a conta, não para um "cartão de débito"
- C) Criar entidade separada `DebitCard` vinculada à `BankAccount`

**Recomendação técnica:** Opção B é a mais simples e faz sentido financeiramente — débito = sai direto da conta. Opção A é mais flexível mas adiciona complexidade (migração, validações condicionais, renomear entidade).

**Onde impacta:** Schema `credit_cards`, onboarding step 3, CRUD de cartões, e futuramente o registro de gastos (Epic 3) que vai precisar do método de pagamento.

**Origem:** Questionamento durante testes da Story 2.6 (Epic 2).
