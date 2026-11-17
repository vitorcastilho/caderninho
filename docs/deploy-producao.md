# Deploy em Produção — Guia Completo

Este documento descreve todas as contas, serviços e configurações necessárias para colocar o Caderninho em produção.

## Contas Necessárias

Você precisa criar conta em **3 serviços** (todos têm plano gratuito):

### 1. Supabase — Banco de Dados

- **Site:** https://supabase.com/dashboard
- **Plano gratuito:** 2 projetos, 500MB de banco, 1GB de storage
- **O que faz:** Hospeda o PostgreSQL (banco de dados) + Auth + Realtime

**Passo a passo:**

1. Criar conta em https://supabase.com (pode usar GitHub login)
2. Clicar em "New Project"
3. Escolher organização (cria automaticamente na primeira vez)
4. Preencher:
   - **Name:** `caderninho` (ou o nome que preferir)
   - **Database Password:** gerar senha forte e **guardar** (vai precisar depois)
   - **Region:** `South America (São Paulo)` — `sa-east-1`
5. Aguardar criação (~2 minutos)
6. Ir em **Settings → API** para copiar:
   - `Project URL` → será o `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → será o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → será o `SUPABASE_SERVICE_ROLE_KEY`
7. Ir em **Settings → Database** para copiar:
   - `Connection string` (URI) → será o `DATABASE_URL`
   - Substituir `[YOUR-PASSWORD]` pela senha que você definiu no passo 4

**Após criar o projeto, aplicar as migrations (Story 1.13):**

- **Use sempre a URL do pooler em modo transação (porta 6543)** — no app (Vercel), nas migrations e nos arquivos locais.
- **Caminho normal:** guardar a URL no secret do repositório (`STAGING_DATABASE_URL` ou `PRODUCTION_DATABASE_URL`, em GitHub → Settings → Secrets and variables → Actions). O job `deploy-migrations` do CI aplica as migrations a cada merge em `staging`/`main`.
- **Manual (só se necessário):** salvar a URL no arquivo local do ambiente e rodar

```bash
npm run db:migrate -- --env staging                         # lê .env.staging.local
npm run db:migrate -- --env production --confirm-production # lê .env.production.local
```

O script lê o `DATABASE_URL` só do arquivo do ambiente (um `DATABASE_URL` exportado no terminal é ignorado), recusa staging/produção fora da porta 6543 ou com o project ref de outro ambiente (usuário `postgres.<ref>` no pooler compartilhado ou host `db.<ref>.supabase.co` no pooler dedicado; o ref de cada projeto fica só em `scripts/lib/migrate-env.ts` — atualize ao criar um projeto novo), produção sem `--confirm-production`, URL com `$` (o Next expande `$VAR` no `.env.local` e o migrate não; codifique `$` da senha como `%24`), `--env` repetido, `--confirm-production` fora de produção, usuário e host com project refs diferentes e argumentos desconhecidos (inclusive sem o `--` depois de `npm run db:migrate`). Nunca cole a URL com senha direto no terminal.

### 2. Vercel — Hospedagem da Aplicação

- **Site:** https://vercel.com
- **Plano gratuito:** deploys ilimitados, HTTPS automático, preview por branch
- **O que faz:** Hospeda o Next.js (frontend + backend/Server Actions)

**Passo a passo:**

1. Criar conta em https://vercel.com (usar GitHub login — conecta automaticamente ao repo)
2. Clicar em "Add New → Project"
3. Importar o repositório `vitorcastilho/caderninho`
4. Manter configurações padrão (Framework Preset: Next.js é detectado automaticamente)
5. Adicionar as variáveis de ambiente (ver seção abaixo) **antes do primeiro deploy**
6. Clicar em "Deploy"

Após o primeiro deploy:
- Todo push em qualquer branch gera **preview deploy** automático
- Todo merge em `main` gera **deploy em produção** automático
- Um bot da Vercel comenta no PR com a URL do preview

### 3. Google Cloud — OAuth (Login com Google)

- **Site:** https://console.cloud.google.com
- **Plano gratuito:** OAuth não tem custo
- **O que faz:** Permite que usuários façam login com conta Google

**Passo a passo:**

1. Acessar https://console.cloud.google.com
2. Criar um novo projeto (ou usar existente)
3. Ir em **APIs & Services → Credentials**
4. Clicar em **Create Credentials → OAuth Client ID**
5. Se for a primeira vez, configurar a **OAuth consent screen** primeiro:
   - User Type: External
   - App name: `Caderninho`
   - User support email: seu email
   - Authorized domains: adicionar o domínio da Vercel (ex: `caderninho.vercel.app`)
6. Voltar em Credentials → Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Caderninho Production`
   - Authorized JavaScript origins: `https://caderninho.vercel.app` (sua URL de produção)
   - Authorized redirect URIs: `https://caderninho.vercel.app/api/auth/callback/google`
7. Copiar:
   - `Client ID` → será o `GOOGLE_CLIENT_ID`
   - `Client Secret` → será o `GOOGLE_CLIENT_SECRET`

> **Nota:** Enquanto o app estiver em "Testing" no Google, apenas emails adicionados como test users conseguem logar. Para liberar pra todos, é necessário publicar o app (Google pode pedir verificação).

## Variáveis de Ambiente na Vercel

Cadastrar **todas** estas variáveis em **Vercel → Settings → Environment Variables**.

Selecionar o ambiente **Production** para cada uma:

| Variável | Valor | Origem |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase → Settings → API → service_role |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[senha]@...` | Supabase → Settings → Database → Connection string (URI) |
| `BETTER_AUTH_SECRET` | String aleatória 32+ chars | Gerar com: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://caderninho.vercel.app` | Sua URL de produção na Vercel |
| `NEXT_PUBLIC_APP_URL` | `https://caderninho.vercel.app` | Mesma URL de produção |
| `GOOGLE_CLIENT_ID` | `123456789-xxx.apps.googleusercontent.com` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google Cloud Console → Credentials |
| `ENVIRONMENT` | `production` | Valor fixo |

> **`NODE_ENV`** não precisa cadastrar — a Vercel seta automaticamente como `production`.

### Variáveis para ambiente Preview (staging)

Se quiser um staging com banco separado, cadastrar as mesmas variáveis acima mas selecionando o ambiente **Preview** na Vercel, apontando para um **segundo projeto Supabase** (gratuito).

## Checklist de Deploy

- [ ] Criar conta no Supabase e criar projeto `caderninho` (região São Paulo)
- [ ] Copiar as 4 credenciais do Supabase (URL, anon key, service role key, DATABASE_URL)
- [ ] Guardar a URL (porta 6543) no secret `PRODUCTION_DATABASE_URL` do repositório — as migrations rodam no merge em `main` (manual: `npm run db:migrate -- --env production --confirm-production`)
- [ ] Criar conta na Vercel e importar o repositório
- [ ] Criar credenciais OAuth no Google Cloud Console
- [ ] Cadastrar todas as 10 variáveis de ambiente na Vercel (tabela acima)
- [ ] Fazer o primeiro deploy
- [ ] Verificar que a aplicação carrega em produção
- [ ] Testar login com email/senha
- [ ] Testar login com Google

## Custos

| Serviço | Plano | Custo |
|---|---|---|
| Supabase | Free | R$ 0 (500MB banco, 1GB storage, 2 projetos) |
| Vercel | Hobby | R$ 0 (deploys ilimitados, 100GB bandwidth) |
| Google Cloud | — | R$ 0 (OAuth não tem custo) |

**Total: R$ 0** — o MVP roda inteiramente no tier gratuito dos 3 serviços.
