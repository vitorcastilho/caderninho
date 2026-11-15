---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'validation-fixes-2026-03-08', 'validation-fixes-round2-2026-03-08', 'edit-ux-business-rules-2026-03-12']
lastEdited: '2026-11-15'
editHistory:
  - date: '2026-11-15'
    changes: 'Correct course (hierarquia de gastos): alinha o PRD à decisão de modelo de categorização v2 (decisao-modelo-categorizacao-v2.md) e a amplia. Define os 4 níveis (classificação → categoria → subcategoria → estabelecimento opcional) com exemplos; orçamento e método de pagamento padrão opcionais em todos os níveis; regra de preenchimento do método (definido > hábito de 3 usos seguidos, do mais específico ao mais geral) com atalhos e sugestão de padrão; orçamento multinível com saldo não alocado (FR72). Jornadas 1, 3 e 8 corrigidas (Supermercado/Gasolina são subcategorias). Ver sprint-change-proposal-2026-11-15.md.'
  - date: '2026-03-12'
    changes: 'Incorporação de regras de negócio descobertas durante UX Design: modelo de cartão de crédito (mês de referência, fatura estimada, utilizado líquido), reconciliação de fatura (fluxo completo), tipos de conta a pagar (5 tipos com confirmação diferenciada), sistema de notificação em 3 momentos, nova Jornada 9 (reconciliação de fatura). Adicionados FR64-FR70 e must-haves 21-22.'
inputDocuments: ['product-brief-finance-2026-03-05.md', 'brainstorming-session-2026-03-03-2100.md']
workflowType: 'prd'
classification:
  productName: 'Caderninho'
  projectType: 'Web App Responsiva (SPA — mobile & desktop via browser)'
  domain: 'Finanças Pessoais'
  complexity: 'média-alta'
  projectContext: 'greenfield'
---

# Product Requirements Document - Caderninho

**Author:** Vitorcastilho
**Date:** 2026-03-06

## Executive Summary

**Caderninho** é uma aplicação web responsiva de gestão financeira pessoal e familiar que transforma o esforço disciplinado de registro de gastos — que já existe — em compreensão visual compartilhada e projeção de futuro. Substitui uma planilha Excel sofisticada mas incompreensível para terceiros, servindo dois perfis radicalmente diferentes: o gestor financeiro que administra múltiplas entidades (contas pessoais, cartões de crédito, duas empresas PJ) e precisa de controle analítico completo; e a parceira decisora que precisa de respostas visuais instantâneas para decisões financeiras familiares — sem intermediação.

O problema central é que profissionais autônomos que gerenciam finanças pessoais e empresariais investem horas semanais registrando cada transação, mas esse esforço não devolve compreensão proporcional: dados morrem dentro de fórmulas Excel, a projeção não passa do mês seguinte, e a comunicação financeira com o parceiro(a) é uma barreira permanente. Aplicativos existentes falham por exigir dados excessivos sem devolver insights, focar exclusivamente no passado, e ignorar que a informação financeira precisa ser consumida por perfis diferentes.

O Caderninho resolve isso em três dimensões temporais: **ontem** (como estávamos), **hoje** (como estamos) e **amanhã** (para onde vamos se continuarmos assim) — dando ao casal uma visão completa da saúde financeira familiar através de uma linguagem visual que ambos compreendem.

### O Que Torna Especial

- **Tradutor financeiro do casal:** Ponte entre quem controla e quem decide — transforma números complexos em respostas visuais que eliminam a barreira de comunicação financeira
- **Registro com retorno imediato:** Cada campo preenchido gera insight visível — a disciplina de registro que já existe finalmente é recompensada
- **GPS financeiro, não câmera:** Projeção futura em três horizontes temporais, simulação de cenários e visão de longo prazo — "para onde você está indo" em vez de apenas "onde você esteve"
- **Transparência total:** Cada número é rastreável à sua origem. Toque em qualquer valor e veja de onde veio e por que mudou
- **Consciência que gera ação:** Quando a Tamires vê o fluxo com clareza, a motivação de economizar vem naturalmente. O app cria consciência compartilhada

## Classificação do Projeto

- **Tipo de Projeto:** Web App Responsiva (SPA — mobile & desktop via browser)
- **Domínio:** Finanças Pessoais (produto de uso pessoal/familiar, sem requisitos regulatórios comerciais)
- **Complexidade:** Média-Alta (modelo multi-entidade, orçamento em 3 camadas temporais, dois perfis de usuário, fluxo empresa→pessoa física)
- **Contexto:** Greenfield — produto novo, sem sistema existente a ser estendido
- **Natureza:** Projeto pessoal/familiar — não é produto comercial

## Perfis de Usuário

### Vitor — Gestor Financeiro

Programador, responsável por todos os pagamentos da família. Conta principal no Itaú, múltiplos cartões de crédito, duas empresas PJ (Castilho Informática LTDA e contribui na gestão financeira da empresa da Tamires). Registra cada transação com disciplina — precisa que esse esforço retorne em insights, projeções e controle analítico completo. Usa o app no celular para registro rápido no momento do gasto e no desktop para gestão mensal, reconciliação e análise de longo prazo. Quer projetar a vida financeira a 5+ anos.

### Tamires — Decisora Eventual

Psicóloga, empresa própria (Tamires Stasevskas Psicologia LTDA) com receita variável. Contribui financeiramente transferindo para a conta do Vitor quando necessário. Não quer (nem precisa) acompanhar cada detalhe — quer respostas visuais instantâneas: "a gente pode viajar?", "por que gastamos tanto esse mês?". Consulta o app pontualmente no celular antes de decisões. Quando vê o fluxo com clareza, a motivação de economizar vem naturalmente.

## Critérios de Sucesso

### Sucesso do Usuário

**Marco 1 — Paridade com a Planilha (Meses 1-3):**
Os números do Caderninho batem com os números da planilha por 3 meses consecutivos. Saldos de contas, totais de cartões e orçamentos convergem 100%. Ao final, Vitor sente confiança suficiente para parar de abrir a planilha.

**Marco 2 — Superação da Planilha (Meses 3-6):**
O Caderninho entrega insights que a planilha nunca conseguiu: drill-down analítico por categoria/estabelecimento, projeção futura de parcelas com data de liberação de orçamento, classificação por essencialidade, e simulação de cenários ("se economizar R$350/mês, acumula R$4.200 até dezembro"). Vitor descobre informações sobre as próprias finanças que não sabia antes.

**Marco 3 — Independência da Tamires (Meses 4-8):**
Tamires interage com as finanças familiares sem intermediação do Vitor. Nível bom: abre o app sozinha antes de decisões. Nível ótimo: para de perguntar "a gente pode?" porque encontra a resposta. Nível incrível: sugere proativamente oportunidades de economia baseada em insights do app.

**Marco 4 — Visão de Longo Prazo (Mês 6+):**
O Caderninho é a fonte única de verdade financeira da família. Planilha oficialmente aposentada. Projeção de 6 meses a 2 anos funcionando — o casal consegue planejar uma viagem em fevereiro e visualizar o impacto financeiro em dezembro, sabendo se precisará do fundo reserva ou se consegue guardar aos poucos até lá.

### Sucesso do Negócio

Como projeto pessoal/familiar, o sucesso não é comercial mas sim de **qualidade de vida financeira:**
- **Eliminar trabalho morto:** cada minuto de registro retorna insight proporcional
- **Criar linguagem financeira compartilhada:** Vitor e Tamires falando a mesma língua sobre dinheiro
- **Transformar controle em planejamento:** de "quanto gastei" para "quanto posso construir"
- **Autonomia com segurança:** Tamires decide gastos com confiança, sem depender do Vitor
- **Patrimônio visível:** família visualiza crescimento patrimonial como resultado do esforço conjunto *(dependente de capacidades da Fase 3 — Painel de Investimentos)*

### Sucesso Técnico

- **Confiabilidade dos dados:** 100% de precisão nos cálculos de saldos, orçamentos e projeções
- **Confiabilidade dos cálculos:** cada número rastreável à sua origem, transparência total nas fórmulas
- **Backup seguro:** dados protegidos com backup automático, garantindo que anos de registro nunca se percam
- **Performance:** carregamento do dashboard em < 2 segundos, registro de transação fluido
- **Responsividade:** experiência funcional e agradável no desktop e no celular

### Resultados Mensuráveis

| Indicador | Meta |
|---|---|
| Tempo de registro por transação | < 10 segundos |
| Completude de captura vs. extrato real | > 95% após reconciliação |
| Paridade app vs. planilha | 100% por 3 meses → aposentar planilha |
| Tamires entende dashboard sem perguntar | Sim |
| Tamires abre o app por iniciativa própria | ≥ 2x por mês |
| Insights novos por mês | ≥ 3 |
| Projeções que influenciam decisões reais | ≥ 1 por mês |
| Horizonte de projeção confiável | 6 meses a 2 anos |

## Jornadas de Usuário

### Jornada 1: Vitor — O Registro Rápido no Momento do Gasto

**Cena de abertura:** Vitor acabou de pagar R$87 no supermercado com o cartão Latam Pass. Ainda no estacionamento, com o celular na mão, abre o Caderninho.

**Ação:** Digita 87, toca "Alimentação" e depois "Supermercado" (subcategoria), vê os estabelecimentos frequentes — seleciona "Pão de Açúcar". O "Latam Pass Visa" já vem preenchido, porque é o método que Vitor vem usando em Supermercado. Antes de confirmar, o app mostra: "Limite disponível Latam: R$4.213 → R$4.126 | Supermercado: R$2.122/R$3.000 — resta R$878 | Alimentação: R$4.300/R$5.500". Confirma.

**Clímax:** 6 segundos. Gasto registrado. Impacto visível. Vitor sabe exatamente onde está sem abrir planilha nenhuma.

**Resolução:** No fim da semana, a sessão de atualização no computador é só validação — os gastos já estão lá.

### Jornada 2: Vitor — O Ciclo Mensal e a Checklist

**Cena de abertura:** Dia 1º de abril. Vitor abre o Caderninho no computador. O dashboard mostra um card dedicado: "Contas do mês — Falta pagar R$12.640 de R$18.450 total · 4 de 14 confirmadas". O app apresenta a checklist do mês: 14 contas, separadas por tipo de pagamento.

**Tipos de conta diferenciados:** Cada conta tem um tipo que define seu workflow de confirmação:
- **Débito automático** (escola R$2.800, internet R$158): pré-confirmadas, Vitor apenas valida que foram debitadas
- **Agendado no banco** (plano de saúde R$1.890): pré-confirmadas, Vitor valida que o agendamento foi executado
- **Recorrente no cartão** (Netflix R$55,90, Spotify R$34,90): incluídas na fatura do cartão, confirmadas automaticamente via reconciliação de fatura
- **Variável — fatura** (luz, condomínio): aparecem com valor base e indicador "atualizar quando souber"
- **Manual** (gasolina): aguarda registro de pagamento pelo usuário

**Ação progressiva:** Ao longo dos primeiros 10 dias, conforme Vitor descobre os valores reais (fatura de luz chegou: R$267 em vez de R$250), ele atualiza cada item. O app marca progresso: "Abril: 10 de 14 contas confirmadas — faltam: Amil, Condomínio, Luz, Gasolina".

**Notificações em 3 momentos:**
- **1 dia antes:** "Amanhã vence: Plano de saúde R$1.890 — Agendado no banco Itaú"
- **No dia:** "Hoje vence: Internet R$158 — Débito automático Itaú". Vitor confirma que foi debitado
- **Atrasado:** "Conta atrasada: Condomínio R$980 — venceu há 2 dias". Alerta visual vermelho no dashboard

**Clímax:** Dia 10, checklist completa. Card do dashboard atualiza: "R$0 — Tudo em dia ✅ · 14 de 14 confirmadas". Vitor vê a visão consolidada: "Total pago em abril: R$18.450 | Saldo disponível: R$19.200 | Margem: R$750 ✅". A Regra de Ouro está satisfeita.

**Resolução:** Fim do mês. Reconciliação: Vitor confere totais de cartões (via reconciliação de fatura), valida saldos, decide o que fazer com a sobra (colchão pro próximo mês ou fundo reserva). Fecha o mês com confiança.

### Jornada 3: Vitor — Correção de Erro e Edição Retroativa

**Cena de abertura:** Vitor percebe que registrou um almoço de R$65 em "Alimentação › Supermercado" quando deveria ser "Alimentação › Restaurante trabalho". Além disso, decidiu que a categoria "Assinaturas" deve ser reclassificada de "Essenciais" para "Qualidade de Vida".

**Ação — correção pontual:** Encontra a transação no histórico, edita a subcategoria de "Supermercado" para "Restaurante trabalho". O app recalcula instantaneamente: orçamento de Supermercado recupera R$65, orçamento de Restaurante trabalho consome R$65, e o total de Alimentação não muda. Barras de progresso atualizam em tempo real.

**Ação — reclassificação retroativa:** Altera "Assinaturas" de "Essenciais" para "Qualidade de Vida". O app aplica a mudança em todas as visualizações — gráficos do mês atual, histórico de meses anteriores, e projeções futuras refletem a nova classificação. O percentual de gastos não essenciais sobe retroativamente.

**Clímax:** Vitor vê que, com a reclassificação, 42% dos gastos são não essenciais — não 35% como parecia antes. Isso muda a análise de oportunidades de corte.

**Resolução:** Os dados contam a verdade. Nenhuma informação fica presa numa classificação errada do passado.

### Jornada 4: Tamires — "A Gente Pode Viajar?"

**Cena de abertura:** Março. Uma amiga convida Tamires e Vitor para uma viagem em grupo no final de semana prolongado de junho. Custo estimado: R$3.500. Tamires quer saber se podem ir — mas não quer esperar o Vitor chegar em casa pra perguntar.

**Ação:** Tamires abre o Caderninho no celular. Vê o dashboard familiar. Gastos do mês: barra de progresso mostra "Gastos regulares: ✅ dentro do planejado". Nenhum alerta vermelho.

**Descoberta:** Navega até a visão de projeção. Vê que, no ritmo atual, em junho o casal teria R$2.100 de margem acumulada. Não cobre os R$3.500 da viagem sem tocar no fundo reserva.

**Clímax:** O app mostra: "Se economizar R$500/mês em gastos não essenciais (março a maio), acumula R$3.600 até junho — viagem coberta sem tocar na reserva". Tamires entende. Sem números brutos, sem fórmulas, sem pânico.

**Resolução:** Quando Vitor chega em casa, Tamires diz: "Vi no Caderninho — se a gente cortar um pouco nos próximos 3 meses, dá pra ir sem mexer na reserva. Topa?". Ela não perguntou "a gente pode?" — ela propôs uma solução.

### Jornada 5: Tamires — Entendendo o Mês com Gastos Altos

**Cena de abertura:** Fim de maio. Tamires ouve Vitor mencionar que o cartão veio R$22.000 esse mês. O número assusta.

**Ação:** Abre o Caderninho. Dashboard mostra: gastos totais acima do planejado ⚠️. Mas logo abaixo, a explicação visual é imediata:
- Gastos regulares: R$12.600 — ✅ dentro do planejado
- Fora do planejado: Viagem R$9.000 (decisão do casal) + Motor de arranque R$1.400 (imprevisto)

**Clímax:** Tamires entende em 5 segundos. Não é que "gastaram demais" no dia a dia — foram duas situações específicas, uma planejada e uma imprevisto. Os gastos regulares estão normais.

**Resolução:** Nenhuma pergunta ao Vitor. Nenhum pânico. O Caderninho traduziu R$22.000 em contexto compreensível.

### Jornada 6: Vitor — Projeção de Longo Prazo

**Cena de abertura:** Fevereiro. Vitor e Tamires conversam sobre fazer uma viagem em família em dezembro. Custo estimado: R$8.000. Vitor quer saber se é viável sem comprometer a reserva.

**Ação:** Abre o Caderninho no computador. Vai à visão de projeção de longo prazo. A timeline mostra os próximos 12 meses com todos os gastos previstos — não só os mensais, mas também os recorrentes não-mensais: troca de óleo em julho (~R$500), seguro do carro em setembro (~R$2.800), rematrícula em novembro (~R$1.200), material escolar em dezembro (~R$1.500).

**Descoberta:** Vitor configura o cenário: "Meta: R$8.000 até dezembro". O app calcula levando em conta **todos** os compromissos previstos — incluindo os não-mensais. A margem mensal média é R$1.200, mas em setembro cai pra R$-1.600 por causa do seguro do carro, e em novembro/dezembro aperta com rematrícula + material. A projeção real é diferente de uma média simples.

**Clímax:** O app mostra: "Guardar R$800/mês não é suficiente — em setembro e novembro a conta não fecha por causa do seguro e da rematrícula. Alternativa: R$950/mês cobrindo os picos, ou R$700/mês + R$3.200 do fundo reserva". Vitor vê a realidade completa, sem surpresas escondidas.

**Resolução:** Mostra os cenários pra Tamires. Decidem juntos com visão completa — sabendo que o caminho até dezembro tem "lombadas" financeiras. A viagem é planejada com olhos abertos.

### Jornada 7: Vitor — De Onde Vem Esse Número?

**Cena de abertura:** Meio de março. Vitor olha o dashboard no computador e vê "Valor disponível livre: R$320". Parece pouco. Antes de se preocupar, quer entender de onde vem esse número.

**Ação:** Toca no R$320. O app abre a composição: "Saldo total contas: R$19.200 — Contas a pagar restantes: R$8.400 — Faturas de cartão abertas: R$7.180 — Orçamentos restantes (supermercado, gasolina, outros): R$3.300 = Disponível livre: R$320". Cada linha é tocável.

**Descoberta:** Toca em "Faturas de cartão abertas: R$7.180". Vê a decomposição por cartão: Latam Pass R$4.200 (12 parcelas ativas + gastos do mês) | Pão de Açúcar Master R$1.980 | Uniclass R$1.000. Toca em "Latam Pass R$4.200" — vê as 3 maiores transações: parcela da TV R$450, supermercado R$380, combustível R$290.

**Clímax:** Em 3 toques, Vitor foi de "R$320 disponível" até "a parcela da TV no Latam é o que mais pesa". Cada número tem origem. Nenhum valor é uma caixa preta.

**Resolução:** A transparência elimina a ansiedade. Vitor não precisa abrir planilha para entender um número — o próprio número conta sua história.

### Jornada 8: Vitor — Onde Está Indo o Dinheiro?

**Cena de abertura:** Domingo à noite. Vitor quer entender se existe oportunidade de economizar. Sabe que gasta muito, mas não sabe exatamente onde.

**Ação:** Abre o Caderninho no computador. Vai à visão por classificação de essencialidade. Vê: Essenciais 52% (R$9.100) | Qualidade de Vida 31% (R$5.400) | Proteção 8% (R$1.400) | Impostos e Obrigações 6% (R$1.050) | Doações 3% (R$500).

**Drill-down:** Toca em "Qualidade de Vida R$5.400" — abre as categorias: Restaurante R$1.800 | Viagem R$1.200 | Assinaturas R$450 | Lazer R$750 | Compras pessoais R$1.200. Toca em "Restaurante R$1.800" — abre subcategorias: Fast Food R$720 | Delivery R$630 | Restaurante tradicional R$450. Toca em "Fast Food R$720" — vê os estabelecimentos: McDonald's R$480 (67%) | Burger King R$160 (22%) | Outros R$80 (11%).

**Clímax:** Vitor descobre que gasta R$480/mês no McDonald's — quase R$6.000/ano. Na planilha, esse número estava escondido dentro de uma fórmula. No Caderninho, 4 toques revelam a verdade: a maior oportunidade de corte não está no supermercado (que é essencial), está no fast food (que é escolha).

**Resolução:** Vitor define uma meta pessoal: reduzir fast food de R$720 para R$400/mês. O Caderninho entregou o insight que a planilha nunca conseguiu — não apenas "quanto gastei", mas "onde exatamente posso escolher gastar menos".

### Jornada 9: Vitor — A Fatura do Cartão Chegou

**Cena de abertura:** Dia 16 de março. Vitor recebe a fatura do cartão Pão de Açúcar Master. No Caderninho, a fatura estimada era R$11.037,62. A fatura real: R$11.250,00. Diferença de R$212,38.

**Ação — iniciar reconciliação:** Vitor abre o detalhe do cartão no Caderninho e insere o valor real da fatura. O app mostra a comparação lado a lado: estimativa R$11.037,62 → real R$11.250,00 e lista todas as 47 transações do ciclo (16/fev a 15/mar) com checkboxes.

**Investigação:** Vitor percorre a lista. 45 transações batem. Mas a compra de R$380 na Shell do dia 14/mar não apareceu na fatura — processamento atrasado da máquina. Vitor desmarca essa transação. O app move automaticamente para o ciclo de abril e recalcula: diferença cai para −R$167,62 (fatura ainda maior que estimativa).

**Descoberta:** Falta R$167,62 que está na fatura mas não no app. Vitor verifica o extrato do cartão e encontra uma corrida de Uber de R$47,80 que esqueceu de registrar, mais o seguro do cartão de R$119,82 (cobrança automática). Adiciona ambas no app direto pela tela de reconciliação.

**Clímax:** Total reconciliado: R$11.250,00. Diferença: R$0,00. Vitor confirma. A fatura de R$11.250,00 vira automaticamente uma conta a pagar no checklist com vencimento dia 22/mar. A Shell de R$380 entra no ciclo de abril.

**Resolução:** Em 4 minutos, Vitor reconciliou a fatura, descobriu 2 gastos não registrados e corrigiu 1 transação com processamento atrasado. Na planilha, esse processo levava 20+ minutos e era propenso a erro. No Caderninho, o app guia o processo e garante que o total bate.

### Resumo de Requisitos Revelados pelas Jornadas

| Jornada | Capacidades Reveladas |
|---|---|
| Registro rápido | Fluxo cascata, feedback de saldo/limite/orçamento antes de confirmar, sugestão de estabelecimentos frequentes |
| Ciclo mensal | Checklist por tipo de conta (débito automático, agendado, recorrente no cartão, variável, manual), confirmação diferenciada por tipo, card dedicado com total faltante no mês, notificação 1 dia antes + no dia + atrasado, reconciliação de fim de mês |
| Correção e edição | Edição de transações, reclassificação retroativa de categorias com reflexo em todas as visualizações (passado, presente, futuro) |
| Tamires — "A gente pode?" | Dashboard familiar visual, projeção futura com simulação de cenários, linguagem acessível sem números brutos |
| Tamires — Gastos altos | Separação visual de gastos regulares vs. fora do planejado (decisão deliberada vs. imprevisto), explicação instantânea de desvios |
| Projeção de longo prazo | Simulador de metas com prazo, cenários alternativos, projeção baseada em histórico real, cadastro dinâmico de gastos recorrentes não-mensais (semestral, anual, ciclo livre) com visualização na timeline |
| Tap to trace — "De onde vem?" | Rastreabilidade de qualquer valor exibido: toque revela composição e origem, navegação em profundidade por cada componente |
| Drill-down analítico — "Onde vai o dinheiro?" | Navegação hierárquica completa: essencialidade → categoria → subcategoria → estabelecimento, com percentuais e valores absolutos em cada nível |
| Reconciliação de fatura | Comparação estimativa vs. fatura real, marcar/desmarcar transações do ciclo, mover transações entre ciclos (processamento atrasado), adicionar transações não registradas, loop até diferença zero, fatura confirmada vira conta a pagar no checklist |

## Requisitos de Domínio

### Segurança e Autenticação

- **Autenticação:** login social e email/senha como fallback. Aplicação exposta em domínio próprio na internet como produto em produção. *(Escolha de protocolo e provedor definidos na arquitetura)*
- **Sessões seguras:** sessões com expiração, renovação automática, logout explícito
- **HTTPS obrigatório:** toda comunicação criptografada em trânsito
- **Dados sensíveis criptografados:** informações financeiras protegidas em repouso no banco de dados

### Integridade dos Dados

- **Precisão inegociável nos cálculos:** saldos, orçamentos, projeções e totalizadores devem ser 100% precisos — qualquer divergência destrói a confiança no sistema e impede a aposentadoria da planilha
- **Consistência transacional:** operações de escrita (registro, edição, exclusão de transações) devem ser atômicas — sem estados parciais ou dados corrompidos
- **Rastreabilidade:** cada número rastreável à sua origem, cada alteração refletida consistentemente em todas as visualizações (passado, presente, futuro)
- **Arredondamento controlado:** cálculos financeiros em centavos, sem erros de ponto flutuante — usar representação decimal precisa

### Backup e Recuperação

- **Backup automático:** estratégia de backup planejada desde o dia 1
- **Retenção de longo prazo:** dados financeiros acumulados ao longo de anos preservados integralmente — perda de dados é inaceitável
- **Recuperação testada:** a recuperação precisa ser validada e confiável
- **Versionamento de dados:** capacidade de restaurar estado anterior em caso de erro ou corrupção

### Privacidade e Permissões

- **Modelo de permissões por consentimento:** cada usuário controla o que compartilha com o outro
- **Granularidade de permissões:** compartilhamento seletivo — ex: Tamires vê o dashboard familiar e orçamentos compartilhados, mas não necessariamente cada transação individual do Vitor (e vice-versa)
- **Privacidade como padrão:** dados privados por padrão — compartilhamento é ação explícita
- **Separação de dados pessoais:** mesmo dentro de uma "família", cada conta tem seus dados próprios; a visão compartilhada é uma camada construída sobre permissões explícitas
- **Trilha de auditoria completa:** todo registro, alteração e exclusão contém obrigatoriamente: quem fez, quando fez e o que foi alterado. Trilha de auditoria como requisito de domínio, não feature opcional

## Requisitos Específicos — Web App Responsiva

### Arquitetura da Aplicação

- **Navegação fluida:** sem recarregamento de página, essencial para o fluxo de registro rápido e interatividade do dashboard
- **Real-time desde o MVP:** quando um usuário registra, edita ou exclui uma transação, o outro vê a mudança refletida imediatamente sem recarregar
- **Separação dados/apresentação:** frontend e backend independentes, facilitando eventual app mobile nativo e manutenção isolada

### Design Responsivo

- **Dual-device como requisito fundamental:** a aplicação precisa ser 100% funcional e agradável tanto no desktop quanto no mobile — ambos os perfis de usuário dependem do mobile
- **Mobile (ambos os perfis):**
  - **Vitor — registro diário:** fluxo cascata de registro rápido (~5 segundos) para criar o hábito de registrar no momento do gasto
  - **Tamires — consumo e decisão:** dashboard familiar visual, barras de progresso, projeções, telas otimizadas para toque
- **Desktop (Vitor — gestão e análise):** dashboard analítico completo, checklist mensal, reconciliação, drill-down, projeções de longo prazo, configuração de categorias e orçamentos
- **100% responsivo:** todas as funcionalidades disponíveis em ambos os dispositivos — o que muda é a prioridade visual e o layout, não a disponibilidade
- **Breakpoints principais:** celular (< 768px) e desktop (≥ 1024px) como experiências igualmente completas

### Suporte de Browsers

- **Primário:** Google Chrome (últimas 2 major versions)
- **Secundário:** Safari (versões recentes — para uso no iPhone/iPad)
- **Não priorizado:** Firefox, Edge — sem esforço extra de compatibilidade

### SEO

- **Não aplicável:** 100% do conteúdo está atrás de autenticação

### Acessibilidade

- **Boas práticas padrão:** contraste adequado, fontes legíveis, hierarquia visual clara
- **Navegação por teclado:** funcional para uso no desktop
- **Sem requisitos WCAG formais:** foco em usabilidade prática

### Considerações de Implementação

- **PWA (Progressive Web App):** considerar service worker para cache básico e "adicionar à tela inicial" no celular — experiência quase nativa sem app store
- **Estado offline:** não é requisito do MVP — requer conexão para consistência e real-time
- **Arquitetura preparada para mobile nativo:** separação API/frontend facilita app nativo futuro

## Scoping & Desenvolvimento Faseado

### Estratégia do MVP

**Filosofia:** MVP de resolução de problema — o mínimo que substitui funcionalmente a planilha Excel e prova que o Caderninho é superior.

**Contexto:** Projeto pessoal desenvolvido pelo próprio usuário principal (programador). Sem restrições de equipe externa, investidores ou prazos comerciais. Ritmo ditado pela qualidade e confiança nos dados.

### MVP — Feature Set (Fase 1)

**Jornadas Suportadas no MVP:**
- Registro rápido no momento do gasto (Jornada 1)
- Ciclo mensal com checklist por tipo de conta e notificações em 3 momentos (Jornada 2)
- Reconciliação de fatura do cartão de crédito (Jornada 9)
- Correção de erros e edição retroativa (Jornada 3)
- Visão de controle e acompanhamento (parcial das Jornadas 4 e 5)
- Rastreabilidade de valores — tap to trace (Jornada 7)
- Drill-down analítico por hierarquia completa (Jornada 8)
- Projeção futura básica com parcelas (parcial da Jornada 6)

**Detalhamento de suporte parcial (J4/J5/J6):**

| Jornada | Capacidade | MVP | Fase |
|---|---|---|---|
| J4 — "A gente pode?" | Dashboard familiar visual com barras de progresso e margem | ✅ | MVP |
| J4 — "A gente pode?" | Simulação de cenários ("se economizar R$500/mês") | ❌ | Fase 3 |
| J5 — Gastos altos | Visualização de gastos totais vs. planejado com alerta visual | ✅ | MVP |
| J5 — Gastos altos | Separação planejado vs. decisão deliberada vs. imprevisto | ❌ | Fase 2 |
| J6 — Projeção longo prazo | Timeline de parcelas com data de término e liberação de orçamento | ✅ | MVP |
| J6 — Projeção longo prazo | Gastos recorrentes não-mensais na timeline | ✅ | MVP |
| J6 — Projeção longo prazo | Simulador de metas com prazo | ❌ | Fase 3 |
| J6 — Projeção longo prazo | Cenários alternativos e visualização de "lombadas" financeiras | ❌ | Fase 3 |

**Capacidades Must-Have:**

1. **Autenticação e segurança:** login social, email/senha como fallback, sessões com expiração e renovação automática, HTTPS, dados criptografados em repouso (AES-256 ou equivalente), domínio próprio em produção
2. **Setup inicial:** cadastro de contas bancárias, cartões de crédito (com limite), investimentos (com tipo, rendimento previsível e vencimento opcional), hierarquia de gastos em 4 níveis (classificação de essencialidade → categoria → subcategoria → estabelecimento) com 7 classificações padrão editáveis — orçamento mensal (valor fixo ou faixa) e método de pagamento padrão opcionais em qualquer nível, fontes de receita (com tipo de vínculo e recorrência)
3. **Registro completo de transações:** entrada/saída com valor, categoria, subcategoria, estabelecimento/contexto, método de pagamento. Suporte a gasto único, parcela de cartão com contagem regressiva, recorrente fixo, recorrente variável, fixo mínimo + variável. Fluxo cascata rápido (~5 segundos no celular)
4. **Gastos recorrentes não-mensais:** frequência fixa (semanal a anual), a cada N meses, ou anual com mês fixo (sazonais) — troca de óleo, seguro do carro, rematrícula, material escolar. Visíveis na timeline de projeção. Próxima ocorrência calculada a partir da última realizada
5. **Checklist mensal com tipos de conta:** 5 tipos de pagamento (débito automático, agendado no banco, recorrente no cartão, variável/fatura, manual) com confirmação diferenciada por tipo. Card dedicado com total faltante no mês e progresso visual
6. **Notificações em 3 momentos:** 1 dia antes do vencimento, no dia, e quando atrasa — cada com prioridade visual diferente. Badge/sininho com lista de alertas visíveis até confirmação
7. **Visão de controle:** saldo de cada conta, total gasto por nível da hierarquia (classificação, categoria, subcategoria), contas a pagar, saldo disponível, drill-down classificação → categoria → subcategoria → estabelecimento
8. **Projeção futura básica:** timeline de parcelas com cartão associado e data de término, indicador de liberação de orçamento, gastos recorrentes não-mensais posicionados na timeline
9. **Edição e correção:** edição de transações, reclassificação retroativa de categorias com reflexo em todas as visualizações (passado, presente, futuro)
10. **Real-time:** atualização instantânea entre usuários conectados — registro/edição/exclusão propagados sem recarregar página
11. **Arquitetura multi-user:** dados associados a "dono" desde o primeiro dia, modelo de permissões por consentimento, privacidade como padrão, trilha de auditoria (quem fez, quando, o quê)
12. **Backup automático:** estratégia de backup desde o dia 1, retenção de longo prazo, recuperação validada
13. **Design responsivo 100%:** desktop e mobile como experiências igualmente completas
14. **Painel administrativo e ferramentas de desenvolvimento:** visão de usuários, monitoramento básico, impersonation em ambientes não-produção, restauração de base entre ambientes
15. **Visibilidade de backup:** status dos backups verificável, integridade validável
16. **Orçamento multinível:** orçamento mensal planejado (valor fixo ou faixa), opcional em cada nível da hierarquia, com acompanhamento realizado vs. planejado, saldo não alocado visível em cada nível e cálculo do valor disponível livre
17. **Transferências entre contas:** movimentações internas entre contas próprias e entre membros — não contabilizadas como receita nem despesa
18. **Projeção agregada:** margem disponível projetada por mês considerando todos os compromissos previstos (receitas, recorrentes, parcelas, sazonais)
19. **Rastreabilidade de valores (tap to trace):** tocar/clicar em qualquer valor do dashboard para ver composição e origem
20. **Dashboard configurável:** widgets configuráveis por usuário com filtro de perspectiva (meus gastos / gastos da família / todos)
21. **Modelo de cartão de crédito:** mês de referência automático por transação baseado em data de fechamento, fatura estimada calculada em tempo real, utilizado líquido, parcelas com mês de referência automático na criação, projeção de parcelas futuras por mês
22. **Reconciliação de fatura:** comparação estimativa vs. fatura real, marcar/desmarcar transações do ciclo, mover transações para próximo ciclo (processamento atrasado), adicionar não registradas, loop até diferença zero, fatura confirmada vira conta a pagar no checklist

### Fase 2 — Inteligência e Análise (Pós-MVP)

- Dashboard orientado por perguntas ("Quanto posso gastar?", "A gente pode?")
- Simulador fiscal empresarial completo (DARF → pró-labore → INSS → lucro)
- Explicação de desvios (planejado vs. decisão deliberada vs. imprevisto)
- Metas financeiras familiares por classificação de essencialidade (percentual ou valor alvo por classificação com acompanhamento de progresso)
- Exportação de dados para contabilidade (relatórios/formatos consumíveis pelo contador)
- Conexão de contas (Tamires cria conta própria, conecta com a conta do Vitor via modelo de permissões do MVP — infraestrutura multi-user já existente)
- Dashboard da Tamires (experiência dedicada: visão familiar simplificada com barras de progresso, status "dentro do combinado ✅ / atenção ⚠️", separação planejado vs. fora do planejado, sem detalhes transacionais — orientado por respostas visuais, não por números brutos)
- Importação de extrato PDF para reconciliação
- Notificação de fim do dia para captura de gastos

### Fase 3 — Projeção e Patrimônio (Futuro)

- Projeção de longo prazo com simulação de cenários (6 meses a 2 anos)
- Simulador de metas com prazo ("guardar R$X/mês para viagem em dezembro")
- Painel de investimentos (aportes vs. rendimentos, patrimônio consolidado)
- Metas de poupança com prazo e projeção (caixinhas)
- Financiamento/consórcio com visão de longo prazo
- App mobile nativo (opcional — se PWA não for suficiente)

### Infraestrutura e Ambientes

- **Três ambientes desde o dia 1:**
  - **Testes:** desenvolvimento e testes automatizados — dados fictícios ou restaurados de produção
  - **Homologação:** espelho de produção para validação antes de deploy — features novas com dados reais
  - **Produção:** ambiente real com domínio próprio, dados reais, backup ativo
- **Deploy controlado:** features validadas em homologação antes de produção
- **Dados isolados:** cada ambiente com banco de dados próprio

### Ferramentas de Desenvolvimento e Debug

- **Restauração + Impersonation como fluxo integrado:** restaurar dados reais de produção → logar como o usuário afetado → reproduzir e diagnosticar o problema com fidelidade total
- **Restauração de base com um clique:** copiar base de produção para testes ou homologação de forma rápida e simples
- **Impersonation (ambientes não-produção):** admin assume identidade, permissões e visão de qualquer usuário. Bloqueado em produção por design

### Painel Administrativo

- **Visão de usuários:** todos os usuários cadastrados com status (ativo/inativo), data de criação, último acesso
- **Monitoramento básico:** quem está usando, quando usou por último
- **Acesso restrito:** disponível apenas para o administrador (Vitor)

### Mitigação de Riscos

**Risco de confiança nos dados:** Se os números não baterem com a planilha, a migração não acontece. Mitigação: execução paralela (planilha + Caderninho) por 3 meses com conferência mensal de paridade.

**Risco de abandono pela Tamires:** Se a experiência mobile não for intuitiva, ela não adota. Mitigação: validar a interface com a Tamires nos primeiros protótipos.

**Risco de perda de dados:** Anos de registro financeiro em risco. Mitigação: backup automático desde o dia 1, testes de recuperação periódicos, retenção de longo prazo.

## Requisitos Funcionais

### Gestão de Contas e Estrutura Financeira

- FR1: O usuário pode cadastrar contas bancárias com nome, banco e saldo inicial
- FR2: O usuário pode cadastrar cartões de crédito com nome, bandeira, limite total, data de fechamento (define o ciclo de faturamento e o mês de referência das transações) e data de vencimento da fatura
- FR3: O usuário pode cadastrar investimentos com nome, instituição, tipo (renda fixa / renda variável / reserva), saldo atual, data de atualização e data de vencimento (opcional — aplicável a Tesouro Direto e CDBs). Tracking diferenciado por tipo: reserva e renda fixa rastreiam rendimento previsível (ex: % CDI), renda variável rastreia apenas saldo. Projeção de investimentos configurável até 10 anos
- FR4: O usuário pode cadastrar fontes de receita com nome, tipo de vínculo (PJ própria / CLT / freelance / outro), recorrência (sim/não), valor base mensal (opcional — para projeção) e dia habitual de pagamento (opcional). Fonte de receita funciona como etiqueta de origem — sem saldo próprio no sistema
- FR5: O usuário pode cadastrar classificações, categorias, subcategorias e estabelecimentos em estrutura hierárquica (FR38). Cada nível pode ter, opcionalmente, orçamento mensal planejado (valor fixo ou faixa) e método de pagamento padrão. Ex.: Essenciais (classificação) → Alimentação (categoria, R$5.500) → Supermercado (subcategoria, R$2.500 a R$3.000, Latam Pass) → Pão de Açúcar (estabelecimento)
- FR6: O usuário pode editar qualquer item da estrutura financeira (contas, cartões, fontes de receita). Exclusão funciona como arquivamento: itens arquivados ficam inativos — não aparecem para novas transações, mas o histórico permanece intacto. Itens arquivados podem ser reativados
- FR7: O usuário pode visualizar o saldo atualizado de cada conta bancária
- FR8: O usuário pode visualizar de cada cartão de crédito: limite total, utilizado (soma de todas as transações não liquidadas incluindo parcelas futuras), disponível (limite − utilizado), fatura estimada do ciclo atual (soma das transações cujo mês de referência = ciclo atual), utilizado líquido (utilizado − parcelas de ciclos futuros) e parcelas futuras agrupadas por mês de referência com valor e contagem

### Registro de Transações

- FR9: O usuário pode registrar transações de saída (gastos) com valor, categoria, subcategoria, estabelecimento/contexto e método de pagamento
- FR10: O usuário pode registrar transações de entrada (receitas) com valor, origem e conta de destino
- FR11: O usuário pode registrar gastos parcelados no cartão de crédito com número de parcelas, gerando parcelas automáticas com contagem regressiva. Cada parcela recebe automaticamente seu mês de referência na criação, baseado na data de fechamento do cartão (parcela 1 = próximo fechamento, parcela 2 = fechamento +1 mês, etc.)
- FR12: O usuário pode associar cada transação a um método de pagamento específico (cartão de crédito, débito, Pix, Flash)
- FR13: O sistema exibe feedback do impacto da transação antes da confirmação — saldo/limite restante e consumo dos orçamentos afetados (cada nível da hierarquia da transação que tiver orçamento definido) (< 500ms conforme NFR P3)
- FR14: O usuário pode registrar estabelecimentos e o sistema sugere os 5 estabelecimentos mais utilizados na subcategoria (ordenados por frequência de uso nos últimos 90 dias)
- FR15: O usuário pode editar qualquer transação registrada (valor, categoria, subcategoria, estabelecimento, método de pagamento)
- FR16: O usuário pode excluir transações registradas
- FR17: O sistema recalcula todos os totalizadores, saldos e orçamentos ao registrar, editar ou excluir transações (< 500ms conforme NFR P3)
- FR58: O usuário pode registrar transferências entre contas próprias (ex: Itaú → Inter) e entre membros (ex: Tamires → Vitor). Transferências não são contabilizadas como receita nem despesa — são movimentações internas que afetam apenas os saldos das contas envolvidas
- FR71: O usuário pode definir, opcionalmente, um método de pagamento padrão em qualquer nível da hierarquia (classificação, categoria, subcategoria, estabelecimento). Ao registrar um gasto:
  - **Preenchimento automático:** o sistema percorre a hierarquia do mais específico ao mais geral (estabelecimento → subcategoria → categoria → classificação). Em cada nível, usa o método **definido**; se não houver, usa o **hábito** (os 3 últimos registros naquele nível com o mesmo método); se não houver nenhum dos dois, sobe um nível. O primeiro encontrado vem preenchido; se nenhum, o campo fica vazio
  - **Atalhos de um toque** (sem repetir o método já preenchido): "último usado" (método do último registro na subcategoria, ou no estabelecimento quando informado) e o padrão do nível acima quando for diferente (ex.: "Alelo — padrão de Alimentação")
  - **Sugestão de padrão:** quando um método é o mais usado num nível nos últimos 90 dias e difere do padrão daquele nível (ou o nível não tem padrão), o sistema sugere defini-lo como padrão ("Você costuma pagar Supermercado com Latam Pass. Definir como padrão?"). O usuário aceita ou dispensa; dispensada, a sugestão só volta se outro método passar a ser o mais usado
  - O usuário sempre pode trocar o método no momento do registro

### Gastos Recorrentes

- FR18: O usuário pode cadastrar gastos recorrentes mensais do tipo fixo imutável (auto-preenchidos mensalmente)
- FR19: O usuário pode cadastrar gastos recorrentes mensais do tipo variável com base (pré-preenchidos com valor base, sinalizados para atualização)
- FR20: O usuário pode cadastrar gastos recorrentes mensais do tipo fixo mínimo + variável (pré-preenchidos com mínimo, aceitam acréscimo)
- FR21: O usuário pode cadastrar gastos recorrentes não-mensais com frequência fixa (semanal, quinzenal, mensal, bimestral, trimestral, semestral, anual), a cada N meses (ex: a cada 5 meses), ou anual com mês fixo (despesas sazonais — ex: rematrícula em novembro, material escolar em dezembro). Cada recorrente tem valor estimado. Próxima ocorrência calculada a partir da última realizada
- FR22: O sistema posiciona automaticamente os gastos recorrentes não-mensais na timeline de projeção futura. Horizonte configurável: opções rápidas de 6, 12 e 24 meses, configurável até 5 anos (60 meses) para fluxo de caixa geral e até 10 anos (120 meses) para projeção de investimentos

### Checklist Mensal

- FR23: O sistema gera automaticamente a checklist do mês com todos os gastos recorrentes categorizados por tipo de pagamento: débito automático, agendado no banco, recorrente no cartão, variável (fatura), e manual
- FR24: O sistema aplica confirmação diferenciada por tipo: débito automático e agendado no banco são pré-confirmados (usuário valida que foram executados); recorrentes no cartão são confirmados automaticamente via reconciliação de fatura; variáveis (fatura) são sinalizados para atualização de valor; manuais aguardam registro de pagamento pelo usuário
- FR25: O usuário pode atualizar o valor real de gastos variáveis conforme as informações chegam (ex: fatura de luz chega com valor diferente do estimado). O sistema exibe o impacto da alteração no total do mês antes de confirmar
- FR26: O sistema exibe o progresso da checklist mensal (X de Y contas confirmadas, listando as pendentes)
- FR27: O usuário pode visualizar a visão "o que falta pagar" com: valor total faltante no mês, progresso monetário (R$X pagos de R$Y total), contagem de contas (X de Y confirmadas), e lista de pendentes agrupadas por proximidade de vencimento

### Notificações

- FR28: O sistema notifica o usuário em 3 momentos para cada conta: 1 dia antes do vencimento, no dia do vencimento, e quando atrasa. Cada momento tem prioridade visual diferente (informativo → atenção → crítico). Notificações in-app via badge/sininho com lista de alertas. Alertas permanecem visíveis até a conta ser confirmada. No dashboard, um card dedicado exibe o total faltante no mês com progresso visual
- FR29: O usuário pode marcar contas como pagas a partir da notificação ou dentro do app

### Visão de Controle e Dashboard

- FR30: O usuário pode visualizar o total gasto no mês por nível da hierarquia (classificação, categoria, subcategoria) com barra de progresso (gasto/orçamento/restante) quando houver orçamento definido
- FR31: O usuário pode fazer drill-down de uma categoria para ver distribuição por subcategoria e estabelecimento
- FR32: O usuário pode visualizar o total de contas a pagar restantes no mês
- FR33: O usuário pode visualizar a Regra de Ouro: comprometimento em cartões (soma das faturas atuais/abertas de todos os cartões) vs. saldo disponível (soma dos saldos de todas as contas-corrente). Alerta visual quando comprometimento ≥ X% do saldo disponível, onde X é configurável pelo usuário
- FR34: O sistema atualiza o dashboard quando outro usuário registra, edita ou exclui transações (propagação < 2s conforme NFR P4)
- FR59: O usuário pode tocar/clicar em qualquer valor exibido no dashboard ou relatórios para visualizar a composição e origem daquele valor
- FR60: O sistema acompanha gasto realizado vs. orçamento planejado em cada nível com orçamento e exibe o valor disponível livre — o que sobra depois de todas as despesas realizadas, despesas fixas pendentes e orçamentos planejados restantes. Quando um nível estoura o planejado, o impacto é refletido no valor disponível
- FR72: Quando um nível tem orçamento e níveis abaixo dele também têm, o sistema exibe o saldo não alocado (orçamento do nível − soma dos orçamentos dos filhos). Nível sem orçamento exibe barra neutra, sem julgamento de cor, com o percentual relativo ao nível acima
- FR61: O usuário pode configurar quais widgets exibir no dashboard e filtrar por perspectiva (meus gastos / gastos da família / todos)

### Projeção Futura

- FR35: O usuário pode visualizar a timeline de parcelas ativas com cartão associado, parcela atual/total e data de término
- FR36: O sistema exibe quando uma parcela termina e quanto de orçamento será liberado mensalmente
- FR37: O sistema exibe os gastos recorrentes não-mensais posicionados na timeline com valor estimado e data prevista
- FR62: O sistema calcula e exibe a margem disponível projetada por mês, considerando receitas, despesas recorrentes (mensais e não-mensais), parcelas conhecidas e despesas sazonais. Horizonte configurável conforme FR22

### Categorização e Classificação

- FR38: O usuário pode organizar gastos em hierarquia de até 4 níveis:
  - **Classificação de essencialidade:** como o gasto é visto (ex.: Essenciais, Qualidade de Vida)
  - **Categoria:** o grande grupo de gasto (ex.: Alimentação, Transporte)
  - **Subcategoria:** o tipo de gasto dentro da categoria (ex.: Alimentação › Supermercado, Padaria, Hortifrúti; Transporte › Gasolina, Pedágio, Estacionamento)
  - **Estabelecimento:** onde o gasto foi feito (ex.: Supermercado › Pão de Açúcar, Fort Atacadista; Gasolina › Posto da esquina)
  - Toda transação de gasto tem classificação, categoria e subcategoria; o estabelecimento é opcional (ex.: um gasto em Transporte › Pedágio pode ser registrado sem estabelecimento)
  - A mesma subcategoria pode existir em categorias diferentes com classificação de essencialidade diferente
- FR39: O sistema oferece classificações de essencialidade padrão iniciais (Essenciais, Qualidade de Vida, Investimentos, Proteção, Doações, Impostos e Obrigações, Dívidas) como ponto de partida
- FR40: O usuário pode criar, renomear, mesclar e arquivar classificações de essencialidade. Renomear altera o nome preservando histórico. Mesclar migra todas as categorias e transações para outra classificação e desativa a original. Arquivar torna inativa — não aparece para novas transações, histórico preservado, pode ser reativada. O usuário pode reclassificar transações individualmente a qualquer momento. Classificações nunca são excluídas definitivamente
- FR41: O usuário pode reclassificar uma categoria (ex: mudar de "Essencial" para "Qualidade de Vida") com efeito retroativo em todas as visualizações — passado, presente e futuro
- FR42: O sistema recalcula todas as análises e gráficos ao alterar a classificação de uma categoria (< 500ms conforme NFR P3)
- FR43: O usuário pode fazer drill-down analítico seguindo a hierarquia completa (essencialidade → categoria → subcategoria → estabelecimento)
- FR44: *(Fase 2)* O usuário pode definir metas financeiras familiares baseadas nas classificações de essencialidade (percentual ou valor alvo por classificação) e acompanhar progresso via indicador visual (percentual atingido vs. meta, valor acumulado vs. valor alvo, tendência mensal)

### Gestão de Usuários e Permissões

- FR45: O usuário pode criar conta via login social ou email/senha
- FR46: O usuário pode fazer login com sessão persistente (renovação automática) e logout com encerramento completo da sessão
- FR47: O usuário pode conceder permissões a outro usuário com dois modos: acesso total (visualização e edição de todos os dados, padrão) ou acesso configurável por tipo de dado (ex: compartilhar contas e orçamentos mas restringir investimentos pessoais)
- FR48: O usuário pode revogar permissões concedidas a qualquer momento
- FR49: Dados de um usuário são visíveis apenas para ele até que ele conceda acesso explícito. Ao adicionar um membro à família, nenhum dado é compartilhado automaticamente — o dono configura o que compartilhar
- FR50: O sistema registra trilha de auditoria imutável para toda ação (criação, edição, exclusão) com identificação de quem fez, quando e o que foi alterado. Registros de auditoria não podem ser editados ou excluídos

### Painel Administrativo

- FR51: O administrador pode visualizar todos os usuários cadastrados com status, data de criação e último acesso
- FR52: O administrador pode impersonar qualquer usuário nos ambientes de teste e homologação
- FR53: O administrador pode restaurar a base de dados de produção para ambientes de teste ou homologação via painel administrativo (< 30 minutos conforme NFR M3)
- FR54: O sistema bloqueia impersonation no ambiente de produção

### Modelo de Cartão de Crédito

- FR64: O sistema atribui automaticamente o mês de referência a cada transação de cartão baseado na data de fechamento: transações registradas entre o fechamento anterior e o fechamento atual pertencem ao ciclo seguinte
- FR65: O sistema calcula a fatura estimada do ciclo atual somando todas as transações (avulsas, parcelas e recorrentes) cujo mês de referência corresponde ao ciclo. O status da fatura é "Estimativa" até o valor real ser inserido via reconciliação
- FR66: Ao confirmar a reconciliação de fatura, o sistema gera automaticamente uma conta a pagar no checklist mensal com o valor confirmado e a data de vencimento do cartão. A fatura confirmada substitui a estimativa
- FR67: Após o pagamento da fatura anterior (confirmado via checklist), o sistema recalcula as métricas do cartão: utilizado líquido e fatura do próximo mês se igualam (não há mais fatura anterior pendente a subtrair)
- FR68: O usuário pode desmarcar transações durante a reconciliação de fatura que não apareceram na fatura real. Transações desmarcadas têm seu mês de referência atualizado automaticamente para o próximo ciclo
- FR69: O usuário pode adicionar transações não registradas diretamente na tela de reconciliação para cobrir diferenças entre a fatura real e a estimativa
- FR70: O sistema exibe a diferença entre o total reconciliado e o valor real da fatura em tempo real durante a reconciliação. A confirmação só é permitida quando a diferença é zero

### Reconciliação de Fim de Mês

- FR55: O usuário pode iniciar a reconciliação de fatura de um cartão inserindo o valor real da fatura. O sistema compara com a fatura estimada (calculada automaticamente) e lista todas as transações do ciclo para revisão individual
- FR56: No fechamento do mês, o sistema apresenta o saldo final (positivo ou negativo). Se positivo, o usuário registra o destino da sobra para qualquer conta ou investimento cadastrado. Se negativo, o usuário registra a origem da cobertura (transferência de outro membro ou resgate de reserva/investimento)

### Backup e Monitoramento

- FR57: O administrador pode visualizar o status dos backups (último backup realizado, próximo agendado, resultado de integridade) e acionar restauração manual
- FR63: O sistema exibe mensagem de erro específica quando uma operação falha, preserva os dados digitados pelo usuário e oferece opção de retry

## Requisitos Não-Funcionais

### Performance

- Carregamento inicial do dashboard: < 2 segundos após login
- Registro de transação (fluxo cascata completo): feedback visual em < 100ms, confirmação do servidor em < 1 segundo
- Recálculo de totalizadores, saldos e orçamentos após registro/edição/exclusão: < 500ms
- Propagação real-time para outros usuários conectados: < 2 segundos
- Navegação entre telas: transição em < 300ms, sem recarregamento de página
- Drill-down analítico (essencialidade → categoria → subcategoria → estabelecimento): < 1 segundo por nível
- Checklist mensal e visão "o que falta pagar": carregamento < 1 segundo

### Segurança

- Sessões com expiração (default: 7 dias, configurável) e renovação automática
- HTTPS obrigatório em todos os ambientes (inclusive homologação)
- Dados financeiros criptografados em repouso com AES-256 ou equivalente
- Proteção contra ataques comuns: CSRF, XSS, SQL injection, brute force no login. Critério de aceitação: passar scan OWASP Top 10 sem vulnerabilidades críticas ou altas

### Confiabilidade e Disponibilidade

- Disponibilidade alvo: 99.5% (~1.8 dias de downtime por ano — razoável para projeto pessoal sem SLA comercial)
- Backup automático diário com retenção mínima de 90 dias
- Backup completo semanal com retenção de 1 ano
- Recuperação de backup testável — RTO < 4 horas, RPO < 24 horas. Capacidade de restaurar e validar integridade dos dados
- Zero perda de dados transacionais — toda transação confirmada é persistida de forma durável

### Manutenibilidade

- Nenhum componente de apresentação acessa diretamente a camada de persistência; toda comunicação via serviços/APIs internas — seguindo princípios de separação de responsabilidades (SOLID, DDD). Manutenção e evolução independentes
- Três ambientes isolados (testes, homologação, produção) com deploy controlado
- Restauração de base de produção para ambientes não-produção em < 30 minutos
- Cada módulo de domínio em diretório próprio, sem dependências circulares entre módulos — projeto mantido por um único desenvolvedor ao longo de anos precisa de organização rigorosa. *(Padrões arquiteturais específicos definidos no documento de arquitetura)*

### Usabilidade

- Registro de transação no celular: < 10 segundos (meta: ~5 segundos)
- Linguagem visual consistente: mesmos componentes, cores, tipografia e padrões de interação em todas as telas, seguindo um design system unificado. *(Design system específico definido no documento de UX/arquitetura)*
- Tamires localiza o status de gastos do mês e responde "a gente pode gastar X?" em < 30 segundos no primeiro uso sem instrução
- Feedback visual para toda ação: confirmação de sucesso em < 1 segundo, alertas com ação sugerida, erros com descrição do problema e opção de retry
