---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['brainstorming-session-2026-03-03-2100.md']
date: 2026-03-05
author: Vitorcastilho
---

# Product Brief: Finance

## Executive Summary

**Finance** é uma aplicação multiplataforma de gestão financeira pessoal e familiar que vai além do registro de gastos — é uma ferramenta para controlar e planejar o futuro das finanças baseado no histórico de gastos passados. Desenvolvida para substituir definitivamente uma planilha Excel sofisticada mas incompreensível para terceiros, a aplicação combina registro rápido de transações (~5 segundos), sistema de orçamento em três camadas temporais (base histórica, projeção mensal, execução diária), e projeção futura de comprometimento financeiro.

O produto atende dois perfis de usuário radicalmente diferentes num único app: um power user que gerencia múltiplas entidades financeiras (contas pessoais, cartões de crédito, empresas) com necessidade de drill-down analítico completo; e uma consumidora eventual de informação que precisa de respostas visuais instantâneas para decisões financeiras familiares. O diferencial central é que cada dado registrado devolve insight imediato ao usuário, e o dashboard é organizado por perguntas reais ("Quanto ainda posso gastar?", "A gente pode fazer X?") em vez de gráficos genéricos.

---

## Visão Central

### Declaração do Problema

Profissionais autônomos e casais que gerenciam finanças pessoais e empresariais enfrentam uma escolha insatisfatória: planilhas Excel que oferecem controle total mas exigem esforço excessivo e são incompreensíveis para o parceiro(a); ou aplicativos de finanças que pedem muitos dados detalhados sem devolver insights úteis, não oferecem projeção futura, e apresentam análises tão rasas que levam ao abandono.

O resultado é que o esforço disciplinado de registrar cada transação — que já existe — é transformado em dados mortos: valores comprimidos em fórmulas de Excel sem retorno analítico, controle de cartões fragmentado em abas separadas, e total impossibilidade de compartilhar a visão financeira com o parceiro(a) de forma compreensível.

### Impacto do Problema

- **Esforço desperdiçado:** Horas semanais dedicadas a atualizar planilhas manualmente (abrir cada app bancário, confrontar extratos, digitar valores), sem retorno proporcional em insights
- **Arqueologia financeira:** Quando o registro atrasa, o usuário precisa recorrer a históricos do Google Maps e extratos para lembrar onde e o que gastou
- **Barreira de comunicação familiar:** Perguntas simples como "a gente pode viajar?" geram respostas complexas que apavoram em vez de informar, porque os números brutos não traduzem a realidade financeira de forma acessível
- **Ponto cego no futuro:** Parcelas sem cartão associado, sem contagem regressiva, sem projeção de impacto nos meses seguintes — o usuário sabe quanto gastou, mas não sabe como isso afeta o futuro
- **Abandono de apps:** Aplicativos como Mobills exigem preenchimento excessivo por transação sem permitir controle de orçamento planejado por categoria, levando à desistência e retorno à planilha

### Por Que Soluções Existentes Falham

- **Registro sem retorno:** Apps pedem categoria, subcategoria, tags, notas, fotos — mas devolvem apenas gráficos de pizza genéricos que não respondem "posso comprar isso?" nem "onde posso cortar?"
- **Pensamento de espelho retrovisor:** Foco exclusivo no passado ("você gastou X") sem projeção futura ("se continuar nesse ritmo, em 15 dias estoura o orçamento de alimentação")
- **Dados voláteis sem contexto:** Números que mudam entre visualizações sem explicar por quê, destruindo a confiança do usuário nos dados
- **Modelo simplista:** Não suportam múltiplas entidades financeiras (pessoal + empresas), diferentes tipos de recursos financeiros (crédito, débito, benefício/Flash), nem o fluxo empresa→pessoa física com distinção entre pró-labore e distribuição de lucros
- **Ignoram o segundo usuário:** Não consideram que a informação financeira precisa ser consumida por perfis diferentes — quem controla e quem decide

### Solução Proposta

**Finance** é um app multiplataforma (celular + computador) que substitui definitivamente a planilha Excel através de:

1. **Registro em cascata progressiva (~5 seg):** Tela única onde o usuário digita apenas o valor e seleciona categoria, estabelecimento e método de pagamento por toque — cada seleção revela a próxima camada sem navegação, com feedback instantâneo de saldo/limite antes de confirmar
2. **Orçamento em 3 camadas temporais:** Base histórica (quanto normalmente custa) → Projeção mensal (quanto vai custar este mês) → Execução diária (quanto falta pagar) — honrando a lógica financeira que o usuário já construiu
3. **Dashboard orientado por perguntas:** Responde instantaneamente "Quanto ainda devo este mês?", "Quanto posso gastar em comida?", "Quanto posso gastar em extras?" com barras de progresso visuais e indicador de regra financeira do casal (cartões vs. saldo)
4. **Projeção futura:** Timeline de parcelas com cartão associado e data de liberação de orçamento, cenários baseados em renda fixa vs. variável, simulação de impacto de gastos extras
5. **Dois perfis num único app:** Cockpit completo para o gestor (drill-down, multi-entidade, reconciliação) e vitrine de decisão para o parceiro(a) ("Estamos dentro do combinado ✅" / "Atenção, gastos acima do planejado ⚠️")
6. **Reconciliação em 3 camadas:** Registro rápido no momento + notificação de fim do dia + importação de extrato PDF bancário para garantir 100% de captura

### Diferenciadores-Chave

- **Registro com retorno:** Cada campo preenchido gera insight visível imediatamente — diferente de apps que pedem dados e devolvem gráficos genéricos
- **GPS financeiro, não câmera:** Projeção futura e simulação de cenários em vez de apenas histórico — "para onde você está indo" em vez de "onde você esteve"
- **Transparência total:** Cada número é rastreável à sua origem — toque em qualquer valor e veja de onde veio e por que mudou
- **Paridade com planilha como ponto de partida:** O app só se justifica se cobrir TUDO que a planilha Excel já faz — e entregar mais
- **Linguagem financeira compartilhada:** Dashboard que traduz números complexos em respostas simples para o parceiro(a), eliminando a necessidade de "explicar" finanças

---

## Usuários-Alvo

### Usuários Primários

#### Persona 1: Vitor — O Gestor Financeiro Familiar

**Perfil:** Programador, 42 anos, presta serviços para uma empresa de Florianópolis. Dono de empresa PJ (Fator R, 6% DARF). Responsável por 100% da gestão financeira da família — contas pessoais, cartões de crédito, empresa própria e empresa da esposa.

**Contexto:** Gerencia 4 cartões de crédito ativamente (quer reduzir para 2 por estratégia de milhas), 3 contas bancárias (Itaú, Flash, Inter), e duas empresas (a dele e a da esposa). Paga tudo deliberadamente no cartão de crédito, com limites muito superiores à renda — o que torna o controle rígido não opcional, mas vital. Possui investimentos em ações e FIIs pelo Banco Inter.

**Comportamento atual:** Mantém um sistema sofisticado de planilhas Excel com três camadas temporais (base histórica, projeção mensal, execução diária). Registra cada transação individualmente dentro de fórmulas de célula (ex: =H19-14,49-449,09-25,51...), mas perde toda a riqueza analítica no processo. Atualiza 1-2x por semana sentando no computador com o celular ao lado, abrindo cada app bancário. No fim do mês, faz reconciliação completa e planeja o mês seguinte. Também gerencia cálculos fiscais (DARF 6%, pró-labore meta 28%, INSS 11%) de ambas as empresas para saber quanto transferir como lucro. Investimentos são acompanhados esporadicamente — "às vezes vai na planilha e coloca os valores totais" — sempre desatualizado.

**Dores:**
- Esforço de registro não devolve insights (dados mortos nas fórmulas)
- Arqueologia financeira quando atrasa registro (recorre ao Google Maps)
- Não consegue ver projeção futura de parcelas e comprometimento
- Não consegue comunicar a situação financeira de forma compreensível para a esposa — especialmente quando gastos extraordinários inflam os números e geram pânico sem contexto
- Quando a Tamires pergunta "como foi que gastamos tanto?", precisa caçar manualmente na planilha o que saiu do planejado e traduzir de forma que ela entenda
- Precisa calcular manualmente impostos e lucro da empresa para saber quanto transferir para conta pessoal
- Sem projeção de longo prazo: não consegue ver o impacto de economizar R$200/mês ao longo de um ano
- Investimentos sem visibilidade consolidada — não sabe quanto cresceu por aportes vs. rendimentos

**Motivações:**
- Controle total e organização detalhada
- Drill-down analítico (Categoria > Subcategoria > Estabelecimento)
- Classificação por essencialidade (Essencial / Não Essencial / Investimento) para identificar oportunidades de corte
- Projeção futura (como parcelas afetam os próximos meses, quando terminam e liberam orçamento)
- Projeção de longo prazo (se economizar X aqui, acumulo Y no final do ano)
- Simulador fiscal empresarial (entrada → DARF → pró-labore → INSS → lucro distribuível)
- Painel de visibilidade de investimentos (evolução, aportes vs. rendimentos, patrimônio consolidado da família)
- Metas de poupança (caixinhas com objetivo, prazo e progresso)
- Suporte a financiamentos e consórcios de longo prazo (parcelas em anos, saldo devedor, projeção de término)
- Ter a Tamires como parceira consciente nas decisões financeiras — sem precisar "traduzir" números

**Regra de Ouro:** Nunca gastar no cartão mais do que tem de saldo na conta. Pagar o cartão de março com o que sobrou de fevereiro, NUNCA com o que vai receber em março.

**Momento "valeu a pena":** Quando o app retorna todas as informações que a planilha já retorna, E responde as perguntas da Tamires sem que ele precise explicar nada — especialmente em meses com gastos fora do planejado. E quando consegue ver "se economizar R$350/mês em gastos não essenciais, em dezembro terei R$4.200 a mais na reserva".

---

#### Persona 2: Tamires — A Decisora Eventual

**Perfil:** Psicóloga, 38 anos, atende exclusivamente online. Dona de empresa PJ (Fator R, 6% DARF). Faturamento altamente variável mês a mês. Guardiã do fundo reserva familiar (caixinha Nubank na conta dela).

**Contexto:** Gerencia suas próprias finanças de forma simples — controla pelo saldo da conta bancária. Paga tudo por Pix ou dinheiro. Não tem interesse em controle financeiro detalhado do dia a dia. Contribui financeiramente para os gastos familiares através de transferências para o Vitor quando necessário, e alimenta o fundo reserva familiar quando sobra.

**Comportamento atual:** Monitora o saldo da conta própria como limite de gasto. Quando quer comprar algo pessoal (ex: blusa na Shein), confere o saldo e decide. Quando a decisão envolve gastos da família (viagem, compra grande, escola), pergunta ao Vitor — que responde com números que ela não consegue interpretar.

**Dores:**
- Não compreende a linguagem financeira do Vitor
- Quando vê "gastamos R$22.751 no cartão", apavora-se sem contexto — não sabe que R$10.400 foram gastos extraordinários (viagem + carro) e o restante está dentro do planejado
- Não tem visibilidade sobre a saúde financeira familiar fora dos momentos de pergunta
- Quando pergunta "como gastamos tanto?", depende do Vitor para caçar a informação e traduzir

**Motivações:**
- Respostas diretas: "A gente pode?" → Sim/Não com contexto visual simples
- Quando gastos estão altos, entender INSTANTANEAMENTE por quê — ver claramente o que é planejado vs. decisão deliberada vs. imprevisto
- Tranquilidade financeira sem precisar entender o sistema complexo por trás
- Visualizar o crescimento do fundo reserva (que está na conta dela) como motivador
- Eventualmente poder registrar entradas e saídas da conta dela, se o app for fácil o suficiente

**Regra de Engajamento:** Só interage com finanças quando existe um EVENTO (viagem, compra grande, planejamento). O app deve ser útil nesses momentos e silencioso quando não precisa dela.

**Momento "valeu a pena":** Quando olha o dashboard, vê que os gastos estão acima do planejado, e em vez de pânico entende imediatamente: "Ah, foram R$9.000 da viagem e R$1.400 do carro — os gastos regulares estão dentro do combinado ✅"

---

### Usuários Secundários

#### Contador — Consumidor de Dados Contábeis

**Perfil:** Profissional contábil que gerencia as obrigações fiscais de ambas as empresas (Vitor e Tamires). Define anualmente o valor de pró-labore (meta de 28% do faturamento) e pode reajustar durante o ano, especialmente para Tamires cujo faturamento é muito variável.

**Interação:** Não usa o app diretamente, mas é consumidor dos dados financeiros para organizar obrigações fiscais. O app pode gerar relatórios ou exportações com dados organizados para facilitar o trabalho contábil.

---

### Jornada dos Usuários

#### Jornada do Vitor

**Onboarding:** Começa do zero (sem migração da planilha). Cadastra contas bancárias, cartões, empresas. Define categorias com classificação de essencialidade (Essencial / Não Essencial / Investimento). Configura orçamentos base por categoria. Configura percentuais fiscais das empresas (DARF 6%, pró-labore definido pelo contador, INSS 11%). Registra investimentos existentes (ações/FIIs no Inter, fundo reserva no Nubank). Mantém a planilha em paralelo até confiar no app.

**Uso diário (celular):** Registra gastos no momento em ~5 segundos (valor → categoria → estabelecimento → cartão). Recebe feedback instantâneo do impacto no saldo/limite e no orçamento da categoria. Quando gasto é extraordinário (viagem, imprevisto), marca como "fora do planejado" — diferenciando decisão deliberada de imprevisto real.

**Uso semanal (computador):** Sessão de atualização — valida transações registradas durante a semana, importa extrato PDF para capturar o que escapou, atualiza valores de contas variáveis (Luz, Condomínio, Amil) conforme descobre.

**Ciclo mensal:** Abertura progressiva (~10 dias) com checklist pré-carregada. Gastos fixos imutáveis auto-preenchidos, variáveis sinalizados para atualização. Registro de entradas empresariais com cálculo fiscal automático (entrada → DARF → pró-labore → INSS → lucro). Fim do mês: reconciliação completa, decisão sobre sobra (colchão próximo mês ou fundo reserva), atualização do saldo dos investimentos.

**Visão de longo prazo:** Consulta projeção anual: "se mantiver os gastos atuais, acumulo R$X na reserva até dezembro". Acompanha metas de caixinhas. Visualiza evolução de investimentos (aportes vs. rendimentos). Monitora financiamentos de longo prazo (parcela atual, saldo devedor, projeção de término).

**Momento "aha!":** Quando a Tamires abre o app, vê os gastos acima do planejado, e NÃO pergunta ao Vitor "como gastamos tanto?" — porque a resposta já está diante dos olhos dela. E quando o app mostra "se cortar R$350/mês em gastos não essenciais, em 8 meses vocês têm o suficiente para aquela viagem".

#### Jornada da Tamires

**Onboarding:** Cria conta própria no app. Conecta com a conta do Vitor para visualizar dashboard familiar. Primeiro acesso: vê "Estamos dentro do combinado ✅" — entende imediatamente. Vê também o fundo reserva crescendo na conta dela.

**Uso eventual (celular):** Abre para decisões (viagem, compra grande). Vê barras de progresso dos orçamentos familiares e a situação consolidada. Quando gastos estão acima do planejado, vê exatamente o que causou — separando gastos regulares (dentro do planejado) de gastos extraordinários (decisão deliberada ou imprevisto). Opcionalmente registra entradas e saídas da conta dela pelo mesmo fluxo rápido.

**Momento "aha!":** Mês com cartão em R$22.000 — abre o app, vê "Gastos regulares: ✅ Dentro do planejado | Fora do planejado: Viagem R$9.000 (decisão do casal) + Motor de arranque R$1.400 (imprevisto)" — entende tudo sem perguntar ao Vitor.

---

### Tipos de Compromisso Financeiro Suportados

| Tipo | Duração | Exemplo | Comportamento |
|---|---|---|---|
| **Gasto único** | Pontual | Restaurante R$100 | Registro simples, consome orçamento |
| **Parcela cartão** | Curto prazo (2-12x) | Fotos 10/10 | Cartão associado, contagem regressiva |
| **Recorrente fixo** | Mensal indefinido | Internet R$158 | Auto-preenchido mensalmente |
| **Recorrente variável** | Mensal indefinido | Luz ~R$250 | Pré-preenchido com base, atualizar |
| **Financiamento** | Longo prazo (anos) | Imobiliário 240x | Saldo devedor, evolução, projeção |
| **Consórcio** | Longo prazo (anos) | Contemplado ou não | Status, parcela, saldo |

### Classificação de Essencialidade

Cada categoria de gasto pode ser classificada como:
- **Essencial:** Moradia, saúde, educação, alimentação básica — não tem como cortar
- **Não Essencial:** Streaming, restaurante, lazer, compras pessoais — principal alvo de otimização
- **Investimento:** Fundo reserva, aportes, caixinhas de meta — dinheiro construindo futuro

### Painel de Investimentos (Visibilidade Simplificada)

| Investimento | Localização | Tipo de Acompanhamento |
|---|---|---|
| **Fundo Reserva** | Caixinha Nubank (conta Tamires) | Aportes manuais, rendimento previsível |
| **Ações** | Banco Inter (conta Vitor) | Saldo periódico, evolução |
| **FIIs** | Banco Inter (conta Vitor) | Dividendos mensais, reinvestimento eventual |
| **CDB** | A definir | Saldo periódico, rendimento |
| **Caixinhas/Metas** | Dentro do app | Meta, prazo, progresso, projeção |

**Visão consolidada:** "Patrimônio investido da família: R$X — Reserva R$Y + Ações R$W + FIIs R$Z"
**Evolução:** Separar crescimento por aportes vs. rendimentos ao longo do tempo

### Simulador Fiscal Empresarial

Cálculo encadeado para ambas as empresas (Fator R):
```
Entrada mensal
├─ DARF (6% sobre entrada)
├─ Pró-labore (definido pelo contador, meta 28% anual)
│   └─ INSS (11% sobre pró-labore)
└─ Lucro distribuível (entrada - DARF - pró-labore - INSS)
```
- Pró-labore do Vitor: praticamente fixo o ano todo (renda previsível)
- Pró-labore da Tamires: pode mudar durante o ano (renda variável)
- Valores definidos pelo contador, registrados no app como "variável com default"

---

## Métricas de Sucesso

### Métricas de Sucesso do Usuário

#### Marco 1: Paridade com a Planilha (Validação — Meses 1-3)

**Critério:** Os números do app batem com os números da planilha por 3 meses consecutivos.
- Saldo final do mês no app = Saldo final na planilha
- Total de cartões no app = Total de cartões na planilha
- Orçamentos por categoria conferem entre os dois sistemas
- **Indicador de sucesso:** Após 3 meses de paridade, Vitor sente confiança suficiente para parar de abrir a planilha

#### Marco 2: Superação da Planilha (Valor Diferencial — Meses 3-6)

**Critério:** O app entrega insights que a planilha NUNCA conseguiu entregar.
- Drill-down analítico: "80% do gasto de supermercado foi no Pão de Açúcar"
- Projeção futura: "A parcela de Fotos termina em março, libera R$171/mês"
- Classificação por essencialidade: "38% dos gastos são não essenciais — maior oportunidade: Uber R$900/mês"
- Simulação: "Se economizar R$350/mês em não essenciais, acumula R$4.200 na reserva até dezembro"
- **Indicador de sucesso:** Vitor descobre informações sobre as próprias finanças que não sabia antes

#### Marco 3: Independência da Tamires (Transformação Familiar — Meses 4-8)

**Critério:** A Tamires interage com as finanças familiares sem intermediação do Vitor.
- Nível 1 (Bom): Tamires abre o app sozinha para consultar o dashboard antes de decisões de gasto
- Nível 2 (Ótimo): Tamires para de perguntar "a gente pode?" porque encontra a resposta no app
- Nível 3 (Incrível): Tamires sugere proativamente "e se a gente economizasse nisso ou naquilo?" — baseada em insights que viu no app
- **Indicador máximo de sucesso:** Vitor deixa de "lutar sozinho" na gestão financeira — a Tamires se torna parceira ativa, não por obrigação, mas porque o app tornou finanças compreensíveis e motivadoras para ela

#### Marco 4: Controle Total (Visão de Longo Prazo — Mês 6+)

**Critério:** O app se torna a fonte única de verdade financeira da família.
- Planilha oficialmente aposentada
- Investimentos acompanhados com visibilidade de evolução (aportes vs. rendimentos)
- Metas de poupança (caixinhas) com progresso rastreado
- Projeção de longo prazo funcionando: "no ritmo atual, em dezembro o patrimônio investido será R$X"
- Financiamentos/consórcios futuros gerenciados nativamente
- **Indicador de sucesso:** Vitor e Tamires conseguem planejar o futuro financeiro juntos, usando o app como base da conversa

### Indicadores Qualitativos

| Indicador | Como Medir | Meta |
|---|---|---|
| **Agilidade no registro** | Tempo para registrar um gasto no celular | < 10 segundos por transação |
| **Completude de captura** | % de gastos registrados vs. extrato bancário real | > 95% após reconciliação |
| **Confiança nos dados** | Paridade app vs. planilha por 3 meses | 100% de convergência |
| **Compreensão da Tamires** | Ela entende o dashboard sem perguntar ao Vitor | Sim / Não |
| **Engajamento da Tamires** | Frequência com que abre o app por iniciativa própria | ≥ 2x por mês |
| **Insights gerados** | Informações novas que a planilha não revelava | ≥ 3 por mês |
| **Projeção útil** | Projeções futuras que influenciam decisões reais | ≥ 1 por mês |
| **Aposentadoria da planilha** | Meses sem abrir o Excel | Meta: 3 meses → aposentar |

### Objetivos do Projeto

Como este é um projeto de uso pessoal, os objetivos não são comerciais mas sim de **qualidade de vida financeira:**

1. **Eliminar trabalho morto:** Cada minuto gasto registrando deve retornar insight proporcional — zero esforço desperdiçado
2. **Criar linguagem financeira compartilhada:** Vitor e Tamires falando a mesma língua sobre dinheiro, usando o app como tradutor
3. **Transformar controle em planejamento:** Sair de "quanto gastei" para "quanto posso construir" — visão de futuro, não só de passado
4. **Autonomia com segurança:** Tamires decidir gastos com confiança, sem depender do Vitor como intermediário
5. **Patrimônio visível:** Família consegue ver o crescimento patrimonial consolidado (investimentos, reserva, metas) como resultado do esforço conjunto

---

## Escopo MVP

### Funcionalidades Essenciais (Web First)

#### 1. Setup Inicial — Cadastro da Estrutura Financeira
- Cadastro de contas bancárias (Itaú, Flash, Inter)
- Cadastro de cartões de crédito (4 cartões, com limite)
- Cadastro de investimentos como conta com saldo (Nubank caixinha, Inter ações/FIIs)
- Cadastro de categorias de gasto com orçamento mensal base
- Cadastro de empresas (Vitor e Tamires) como fontes de entrada

#### 2. Registro Completo de Transações
- Entrada e saída com: valor, categoria, estabelecimento, método de pagamento
- Suporte a todos os tipos de compromisso: gasto único, parcela de cartão (com contagem regressiva), recorrente fixo imutável, recorrente variável com base, fixo mínimo + variável
- Cada registro associado ao método de pagamento (cartão específico, débito, Pix, Flash)
- Registro de entradas empresariais como transferência simples (sem cálculo fiscal automatizado)

#### 3. Checklist Mensal — Abertura Progressiva
- Abertura progressiva do mês (~10 dias) com checklist pré-carregada
- Gastos fixos imutáveis auto-preenchidos (escola, internet, parcelas)
- Gastos variáveis sinalizados para atualização com valor base visível (luz, condomínio)
- Gastos fixo mínimo + variável com base preenchida (Amil)
- Visão principal: "O que falta pagar" — terceira camada da planilha transposta para o app

#### 4. Visão de Controle
- Saldo atualizado de cada conta bancária
- Total gasto até o momento do mês por categoria
- Total de contas ainda a pagar no mês
- Saldo disponível para cobrir o que falta (Regra de Ouro: cartões vs. saldo em conta)
- Drill-down: Categoria → Estabelecimento (ex: Supermercado → 80% Pão de Açúcar)

#### 5. Projeção Futura Básica
- Timeline de parcelas: cartão associado, parcela atual/total, data de término
- Indicador de liberação de orçamento ("Parcela de Fotos termina em março → libera R$171/mês")

#### 6. Requisito Arquitetural: Multi-User desde a Fundação
- Dados associados a "dono" desde o primeiro dia
- Funcionalidade visível no MVP: single-user (só Vitor)
- Preparado para: criação de conta da Tamires, conexão entre contas, dashboard compartilhado — sem necessidade de migração de dados

### Fora do Escopo do MVP

| Funcionalidade | Motivo | Quando |
|---|---|---|
| **App mobile** | Web first resolve o uso principal (sessão no computador) | Pós-MVP |
| **Dashboard da Tamires** | Depende de dados consolidados e correlações calculadas | Pós-MVP |
| **Dashboard orientado por perguntas** | Checklist mensal + visão de controle cobre o essencial | Pós-MVP |
| **Classificação por essencialidade** | Categorias funcionam sem essa camada no início | Pós-MVP |
| **Importação de extrato PDF** | Registro manual cobre 100% no início | Pós-MVP |
| **Simulador fiscal empresarial** | Entrada empresa→pessoal como transferência simples | Pós-MVP |
| **Painel de investimentos detalhado** | Investimentos como conta com saldo é suficiente | Pós-MVP |
| **Metas de poupança (caixinhas)** | Fundo reserva rastreado como saldo de conta | Pós-MVP |
| **Financiamento/consórcio** | Registrado como recorrente fixo por enquanto | Pós-MVP |
| **Conexão de contas (funcionalidade)** | Arquitetura preparada, funcionalidade futura | Pós-MVP |

### Critérios de Sucesso do MVP

1. **Registro completo:** Conseguir registrar 100% das transações do mês pelo app (mesmo mantendo planilha em paralelo para conferência)
2. **Paridade numérica:** Saldos finais de contas e cartões no app batem com os saldos na planilha
3. **Visão clara:** Visualizar com clareza o saldo de cada conta, o que foi gasto até o momento, quanto ainda tem de contas a pagar, e quanto tem de saldo para cobrir
4. **Validação:** 3 meses consecutivos de paridade = confiança para aposentar a planilha

### Visão Futura

O Finance é uma ferramenta pessoal/familiar — não um produto comercial. A evolução pós-MVP segue a ordem natural de valor:

**Fase 2 — Inteligência e Análise**
- Dashboard orientado por perguntas ("Quanto posso gastar?", "A gente pode?")
- Classificação por essencialidade (Essencial / Não Essencial / Investimento)
- Simulador fiscal empresarial completo (DARF → pró-labore → INSS → lucro)
- Explicação de desvios (planejado vs. decisão deliberada vs. imprevisto)

**Fase 3 — Experiência Completa**
- App mobile com registro em cascata (~5 segundos)
- Importação de extrato PDF para reconciliação
- Notificação de fim do dia para captura do que escapou
- Conexão de contas (Tamires com seu próprio login e dashboard)

**Fase 4 — Projeção e Patrimônio**
- Painel de investimentos (aportes vs. rendimentos, patrimônio consolidado)
- Metas de poupança com prazo e projeção
- Financiamento/consórcio com visão de longo prazo
- Projeção anual: "no ritmo atual, em dezembro o patrimônio será R$X"
