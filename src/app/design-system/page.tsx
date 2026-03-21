"use client"

import { useState } from "react"
import { Button } from "@/client/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/client/components/ui/card"
import { Input } from "@/client/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/client/components/ui/select"
import { Label } from "@/client/components/ui/label"
import { Badge } from "@/client/components/ui/badge"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/client/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/client/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/client/components/ui/tabs"
import { Skeleton } from "@/client/components/ui/skeleton"
import { ChevronDown, Plus, Pencil, Archive, Loader2, Clock, X, AlertTriangle, CheckCircle2 } from "lucide-react"

/* ─── helpers ─── */

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6 pb-12">
      <h2 className="mb-6 border-b pb-2 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="size-10 rounded-md ring-1 ring-foreground/10"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

/* ─── page ─── */

export default function DesignSystemPage() {
  return (
    <div className="flex flex-col gap-0">
      <CoresSection />
      <TipografiaSection />
      <BotoesSection />
      <CardsSection />
      <FormulariosSection />
      <BadgesSection />
      <DialogsSection />
      <TabelasSection />
      <TabsSection />
      <BannersSection />
      <SummaryCardsSection />
      <EmptyStatesSection />
      <ListaColapsavelSection />
      <CursoresSection />
      <EspacamentoSection />
      <SkeletonSection />
    </div>
  )
}

/* ─── 1. Cores / Tokens ─── */

function CoresSection() {
  return (
    <Section id="cores" title="Cores / Tokens">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Neutros (Stone)</h3>
          <div className="flex flex-wrap gap-3">
            <Swatch color="#FAFAF9" label="background" />
            <Swatch color="#F5F5F4" label="muted" />
            <Swatch color="#E7E5E4" label="border" />
            <Swatch color="#A8A29E" label="tertiary" />
            <Swatch color="#78716C" label="secondary" />
            <Swatch color="#1C1917" label="foreground" />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Primária (Indigo)</h3>
          <div className="flex flex-wrap gap-3">
            <Swatch color="#EEF2FF" label="primary-light" />
            <Swatch color="#4F46E5" label="primary" />
            <Swatch color="#4338CA" label="primary-hover" />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Status</h3>
          <div className="flex flex-wrap gap-3">
            <Swatch color="#DCFCE7" label="positive-bg" />
            <Swatch color="#22C55E" label="positive" />
            <Swatch color="#166534" label="positive-text" />
            <Swatch color="#FEF9C3" label="attention-bg" />
            <Swatch color="#EAB308" label="attention" />
            <Swatch color="#854D0E" label="attention-text" />
            <Swatch color="#FFF7ED" label="alert-bg" />
            <Swatch color="#F97316" label="alert" />
            <Swatch color="#9A3412" label="alert-text" />
            <Swatch color="#DBEAFE" label="info-bg" />
            <Swatch color="#3B82F6" label="info" />
            <Swatch color="#1E40AF" label="info-text" />
            <Swatch color="#FEE2E2" label="critical-bg" />
            <Swatch color="#DC2626" label="critical" />
            <Swatch color="#991B1B" label="critical-text" />
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── 2. Tipografia ─── */

function TipografiaSection() {
  return (
    <Section id="tipografia" title="Tipografia">
      <div className="space-y-4">
        <div>
          <span className="text-xs text-muted-foreground">H1 — text-2xl font-bold</span>
          <p className="text-2xl font-bold">Resumo financeiro de março</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">H2 — text-xl font-semibold</span>
          <p className="text-xl font-semibold">Contas bancárias</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">H3 — text-lg font-semibold</span>
          <p className="text-lg font-semibold">Categorias e subcategorias</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">H4 — text-base font-medium</span>
          <p className="text-base font-medium">Detalhes da transação</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Body — text-sm</span>
          <p className="text-sm">
            O saldo atual da conta corrente Nubank é de R$ 4.532,18 com 23 transações no período.
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Small — text-xs text-muted-foreground</span>
          <p className="text-xs text-muted-foreground">Atualizado em 20/03/2026</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Label — text-sm font-medium</span>
          <Label>Nome da conta</Label>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Tabular nums — tabular-nums</span>
          <p className="text-sm tabular-nums">
            R$ 1.234,56 &nbsp;|&nbsp; R$ 98.765,43 &nbsp;|&nbsp; R$ 0,01
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ─── 3. Botoes ─── */

function BotoesSection() {
  return (
    <Section id="botoes" title="Botões">
      <div className="space-y-6">
        {/* Variants */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Variantes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Tamanhos</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        {/* Icon buttons */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Icon buttons</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon-xs" variant="ghost">
              <Pencil />
            </Button>
            <Button size="icon-sm" variant="ghost">
              <Pencil />
            </Button>
            <Button size="icon" variant="outline">
              <Plus />
            </Button>
            <Button size="icon-lg" variant="outline">
              <Plus />
            </Button>
          </div>
        </div>

        {/* States */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Estados</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button disabled variant="outline">
              Disabled outline
            </Button>
            <Button disabled>
              <Loader2 className="animate-spin" />
              Carregando...
            </Button>
          </div>
        </div>

        {/* With icons */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Com ícones</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus data-icon="inline-start" />
              Adicionar
            </Button>
            <Button variant="outline">
              <Pencil data-icon="inline-start" />
              Editar
            </Button>
            <Button variant="destructive">
              <Archive data-icon="inline-start" />
              Arquivar
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── 4. Cards ─── */

function CardsSection() {
  return (
    <Section id="cards" title="Cards">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Simples */}
        <Card>
          <CardHeader>
            <CardTitle>Card simples</CardTitle>
            <CardDescription>Apenas título e descrição</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Conteúdo do card com informações relevantes.
            </p>
          </CardContent>
        </Card>

        {/* Completo */}
        <Card>
          <CardHeader>
            <CardTitle>Conta Nubank</CardTitle>
            <CardDescription>Conta corrente</CardDescription>
            <CardAction>
              <Badge variant="secondary">Ativa</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">R$ 4.532,18</p>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-muted-foreground">
              Atualizado em 20/03/2026
            </span>
          </CardFooter>
        </Card>

        {/* Card sm */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>Card compacto</CardTitle>
            <CardDescription>Variante size=sm</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Menos padding e gap.</p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}

/* ─── 5. Formulários ─── */

function PercentInput() {
  const [value, setValue] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "")
    if (raw === "") {
      setValue("")
      return
    }
    const num = parseInt(raw, 10)
    const formatted = (num / 100).toFixed(2).replace(".", ",")
    setValue(`${formatted}%`)
  }

  return (
    <Input
      id="demo-percent"
      inputMode="numeric"
      placeholder="0,00%"
      value={value}
      onChange={handleChange}
    />
  )
}

function FormulariosSection() {
  const [moneyValue, setMoneyValue] = useState("")

  function handleMoneyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "")
    if (raw === "") {
      setMoneyValue("")
      return
    }
    const cents = parseInt(raw, 10)
    const reais = (cents / 100).toFixed(2).replace(".", ",")
    setMoneyValue(`R$ ${reais}`)
  }

  return (
    <Section id="formularios" title="Formulários">
      <div className="grid max-w-md gap-6">
        {/* Default */}
        <div className="grid gap-2">
          <Label htmlFor="demo-name">Nome da conta</Label>
          <Input id="demo-name" placeholder="Ex: Nubank, Itaú..." />
        </div>

        {/* Monetario */}
        <div className="grid gap-2">
          <Label htmlFor="demo-money">Valor (padrão bancário)</Label>
          <Input
            id="demo-money"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={moneyValue}
            onChange={handleMoneyInput}
          />
          <p className="text-xs text-muted-foreground">
            Digite apenas números. Ex: 1978 = R$ 19,78
          </p>
        </div>

        {/* Percentual */}
        <div className="grid gap-2">
          <Label htmlFor="demo-percent">Taxa de juros (padrão bancário)</Label>
          <PercentInput />
          <p className="text-xs text-muted-foreground">
            Digite apenas números. Ex.: 2503 = 25,03%
          </p>
        </div>

        {/* Error */}
        <div className="grid gap-2">
          <Label htmlFor="demo-error">Campo com erro</Label>
          <Input id="demo-error" aria-invalid="true" defaultValue="abc" />
          <p className="text-xs text-destructive">Valor inválido</p>
        </div>

        {/* Disabled */}
        <div className="grid gap-2">
          <Label htmlFor="demo-disabled">Campo desabilitado</Label>
          <Input id="demo-disabled" disabled defaultValue="Valor fixo" />
        </div>

        {/* Select */}
        <div className="grid gap-2">
          <Label>Tipo de conta</Label>
          <Select defaultValue="corrente">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corrente">Conta corrente</SelectItem>
              <SelectItem value="poupanca">Poupança</SelectItem>
              <SelectItem value="investimento">Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Section>
  )
}

/* ─── 6. Badges ─── */

function BadgesSection() {
  return (
    <Section id="badges" title="Badges">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="link">Link</Badge>
      </div>
      <div className="mt-4">
        <h3 className="mb-3 text-sm font-medium">Contextuais</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-positive-bg text-positive-text border-transparent">
            Ativa
          </Badge>
          <Badge className="bg-attention-bg text-attention-text border-transparent">
            Pendente
          </Badge>
          <Badge className="bg-alert-bg text-alert-text border-transparent">
            Atrasada
          </Badge>
          <Badge className="bg-critical-bg text-critical-text border-transparent">
            Cancelada
          </Badge>
          <Badge className="bg-info-bg text-info-text border-transparent">
            Informativo
          </Badge>
        </div>
      </div>
    </Section>
  )
}

/* ─── 7. Dialogs ─── */

function DialogsSection() {
  return (
    <Section id="dialogs" title="Dialogs">
      <Dialog>
        <DialogTrigger
          render={<Button variant="outline" />}
        >
          Abrir dialog de exemplo
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja arquivar esta categoria? Os lançamentos
              existentes serão mantidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive">Arquivar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="mt-3 text-xs text-muted-foreground">
        Overlay: bg-black/25 + backdrop-blur-sm (25% opacidade + blur)
      </p>
    </Section>
  )
}

/* ─── 8. Tabelas ─── */

function TabelasSection() {
  return (
    <Section id="tabelas" title="Tabelas">
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="tabular-nums">20/03/2026</TableCell>
                <TableCell>Supermercado Extra</TableCell>
                <TableCell>
                  <Badge variant="secondary">Alimentação</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums text-critical">
                  - R$ 234,56
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="tabular-nums">19/03/2026</TableCell>
                <TableCell>Salário</TableCell>
                <TableCell>
                  <Badge variant="secondary">Renda</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums text-positive">
                  R$ 8.500,00
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="tabular-nums">18/03/2026</TableCell>
                <TableCell>Netflix</TableCell>
                <TableCell>
                  <Badge variant="secondary">Assinaturas</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums text-critical">
                  - R$ 39,90
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="tabular-nums">17/03/2026</TableCell>
                <TableCell>Uber</TableCell>
                <TableCell>
                  <Badge variant="secondary">Transporte</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums text-critical">
                  - R$ 28,70
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Section>
  )
}

/* ─── 9. Tabs ─── */

function TabsSection() {
  return (
    <Section id="tabs" title="Tabs">
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium">Default (pill)</h3>
          <Tabs defaultValue="visao-geral">
            <TabsList>
              <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
              <TabsTrigger value="transacoes">Transações</TabsTrigger>
              <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
            </TabsList>
            <TabsContent value="visao-geral">
              <p className="py-4 text-sm text-muted-foreground">
                Conteúdo da aba Visão geral.
              </p>
            </TabsContent>
            <TabsContent value="transacoes">
              <p className="py-4 text-sm text-muted-foreground">
                Conteúdo da aba Transações.
              </p>
            </TabsContent>
            <TabsContent value="orcamento">
              <p className="py-4 text-sm text-muted-foreground">
                Conteúdo da aba Orçamento.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Line</h3>
          <Tabs defaultValue="mensal">
            <TabsList variant="line">
              <TabsTrigger value="mensal">Mensal</TabsTrigger>
              <TabsTrigger value="semanal">Semanal</TabsTrigger>
              <TabsTrigger value="diario">Diário</TabsTrigger>
            </TabsList>
            <TabsContent value="mensal">
              <p className="py-4 text-sm text-muted-foreground">
                Conteúdo da aba Mensal.
              </p>
            </TabsContent>
            <TabsContent value="semanal">
              <p className="py-4 text-sm text-muted-foreground">
                Conteúdo da aba Semanal.
              </p>
            </TabsContent>
            <TabsContent value="diario">
              <p className="py-4 text-sm text-muted-foreground">
                Conteúdo da aba Diário.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Section>
  )
}

/* ─── 10. Banners ─── */

function BannersSection() {
  return (
    <Section id="banners" title="Banners">
      <div className="space-y-4 max-w-2xl">
        {/* Info banner */}
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-info/20 bg-info-bg px-5 py-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info">
            <Clock className="size-[18px] text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-info-text">
              Amanhã vence: Internet R$ 158,00
            </p>
          </div>
          <Button size="sm" className="shrink-0 bg-info text-white hover:bg-info/90">
            Marcar como pago
          </Button>
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded p-1 text-info-text/50 transition-colors hover:text-info-text"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Attention banner */}
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-attention/20 bg-attention-bg px-5 py-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-attention">
            <AlertTriangle className="size-[18px] text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-attention-text">
              2 faturas precisam ser atualizadas
            </p>
            <p className="text-xs text-attention-text/80">
              Latam Pass e Pão de Açúcar estão com valores estimados.
            </p>
          </div>
          <Button size="sm" className="shrink-0 bg-attention text-white hover:bg-attention/90">
            Atualizar faturas
          </Button>
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded p-1 text-attention-text/50 transition-colors hover:text-attention-text"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Critical banner — vencido */}
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-critical/20 bg-critical-bg px-5 py-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-critical">
            <AlertTriangle className="size-[18px] text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-critical-text">
              Condomínio venceu há 3 dias — R$ 580,00
            </p>
            <p className="text-xs text-critical-text/80">
              Vencimento era 17/03. Verifique multa e juros.
            </p>
          </div>
          <Button size="sm" className="shrink-0 bg-critical text-white hover:bg-critical/90">
            Marcar como pago
          </Button>
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded p-1 text-critical-text/50 transition-colors hover:text-critical-text"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Positive banner */}
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-positive/20 bg-positive-bg px-5 py-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-positive">
            <CheckCircle2 className="size-[18px] text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-positive-text">
              Todas as contas do mês estão pagas!
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded p-1 text-positive-text/50 transition-colors hover:text-positive-text"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Ícone circular colorido + texto + CTA opcional + dismiss. Cores: info (azul), attention (amarelo), critical (vermelho/vencido), positive (verde).
      </p>
    </Section>
  )
}

/* ─── 11. Summary Cards ─── */

function SummaryCardsSection() {
  return (
    <Section id="summary-cards" title="Summary Cards">
      <div className="grid max-w-2xl grid-cols-3 gap-4">
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 transition-shadow hover:shadow-sm">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total do mês
          </p>
          <p className="text-2xl font-bold tabular-nums">R$ 14.858,00</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 transition-shadow hover:shadow-sm">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Confirmado
          </p>
          <p className="text-2xl font-bold tabular-nums text-positive-text">
            R$ 5.044,00
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 transition-shadow hover:shadow-sm">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pendente
          </p>
          <p className="text-2xl font-bold tabular-nums text-attention-text">
            R$ 9.814,00
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Grid 3 colunas, label uppercase + valor grande. Cores semânticas para status.
      </p>
    </Section>
  )
}

/* ─── 12. Empty States ─── */

function EmptyStatesSection() {
  return (
    <Section id="empty-states" title="Empty States">
      <div className="max-w-md">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria ainda
          </p>
          <Button variant="secondary" size="sm">
            <Plus data-icon="inline-start" />
            Adicionar categoria
          </Button>
          <p className="text-xs text-muted-foreground">
            Ex.: Moradia, Alimentação, Transporte...
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ─── 13. Lista Colapsavel ─── */

function CollapseHeader({
  level,
  title,
  count,
  badge,
  defaultExpanded = true,
  children,
}: {
  level: 1 | 2
  title: string
  count?: string
  badge?: React.ReactNode
  defaultExpanded?: boolean
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (level === 1) {
    return (
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full cursor-pointer items-center gap-2.5 border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
            expanded
              ? "rounded-t-[var(--radius-card)]"
              : "rounded-[var(--radius-card)]"
          }`}
        >
          <ChevronDown
            className={`size-[18px] shrink-0 text-muted-foreground transition-transform duration-150 ${
              expanded ? "" : "-rotate-90"
            }`}
          />
          <span className="flex-1 text-sm font-semibold">{title}</span>
          {badge}
          {count && (
            <span className="text-xs font-medium text-muted-foreground">
              {count}
            </span>
          )}
        </button>
        {expanded && (
          <div className="overflow-hidden rounded-b-[var(--radius-card)] border border-t-0 border-border">
            {children}
          </div>
        )}
      </div>
    )
  }

  // Level 2 — sub-group dentro do container do level 1
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-2 bg-muted/30 px-4 py-2.5 pl-10 text-left transition-colors hover:bg-muted/60"
      >
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-150 ${
            expanded ? "" : "-rotate-90"
          }`}
        />
        <span className="flex-1 text-sm font-medium">{title}</span>
        {badge}
        {count && (
          <span className="text-xs text-muted-foreground">{count}</span>
        )}
      </button>
      {expanded && <div>{children}</div>}
    </div>
  )
}

function CollapseItem({
  name,
  detail,
  value,
  status,
  statusVariant = "secondary",
}: {
  name: string
  detail?: string
  value?: string
  status?: string
  statusVariant?: "paid" | "pending" | "estimate" | "secondary"
}) {
  const statusStyles = {
    paid: "bg-positive-bg text-positive-text",
    pending: "bg-muted text-muted-foreground border border-border",
    estimate: "bg-attention-bg text-attention-text",
    secondary: "bg-secondary text-secondary-foreground",
  }

  return (
    <div className="group flex items-center gap-3 border-b border-border bg-card py-3 pr-4 pl-16 transition-colors last:border-b-0 hover:bg-muted/30">
      <div className="size-1 shrink-0 rounded-full bg-muted-foreground/60" />
      <span className="flex-1 text-sm">{name}</span>
      {detail && (
        <span className="text-xs text-muted-foreground">{detail}</span>
      )}
      {value && (
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      )}
      {status && (
        <Badge
          className={`shrink-0 border-transparent text-[11px] font-semibold ${statusStyles[statusVariant]}`}
        >
          {status}
        </Badge>
      )}
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon-xs">
          <Pencil />
        </Button>
      </div>
    </div>
  )
}

function ListaColapsavelSection() {
  return (
    <Section id="lista-colapsavel" title="Lista Colapsável">
      <div className="max-w-2xl">
        {/* Nivel 1 → Nivel 2 → Nivel 3 (itens) */}
        <CollapseHeader
          level={1}
          title="Despesas Fixas"
          count="7 itens"
          badge={
            <Badge className="border-transparent bg-positive-bg text-positive-text text-[11px] font-semibold">
              5 pagos
            </Badge>
          }
        >
          <CollapseHeader level={2} title="Moradia" count="4 itens">
            <CollapseItem
              name="Aluguel"
              value="R$ 1.800,00"
              detail="Pago em 01/03 · Itaú"
              status="Pago"
              statusVariant="paid"
            />
            <CollapseItem
              name="Condomínio"
              value="R$ 580,00"
              detail="Vence 15/03 · Boleto"
              status="Pendente"
              statusVariant="pending"
            />
            <CollapseItem
              name="Energia"
              value="R$ 320,00"
              detail="Pago em 05/03 · Nubank"
              status="Pago"
              statusVariant="paid"
            />
            <CollapseItem
              name="IPTU"
              value="R$ 195,00"
              detail="Pago em 10/03 · Boleto"
              status="Pago"
              statusVariant="paid"
            />
          </CollapseHeader>

          <CollapseHeader level={2} title="Transporte" count="2 itens">
            <CollapseItem
              name="Seguro carro"
              value="R$ 230,00"
              detail="Vence 25/03 · Débito"
              status="Pendente"
              statusVariant="pending"
            />
            <CollapseItem
              name="Combustível"
              value="~R$ 400,00"
              detail="Estimativa mensal"
              status="Estimativa"
              statusVariant="estimate"
            />
          </CollapseHeader>

          <CollapseHeader
            level={2}
            title="Saúde"
            count="1 item"
            defaultExpanded={false}
          >
            <CollapseItem
              name="Plano saúde"
              value="R$ 815,00"
              detail="Vence 28/03 · Boleto"
              status="Pendente"
              statusVariant="pending"
            />
          </CollapseHeader>
        </CollapseHeader>

        {/* Nivel 1 colapsado */}
        <CollapseHeader
          level={1}
          title="Despesas Variáveis"
          count="5 itens"
          defaultExpanded={false}
          badge={
            <Badge className="border-transparent bg-attention-bg text-attention-text text-[11px] font-semibold">
              2 estimativas
            </Badge>
          }
        >
          <CollapseItem name="Placeholder" />
        </CollapseHeader>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        3 níveis: grupo (nível 1) → sub-grupo (nível 2, indentado, fundo sutil) → itens (nível 3, bullet + indentação maior). Cada nível colapsa independentemente. Ações no hover.
      </p>
    </Section>
  )
}

/* ─── 12. Cursores ─── */

function CursoresSection() {
  return (
    <Section id="cursores" title="Cursores">
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col items-center gap-2">
          <Button variant="outline" className="cursor-pointer">
            Clique aqui
          </Button>
          <span className="text-xs text-muted-foreground">
            cursor: pointer
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-24 items-center justify-center rounded-md bg-muted p-4 text-sm text-muted-foreground cursor-default">
            Texto
          </div>
          <span className="text-xs text-muted-foreground">
            cursor: default
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Input
            placeholder="Digite..."
            className="w-32 cursor-text"
          />
          <span className="text-xs text-muted-foreground">
            cursor: text
          </span>
        </div>
      </div>
    </Section>
  )
}

/* ─── 13. Espacamento / Density ─── */

function EspacamentoSection() {
  const [density, setDensity] = useState<"spacious" | "compact">("spacious")

  const isCompact = density === "compact"

  return (
    <Section id="espacamento" title="Espaçamento / Density">
      <div className="mb-4 flex gap-2">
        <Button
          variant={density === "spacious" ? "default" : "outline"}
          size="sm"
          onClick={() => setDensity("spacious")}
        >
          Spacious
        </Button>
        <Button
          variant={density === "compact" ? "default" : "outline"}
          size="sm"
          onClick={() => setDensity("compact")}
        >
          Compact
        </Button>
      </div>

      <div data-density={density} className="max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Exemplo de card</CardTitle>
            <CardDescription>
              Padding e gap mudam com a density
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-[var(--density-gap)]"
            style={{
              padding: `0 var(--density-card-padding)`,
            }}
          >
            <div
              className="rounded-md bg-muted"
              style={{
                padding: `var(--density-line-padding)`,
              }}
            >
              <span className="text-sm">Linha 1</span>
            </div>
            <div
              className="rounded-md bg-muted"
              style={{
                padding: `var(--density-line-padding)`,
              }}
            >
              <span className="text-sm">Linha 2</span>
            </div>
            <div
              className="h-[var(--density-bar-height)] rounded-full bg-primary"
              style={{ width: "60%" }}
            />
          </CardContent>
        </Card>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Spacious: padding 20px, gap 16px. Compact: padding 12px, gap 8px.
      </p>
    </Section>
  )
}

/* ─── 14. Skeleton ─── */

function SkeletonSection() {
  return (
    <Section id="skeleton" title="Skeleton">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Card skeleton</h3>
          <Card className="max-w-sm">
            <CardHeader>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Formas</h3>
          <div className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Lista</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
