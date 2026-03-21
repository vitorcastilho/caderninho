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
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Pencil, Archive, Loader2, Clock, X, AlertTriangle, CheckCircle2, LayoutDashboard, CreditCard, Landmark, Wallet, PiggyBank, CheckSquare, TrendingUp, LogOut, ShoppingCart, GraduationCap, Home, Fuel, Bus, Globe, UtensilsCrossed, Package, MoreVertical, Settings, Building2, Users } from "lucide-react"

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
      <BarrasProgressoSection />
      <CardsOrcamentoSection />
      <BarraResumoSection />
      <SeletorMesSection />
      <ControleSegmentadoSection />
      <ListaTransacoesSection />
      <ChecklistSection />
      <ColunaMensalSection />
      <PainelSimulacaoSection />
      <BannersSection />
      <SummaryCardsSection />
      <EmptyStatesSection />
      <ListaColapsavelSection />
      <MenuLateralSection />
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
    setValue(formatted)
  }

  return (
    <div className="relative">
      <Input
        id="demo-percent"
        inputMode="numeric"
        placeholder="0,00"
        className="pr-8"
        value={value}
        onChange={handleChange}
      />
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        %
      </span>
    </div>
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

/* ─── Barras de Progresso ─── */

function ProgressBar({
  value,
  color,
  label,
  className,
}: {
  value: number
  color: string
  label?: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%`, background: color }}
        />
      </div>
      {label && (
        <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  )
}

function BarrasProgressoSection() {
  return (
    <Section id="barras-progresso" title="Barras de Progresso">
      <div className="max-w-md space-y-6">
        {/* Status semânticos */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Status semânticos</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Ok — 45%</span>
                <span className="font-semibold text-positive-text">45%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-positive transition-all" style={{ width: "45%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Atenção — 78%</span>
                <span className="font-semibold text-attention-text">78%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-attention transition-all" style={{ width: "78%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Alerta — 92%</span>
                <span className="font-semibold text-alert-text">92%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-alert transition-all" style={{ width: "92%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Crítico — 110%</span>
                <span className="font-semibold text-critical-text">110%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-critical transition-all" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Fixo — 100%</span>
                <span className="font-semibold text-primary">100%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tamanhos */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Tamanhos</h3>
          <div className="space-y-3">
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Fino (h-1) — usado inline</span>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-positive" style={{ width: "60%" }} />
              </div>
            </div>
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Padrão (h-1.5) — usado em cards e tabelas</span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-positive" style={{ width: "60%" }} />
              </div>
            </div>
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Largo (h-2) — usado em resumos</span>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-positive" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Com inline label */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Com label inline (tabela)</h3>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-positive" style={{ width: "70%" }} />
            </div>
            <span className="text-sm font-semibold text-positive-text">70%</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Cores: positivo (verde &lt;75%), atenção (amarelo 75-85%), alerta (laranja 85-95%), crítico (vermelho &gt;95%), fixo (indigo 100% fixo). Barras sempre arredondadas.
      </p>
    </Section>
  )
}

/* ─── Cards de Orçamento ─── */

function BudgetCard({
  icon: Icon,
  name,
  status,
  statusVariant,
  spent,
  budget,
  remaining,
  percentage,
  progressColor,
  method,
}: {
  icon: React.ComponentType<{ className?: string }>
  name: string
  status: string
  statusVariant: "ok" | "fixed" | "attention" | "alert" | "critical"
  spent: string
  budget: string
  remaining: string
  percentage: number
  progressColor: string
  method?: string
}) {
  const badgeStyles = {
    ok: "bg-positive-bg text-positive-text",
    fixed: "bg-primary-light text-primary",
    attention: "bg-attention-bg text-attention-text",
    alert: "bg-alert-bg text-alert-text",
    critical: "bg-critical-bg text-critical-text",
  }

  const pctColor = {
    ok: "text-positive-text",
    fixed: "text-primary",
    attention: "text-attention-text",
    alert: "text-alert-text",
    critical: "text-critical-text",
  }

  return (
    <div className="flex cursor-pointer flex-col justify-between rounded-[var(--radius-card)] border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-sm">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-muted-foreground" />
            <span className="text-sm font-semibold">{name}</span>
          </div>
          <Badge className={`border-transparent text-[11px] font-semibold ${badgeStyles[statusVariant]}`}>
            {status}
          </Badge>
        </div>
        <div className="mb-1.5">
          <span className="text-xl font-bold tabular-nums">{spent}</span>
          <span className="ml-1 text-sm font-medium text-muted-foreground tabular-nums">/ {budget}</span>
        </div>
        {method && (
          <p className="text-xs text-muted-foreground">{method}</p>
        )}
      </div>
      <div className="mt-3">
        <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%`, background: progressColor }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{remaining}</span>
          <span className={`text-xs font-semibold tabular-nums ${pctColor[statusVariant]}`}>
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  )
}

function CardsOrcamentoSection() {
  return (
    <Section id="cards-orcamento" title="Cards de Orçamento">
      <div className="space-y-6">
        {/* Group header */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Cabeçalho de grupo (classificação)</h3>
          <div className="mb-2 border-b border-border pb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Essenciais
          </div>
        </div>

        {/* Grid de cards */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Cards de categoria com status</h3>
          <div className="grid max-w-3xl grid-cols-2 gap-3">
            <BudgetCard
              icon={ShoppingCart}
              name="Supermercado"
              status="Ok"
              statusVariant="ok"
              spent="R$ 2.122,00"
              budget="R$ 3.000,00"
              remaining="Resta R$ 878,00"
              percentage={70}
              progressColor="var(--color-positive)"
              method="Latam Pass Visa"
            />
            <BudgetCard
              icon={GraduationCap}
              name="Escola"
              status="Fixo"
              statusVariant="fixed"
              spent="R$ 2.800,00"
              budget="R$ 2.800,00"
              remaining="Custo fixo"
              percentage={100}
              progressColor="var(--color-primary)"
              method="Latam Pass Visa"
            />
            <BudgetCard
              icon={Home}
              name="Moradia"
              status="Atenção"
              statusVariant="attention"
              spent="R$ 1.800,00"
              budget="R$ 2.200,00"
              remaining="Resta R$ 400,00"
              percentage={82}
              progressColor="var(--color-attention)"
              method="Itaú Débito"
            />
            <BudgetCard
              icon={Fuel}
              name="Gasolina"
              status="Ok"
              statusVariant="ok"
              spent="R$ 420,00"
              budget="R$ 600,00"
              remaining="Resta R$ 180,00"
              percentage={70}
              progressColor="var(--color-positive)"
              method="Itaú Débito"
            />
          </div>
        </div>

        {/* Group header 2 */}
        <div>
          <div className="mb-2 border-b border-border pb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Qualidade de Vida
          </div>
          <div className="grid max-w-3xl grid-cols-2 gap-3">
            <BudgetCard
              icon={UtensilsCrossed}
              name="Restaurante"
              status="Ok"
              statusVariant="ok"
              spent="R$ 1.800,00"
              budget="R$ 2.500,00"
              remaining="Resta R$ 700,00"
              percentage={72}
              progressColor="var(--color-positive)"
              method="Nubank Mastercard"
            />
            <BudgetCard
              icon={Package}
              name="Outros"
              status="Ok"
              statusVariant="ok"
              spent="R$ 450,00"
              budget="R$ 2.000,00"
              remaining="Resta R$ 1.550,00"
              percentage={22}
              progressColor="var(--color-positive)"
              method="Variado"
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-09: ícone + nome, badge de status (Ok/Fixo/Atenção/Alerta/Crítico), gasto/orçado, barra de progresso, resta + percentual. Agrupados por classificação de essencialidade.
      </p>
    </Section>
  )
}

/* ─── Barra de Resumo ─── */

function BarraResumoSection() {
  return (
    <Section id="barra-resumo" title="Barra de Resumo">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-6 rounded-[var(--radius-card)] border border-border bg-card px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Gasto
            </span>
            <span className="text-xl font-bold tabular-nums">R$ 9.930,00</span>
          </div>
          <div className="h-9 w-px bg-border" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Orçado
            </span>
            <span className="text-xl font-bold tabular-nums">R$ 14.858,00</span>
          </div>
          <div className="h-9 w-px bg-border" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Disponível
            </span>
            <span className="text-xl font-bold tabular-nums text-positive-text">R$ 4.928,00</span>
          </div>
          <div className="h-9 w-px bg-border" />
          <div className="min-w-[200px] flex-1">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total utilizado</span>
              <span className="text-sm font-bold tabular-nums">67%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-positive transition-all" style={{ width: "67%" }} />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Itens de resumo separados por divisores verticais + barra de progresso total. Usado em telas de orçamento e dashboard.
      </p>
    </Section>
  )
}

/* ─── Seletor de Mês ─── */

function SeletorMesSection() {
  const [mesIdx, setMesIdx] = useState(2) // março
  const meses = ["Jan 2026", "Fev 2026", "Mar 2026", "Abr 2026", "Mai 2026"]

  return (
    <Section id="seletor-mes" title="Seletor de Mês">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Padrão com setas</h3>
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-border bg-card px-3.5 py-1.5">
            <button
              type="button"
              onClick={() => setMesIdx(Math.max(0, mesIdx - 1))}
              className="cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[80px] text-center text-sm font-semibold">
              {meses[mesIdx]}
            </span>
            <button
              type="button"
              onClick={() => setMesIdx(Math.min(meses.length - 1, mesIdx + 1))}
              className="cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Compacto (mobile)</h3>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground">
            <ChevronLeft className="size-3.5 cursor-pointer" />
            <span>Mar 2026</span>
            <ChevronRight className="size-3.5 cursor-pointer" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Setas para navegar entre meses. Usado em orçamentos, dashboard e checklist. Versão compacta para mobile.
      </p>
    </Section>
  )
}

/* ─── Controle Segmentado ─── */

function ControleSegmentadoSection() {
  const [activeView, setActiveView] = useState("visual")
  const views = [
    { id: "visual", label: "Visual", icon: "◼" },
    { id: "lista", label: "Lista", icon: "☰" },
    { id: "timeline", label: "Timeline", icon: "→" },
    { id: "mapa", label: "Mapa", icon: "■" },
  ]

  return (
    <Section id="controle-segmentado" title="Controle Segmentado">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">View toggle (orçamentos)</h3>
          <div className="inline-flex gap-0.5 rounded-[var(--radius-card)] border border-border bg-card p-[3px]">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveView(v.id)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-[9px] border-none px-3.5 py-[7px] text-sm font-medium transition-all ${
                  activeView === v.id
                    ? "bg-primary font-semibold text-white"
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-xs">{v.icon}</span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Versão compacta (2 opções)</h3>
          <Tabs defaultValue="cards">
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="tabela">Tabela</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Para alternar entre modos de visualização. Active = fundo primary + texto branco. Inativo = ghost hover.
      </p>
    </Section>
  )
}

/* ─── Lista de Transações ─── */

const transacoes = [
  { date: "20/03", icon: ShoppingCart, name: "Pão de Açúcar", category: "Supermercado", amount: "R$ 87,00", method: "Latam Pass Visa" },
  { date: "19/03", icon: Fuel, name: "Shell", category: "Gasolina", amount: "R$ 180,00", method: "Itaú Débito" },
  { date: "18/03", icon: UtensilsCrossed, name: "iFood", category: "Restaurante", amount: "R$ 45,00", method: "Latam Pass Visa" },
  { date: "17/03", icon: Bus, name: "Uber", category: "Transporte", amount: "R$ 32,00", method: "Débito" },
  { date: "15/03", icon: Package, name: "Amazon", category: "Compras", amount: "R$ 250,00", method: "Uniclass 3x", installment: "2/3" },
]

function ListaTransacoesSection() {
  return (
    <Section id="lista-transacoes" title="Lista de Transações">
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Transações recentes</CardTitle>
            <CardAction>
              <Button variant="link" size="sm" className="text-primary">
                Ver todas
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border">
              {transacoes.map((tx) => {
                const Icon = tx.icon
                return (
                  <li
                    key={tx.name}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{tx.name}</span>
                        {tx.installment && (
                          <Badge className="border-transparent bg-primary-light text-primary text-[10px] font-semibold px-1.5 py-0">
                            {tx.installment}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{tx.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold tabular-nums">{tx.amount}</span>
                      <p className="text-[11px] text-muted-foreground">
                        {tx.method} · {tx.date}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon-xs">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-xs">
                        <MoreVertical />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Ícone circular + nome + categoria, valor + método + data à direita. Badge de parcela quando aplicável. Ações (editar, detalhes) no hover.
      </p>
    </Section>
  )
}

/* ─── Checklist ─── */

function CardBrand({ brand }: { brand: "visa" | "master" }) {
  if (brand === "visa") {
    return (
      <span className="inline-flex size-[26px_16px] w-[26px] h-4 shrink-0 items-center justify-center rounded-[3px] border border-foreground/6 bg-[#1A1F71] text-[7px] font-extrabold italic text-white">
        VISA
      </span>
    )
  }
  return (
    <span className="relative inline-flex w-[26px] h-4 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-foreground/6 bg-[#252525]">
      <span className="absolute left-[3px] top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#EB001B]" />
      <span className="absolute right-[3px] top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#F79E1B]" />
    </span>
  )
}

function CLItem({
  name,
  value,
  meta,
  brand,
  status,
  statusVariant,
  checked = false,
  showUpdateBtn = false,
  showActions = false,
}: {
  name: string
  value: string
  meta: string
  brand?: "visa" | "master"
  status: string
  statusVariant: "paid" | "tomorrow" | "pending" | "overdue" | "estimate"
  checked?: boolean
  showUpdateBtn?: boolean
  showActions?: boolean
}) {
  const [isChecked, setIsChecked] = useState(checked)

  const statusStyles = {
    paid: "bg-positive-bg text-positive-text",
    tomorrow: "bg-info-bg text-info-text",
    pending: "bg-muted text-muted-foreground border border-border",
    overdue: "bg-critical-bg text-critical-text",
    estimate: "bg-attention-bg text-attention-text",
  }

  return (
    <div
      className={`group flex items-center gap-3.5 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-muted/20 ${
        isChecked ? "bg-positive-bg/15" : "bg-card"
      }`}
    >
      {/* Custom checkbox */}
      <label className="relative flex size-[22px] shrink-0 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <span className="flex size-full items-center justify-center rounded-[6px] border-2 border-border bg-card transition-all peer-hover:border-primary peer-checked:border-primary peer-checked:bg-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`size-3.5 text-white transition-all ${
              isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </label>

      {/* Content */}
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {brand && <CardBrand brand={brand} />}
        <span className={`min-w-[100px] text-sm font-medium ${isChecked ? "text-muted-foreground" : ""}`}>
          {name}
        </span>
        <span className={`min-w-[80px] text-sm font-semibold tabular-nums ${isChecked ? "text-muted-foreground" : ""}`}>
          {value}
        </span>
        <span className="text-[13px] text-muted-foreground">{meta}</span>
      </div>

      {/* Status badge */}
      <Badge className={`shrink-0 border-transparent text-[11px] font-semibold ${statusStyles[statusVariant]}`}>
        {status}
      </Badge>

      {/* Update button (for estimates) */}
      {showUpdateBtn && (
        <button
          type="button"
          className="shrink-0 cursor-pointer rounded-md border border-attention/30 bg-attention-bg px-3 py-1.5 text-xs font-semibold text-attention-text transition-colors hover:bg-attention-bg/80"
        >
          Atualizar fatura
        </button>
      )}

      {/* Hover actions — text links like proto-10 */}
      {showActions && (
        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-primary-light px-2 py-1 rounded-md">
            Editar
          </button>
          <button type="button" className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-primary-light px-2 py-1 rounded-md">
            Detalhes
          </button>
        </div>
      )}
    </div>
  )
}

function ChecklistGroup({
  title,
  count,
  defaultExpanded = true,
  children,
}: {
  title: string
  count: string
  defaultExpanded?: boolean
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-2.5 bg-card px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-150 ${
            expanded ? "" : "-rotate-90"
          }`}
        />
        <span className="flex-1 text-sm font-semibold">{title}</span>
        <span className="text-xs font-medium text-muted-foreground">{count}</span>
      </button>
      {expanded && <div className="border-t border-border">{children}</div>}
    </div>
  )
}

function ChecklistSection() {
  return (
    <Section id="checklist" title="Checklist">
      <div className="max-w-2xl space-y-4">
        {/* Grupo 1: Recorrente no Cartão */}
        <ChecklistGroup title="Recorrente no Cartão" count="3 itens">
          <CLItem
            name="Spotify"
            value="R$ 22"
            brand="visa"
            meta="Latam Pass · Ciclo Mar"
            status="Pago"
            statusVariant="paid"
            checked={true}
          />
          <CLItem
            name="Netflix"
            value="R$ 45"
            brand="visa"
            meta="Latam Pass · Ciclo Mar"
            status="Pago"
            statusVariant="paid"
            checked={true}
          />
          <CLItem
            name="iCloud"
            value="R$ 12"
            meta="PDA · Ciclo Mar"
            status="Pago"
            statusVariant="paid"
            checked={true}
          />
        </ChecklistGroup>

        {/* Grupo 2: Variável (Fatura) */}
        <ChecklistGroup title="Variável (Fatura)" count="2 itens">
          <CLItem
            name="Fatura Latam Pass"
            value="~R$ 4.200"
            brand="visa"
            meta="Vence 15/03 · Estimativa"
            status="Estimativa"
            statusVariant="estimate"
            showUpdateBtn={true}
          />
          <CLItem
            name="Fatura Pão de Açúcar"
            value="~R$ 1.980"
            brand="master"
            meta="Vence 10/03 · Estimativa"
            status="Estimativa"
            statusVariant="estimate"
            showUpdateBtn={true}
          />
        </ChecklistGroup>

        {/* Grupo 3: Manual */}
        <ChecklistGroup title="Manual" count="4 itens">
          <CLItem
            name="Faxineira"
            value="R$ 250"
            meta="Vence 20/03 · PIX"
            status="Pendente"
            statusVariant="pending"
            showActions={true}
          />
          <CLItem
            name="Condomínio"
            value="R$ 580"
            meta="Vence 15/03 · Boleto"
            status="Pendente"
            statusVariant="pending"
            showActions={true}
          />
          <CLItem
            name="Seguro carro"
            value="R$ 230"
            meta="Vence 25/03 · Débito"
            status="Pendente"
            statusVariant="pending"
            showActions={true}
          />
          <CLItem
            name="Plano saúde"
            value="R$ 815"
            meta="Vence 28/03 · Boleto"
            status="Pendente"
            statusVariant="pending"
            showActions={true}
          />
        </ChecklistGroup>

        {/* Status badges isolados */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Status badges do checklist</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-transparent bg-positive-bg text-positive-text text-[11px] font-semibold">Pago</Badge>
            <Badge className="border-transparent bg-info-bg text-info-text text-[11px] font-semibold">Amanhã</Badge>
            <Badge className="border border-border bg-muted text-muted-foreground text-[11px] font-semibold">Pendente</Badge>
            <Badge className="border-transparent bg-attention-bg text-attention-text text-[11px] font-semibold">Estimativa</Badge>
            <Badge className="border-transparent bg-critical-bg text-critical-text text-[11px] font-semibold">Vencido</Badge>
          </div>
        </div>

        {/* Card brand badges isolados */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Card brand badges</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CardBrand brand="visa" />
              <span className="text-sm text-muted-foreground">Visa</span>
            </div>
            <div className="flex items-center gap-2">
              <CardBrand brand="master" />
              <span className="text-sm text-muted-foreground">Mastercard</span>
            </div>
          </div>
        </div>

        {/* Botão atualizar fatura */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Botão "Atualizar fatura"</h3>
          <button
            type="button"
            className="cursor-pointer rounded-md border border-attention/30 bg-attention-bg px-3 py-1.5 text-xs font-semibold text-attention-text transition-colors hover:bg-attention-bg/80"
          >
            Atualizar fatura
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Usado quando o valor é estimativa e precisa ser confirmado com a fatura real.
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-10: 3 grupos (Recorrente no Cartão, Variável/Fatura, Manual). Checkbox customizado com animação. Card brand badges (VISA/Mastercard) inline. Ações "Editar"/"Detalhes" em texto no hover. Badge "Atualizar fatura" para estimativas.
      </p>
    </Section>
  )
}

/* ─── Coluna Mensal (Projeção) ─── */

function MonthColumn({
  month,
  isCurrent = false,
  items,
  margin,
  isPositive,
  freedBadge,
}: {
  month: string
  isCurrent?: boolean
  items: { name: string; value: string; type: "fixed" | "variable" | "installment" | "planned" }[]
  margin: string
  isPositive: boolean
  freedBadge?: string
}) {
  const typeStyles = {
    fixed: "border-l-2 border-l-primary/40 bg-primary-light/30",
    variable: "border-l-2 border-l-muted-foreground/30",
    installment: "border-l-2 border-l-attention/40 bg-attention-bg/20",
    planned: "border border-dashed border-primary/40 bg-primary-light/20",
  }

  return (
    <div className={`flex min-w-[200px] flex-col rounded-[var(--radius-card)] border ${
      isCurrent ? "border-primary/30 bg-primary-light/10" : "border-border bg-card"
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-2 border-b px-4 py-3 ${
        isCurrent ? "border-primary/20 bg-primary-light/30" : "border-border"
      }`}>
        <span className={`text-sm font-bold ${isCurrent ? "text-primary" : ""}`}>
          {month}
        </span>
        {isCurrent && (
          <Badge className="border-transparent bg-primary text-white text-[10px] font-semibold px-1.5 py-0">
            Atual
          </Badge>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 space-y-1.5 p-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${typeStyles[item.type]}`}
          >
            <span className="font-medium">{item.name}</span>
            <span className="font-semibold tabular-nums">{item.value}</span>
          </div>
        ))}
        {freedBadge && (
          <div className="flex items-center justify-center rounded-md border border-dashed border-positive/40 bg-positive-bg/20 px-3 py-1.5 text-xs font-semibold text-positive-text">
            {freedBadge}
          </div>
        )}
      </div>

      {/* Footer — Margin */}
      <div className="border-t border-border px-4 py-2.5">
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          isPositive
            ? "bg-positive-bg text-positive-text"
            : "bg-critical-bg text-critical-text"
        }`}>
          <span>Margem</span>
          <span className="tabular-nums">{margin}</span>
        </div>
      </div>
    </div>
  )
}

function ColunaMensalSection() {
  return (
    <Section id="coluna-mensal" title="Coluna Mensal (Projeção)">
      <div className="space-y-6">
        {/* Legenda */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Legenda de tipos</h3>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-l-2 border-l-primary/40 bg-primary-light/30" />
              <span>Fixo (não arrastável)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-dashed border-primary/40 bg-primary-light/20" />
              <span>Planejado (arrastável)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-positive-bg" />
              <span>Margem positiva</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-critical-bg" />
              <span>Margem negativa</span>
            </div>
          </div>
        </div>

        {/* Colunas */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Colunas de meses (scroll horizontal)</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <MonthColumn
              month="Mar 2026"
              isCurrent={true}
              items={[
                { name: "Escola", value: "R$ 2.800", type: "fixed" },
                { name: "Aluguel", value: "R$ 1.800", type: "fixed" },
                { name: "Supermercado", value: "~R$ 3.000", type: "variable" },
                { name: "Fotos 8/10", value: "R$ 171", type: "installment" },
              ]}
              margin="R$ 750"
              isPositive={true}
            />
            <MonthColumn
              month="Abr 2026"
              items={[
                { name: "Escola", value: "R$ 2.800", type: "fixed" },
                { name: "Aluguel", value: "R$ 1.800", type: "fixed" },
                { name: "Fotos 9/10", value: "R$ 171", type: "installment" },
              ]}
              margin="R$ 920"
              isPositive={true}
            />
            <MonthColumn
              month="Jun 2026"
              items={[
                { name: "Escola", value: "R$ 2.800", type: "fixed" },
                { name: "Aluguel", value: "R$ 1.800", type: "fixed" },
              ]}
              margin="R$ 1.640"
              isPositive={true}
              freedBadge="Libera R$ 171/mês"
            />
            <MonthColumn
              month="Set 2026"
              items={[
                { name: "Escola", value: "R$ 2.800", type: "fixed" },
                { name: "Seguro Carro", value: "R$ 2.800", type: "planned" },
                { name: "Troca Óleo", value: "R$ 500", type: "planned" },
              ]}
              margin="-R$ 1.600"
              isPositive={false}
            />
          </div>
        </div>

        {/* Range selector */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Seletor de período</h3>
          <div className="inline-flex gap-0.5 rounded-[var(--radius-card)] border border-border bg-card p-[3px]">
            <button type="button" className="cursor-pointer rounded-[9px] px-3.5 py-[7px] text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">6 meses</button>
            <button type="button" className="cursor-pointer rounded-[9px] bg-primary px-3.5 py-[7px] text-sm font-semibold text-white">12 meses</button>
            <button type="button" className="cursor-pointer rounded-[9px] px-3.5 py-[7px] text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">24 meses</button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão Kanban do proto-11: uma coluna por mês com itens categorizados (fixo, variável, parcela, planejado). Margem no footer (verde positiva, vermelho negativa). Items planejados são arrastáveis (borda tracejada). Badge "Libera X/mês" quando parcelas terminam.
      </p>
    </Section>
  )
}

/* ─── Painel de Simulação ─── */

function PainelSimulacaoSection() {
  return (
    <Section id="painel-simulacao" title="Painel de Simulação">
      <div className="max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              Simular meta — "Dá pra ir?"
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form */}
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>O que você quer?</Label>
                <Input defaultValue="Viagem São Paulo" placeholder="Ex: Viagem, compra..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Quanto custa?</Label>
                  <Input defaultValue="R$ 3.500" inputMode="numeric" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Quando?</Label>
                  <Input defaultValue="Jun 2026" />
                </div>
              </div>
              <Button className="w-full">
                ⚡ Simular
              </Button>
            </div>

            {/* Result */}
            <div className="space-y-3 rounded-[var(--radius-card)] border border-positive/20 bg-positive-bg/30 p-4">
              <div className="text-sm font-bold text-positive-text">
                ✓ Viável com ajustes
              </div>
              <p className="text-sm text-foreground">
                Economize <strong>R$ 945/mês</strong> nos próximos <strong>4 meses</strong> para alcançar sua meta de <strong>R$ 3.500</strong> em Junho 2026.
              </p>

              <div className="mt-2 text-xs font-semibold text-muted-foreground">De onde cortar:</div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Restaurante</span>
                    <span className="font-semibold text-critical tabular-nums">-R$ 750/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Atual R$ 2.500 → reduzir 30%</p>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-critical/60" style={{ width: "70%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Delivery</span>
                    <span className="font-semibold text-critical tabular-nums">-R$ 180/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Atual R$ 900 → reduzir 20%</p>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-alert/60" style={{ width: "80%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Compras pessoais</span>
                    <span className="font-semibold text-critical tabular-nums">-R$ 75/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Atual R$ 500 → reduzir 15%</p>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-attention/60" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-md bg-primary-light px-3 py-2 text-sm font-bold text-primary">
                <span>Total possível</span>
                <span className="tabular-nums">R$ 1.005/mês</span>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                R$ 60 acima do necessário — folga para imprevistos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-11: formulário de meta + resultado com veredito (viável/inviável) + recomendações de corte com barras visuais + total possível. Veredito verde = viável, vermelho = inviável.
      </p>
    </Section>
  )
}

/* ─── Banners ─── */

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

/* ─── Menu Lateral ─── */

function SidebarNavItem({
  icon: Icon,
  label,
  active,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  badge?: React.ReactNode
}) {
  return (
    <li>
      <div
        className={`flex cursor-pointer items-center gap-[10px] rounded-button px-3 py-2 text-[13px] font-medium transition-colors ${
          active
            ? "bg-primary-light font-semibold text-primary"
            : "text-text-secondary hover:bg-background hover:text-foreground"
        }`}
      >
        <Icon className="size-[18px] shrink-0" />
        <span className="flex-1 truncate">{label}</span>
        {badge}
      </div>
    </li>
  )
}

function SidebarCardItem({
  brand,
  label,
}: {
  brand: "visa" | "master"
  label: string
}) {
  return (
    <li>
      <div className="flex cursor-pointer items-center gap-[10px] rounded-button px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-background hover:text-foreground">
        {brand === "visa" ? (
          <span className="inline-flex size-auto shrink-0 items-center justify-center rounded-[3px] border border-black/[0.06] bg-[#1A1F71] px-[3px] py-[1px] text-[7px] font-extrabold italic text-white" style={{ width: 26, height: 16 }}>
            VISA
          </span>
        ) : (
          <span className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-black/[0.06] bg-[#252525]" style={{ width: 26, height: 16 }}>
            <span className="absolute left-[3px] top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#EB001B]" />
            <span className="absolute right-[3px] top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#F79E1B]" />
          </span>
        )}
        <span className="flex-1 truncate">{label}</span>
      </div>
    </li>
  )
}

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
      {children}
    </div>
  )
}

function SidebarSeparator() {
  return <div className="mx-4 my-1 h-px bg-border" />
}

function MenuLateralSection() {
  return (
    <Section id="menu-lateral" title="Menu Lateral">
      <div className="flex gap-8">
        {/* Expandido — proto-05 */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Expandido (220px)</h3>
          <div className="flex w-[220px] flex-col rounded-[var(--radius-card)] border border-sidebar-border bg-white">
            {/* Logo */}
            <div className="px-4 pt-5 pb-4">
              <span className="text-base font-bold tracking-[-0.01em] text-primary">
                ✎ Caderninho
              </span>
            </div>

            <SidebarSeparator />

            {/* Navegação */}
            <SidebarSectionLabel>Navegação</SidebarSectionLabel>
            <ul className="space-y-0.5 px-2">
              <SidebarNavItem icon={LayoutDashboard} label="Dashboard" active />
              <SidebarNavItem icon={PiggyBank} label="Orçamentos" />
              <SidebarNavItem
                icon={CheckSquare}
                label="Checklist"
                badge={
                  <span className="ml-auto rounded-badge bg-critical px-[7px] py-[1px] text-[11px] font-semibold leading-[1.5] text-white">
                    3
                  </span>
                }
              />
              <SidebarNavItem icon={TrendingUp} label="Projeção" />
            </ul>

            <SidebarSeparator />

            {/* Cartões */}
            <SidebarSectionLabel>Cartões</SidebarSectionLabel>
            <ul className="space-y-0.5 px-2">
              <SidebarCardItem brand="visa" label="Latam Pass Visa" />
              <SidebarCardItem brand="master" label="Pão de Açúcar Master" />
              <SidebarCardItem brand="visa" label="Uniclass Visa" />
              <SidebarCardItem brand="visa" label="PDA Visa" />
            </ul>

            <SidebarSeparator />

            {/* Configurações */}
            <SidebarSectionLabel>Configurações</SidebarSectionLabel>
            <ul className="space-y-0.5 px-2">
              <SidebarNavItem icon={Settings} label="Categorias" />
              <SidebarNavItem icon={Building2} label="Contas" />
              <SidebarNavItem icon={Users} label="Usuários" />
            </ul>

            {/* User */}
            <div className="mt-auto border-t border-sidebar-border p-4">
              <div className="flex items-center gap-[10px]">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
                  V
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-foreground">Vitor</span>
                  <span className="text-[11px] text-text-tertiary">Administrador</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colapsado */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Colapsado (56px)</h3>
          <div className="flex w-[56px] flex-col rounded-[var(--radius-card)] border border-sidebar-border bg-white">
            {/* Logo */}
            <div className="flex items-center justify-center pt-5 pb-4">
              <span className="text-base font-bold text-primary">✎</span>
            </div>

            <SidebarSeparator />

            {/* Nav icons */}
            <nav className="flex-1 py-2">
              <ul className="space-y-0.5 px-2">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", active: true },
                  { icon: PiggyBank, label: "Orçamentos" },
                  { icon: CheckSquare, label: "Checklist" },
                  { icon: TrendingUp, label: "Projeção" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.label}>
                      <div
                        title={item.label}
                        className={`flex cursor-pointer items-center justify-center rounded-button p-2 transition-colors ${
                          item.active
                            ? "bg-primary-light text-primary"
                            : "text-text-secondary hover:bg-background hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-[18px] shrink-0" />
                      </div>
                    </li>
                  )
                })}
              </ul>

              <SidebarSeparator />

              <ul className="mt-2 space-y-0.5 px-2">
                {[
                  { icon: Settings, label: "Categorias" },
                  { icon: Building2, label: "Contas" },
                  { icon: Users, label: "Usuários" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.label}>
                      <div
                        title={item.label}
                        className="flex cursor-pointer items-center justify-center rounded-button p-2 text-text-secondary transition-colors hover:bg-background hover:text-foreground"
                      >
                        <Icon className="size-[18px] shrink-0" />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* User avatar */}
            <div className="mt-auto flex justify-center border-t border-sidebar-border p-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
                V
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Especificações */}
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium">Elementos</h3>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Section Labels</p>
            <p className="text-muted-foreground">11px, uppercase, tracking 0.06em, cor text-tertiary (#A8A29E)</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Nav Items</p>
            <p className="text-muted-foreground">13px font-medium, gap 10px, padding 8px 12px, radius 8px</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Item Ativo</p>
            <p className="text-muted-foreground">bg-primary-light (#EEF2FF), text-primary (#4F46E5), font-semibold</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Badge Notificação</p>
            <p className="text-muted-foreground">bg-critical (#DC2626), text-white, 11px, pill (radius-badge)</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Card Brands</p>
            <p className="text-muted-foreground">26×16px, radius 3px. Visa: #1A1F71, Master: #252525 com círculos</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Avatar</p>
            <p className="text-muted-foreground">32×32px, circular, bg-primary, inicial branca 13px bold</p>
          </div>
        </div>
      </div>
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
