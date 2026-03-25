# Decisão de Produto: Modelo de Categorização v2

**Data:** 2026-03-25
**Origem:** Discussão PO + Dev durante review visual do proto-14 (Story 2.5.2)
**Status:** Aprovado pelo PO
**Impacto:** Modelo de dados, proto-14, proto-15 (drill-down), proto-09 (orçamentos), onboarding (proto-08)

---

## 1. Contexto

Durante o review visual da Story 2.5.2, o PO identificou que a modelagem de categorias no proto-14 não refletia a forma como ele organiza seus gastos. A discussão revelou que o modelo atual (4 classificações fixas + categorias granulares) precisa evoluir para uma hierarquia de 4 níveis com classificações customizáveis e orçamento flexível.

### Modelo anterior (Story 2.5.1)

```
Classificação (fixa: 4 tipos) → Categoria (orçamento + método pagamento) → Subcategoria (override opcional de método)
```

### Modelo novo (v2)

```
Classificação (customizável) → Categoria → Subcategoria (método pagamento) → Estabelecimento (aprendido do uso)
```

---

## 2. Hierarquia de 4 Níveis

| Nível | Configurável pelo usuário? | Orçamento mensal | Método de pagamento | Exemplo |
|-------|---------------------------|------------------|---------------------|---------|
| **Classificação** | Sim — criar, editar, remover | Sim (opcional) | Não | Essenciais fixos, Qualidade de vida |
| **Categoria** | Sim — criar, editar, remover | Sim (opcional) | Não | Alimentação, Transporte, Moradia |
| **Subcategoria** | Sim — criar, editar, remover | Sim (opcional) | Sim — padrão para registros | Supermercado, Gasolina, Aluguel |
| **Estabelecimento** | Aprendido do uso (texto livre) | Sim (opcional) | Aprendido do uso | Pão de Açúcar, Shell, McDonald's |

### 2.1 Classificações são 100% customizáveis

As classificações NÃO são mais fixas em 4 tipos. Cada usuário define as suas. Exemplos:

**Usuário A:**
- Essenciais fixos
- Essenciais variáveis
- Qualidade de vida
- Investimentos
- Proteção
- Objetivos (metas)
- Imprevistos

**Usuário B:**
- Essenciais
- Qualidade de vida
- Investimentos
- Proteção
- Doações

**Usuário C:**
- Essenciais
- Qualidade de vida
- Investimentos
- Proteção

### 2.2 Método de pagamento: onde fica

- **Subcategoria** — é onde o método é configurado manualmente (ex: Supermercado → Latam Pass Visa)
- **Estabelecimento** — aprende do uso qual método o usuário mais usa naquele lugar específico, criando um padrão próprio para o estabelecimento

**Prioridade na hora do registro:**

```
1. Estabelecimento tem padrão próprio (aprendido)?  → Sugere o método do estabelecimento
2. Estabelecimento novo (sem padrão)?                → Sugere o método da subcategoria
3. Sem subcategoria com método definido?             → Usuário escolhe manualmente
```

**Importante:** O padrão do estabelecimento NÃO sobrepõe o da subcategoria. São padrões independentes. O do estabelecimento é o padrão DELE. O da subcategoria continua existindo e é usado para estabelecimentos novos.

Exemplo:
```
Subcategoria: Fast Food [padrão: PDA Visa]
  McDonald's  [padrão aprendido: PDA Visa]     ← coincide com subcategoria
  Burger King [padrão aprendido: Latam Pass]   ← diferente, é o padrão DO Burger King
  KFC         [sem padrão ainda]               ← novo, sugere PDA Visa (da subcategoria)
```

O usuário SEMPRE pode trocar o método na hora do registro, independente da sugestão.

---

## 3. Modelo de Orçamento

### 3.1 Orçamento é opcional em todos os níveis

Cada nível pode ter ou não ter um orçamento mensal definido. O usuário decide o nível de detalhe:
- Pode definir só na classificação (ex: "Essenciais fixos: R$ 6.000")
- Pode detalhar até subcategoria (ex: "Aluguel: R$ 2.200")
- Pode misturar (algumas categorias com orçamento, outras sem)
- Pode até definir para estabelecimento (ex: "McDonald's: R$ 200/mês")

### 3.2 Alocação flexível com saldo não alocado

```
📊 Essenciais fixos [Orçamento: R$ 6.000,00]
  🏠 Moradia [Orçamento: R$ 4.000,00]
    ├─ Aluguel [R$ 2.200,00]
    ├─ Condomínio [R$ 800,00]
    ├─ Internet [R$ 158,00]
    └─ (não alocado dentro de Moradia: R$ 842,00)
  📱 Assinaturas [sem orçamento definido]
    ├─ Streaming [sem orçamento]
    └─ Apps [sem orçamento]
  (não alocado na classificação: R$ 2.000,00) ← 6.000 - 4.000
```

O saldo não alocado é visível e disponível para uso livre dentro daquele nível.

### 3.3 Regras de exibição visual

| Cenário | Indicador visual |
|---------|-----------------|
| Dentro do orçamento | Barra verde + "R$ X restantes" |
| Próximo do limite (ex: >80%) | Barra amarela/atenção |
| Estourou o orçamento | Barra vermelha com a parte excedente visível + texto "+R$ 500,00 acima (12,50%)" |
| Categoria estourou mas classificação ainda cabe | Categoria em vermelho, classificação em amarelo/atenção (algo dentro precisa de atenção) |
| Sem orçamento definido | Barra cinza (sem julgamento) + percentual relativo ao nível pai. Ex: "R$ 300,00 (5,00% de Essenciais fixos)" |

#### Estouro visual detalhado

A barra deve deixar claro o quanto foi estourado:

```
Moradia                        R$ 4.500,00 / R$ 4.000,00
[██████████████████████|██████] +R$ 500,00 acima (12,50%)
         100%          │ 112,5%
                       └─ linha do limite
```

A parte além do 100% aparece em vermelho, visualmente distinta.

#### Sem orçamento — barra proporcional ao pai

```
Assinaturas                    R$ 300,00 (5,00% de Essenciais fixos)
[███░░░░░░░░░░░░░░░░░░░░░░░░░] ← barra cinza, sem julgamento verde/vermelho
```

---

## 4. Exemplo Completo (dados reais do PO)

```
📊 Essenciais fixos [Orçamento: R$ 6.000,00]
  🏠 Moradia [Orçamento: R$ 4.000,00]
    ├─ Aluguel [R$ 2.200,00] [Débito Itaú]
    ├─ Condomínio [R$ 800,00] [Débito Itaú]
    ├─ Luz [Débito Itaú]
    └─ Internet [R$ 158,00] [PDA Visa]
  📱 Assinaturas [Orçamento: R$ 200,00]
    ├─ Streaming [Latam Pass Visa]
    └─ Apps [Latam Pass Visa]

📊 Essenciais variáveis [Orçamento: R$ 8.000,00]
  🍽 Alimentação [Orçamento: R$ 5.500,00]
    ├─ Supermercado [R$ 3.000,00] [Latam Pass Visa]
    │    └─ Pão de Açúcar, Bistek, Angeloni...
    ├─ Restaurante trabalho [R$ 1.500,00] [PDA Visa]
    │    └─ Da Terra, Frango e Fritas...
    └─ Feira/Hortifruti [R$ 500,00] [Latam Pass Visa]
         └─ Feira do bairro...
  🚗 Transporte [Orçamento: R$ 1.500,00]
    ├─ Gasolina [R$ 600,00] [Latam Pass Visa]
    │    └─ Shell, Ipiranga...
    ├─ Estacionamento [R$ 300,00] [PDA Visa]
    │    └─ Estapar, estacionamento do shopping...
    ├─ Pedágio [R$ 200,00] [Débito Itaú - ConectCar]
    │    └─ ConectCar...
    └─ Manutenção [R$ 400,00] [PDA Visa]
         └─ Oficina do João, concessionária...

📊 Qualidade de vida [Orçamento: R$ 4.000,00]
  🍔 Restaurante [Orçamento: R$ 2.000,00]
    ├─ Fast Food [R$ 500,00] [PDA Visa]
    │    └─ McDonald's, Burger King, Subway...
    ├─ Delivery [R$ 800,00] [PDA Visa]
    │    └─ iFood, Rappi...
    └─ Jantar fora [R$ 700,00] [PDA Visa]
         └─ Outback, Cantina Italiana...
  ✈️ Viagem [Orçamento: R$ 2.000,00]
    ├─ Hospedagem [Latam Pass Visa]
    │    └─ Airbnb, Hotel X...
    ├─ Alimentação viagem [PDA Visa]
    │    └─ Restaurante na viagem...
    ├─ Transporte viagem [Latam Pass Visa]
    │    └─ Gasolina, pedágio, Uber...
    └─ Passeios [PDA Visa]
         └─ Ingresso parque, museu...

📊 Investimentos
  📈 Educação [Orçamento: R$ 2.800,00]
    ├─ Cursos [Débito Itaú]
    └─ Livros [Latam Pass Visa]

📊 Proteção
  🛡 Seguros [Orçamento: R$ 500,00]
    ├─ Seguro carro [Débito Itaú]
    └─ Plano saúde [Boleto]

📊 Imprevistos [Orçamento: R$ 1.000,00]
  (sem categorias pré-definidas — o usuário cria quando surge)
```

---

## 5. Impacto no Modelo de Dados

### O que muda vs modelo atual (Story 2.5.1):

| Aspecto | Modelo atual | Modelo v2 |
|---------|-------------|-----------|
| Classificações | Enum fixo (4 tipos) no campo `essentiality` | Entidade customizável — tabela `classifications` |
| Método de pagamento | Na categoria (com override na subcategoria) | Na subcategoria (categoria NÃO tem mais) |
| Orçamento | Só na categoria (`monthlyBudget`) | Em todos os níveis (classificação, categoria, subcategoria, estabelecimento) — todos opcionais |
| Estabelecimento | Não existe como entidade | Nova entidade aprendida do uso, com padrão de método e orçamento opcional |

### Novas entidades/campos necessários:

1. **Tabela `classifications`** — substitui o enum `essentiality`
   - `id`, `userId`, `name`, `emoji` (opcional), `monthlyBudget` (opcional), `sortOrder`

2. **Tabela `categories`** — atualizar
   - Remover: `essentiality` (enum), `defaultPaymentMethodType`, `defaultPaymentMethodId`
   - Adicionar: `classificationId` (FK → classifications)
   - Manter: `monthlyBudget` (já existe)

3. **Tabela `subcategories`** — já tem override de método (Story 2.5.1)
   - Os campos `defaultPaymentMethodType` e `defaultPaymentMethodId` passam a ser os campos PRIMÁRIOS (não mais "override")
   - Adicionar: `monthlyBudget` (opcional)

4. **Tabela `establishments`** (nova)
   - `id`, `userId`, `subcategoryId` (FK), `name`, `learnedPaymentMethodType`, `learnedPaymentMethodId`, `monthlyBudget` (opcional), `usageCount`

---

## 6. Impacto nos Protótipos

| Protótipo | Impacto |
|-----------|---------|
| **proto-14** (Configurações) | Redesign significativo — tabs de classificações customizáveis, categorias agrupadas por classificação, subcategorias com método, sem "essencialidade" como dropdown |
| **proto-15** (Drill-down) | Atualizar hierarquia — nível 1 = classificação, nível 2 = categoria, nível 3 = subcategoria, nível 4 = estabelecimento |
| **proto-09** (Orçamentos) | Atualizar para refletir orçamento multi-nível com barras de estouro e barra cinza |
| **proto-08** (Onboarding) | Atualizar etapa de categorias — agora com classificações customizáveis |
| **proto-07** (Cascade input) | Atualizar hierarquia de seleção no registro |

---

## 7. Decisão sobre `categories-ux-v2.html`

**ARQUIVAR** — proto-14 é o canônico para categorias. O categories-ux-v2 foi uma exploração UX anterior que ficou redundante.

---

## 8. Questões em Aberto

_(nenhuma — todas as decisões foram tomadas na discussão)_
