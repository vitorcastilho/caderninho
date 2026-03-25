# Story 2.5.2 — Action Items do Review Visual

**Data:** 2026-03-24
**Origem:** Review visual feito pelo PO nos protótipos corrigidos
**Status:** Pendente — dev precisa executar antes de fechar o PR #20

---

## AI-1: Padronizar ícone do logo no sidebar do proto-03

**Severidade:** MEDIUM
**Arquivo:** `_bmad-output/prototypes/proto-03-link-account.html`
**Problema:** O sidebar do proto-03 usa `&#10000;` (✐, U+2710 — "upper right pencil") ao lado de "Caderninho", enquanto TODOS os outros sidebars canônicos (proto-05, 09, 10, 11, 12, 13, 14) usam `✎` (U+270E — "lower right pencil"). O componente real `Sidebar.tsx:93` usa `✎`.

### O que mudar

**Linha 565** — trocar o caractere Unicode do ícone:

```
ANTES:  <span class="sidebar-logo-icon">&#10000;</span>
DEPOIS: <span class="sidebar-logo-icon">✎</span>
```

### O que NÃO mudar

- Proto-01 e proto-02 usam um SVG de caderneta (notebook) — isso está CORRETO. A tela de login no app real (`LoginForm.tsx:81`) usa `BookOpen` do Lucide, que é conceitualmente o mesmo ícone de caderneta. Não alterar proto-01 nem proto-02.
- Os demais protos (05, 09-14) já usam `✎` — não alterar.

---

## AI-2: Adicionar badge de bandeira em todos os cartões do proto-04

**Severidade:** HIGH
**Arquivo:** `_bmad-output/prototypes/proto-04-permissions.html`
**Problema:** Na tela de permissões (seção "Entidades"), apenas o "Cartão Latam Pass" tem o badge `VISA`. Os outros 3 cartões (Pão de Açúcar, Uniclass, PDA) aparecem sem nenhuma bandeira. O badge de bandeira é informação visual importante — o usuário precisa identificar rapidamente qual cartão é qual.

### Bandeiras dos cartões (referência: proto-05 e proto-07)

| Cartão | Bandeira | Classe CSS | Evidência |
|--------|----------|------------|-----------|
| Latam Pass | VISA | `method-brand-visa` | Já está correto em todas as ocorrências |
| Pão de Açúcar | Mastercard | `method-brand-master` | Proto-07 mostra "Nubank Master" como Mastercard; Pão de Açúcar é cartão store Mastercard |
| Uniclass | VISA | `method-brand-visa` | Proto-05 linha 1228: `VISA Uniclass 3x` |
| PDA | VISA | `method-brand-visa` | Proto-05 linha 1195: `VISA PDA` |

### O que mudar — DESKTOP (seção "Entidades")

**Linha 967** — Pão de Açúcar (desktop):
```
ANTES:  <div class="perm-item-name">Cartao Pao de Acucar</div>
DEPOIS: <div class="perm-item-name">Cartao <span class="method-brand method-brand-master"></span>Pao de Acucar</div>
```

**Linha 979** — Uniclass (desktop):
```
ANTES:  <div class="perm-item-name">Cartao Uniclass</div>
DEPOIS: <div class="perm-item-name">Cartao <span class="method-brand method-brand-visa">VISA</span>Uniclass</div>
```

**Linha 991** — PDA (desktop):
```
ANTES:  <div class="perm-item-name">Cartao PDA</div>
DEPOIS: <div class="perm-item-name">Cartao <span class="method-brand method-brand-visa">VISA</span>PDA</div>
```

### O que mudar — MOBILE FRAME 1 (accordion "Entidades")

**Linha 1239** — Pão de Açúcar (mobile 1):
```
ANTES:  <div class="m-perm-name">Cartao Pao de Acucar</div>
DEPOIS: <div class="m-perm-name">Cartao <span class="method-brand method-brand-master"></span>Pao de Acucar</div>
```

**Linha 1245** — Uniclass (mobile 1):
```
ANTES:  <div class="m-perm-name">Cartao Uniclass</div>
DEPOIS: <div class="m-perm-name">Cartao <span class="method-brand method-brand-visa">VISA</span>Uniclass</div>
```

**Linha 1251** — PDA (mobile 1):
```
ANTES:  <div class="m-perm-name">Cartao PDA</div>
DEPOIS: <div class="m-perm-name">Cartao <span class="method-brand method-brand-visa">VISA</span>PDA</div>
```

### O que mudar — MOBILE FRAME 2 (accordion "Entidades" expandido)

**Linha 1473** — Pão de Açúcar (mobile 2):
```
ANTES:  <div class="m-perm-name">Cartao Pao de Acucar</div>
DEPOIS: <div class="m-perm-name">Cartao <span class="method-brand method-brand-master"></span>Pao de Acucar</div>
```

**Linha 1477** — Uniclass (mobile 2):
```
ANTES:  <div class="m-perm-name">Cartao Uniclass</div>
DEPOIS: <div class="m-perm-name">Cartao <span class="method-brand method-brand-visa">VISA</span>Uniclass</div>
```

**Linha 1481** — PDA (mobile 2):
```
ANTES:  <div class="m-perm-name">Cartao PDA</div>
DEPOIS: <div class="m-perm-name">Cartao <span class="method-brand method-brand-visa">VISA</span>PDA</div>
```

### CSS necessário

O proto-04 já tem as classes `.method-brand`, `.method-brand-visa` e `.method-brand-master` definidas (linhas 553-587). Nenhuma alteração de CSS necessária.

### O que NÃO mudar

- "Cartao Latam Pass" já tem `method-brand-visa` em TODAS as ocorrências — não alterar.
- Contas bancárias (Conta Pessoal Vitor, Conta Pessoal Tamires, Empresa Alpha, Empresa Beta) NÃO têm bandeira — correto, são contas bancárias, não cartões.

---

## AI-3: Ajustar posicionamento do percentual no gauge "Regra de Ouro" do proto-05

**Severidade:** MEDIUM
**Arquivo:** `_bmad-output/prototypes/proto-05-dashboard-desktop.html`
**Problema:** O texto "68,00%" está posicionado em `y="78"` dentro de um SVG com `viewBox="0 0 160 100"`. O arco do gauge termina em `y=90` (ponto mais baixo do semicírculo). Com font-size 28px, o texto de 68,00% já fica muito próximo do arco. Se o valor for 100,00% (7 caracteres vs 6), o texto ficaria ainda mais largo e potencialmente sobreporia o arco.

### Contexto técnico do SVG

- `viewBox="0 0 160 100"` — canvas de 160x100
- Arco: `M 15 90 A 65 65 0 0 1 145 90` — semicírculo de raio 65, centro em (80, 90), topo em y=25, laterais em y=90
- `stroke-width="12"` — o arco tem espessura de 12px, então a borda interna do arco fica em y ≈ 90 - 6 = 84
- Texto atual: `x="80" y="78"` com `font-size: 28px` — a baseline fica em y=78, mas os ascendentes do texto sobem ~22px acima (y ≈ 56), e os descendentes descem ~6px abaixo (y ≈ 84). O limite inferior do texto TOCA a borda interna do arco.

### O que mudar

**1. Aumentar o viewBox para dar mais espaço abaixo do arco (linha 1097):**

```
ANTES:  <svg class="gauge-svg" viewBox="0 0 160 100">
DEPOIS: <svg class="gauge-svg" viewBox="0 0 160 110">
```

**2. Mover o texto para baixo do arco, fora da área do semicírculo (linha 1106):**

```
ANTES:  <text x="80" y="78" text-anchor="middle" class="gauge-label-center">68,00%</text>
DEPOIS: <text x="80" y="108" text-anchor="middle" class="gauge-label-center">68,00%</text>
```

**3. Atualizar o CSS do `.gauge-svg` para acomodar a nova altura (linha 617):**

```
ANTES:  height: 100px;
DEPOIS: height: 110px;
```

### Resultado visual esperado

O percentual "68,00%" aparece **abaixo** do arco do gauge (entre o arco e o texto "Comprometimento em cartões"), em vez de dentro do semicírculo. Isso garante que mesmo com "100,00%" o texto nunca sobrepõe o arco.

### O que NÃO mudar

- O gradiente do arco, o stroke-width, o stroke-dasharray/offset — tudo isso permanece igual.
- O `.gauge-info` abaixo (título + detalhe + badge) permanece igual.

---

## AI-4: Adicionar indicador de banco na transação de débito do proto-05

**Severidade:** MEDIUM
**Arquivo:** `_bmad-output/prototypes/proto-05-dashboard-desktop.html`
**Problema:** Na seção "Transações Recentes", 4 das 5 transações mostram o badge da bandeira do cartão + nome do cartão (ex: `VISA Latam Pass`). A transação de débito (Uber — R$ 32,00) mostra apenas o texto "Débito · Ontem" sem nenhuma identificação de qual banco. O usuário precisa saber de qual conta bancária saiu o dinheiro.

### Contexto: como o app real trata isso

O app tem o componente `BankLogo` (`src/client/components/ui/bank-logo.tsx`) que renderiza logos de bancos (Nubank, Itaú, BB, etc.). Em protótipos HTML, não temos componentes React, então usamos um badge textual simples similar ao `.method-brand`.

### O que mudar

**1. Adicionar CSS para badge de banco (após a definição de `.method-brand-master::after`, por volta da linha 787):**

```css
.bank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  vertical-align: middle;
  margin-right: 4px;
}
.bank-badge-itau {
  background: #003399;
  color: #FFFFFF;
}
```

**2. Atualizar a transação de débito (linha 1217):**

```
ANTES:  <div class="txn-meta">Débito &middot; Ontem</div>
DEPOIS: <div class="txn-meta"><span class="bank-badge bank-badge-itau">Itaú</span>Débito &middot; Ontem</div>
```

### Resultado visual esperado

A transação "Uber" mostra: `[Itaú] Débito · Ontem` — com "Itaú" num badge azul escuro (#003399) de 16px de altura, estilo visual consistente com os badges VISA/Mastercard das outras transações.

### O que NÃO mudar

- As outras 4 transações (Pão de Açúcar, Shell, iFood, Amazon) já têm badges corretos — não alterar.
- O badge é apenas visual no protótipo — a implementação real usará o componente `BankLogo`.

---

## AI-5: Integrar seção "Bônus" como sub-estado do Estado 3 no proto-07

**Severidade:** HIGH
**Arquivo:** `_bmad-output/prototypes/proto-07-cascade-input.html`
**Problema:** O protótipo mostra 4 estados sequenciais (storyboard) + uma seção "Bônus — Variação Cartão de Crédito (Parcelamento)" separada do fluxo. Essa seção aparece como uma 5ª tela isolada, gerando confusão sobre se é uma alternativa ou um estado adicional. Na verdade, o parcelamento é um **sub-estado condicional do Estado 3** — aparece quando o usuário seleciona cartão de crédito como método de pagamento.

### Estrutura ATUAL (confusa)

```
Estado 1: Valor (keypad)
Estado 2: Categoria (chips)
Estado 3: Detalhes + Impacto (estabelecimento + pagamento "à vista" + preview de impacto)
Estado 4: Confirmar (revisão final + botão confirmar)
────────── separador ──────────
Bônus: Variação Cartão de Crédito (Parcelamento)  ← TELA ISOLADA, desconectada do fluxo
────────── separador ──────────
Desktop: Side Sheet (400px)
```

### Estrutura DESEJADA (clara)

```
Estado 1: Valor (keypad)
Estado 2: Categoria (chips)
Estado 3a: Detalhes — Pagamento à Vista (estabelecimento + dropdown pagamento + preview de impacto)
Estado 3b: Detalhes — Parcelamento no Cartão (mesmo layout, com roller picker de parcelas visível)
Estado 4: Confirmar (revisão final + botão confirmar)
────────── separador ──────────
Desktop: Side Sheet (400px)
```

### O que mudar

**1. Renomear o label do Estado 3 atual (linhas 1127-1128):**

```
ANTES:
  Estado 3: Detalhes + Impacto
  <span>Estabelecimento, pagamento e prévia</span>

DEPOIS:
  Estado 3a: Pagamento à Vista
  <span>Estabelecimento, pagamento e prévia de impacto</span>
```

**2. Renomear a seção "Bônus" para "Estado 3b" (linhas 1384-1398):**

Remover:
```html
<!-- ════════════════════════════════════════════ -->
<!-- BONUS: CREDIT CARD VARIATION                 -->
<!-- ════════════════════════════════════════════ -->
<hr class="section-divider">

<div class="section-header">
  <h2>Bonus — Variação Cartão de Crédito (Parcelamento)</h2>
  <p>Roller picker horizontal de parcelas aparece ao selecionar pagamento com cartão</p>
</div>

<div class="phone-row">
  <div class="phone-column">
    <div class="phone-label">
      Parcelamento
      <span>Roller picker horizontal de parcelas</span>
    </div>
```

Substituir por:
```html
<!-- ──── STATE 3b: Parcelamento no Cartão ──── -->

<div class="phone-row">
  <div class="phone-column">
    <div class="phone-label">
      Estado 3b: Parcelamento no Cartão
      <span>Quando o usuário seleciona cartão de crédito, o roller de parcelas aparece</span>
    </div>
```

**3. Mover o Estado 3b para DENTRO da mesma `.phone-row` dos estados 1-4, ou imediatamente após o Estado 3a e antes do Estado 4.**

A ideia é que os estados fluam visualmente como: `1 → 2 → 3a → 3b → 4`, todos na mesma "faixa" de storyboard. Se a `.phone-row` não couber 6 phone frames, é aceitável ter 2 linhas:
- Linha 1: Estados 1, 2, 3a
- Linha 2: Estados 3b, 4

**4. Remover o `<hr class="section-divider">` e o `<div class="section-header">` do antigo "Bônus" (linhas 1384-1392).** O Estado 3b é parte do fluxo, não uma seção separada.

**5. Atualizar o step-indicator do Estado 3b** para mostrar que é o mesmo passo 3 (não passo 5):

O Estado 3b deve ter o MESMO step-indicator que o 3a:
```html
<div class="step-indicator" style="justify-content: center; padding: 8px 0;">
  <div class="step-dot done"></div>
  <div class="step-dot done"></div>
  <div class="step-dot active"></div>
  <div class="step-dot"></div>
</div>
```

(Atualmente a seção Bônus NÃO tem step-indicator — adicionar.)

**6. NÃO alterar o conteúdo interno do phone frame** — o roller picker de parcelas, os chips de pagamento, o impact-preview, o botão "Confirmar 2x R$ 43,50" — tudo permanece igual. Só muda a posição no layout e os labels.

### O que NÃO mudar

- Estados 1, 2, 4 — sem alteração.
- Seção Desktop (Side Sheet 400px) — sem alteração.
- O conteúdo HTML/CSS/JS dentro do phone frame do parcelamento — sem alteração.
- O JavaScript interativo (roller, chips) — sem alteração.

---

## Checklist de Validação

Após executar os 5 action items, o dev deve verificar:

- [ ] AI-1: Abrir proto-03 no browser → sidebar mostra `✎ Caderninho` (e não `✐`)
- [ ] AI-2: Abrir proto-04 no browser → na seção "Entidades" (desktop E mobile), TODOS os 4 cartões mostram badge de bandeira (Latam Pass = VISA, Pão de Açúcar = Mastercard, Uniclass = VISA, PDA = VISA)
- [ ] AI-3: Abrir proto-05 no browser → o gauge "Regra de Ouro" mostra 68,00% ABAIXO do arco, sem sobreposição
- [ ] AI-4: Abrir proto-05 no browser → a transação "Uber" mostra `[Itaú] Débito · Ontem` com badge azul do banco
- [ ] AI-5: Abrir proto-07 no browser → o fluxo mostra "Estado 3a: Pagamento à Vista" e "Estado 3b: Parcelamento no Cartão" como parte da mesma sequência, sem seção "Bônus" separada
