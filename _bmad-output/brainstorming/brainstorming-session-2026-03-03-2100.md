---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Aplicação pessoal de gestão financeira (fluxo de caixa) multiplataforma para substituir planilha Excel, com dashboard compreensível para uso compartilhado com a esposa'
session_goals: 'App mobile e desktop para fluxo de caixa pessoal; dashboard intuitivo que a esposa compreenda; engajar esposa a documentar ganhos/gastos; facilitar registro detalhado de transações sem esforço manual excessivo; superar experiência negativa com apps anteriores'
selected_approach: 'ai-recommended'
techniques_used: ['Role Playing', 'Reverse Brainstorming', 'SCAMPER Method']
ideas_generated: ['73 insights organizados em 9 temas']
session_active: false
workflow_completed: true
context_file: '_bmad/bmm/data/project-context-template.md'
---

# Brainstorming Session Results

**Facilitador:** Vitorcastilho
**Data:** 2026-03-03

## Visão Geral da Sessão

**Tópico:** Aplicação pessoal de gestão financeira (fluxo de caixa) — multiplataforma (celular + computador) — para substituir uma planilha Excel funcional porém incompreensível para outros.

**Objetivos:**
- Gerenciar fluxo de caixa pessoal e familiar
- Dashboard visual e intuitivo para análise de balanço
- Clareza suficiente para que a esposa compreenda o dashboard
- Engajar a esposa a também registrar seus ganhos e gastos
- Facilitar o registro detalhado de transações (categoria, valor, método de pagamento) sem o esforço manual que a planilha atual exige
- Superar a experiência negativa com aplicativos financeiros anteriores

### Contexto e Dores Atuais

- Planilha Excel funciona para o Vitor, mas ninguém mais consegue entender
- Apps testados anteriormente foram tão desanimadores que causaram abandono do registro financeiro
- Na planilha, o detalhamento é sacrificado pelo esforço: em vez de registrar restaurante + valor + cartão utilizado, registra apenas restaurante + valor
- Controle de crédito disponível nos cartões é feito manualmente em local separado
- Não há visibilidade sobre os ganhos e gastos da esposa
- A esposa é descrita como quem "mais inventa" nos gastos — existe uma necessidade de consciência financeira compartilhada

### Necessidade de Análise em Camadas (Drill-Down)

- Deseja visualização hierárquica: Categoria > Subcategoria > Estabelecimento (ex: Restaurante > Fast Food > McDonald's)
- Análise proporcional dentro de categorias: não apenas "gastei R$500 em restaurante", mas "80% foi no McDonald's"
- Padrões de comportamento de consumo: descobrir onde o dinheiro realmente está indo vs. onde se imagina que vai
- Esse nível de detalhe é fundamental para gerar consciência financeira compartilhada no dashboard

### Configuração da Sessão

_Sessão focada em explorar soluções para gestão financeira pessoal/familiar, com ênfase especial em UX acessível, engajamento do segundo usuário (esposa), e redução da fricção no registro de transações._

## Seleção de Técnicas

**Abordagem:** Técnicas Recomendadas por IA
**Contexto da Análise:** App de gestão financeira pessoal/familiar com foco em dois perfis de usuário distintos, engajamento, e análise em camadas

**Técnicas Recomendadas:**

- **Role Playing (Fase 1 — Fundação):** Explorar perspectivas dos dois perfis de usuário (power user vs. usuário visual/casual) para mapear necessidades, frustrações e motivações de cada um
- **Reverse Brainstorming (Fase 2 — Destruição Criativa):** Gerar anti-padrões ("como criar o pior app de finanças") para revelar, por inversão, os princípios de design essenciais — aproveitando a experiência negativa com apps anteriores
- **SCAMPER Method (Fase 3 — Construção Sistemática):** Aplicar 7 lentes criativas sobre a planilha Excel existente para transformá-la sistematicamente em uma solução nova sem perder o que já funciona

**Racional da IA:** Sequência desenhada para ir da empatia com os usuários → eliminação de anti-padrões → construção sistemática. A combinação de técnica colaborativa + criativa + estruturada garante cobertura completa do problema, desde a dimensão humana/relacional até a dimensão técnica/funcional.

## Execução das Técnicas

### Fase 1: Role Playing — Entendendo os Usuários

#### Persona Vitor (Power User)

**[Fluxo de Trabalho #1]**: Registro em Lote (Batch)
- Não registra em tempo real — acumula e faz sessões de atualização 1-2x por semana, com reconciliação completa no fim do mês

**[Escopo #2]**: Multi-Entidade Financeira
- Múltiplas entidades: contas pessoais, cartões de crédito, empresa do Vitor (Castilho), empresa da Tamires (Consultório)

**[Workflow #3]**: Ritual Multi-Dispositivo
- Trabalha simultaneamente no computador (planilha) e celular (apps bancários) — fluxo de duas telas

**[Escopo #4]**: Gestão de Boletos e Débito Automático
- Inclui gestão ativa de contas a pagar, busca de boletos e cadastro de débito automático

**[Fluxo Financeiro #5]**: Pipeline Empresa → Pessoa Física
- Empresa recebe → paga impostos e custos → transfere lucro para conta pessoal (Pró-labore ou Distribuição de Lucros)

**[Dor Crítica #6]**: Emissão de Nota Fiscal (FORA DO ESCOPO)
- Processo estressante mas deliberadamente excluído deste app — potencial projeto separado

**[Stakeholder #7]**: O Contador como Terceiro Consumidor de Dados
- Informações precisam ser organizadas para o contador — possibilidade de relatórios/exportações

**[Escopo #8]**: Fronteira de Escopo Definida
- NF fora, mas fluxo empresa→pessoa física permanece no escopo

#### Análise da Planilha Excel (Screenshots)

**[Planilha-Insight #16]**: Sistema de Cores como Linguagem Visual
- Laranja = pagamento manual, Azul = débito automático cartão. Funcional para Vitor, invisível para outros

**[Planilha-Insight #17]**: Coluna "O Que Falta Pagar" como Coração do Controle
- Foco em obrigações futuras, não apenas histórico de gastos

**[Planilha-Insight #18]**: Categorização Multidimensional
- 6+ dimensões por transação: dia pagamento, descrição, tipo destino, destino, valor, carteira/cartão, valor real, falta pagar

**[Planilha-Insight #19]**: Gastos Estimados vs. Reais
- Supermercado R$3.000 e Gasolina R$600 são estimativas/orçamentos, não valores exatos

**[Planilha-Insight #20]**: Saldo Final Negativo (-R$133,47)
- Métrica-mestre: saldo conta - total a pagar = margem real. Isso responde "a gente pode?"

**[Planilha-Insight #21]**: Agrupamento por Pessoa/Responsabilidade
- "Tami e Sofia", "Sofia & Mafê" — conceito de beneficiário/centro de custo familiar

**[Cartões #22]**: Controle de 3 Camadas por Cartão
- 4 cartões ativos (quer reduzir para 2 por estratégia de milhas): Pão de Açúcar Master, Latam Pass Visa, Uniclass Visa, Inter Master
- 6 métricas cada: Limite, Limite Disponível, Utilizado, Utilizado Líquido, Fatura, Próximo Mês

**[Sistema #23]**: Três Camadas de Valor por Gasto
- Valor (reserva mensal histórica) → Valor Limite Real (projeção do mês) → O Que Falta Pagar (saldo pendente)

**[Sistema #24]**: Valor como Baseline Estável
- Quase nunca muda — só atualiza quando custo real ultrapassa consistentemente a estimativa

**[Sistema #25]**: Ciclo Mensal — Início do Mês como Reset/Checklist
- Atualiza "Valor Limite Real" com valores reais no início de cada mês. Lista garante que nenhuma conta seja esquecida

**[Sistema #26]**: Controle de Parcelas (Gambiarra)
- Parcelas rastreadas na coluna Destino (ex: "10/10") — falta informação de qual cartão, e projeção de impacto futuro

**[Sistema #27]**: "Outros" como Colchão de R$2.000
- Reserva para imprevistos com sub-categorização opcional (Farmácia, Livros, Restaurante, genérico)

**[Nomenclatura #28]**: Nomes Customizáveis
- "Castilho" e "Consultório" são códigos pessoais — quer poder renomear

**[Dor #29]**: Parcelas sem Cartão Associado e sem Projeção Futura
- Não sabe em qual cartão parcelou, nem como parcelas afetam meses seguintes

**[Necessidade #30]**: Projeção Futura de Comprometimento
- Quer timeline de parcelas e compromissos futuros — quando terminam, quando liberam orçamento

**[Fluxo Crítico #31]**: Reset Mensal como Checklist de Sobrevivência
- A lista é ferramenta de segurança para não esquecer nenhuma conta

**[Sistema #32]**: Quadro de Receitas Projetadas (não mostrado)
- Pró-labore, Distribuição de lucros, Ajuda de custo, Retirada do fundo reserva, Saldo do mês anterior, Transferência da Tamires

**[Fluxo Financeiro #33]**: Tamires como Contribuinte do Orçamento Familiar
- Tamires transfere valor para Vitor cobrir parte dela nos gastos familiares — rateio implícito

**[Resiliência #34]**: Fundo Reserva como Válvula de Segurança
- Usado quando contas não fecham só com receita

**[Gambiarra Genial #35]**: Célula Excel como Banco de Dados Comprimido
- Dentro de UMA célula: =H19-14,49-449,09-25,51-18,98... — 25+ transações individuais comprimidas numa fórmula
- O dado existe mas toda riqueza (onde, como, quando) morre ali dentro

**[Dor #36]**: Informação que Entra mas Não Sai
- Esforço de registrar existe, retorno analítico é zero — sabe que sobrou R$0,14 mas não sabe POR QUÊ

**[Insight #37]**: A Disciplina Já Existe — A Ferramenta que Falha
- Vitor JÁ registra cada gasto manualmente. O problema não é hábito, é ferramenta inadequada

#### Persona Tamires (Consumidora Eventual)

**[Persona #9]**: Consumidora Eventual de Informação
- Não quer controle diário. Monitora pelo saldo bancário. Engaja quando surgem decisões (viagem, gasto extra, poupar)

**[Engajamento #10]**: Gatilho de Engajamento por Evento
- Só engaja com finanças quando existe um EVENTO — app precisa ser útil nesses momentos e silencioso quando não precisa

**[Fluxo #11]**: Duas Categorias de Receita Empresarial
- Pró-labore e Distribuição de Lucros — distinção necessária no registro

**[Persona Refinada #12]**: Autonomia com Saldo Visível
- Tamires tem seu sistema: saldo = limite de gasto. Pix e dinheiro. O app não precisa mudar o comportamento dela

**[Definição Chave #13]**: "A Gente" vs. "Eu"
- Gastos da Tamires = dela (saldo). Gastos "da gente" = família (controlados pelo Vitor). O app resolve o "a gente"

**[Persona Refinada #14]**: Vitor — Cartão como Ferramenta Estratégica
- Paga TUDO no cartão deliberadamente. Limites muito superiores à renda. Controle rígido é vital

**[Core #15]**: Missão Refinada do App
- Cadastrar com facilidade, compreender fluxo completo, identificar otimizações, apresentar de forma clara para Tamires

| Dimensão | Vitor | Tamires |
|---|---|---|
| Frequência | 1-2x semana, ritual completo | Quando surge decisão |
| Profundidade | Tudo, cada detalhe, drill-down | A resposta, não os dados |
| Pergunta central | "Para onde vai o dinheiro?" | "A gente pode fazer X?" |
| Motivação | Controle e organização | Planejamento e tranquilidade |

### Fase 2: Reverse Brainstorming — Anti-Padrões e Inversões

**[Anti-Padrão #38]**: Registro sem Retorno — O Pecado Capital
- Apps pedem tudo e devolvem nada útil. Trabalho sem recompensa
- **Inversão**: Cada campo preenchido deve gerar insight visível

**[Anti-Padrão #39]**: Pensamento de Espelho Retrovisor
- Apps só mostram passado, sem projeção, sem planejamento para o restante do mês ou meses seguintes
- **Inversão**: GPS financeiro — projeções, alertas, simulação de cenários futuros

**[Anti-Padrão #40]**: Dados Voláteis sem Contexto
- Números mudam entre visualizações sem explicar por quê. Usuário perde confiança
- **Inversão**: Transparência total nos cálculos, cada número rastreável à sua origem

**[Anti-Padrão #41]**: Análises Rasas que Não Respondem Perguntas Reais
- Gráficos de pizza bonitos que não respondem "posso comprar isso?" nem "onde posso cortar?"
- **Inversão**: Dashboard organizado por perguntas, não por gráficos

**[Dor Relacional #42]**: Barreira de Comunicação Financeira
- Vitor entende mas não traduz para Tamires. Saldo vs. cartão apavora ela sem contexto
- **Inversão**: Dashboard da Tamires fala a língua dela: "Estamos dentro do combinado" em vez de números brutos

**[Princípio Financeiro #43]**: A Regra de Ouro do Casal
- Nunca gastar no cartão mais do que tem de saldo. Pagar cartão de março com o que sobrou em fevereiro
- **Inversão**: Alarme embutido — indicador visual "Compromisso em cartões vs. Saldo disponível" com semáforo

**[Desafio #44]**: Categorização Inteligente vs. Realidade Variável
- Mesmo gasto pode ser em estabelecimentos e cartões diferentes a cada vez
- **Inversão**: Auto-sugerir categoria, mas nunca assumir cartão — decisão do momento

**[Cartão #45]**: Flash — Cartão de Benefício com Saldo Fixo
- Diferente de crédito (limite rotativo) e débito (saldo conta). É recurso com teto carregado pela empresa
- **Inversão**: Tipos distintos de recurso financeiro, cada um com sua lógica e visualização

**Anti-padrões com inversões gerados pela IA:**

- **Terrível #4**: Parcelas sem cartão, sem contagem, sem projeção → **Inversão**: Parcela como objeto completo com timeline de liberação de orçamento
- **Terrível #5**: Todos os cartões tratados igualmente → **Inversão**: Cada tipo de recurso com lógica própria (crédito, débito, benefício)
- **Terrível #6**: Mês começa do zero → **Inversão**: Checklist pré-carregada com gastos recorrentes para confirmar
- **Terrível #7**: 47 gráficos para responder uma pergunta simples → **Inversão**: Modo "Pergunta Rápida" — "A gente pode gastar R$3.000 numa viagem?" com resposta direta e opção de ver impacto

### Fase 3: SCAMPER — Construção Sistemática

#### S — Substituir

**[SCAMPER-S #46]**: Substituir Fórmula Excel por Registro One-Tap
- Tela única com tudo visível. Digitar APENAS o valor. Resto é seleção por toque — sem digitação, sem carregamento

**[UX #47]**: Princípio "Tudo no onClick" — Zero Navegação
- Sem etapas, sem "próximo", sem abas. Abre e tudo está ali

**[SCAMPER-S #48]**: Fluxo de Registro em Cascata Progressiva
- Tela se revela progressivamente: Valor → Categoria → Estabelecimento (tags) → Forma de pagamento → Parcelas (se crédito)
- Não é wizard multi-tela nem tela sobrecarregada — é tela que cresce conforme contexto

**[SCAMPER-S #49]**: Categoria com Inteligência Embutida
- Ao selecionar "Supermercado", o app já sabe: é gasto, desconta do orçamento de supermercado, mostra estabelecimentos frequentes
- Cada categoria é "objeto inteligente" — rótulo + regra de negócio + orçamento vinculado + subcategorias

**[SCAMPER-S #50]**: Pagamento à Vista como Default
- App assume à vista por padrão. Cartão de crédito revela opção de parcelas. Elimina campos desnecessários

**[SCAMPER-S #51]**: Feedback Financeiro Instantâneo por Método de Pagamento
- Cartão crédito → mostra limite disponível após gasto
- Flash → mostra saldo restante após gasto
- Pix/Débito bancário → mostra saldo da conta após gasto
- Impacto visível ANTES de confirmar

**[SCAMPER-S #52]**: Registro como Momento de Consciência
- Ver impacto antes de confirmar pode influenciar decisão de pagamento no momento da compra

#### C — Combinar

**[SCAMPER-C #53]**: Gasto Real + Orçamento Restante como Unidade Inseparável
- Toda categoria sempre mostra: quanto gastou E quanto pode gastar. Barra de progresso visual
- Ex: ████████░░░ R$2.122/R$3.000 (Resta R$878)

**[SCAMPER-C #54]**: Trio Completo — Gasto + Orçamento + Saldo Restante (ou Estouro)
- Meses bons: saldo positivo. Meses ruins: estouro em destaque com alerta
- Ex: █████████████ R$2.350/R$2.000 Estourou R$350 ⚠️

**Dashboard Unificado proposto:**
- Receitas + Gastos + Saldo num único painel
- Regra do Casal (cartões vs. saldo) sempre visível
- Barras de progresso por categoria com "Resta R$X"

#### A — Adaptar

**[SCAMPER-A #55]**: Dashboard Orientado por Perguntas
- 4 perguntas fundamentais respondidas ao abrir o app:
  1. Quanto tenho de contas para pagar este mês ainda?
  2. Quanto ainda posso gastar com comida?
  3. Quanto ainda posso gastar com gasolina?
  4. Quanto ainda posso gastar com outros/extras sem afetar o orçamento?

**[SCAMPER-A #56]**: Abertura de Mês Progressiva
- Não é evento de um dia — é processo de ~10 dias conforme informações chegam
- Status: "Março: 8 de 14 contas confirmadas — faltam: Luz, Condomínio, Amil..."

**[SCAMPER-A #57]**: Três Tipos de Recorrência
- **Fixo imutável** (Escola, Internet, Parcelas): auto-preenchido, nunca pergunta
- **Variável com base** (Luz, Condomínio): pré-preenchido com base, sinaliza "atualizar quando souber"
- **Fixo mínimo + variável** (Amil coparticipação): pré-preenchido com mínimo, aceita acréscimo

**[SCAMPER-A #58]**: Amil — Valor Final Opaco
- Fatura vem fechada sem abertura. App trata como "variável com mínimo conhecido" — atualizar quando souber o real

**[SCAMPER-A #59]**: Orçamentos Independentes, Sem Rollover
- Cada categoria isolada. Sobra não transfere entre categorias nem entre meses. Mês acabou, resetou

**[SCAMPER-A #60]**: Recorrente vs. Outros — Regra Simples
- Lista definida de recorrentes. TUDO fora dela = Outros, consumindo o colchão de R$2.000

#### M — Modificar (Escala Temporal e Fluxos)

**[SCAMPER-M #61]**: Duas Realidades de Receita
- Vitor: praticamente fixa (base confiável para projeção). Tamires: altamente variável (alimenta mais reserva que contas)

**[SCAMPER-M #62]**: Fundo Reserva Alimentado Principalmente pela Tamires
- Quando sobra, Tamires alimenta reserva. Indicador: "Reserva cobre X meses de despesas"

**[SCAMPER-M #63]**: Projeção Futura com Cenários
- Cenário base (só renda fixa Vitor) vs. Cenário real (+ média contribuição Tamires)

**[SCAMPER-M #64]**: Hierarquia de Cobertura de Gastos Extras
- 1º Tamires transfere da conta dela → 2º Se não basta, fundo reserva. Cascata com ordem definida

**[SCAMPER-M #65]**: Sobra como Colchão do Próximo Mês
- Sobra fica na conta como "saldo anterior" (segurança). Só vai para reserva se valor muito significativo — decisão manual

#### E — Eliminar

**[SCAMPER-E #66]**: Eliminar a Caça ao Gasto Perdido
- Dias sem atualizar = arqueologia financeira. Recorre ao Google Maps para lembrar onde foi. Informação se perde da memória

**[SCAMPER-E #67]**: Eliminar o Ritual Conta por Conta
- Abrir cada app bancário, conferir, anotar, fechar, repetir. Maior custo de tempo do processo

**[SCAMPER-E #68]**: Registro Rápido "No Momento" Transforma Batch de Reconstrução em Validação
- Registro de 5 seg no celular durante a semana → fim de semana é só conferir, não reconstruir

**[SCAMPER-E #69]**: Importação de Extrato como Reconciliação Automática
- Importar extrato PDF → app cruza com registros → destaca não registrados
- Três camadas: registro no momento (70%) + notificação fim do dia (15%) + reconciliação extrato (15%) = 100%

#### P — Para Outros Usos (implícito nos insights anteriores)
- Checklist mensal, simulador de cenário, ferramenta de comunicação do casal, organizador contábil

#### R — Reverter/Reorganizar

**[SCAMPER-E #70]**: Importação via PDF
- Bancos brasileiros exportam PDF. App precisa interpretar PDFs do Itaú, Inter, Flash

**[SCAMPER-R #71]**: Reorganização por Prioridade/Tipo de Cobrança
1. Fixo automático (débito automático) — só confirmar
2. Fixo manual (agendado/boleto) — agendar pagamento
3. Recorrente cartão (cobrado automaticamente) — já comprometido
4. Variável controlado (supermercado, gasolina) — tem orçamento, vai consumindo
5. Imprevistos (outros/extras) — zona de maior atenção

**[SCAMPER-R #72]**: "Outros" como Zona de Maior Atenção
- Gastos mais propensos a escapar, mais consomem do colchão. Registro rápido no celular tem maior impacto aqui

## Resultados da Execução das Técnicas

### Narrativa da Facilitação Criativa

Esta sessão revelou que o desafio do Vitor vai muito além de "criar um app de finanças". A planilha Excel que ele mantém há anos esconde um sistema financeiro sofisticado com três camadas temporais (base histórica, projeção mensal, execução diária), múltiplas entidades financeiras (pessoal + 2 empresas), e um modelo familiar onde dois perfis radicalmente diferentes precisam coexistir.

O momento de maior breakthrough foi quando Vitor mostrou a fórmula dentro da célula do Excel (=H19-14,49-449,09-25,51...) — revelando que a disciplina de registro já existe, mas a ferramenta transforma esse esforço em dados mortos. O app não precisa criar hábito; precisa recompensar o hábito que já existe.

A técnica de Reverse Brainstorming foi especialmente poderosa porque Vitor trouxe frustrações reais com apps existentes — o "Pecado Capital" de pedir dados sem devolver insights, e a falta de projeção futura que é exatamente o que diferencia sua planilha dos apps comerciais.

### Destaques da Sessão

**Forças Criativas do Usuário:** Vitor demonstrou capacidade excepcional de articular problemas complexos e pensar em soluções práticas. Sua experiência com a planilha é uma mina de requisitos refinados por anos de uso real.

**Momentos de Breakthrough:**
1. A fórmula na célula do Excel — revelou disciplina + ferramenta inadequada
2. A "Regra de Ouro do Casal" — princípio financeiro que deve ser alarme do app
3. A distinção "A gente" vs. "Eu" — definiu fronteira de escopo do dashboard da Tamires
4. A hierarquia de cobertura (Tamires → Fundo Reserva) — modelo financeiro familiar completo

**Fluxo de Energia:** Alta do início ao fim. Vitor trouxe screenshots da planilha espontaneamente, aprofundou cada tópico com exemplos reais, e demonstrou clareza crescente sobre o que quer construir.

## Organização e Priorização de Ideias

### Organização Temática

**73 insights organizados em 9 temas:**

**Tema 1: Registro Rápido de Transações** (#46, #47, #48, #49, #50, #51, #52, #44)
- Fluxo cascata progressiva em ~5 segundos: Valor → Categoria → Estabelecimento → Pagamento → Parcelas
- Categorias como objetos inteligentes, feedback instantâneo de saldo/limite, pagamento à vista como default

**Tema 2: Dashboard Orientado por Perguntas** (#55, #41, #53, #54, #20, #43, #40)
- 4 perguntas fundamentais respondidas ao abrir o app
- Barras de progresso por categoria (gasto/orçamento/restante), Regra do Casal como semáforo, transparência total

**Tema 3: Dois Perfis de Usuário** (#9, #12, #10, #13, #14, #15, #42, #38)
- Vitor = cockpit completo (controle, drill-down, detalhes)
- Tamires = vitrine de decisão ("Estamos dentro do combinado" ✅ / ⚠️)

**Tema 4: Sistema de Orçamento em 3 Camadas** (#23, #24, #59, #60, #27, #19)
- Base histórica → Projeção mensal → Execução diária
- Orçamentos independentes, sem rollover, "Outros" como colchão de R$2.000

**Tema 5: Fluxo Mensal e Abertura de Mês** (#56, #57, #58, #31, #25)
- Abertura progressiva (~10 dias), 3 tipos de recorrência, checklist de segurança
- Fixo imutável (auto), variável com base (sinalizar), fixo mínimo + variável (Amil)

**Tema 6: Projeção Futura e Parcelas** (#30, #29, #26, #63, #39)
- Timeline de parcelas, projeção de cenários, GPS financeiro
- Diferencial competitivo: olhar para frente, não só para trás

**Tema 7: Gestão de Cartões e Recursos** (#22, #45, #51, #16)
- Crédito (limite rotativo), débito (saldo conta), benefício/Flash (saldo carregado)
- Cada recurso com lógica e visualização próprias

**Tema 8: Reconciliação e Captura Completa** (#68, #69, #70, #66, #67)
- 3 camadas: registro no momento (70%) + notificação (15%) + importação PDF (15%)
- Eliminar arqueologia financeira e ritual conta por conta

**Tema 9: Modelo Financeiro Familiar** (#5, #11, #61, #33, #64, #62, #34, #65, #32)
- Pipeline empresa→pessoal, renda fixa vs. variável, hierarquia de cobertura
- Fundo reserva como indicador de segurança familiar

### Conceitos Transversais
- #37 A disciplina já existe — a ferramenta que falha
- #35 Célula Excel como banco de dados comprimido
- #71 Reorganização por prioridade/tipo de cobrança
- #72 "Outros" como zona de maior atenção
- #73 Paridade com a planilha como requisito mínimo

### Resultado da Priorização

**Decisão do usuário: TODOS os 9 temas são essenciais.** O app só substitui a planilha com cobertura completa. Qualquer subconjunto resultaria em manter a planilha como controle principal. A estratégia é manter a planilha em paralelo durante testes até que o app prove ser superior.

### Sequência de Construção Recomendada

**Fundação (estrutura de dados):**
1. Modelo Financeiro Familiar (Tema 9) — contas, entidades, fluxo empresa→pessoal
2. Sistema de Orçamento em 3 Camadas (Tema 4) — base, projeção, execução
3. Gestão de Cartões e Recursos (Tema 7) — crédito, débito, Flash

**Core funcional (uso diário):**
4. Registro Rápido (Tema 1) — cascata progressiva, 5 segundos, feedback
5. Fluxo Mensal (Tema 5) — abertura progressiva, checklist, recorrências

**Valor diferencial (melhor que a planilha):**
6. Dashboard por Perguntas (Tema 2) — 4 perguntas respondidas ao abrir
7. Projeção Futura (Tema 6) — parcelas, timeline, cenários
8. Dois Perfis (Tema 3) — cockpit Vitor + vitrine Tamires

**Rede de segurança (captura completa):**
9. Reconciliação e Captura (Tema 8) — importação PDF, 3 camadas

### Plano de Ação — Próximos Passos

**Passo 1: Criar Product Brief**
- Consolidar os 9 temas num documento de visão do produto
- Definir missão, perfis de usuário, princípios de design
- Usar este documento de brainstorming como base de requisitos

**Passo 2: Definir Arquitetura Técnica**
- Decisão multiplataforma: web app responsivo vs. app nativo vs. híbrido
- Stack tecnológico, banco de dados, hospedagem
- Parsing de PDF bancário como desafio técnico a investigar

**Passo 3: Desenhar UX**
- Fluxo de registro rápido (cascata progressiva)
- Dashboard orientado por perguntas
- Visão Vitor vs. Visão Tamires

**Passo 4: Desenvolvimento iterativo**
- Construir na sequência: Fundação → Core → Diferencial → Segurança
- Testar em paralelo com a planilha
- Validar com Tamires nos marcos de UX

## Resumo e Conclusão da Sessão

**Conquistas da Sessão:**
- 73 insights gerados em 3 técnicas (Role Playing, Reverse Brainstorming, SCAMPER)
- 9 temas organizados cobrindo 100% do escopo necessário
- Sequência de construção definida com fundação → core → diferencial → segurança
- Princípios de design descobertos: registro com retorno, GPS financeiro, transparência, dashboard por perguntas
- Dois perfis de usuário completamente mapeados com necessidades distintas
- Modelo financeiro familiar documentado com fluxos, hierarquias e regras

**Princípios de Design Fundamentais:**
1. Cada campo preenchido deve gerar insight visível (registro com retorno)
2. Dashboard responde perguntas, não exibe gráficos (orientado por perguntas)
3. Projeção futura, não só histórico (GPS financeiro)
4. Cada número rastreável à sua origem (transparência total)
5. Dois perfis, duas linguagens, um app (cockpit + vitrine)
6. Paridade com a planilha como requisito mínimo (tudo ou nada)
