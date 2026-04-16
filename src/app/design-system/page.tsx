"use client"

import React, { useState, useRef } from "react"
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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/client/components/ui/sheet"
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Pencil, Archive, Loader2, Clock, X, AlertTriangle, CheckCircle2, LayoutDashboard, PiggyBank, CheckSquare, TrendingUp, ShoppingCart, GraduationCap, Home, Fuel, UtensilsCrossed, Package, MoreVertical, Settings, Building2, Users, GripVertical, Trash2, Copy, CreditCard, Smartphone, Tablet, Monitor, Wallet, Tags, Landmark, LogOut } from "lucide-react"
import { toast } from "sonner"
import { centsToDisplayValue } from "@/client/utils/currency-input"
import { CurrencyInput } from "@/client/components/ui/currency-input"
import { PercentageInput } from "@/client/components/ui/percentage-input"
import { EmptyState } from "@/client/components/ui/empty-state"
import { PageHeader } from "@/client/components/ui/page-header"
import { BudgetProgressBar } from "@/client/components/ui/budget-progress-bar"
import { SummaryCard } from "@/client/components/ui/summary-card"
import { ImpactPreview } from "@/client/components/ui/impact-preview"
import { BottomNavigation } from "@/client/components/ui/bottom-navigation"
import { CascadeInput } from "@/client/components/ui/cascade-input"
import { TransactionRow } from "@/client/components/ui/transaction-row"
import { TransactionSummaryCards } from "@/client/components/ui/transaction-summary-cards"
import {
  TransactionFiltersBar,
  type TransactionTypeFilter,
  type MonthFilter,
} from "@/client/components/ui/transaction-filters-bar"
import { TransactionFiltersSheet } from "@/client/components/ui/transaction-filters-sheet"

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

function Swatch({ color, label, cssVar }: { color: string; label: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <div
        className="size-10 shrink-0 rounded-md ring-1 ring-foreground/10"
        style={{ backgroundColor: color }}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{cssVar}</span>
        <span className="font-mono text-xs text-muted-foreground">{color}</span>
      </div>
    </div>
  )
}

/* ─── page ─── */

export default function DesignSystemPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Fundamentos */}
      <CoresSection />
      <TipografiaSection />
      <FormatacaoSection />
      <CursoresSection />
      <EspacamentoSection />
      <ResponsividadeSection />
      <IconesSection />
      {/* Componentes base */}
      <BotoesSection />
      <FormulariosSection />
      <BadgesSection />
      <CardsSection />
      <TabelasSection />
      <TabsSection />
      <DialogsSection />
      <DropdownMenuSection />
      <ToastSection />
      <SkeletonSection />
      {/* Controles */}
      <ToggleSwitchSection />
      <ChipsSection />
      <DividerTextoSection />
      <BreadcrumbsSection />
      <StepIndicatorSection />
      {/* Composições */}
      <BannersSection />
      <SummaryCardsSection />
      <BarrasProgressoSection />
      <ProgressRingSection />
      <CardsOrcamentoSection />
      <BarraResumoSection />
      <SeletorMesSection />
      <ControleSegmentadoSection />
      {/* Tela /transactions — DS v2 (Story 3.4b) */}
      <TransactionRowSection />
      <TransactionSummaryCardsSection />
      <TransactionFiltersSection />
      <ChecklistSection />
      <ParcelasAtivasSection />
      <CardCartaoCreditoSection />
      <CardCartaoHeroSection />
      <ListaColapsavelSection />
      <EmptyStatesSection />
      <CurrencyInputSection />
      <PercentageInputSection />
      <PageHeaderSection />
      {/* Componentes Novos (Épico 3) */}
      <BudgetProgressBarSection />
      <SummaryCardSection />
      <ImpactPreviewSection />
      <BottomNavigationComponentSection />
      <CascadeInputSection />
      {/* Visualizações */}
      <GraficoBarrasSection />
      <GradeTimelineSection />
      <TreemapSection />
      <MapaGastosSection />
      <TooltipDetalheSection />
      <LegendaSection />
      <ColunaMensalSection />
      <PainelSimulacaoSection />
      {/* Layout & Navegação */}
      <MenuLateralSection />
      <BottomNavigationSection />
      <BottomSheetSection />
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
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Swatch color="#FAFAF9" label="background" cssVar="--background" />
            <Swatch color="#F5F5F4" label="muted" cssVar="--muted" />
            <Swatch color="#E7E5E4" label="border" cssVar="--border" />
            <Swatch color="#A8A29E" label="tertiary" cssVar="--color-text-tertiary" />
            <Swatch color="#78716C" label="secondary" cssVar="--muted-foreground" />
            <Swatch color="#1C1917" label="foreground" cssVar="--foreground" />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Primária (Indigo)</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Swatch color="#EEF2FF" label="primary-light" cssVar="--color-primary-light" />
            <Swatch color="#4F46E5" label="primary" cssVar="--primary" />
            <Swatch color="#4338CA" label="primary-hover" cssVar="--color-primary-hover" />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Status</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Swatch color="#DCFCE7" label="positive-bg" cssVar="--color-positive-bg" />
            <Swatch color="#22C55E" label="positive" cssVar="--color-positive" />
            <Swatch color="#166534" label="positive-text" cssVar="--color-positive-text" />
            <Swatch color="#FEF9C3" label="attention-bg" cssVar="--color-attention-bg" />
            <Swatch color="#EAB308" label="attention" cssVar="--color-attention" />
            <Swatch color="#854D0E" label="attention-text" cssVar="--color-attention-text" />
            <Swatch color="#FFF7ED" label="alert-bg" cssVar="--color-alert-bg" />
            <Swatch color="#F97316" label="alert" cssVar="--color-alert" />
            <Swatch color="#9A3412" label="alert-text" cssVar="--color-alert-text" />
            <Swatch color="#DBEAFE" label="info-bg" cssVar="--color-info-bg" />
            <Swatch color="#3B82F6" label="info" cssVar="--color-info" />
            <Swatch color="#1E40AF" label="info-text" cssVar="--color-info-text" />
            <Swatch color="#FEE2E2" label="critical-bg" cssVar="--color-critical-bg" />
            <Swatch color="#DC2626" label="critical" cssVar="--color-critical" />
            <Swatch color="#991B1B" label="critical-text" cssVar="--color-critical-text" />
            <Swatch color="#DC2626" label="negative" cssVar="--color-negative" />
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
          <span className="text-xs text-muted-foreground">Display — text-[28px] font-bold (valor grande)</span>
          <p className="text-[28px] font-bold tabular-nums">R$ 12.500,00</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Label — text-sm font-medium</span>
          <Label>Nome da conta</Label>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Caption — text-[11px] font-medium</span>
          <p className="text-[11px] font-medium text-muted-foreground">Resta R$ 878,00</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Mono — font-mono</span>
          <p className="font-mono text-sm text-muted-foreground">ui-monospace, SFMono-Regular, Menlo, Consolas</p>
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

/* ─── 2b. Convenções de Formatação ─── */

function FormatacaoMoneyInput() {
  const [value, setValue] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "")
    if (raw === "") {
      setValue("")
      return
    }
    const cents = parseInt(raw, 10)
    setValue(`R$ ${centsToDisplayValue(cents)}`)
  }

  return (
    <Input
      inputMode="numeric"
      placeholder="R$ 0,00"
      value={value}
      onChange={handleChange}
      className="max-w-[200px]"
    />
  )
}

function FormatacaoPercentInput() {
  const [value, setValue] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "")
    if (raw === "") {
      setValue("")
      return
    }
    const num = parseInt(raw, 10)
    setValue(centsToDisplayValue(num))
  }

  return (
    <div className="relative max-w-[200px]">
      <Input
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

function FormatacaoSection() {
  return (
    <Section id="formatacao" title="Convenções de Formatação">
      <div className="space-y-8">
        {/* Valores monetários */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Valores monetários (R$)</h3>
          <div className="space-y-3">
            <div className="overflow-hidden rounded-[var(--radius-card)] border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-semibold">Contexto</th>
                    <th className="px-4 py-2 text-right font-semibold">Formato</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 text-muted-foreground">Valor positivo</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">R$ 3.000,00</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 text-muted-foreground">Valor negativo</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold text-critical">-R$ 500,00</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 text-muted-foreground">Zero</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">R$ 0,00</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-muted-foreground">Valor grande</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">R$ 1.234.567,89</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Sempre 2 decimais, separador de milhar com ponto, decimal com vírgula. Prefixo <code className="rounded bg-muted px-1 py-0.5 text-[11px]">R$</code> com espaço antes do valor. Negativo: sinal antes do <code className="rounded bg-muted px-1 py-0.5 text-[11px]">R$</code>. Nunca <code className="rounded bg-muted px-1 py-0.5 text-[11px]">R$ 0</code> ou <code className="rounded bg-muted px-1 py-0.5 text-[11px]">R$ -</code>.
            </p>
          </div>
        </div>

        {/* Percentuais */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Percentuais (%)</h3>
          <div className="space-y-3">
            <div className="overflow-hidden rounded-[var(--radius-card)] border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-semibold">Contexto</th>
                    <th className="px-4 py-2 text-right font-semibold">Formato</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 text-muted-foreground">Percentual normal</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">25,03%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 text-muted-foreground">Percentual inteiro</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">100,00%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-muted-foreground">Zero</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">0,00%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Sempre 2 decimais, vírgula como separador decimal, símbolo <code className="rounded bg-muted px-1 py-0.5 text-[11px]">%</code> como sufixo. Nunca <code className="rounded bg-muted px-1 py-0.5 text-[11px]">0%</code> ou <code className="rounded bg-muted px-1 py-0.5 text-[11px]">25%</code>.
            </p>
          </div>
        </div>

        {/* tabular-nums demo */}
        <div>
          <h3 className="mb-3 text-sm font-medium">tabular-nums (alinhamento em colunas)</h3>
          <div className="grid max-w-sm gap-4 md:grid-cols-2">
            <div>
              <span className="mb-2 block text-xs text-muted-foreground">Com tabular-nums</span>
              <div className="space-y-1 rounded-[var(--radius-card)] border p-3">
                <p className="text-right text-sm tabular-nums">R$ 1.234,56</p>
                <p className="text-right text-sm tabular-nums">R$ 98.765,43</p>
                <p className="text-right text-sm tabular-nums">R$ 0,01</p>
                <p className="text-right text-sm tabular-nums">R$ 123.456,78</p>
              </div>
            </div>
            <div>
              <span className="mb-2 block text-xs text-muted-foreground">Sem tabular-nums</span>
              <div className="space-y-1 rounded-[var(--radius-card)] border p-3" style={{ fontVariantNumeric: "normal" }}>
                <p className="text-right text-sm">R$ 1.234,56</p>
                <p className="text-right text-sm">R$ 98.765,43</p>
                <p className="text-right text-sm">R$ 0,01</p>
                <p className="text-right text-sm">R$ 123.456,78</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">font-variant-numeric: tabular-nums</code> aplicado seletivamente em colunas e comparações de valores — nunca no body inteiro. Classe Tailwind: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">tabular-nums</code>.
          </p>
        </div>

        {/* Input monetário */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Input monetário (estilo app bancário)</h3>
          <div className="max-w-sm space-y-2">
            <Label>Valor</Label>
            <FormatacaoMoneyInput />
            <p className="text-xs text-muted-foreground">
              Usuário digita apenas números. Ex: digitar <code className="rounded bg-muted px-1 py-0.5 text-[11px]">1978</code> → <code className="rounded bg-muted px-1 py-0.5 text-[11px]">R$ 19,78</code>. Usar <code className="rounded bg-muted px-1 py-0.5 text-[11px]">inputMode=&quot;numeric&quot;</code>, prefixo &ldquo;R$&rdquo; no valor formatado.
            </p>
          </div>
        </div>

        {/* Input percentual */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Input percentual (estilo app bancário)</h3>
          <div className="max-w-sm space-y-2">
            <Label>Taxa</Label>
            <FormatacaoPercentInput />
            <p className="text-xs text-muted-foreground">
              Mesmo padrão bancário. Ex: digitar <code className="rounded bg-muted px-1 py-0.5 text-[11px]">2503</code> → <code className="rounded bg-muted px-1 py-0.5 text-[11px]">25,03%</code>. Sufixo &ldquo;%&rdquo; posicionado com absolute.
            </p>
          </div>
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
              Salvando...
            </Button>
            <Button disabled variant="outline">
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
    setMoneyValue(`R$ ${centsToDisplayValue(cents)}`)
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

        {/* Valid */}
        <div className="grid gap-2">
          <Label htmlFor="demo-valid">Campo válido</Label>
          <Input
            id="demo-valid"
            defaultValue="vitor@email.com"
            className="border-positive focus-visible:ring-positive/50"
          />
          <p className="text-xs text-positive-text">E-mail válido</p>
        </div>

        {/* Error */}
        <div className="grid gap-2">
          <Label htmlFor="demo-error">Campo com erro</Label>
          <Input id="demo-error" aria-invalid="true" defaultValue="abc" />
          <p className="text-xs text-destructive">Valor inválido</p>
        </div>

        {/* Password strength */}
        <div className="grid gap-2">
          <Label htmlFor="demo-password">Senha (com indicador de força)</Label>
          <Input id="demo-password" type="password" defaultValue="Senh@F0rte!" />
          <div className="flex gap-1">
            <div className="h-1 flex-1 rounded-full bg-critical" />
            <div className="h-1 flex-1 rounded-full bg-attention" />
            <div className="h-1 flex-1 rounded-full bg-positive" />
            <div className="h-1 flex-1 rounded-full bg-positive" />
          </div>
          <p className="text-xs text-positive-text">Senha forte</p>
        </div>

        {/* Password weak example */}
        <div className="grid gap-2">
          <Label htmlFor="demo-password-weak">Senha fraca</Label>
          <Input id="demo-password-weak" type="password" defaultValue="123" />
          <div className="flex gap-1">
            <div className="h-1 flex-1 rounded-full bg-critical" />
            <div className="h-1 flex-1 rounded-full bg-muted" />
            <div className="h-1 flex-1 rounded-full bg-muted" />
            <div className="h-1 flex-1 rounded-full bg-muted" />
          </div>
          <p className="text-xs text-critical-text">Senha fraca</p>
        </div>

        {/* Opcional */}
        <div className="grid gap-2">
          <Label htmlFor="demo-optional">Observações <span className="font-normal text-muted-foreground">(opcional)</span></Label>
          <Input id="demo-optional" placeholder="Nota sobre a transação..." />
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
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Variantes (CVA)</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="link">Link</Badge>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Semânticas (status)</h3>
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

        <div>
          <h3 className="mb-3 text-sm font-medium">Especificações</h3>
          <div className="overflow-hidden rounded-[var(--radius-card)] border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-semibold">Propriedade</th>
                  <th className="px-4 py-2 text-left font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 text-muted-foreground">Altura</td>
                  <td className="px-4 py-2"><code className="rounded bg-muted px-1 py-0.5 text-[11px]">h-5</code> (20px)</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-muted-foreground">Border-radius</td>
                  <td className="px-4 py-2"><code className="rounded bg-muted px-1 py-0.5 text-[11px]">rounded-4xl</code> (pill)</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-muted-foreground">Texto</td>
                  <td className="px-4 py-2"><code className="rounded bg-muted px-1 py-0.5 text-[11px]">text-xs font-medium</code> (12px)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-muted-foreground">Padding</td>
                  <td className="px-4 py-2"><code className="rounded bg-muted px-1 py-0.5 text-[11px]">px-2</code> (8px horizontal)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── 7. Dialogs & Sheets ─── */

function DialogsSection() {
  return (
    <Section id="dialogs" title="Dialogs & Sheets">
      <div className="space-y-6">
        {/* Overlay spec */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Overlay (Dialog + Sheet)</h3>
          <div className="flex items-center gap-6">
            <div className="relative flex size-40 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border">
              <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
              <div className="relative z-10 rounded-md bg-white px-4 py-3 shadow-lg">
                <span className="text-xs font-medium">Conteúdo</span>
              </div>
            </div>
            <div className="space-y-1 text-[13px]">
              <p className="font-medium">Especificação do overlay</p>
              <p className="text-muted-foreground"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">bg-black/25</code> — 25% opacidade (preto)</p>
              <p className="text-muted-foreground"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">backdrop-blur-sm</code> — blur sutil no fundo</p>
              <p className="text-muted-foreground">Aplicado automaticamente em Dialog e Sheet</p>
            </div>
          </div>
        </div>

        {/* Dialog */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Dialog (modal centralizado)</h3>
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
        </div>

        {/* Sheet */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Sheet (painel lateral)</h3>
          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" />}
            >
              Abrir sheet de exemplo
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Detalhes da transação</SheetTitle>
                <SheetDescription>
                  Edite os detalhes desta transação.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 py-4">
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Input defaultValue="Supermercado Extra" />
                </div>
                <div className="space-y-1.5">
                  <Label>Valor</Label>
                  <Input defaultValue="R$ 234,56" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Select defaultValue="alimentacao">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alimentacao">🍔 Alimentação</SelectItem>
                      <SelectItem value="transporte">🚗 Transporte</SelectItem>
                      <SelectItem value="moradia">🏠 Moradia</SelectItem>
                      <SelectItem value="saude">💊 Saúde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Data</Label>
                  <Input type="date" defaultValue="2026-03-20" />
                </div>
                <div className="space-y-1.5">
                  <Label>Observações</Label>
                  <Input placeholder="Nota opcional..." />
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-card)] border px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex shrink-0 items-center justify-center rounded-[3px] border border-black/[0.06] bg-[#1A1F71] px-[3px] py-[1px] text-[7px] font-extrabold italic text-white" style={{ width: 26, height: 16 }}>
                      VISA
                    </span>
                    <span className="text-muted-foreground">Latam Pass •••• 4532</span>
                  </div>
                  <Badge variant="secondary" className="text-[11px]">Crédito</Badge>
                </div>
              </div>
              <div className="flex gap-2 border-t px-4 pt-4">
                <Button className="flex-1">Salvar</Button>
                <Button variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Section>
  )
}

/* ─── Dropdown Menu ─── */

function DropdownMenuSection() {
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <Section id="dropdown-menu" title="Dropdown Menu">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Context menu (ações de item)</h3>
          <div className="relative inline-block">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <MoreVertical />
            </Button>
            {openMenu && (
              <div className="absolute top-full left-0 z-10 mt-1 w-48 overflow-hidden rounded-[var(--radius-card)] border bg-popover p-1 shadow-md">
                <button
                  type="button"
                  onClick={() => setOpenMenu(false)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Pencil className="size-4 text-muted-foreground" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setOpenMenu(false)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Copy className="size-4 text-muted-foreground" />
                  Duplicar
                </button>
                <button
                  type="button"
                  onClick={() => setOpenMenu(false)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Archive className="size-4 text-muted-foreground" />
                  Arquivar
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => setOpenMenu(false)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-critical transition-colors hover:bg-critical-bg"
                >
                  <Trash2 className="size-4" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Menu estático (referência visual)</h3>
          <div className="w-48 overflow-hidden rounded-[var(--radius-card)] border bg-popover p-1 shadow-md">
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted">
              <Pencil className="size-4 text-muted-foreground" />
              Editar
            </div>
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted">
              <Copy className="size-4 text-muted-foreground" />
              Duplicar
            </div>
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted">
              <Archive className="size-4 text-muted-foreground" />
              Arquivar
            </div>
            <div className="my-1 h-px bg-border" />
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-critical hover:bg-critical-bg">
              <Trash2 className="size-4" />
              Excluir
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-14: ícone + texto por item, separador antes de itens destrutivos, item destrutivo em text-critical + hover bg-critical-bg. Radius card, shadow-md, bg-popover.
      </p>
    </Section>
  )
}

/* ─── Toast / Notificações ─── */

function ToastSection() {
  return (
    <Section id="toast" title="Toast / Notificações">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Disparar toasts</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Transação salva com sucesso")}
            >
              Success
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.error("Erro ao salvar transação")}
            >
              Error
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Fatura será fechada em 3 dias")}
            >
              Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.warning("Orçamento de Alimentação está em 92%")}
            >
              Warning
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast("Categoria arquivada", {
                  action: {
                    label: "Desfazer",
                    onClick: () => toast.info("Ação desfeita"),
                  },
                })
              }
            >
              Com ação
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.loading("Salvando...")}
            >
              Loading
            </Button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Variantes (estáticas)</h3>
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-3 rounded-[var(--radius)] border bg-popover px-4 py-3 shadow-sm">
              <CheckCircle2 className="size-4 shrink-0 text-positive" />
              <span className="text-sm">Transação salva com sucesso</span>
            </div>
            <div className="flex items-center gap-3 rounded-[var(--radius)] border bg-popover px-4 py-3 shadow-sm">
              <AlertTriangle className="size-4 shrink-0 text-critical" />
              <span className="text-sm">Erro ao salvar transação</span>
            </div>
            <div className="flex items-center gap-3 rounded-[var(--radius)] border bg-popover px-4 py-3 shadow-sm">
              <Clock className="size-4 shrink-0 text-info" />
              <span className="text-sm">Fatura será fechada em 3 dias</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] border bg-popover px-4 py-3 shadow-sm">
              <span className="text-sm">Categoria arquivada</span>
              <Button variant="outline" size="xs">Desfazer</Button>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Componente Sonner com 4 variantes: success (verde), error (vermelho), info (azul), warning (amarelo). Suporta action button para &ldquo;Desfazer&rdquo;. Posicionado bottom-right por padrão.
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
                <span>Ok — 45,00%</span>
                <span className="font-semibold tabular-nums text-positive-text">45,00%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-positive transition-all" style={{ width: "45%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Atenção — 78,00%</span>
                <span className="font-semibold tabular-nums text-attention-text">78,00%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-attention transition-all" style={{ width: "78%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Alerta — 92,00%</span>
                <span className="font-semibold tabular-nums text-alert-text">92,00%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-alert transition-all" style={{ width: "92%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Crítico — 110,00%</span>
                <span className="font-semibold tabular-nums text-critical-text">110,00%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-critical transition-all" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Fixo — 100,00%</span>
                <span className="font-semibold tabular-nums text-primary">100,00%</span>
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
            <span className="text-sm font-semibold text-positive-text">70,00%</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Container: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">h-1.5 w-full rounded-full bg-muted</code>. Label: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">text-sm font-semibold tabular-nums</code> + cor semântica. Faixas: positivo (verde &le;60%), atenção (amarelo 60-80%), alerta (laranja 80-100%), crítico (vermelho &gt;100%).
      </p>
    </Section>
  )
}

/* ─── Progress Ring ─── */

function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  color = "var(--color-positive)",
  label,
  sublabel,
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold tabular-nums">{percentage}%</span>
        </div>
      </div>
      {label && <span className="text-xs font-medium">{label}</span>}
      {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
    </div>
  )
}

function ProgressRingSection() {
  return (
    <Section id="progress-ring" title="Progress Ring">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Tamanhos e status</h3>
          <div className="flex flex-wrap items-end gap-8">
            <ProgressRing
              percentage={58}
              size={80}
              color="var(--color-positive)"
              label="Checklist"
              sublabel="7 de 12 pagos"
            />
            <ProgressRing
              percentage={85}
              size={80}
              color="var(--color-attention)"
              label="Orçamento"
              sublabel="R$ 8.500 de R$ 10.000"
            />
            <ProgressRing
              percentage={100}
              size={80}
              color="var(--color-primary)"
              label="Fixos"
              sublabel="Todos pagos"
            />
            <ProgressRing
              percentage={110}
              size={80}
              color="var(--color-critical)"
              label="Restaurante"
              sublabel="Estourou orçamento"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Tamanho compacto (inline)</h3>
          <div className="flex items-center gap-6">
            <ProgressRing percentage={75} size={48} strokeWidth={4} color="var(--color-positive)" />
            <ProgressRing percentage={42} size={48} strokeWidth={4} color="var(--color-info)" />
            <ProgressRing percentage={92} size={48} strokeWidth={4} color="var(--color-alert)" />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Grande (dashboard)</h3>
          <ProgressRing
            percentage={67}
            size={120}
            strokeWidth={8}
            color="var(--color-positive)"
            label="Total utilizado"
            sublabel="R$ 9.930 de R$ 14.858"
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        SVG circular com stroke-dasharray. Cores semânticas por status: verde (ok), amarelo (atenção), laranja (alerta), vermelho (estourou). 3 tamanhos: compacto (48px), padrão (80px), grande (120px).
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
              <span className="text-sm font-bold tabular-nums">67,00%</span>
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
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setMesIdx(Math.max(0, mesIdx - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[80px] text-center text-sm font-semibold">
              {meses[mesIdx]}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setMesIdx(Math.min(meses.length - 1, mesIdx + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
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
              <Button
                key={v.id}
                variant={activeView === v.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView(v.id)}
                className={activeView === v.id ? "rounded-[9px]" : "rounded-[9px] bg-transparent"}
              >
                <span className="text-xs">{v.icon}</span>
                {v.label}
              </Button>
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

/* ─── Tela /transactions — componentes DS v2 (Story 3.4b) ─── */

function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-[12px] leading-relaxed font-mono text-foreground">
      <code>{code}</code>
    </pre>
  )
}

function TransactionRowSection() {
  return (
    <Section id="transaction-row" title="TransactionRow (tela /transactions)">
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-medium">Desktop — os 3 tipos</h3>
          <div className="max-w-2xl rounded-lg border border-border bg-card">
            <ul className="divide-y divide-border">
              <TransactionRow
                type="expense"
                primary="Imperatriz"
                secondary="Alimentação"
                amountCents={10000}
                method="Master · Inter"
                icon={{ kind: 'emoji', value: '🛒' }}
                onClick={() => {}}
                onAction={() => {}}
              />
              <TransactionRow
                type="expense"
                primary="Padaria do João"
                secondary="Alimentação"
                amountCents={1850}
                method="Débito · Inter"
                icon={{ kind: 'letter', value: 'P' }}
                onClick={() => {}}
                onAction={() => {}}
              />
              <TransactionRow
                type="income"
                primary="Salário — Nexfar"
                secondary="Receita"
                amountCents={650000}
                method="Itaú · Corrente"
                icon={{ kind: 'lucide', name: 'ArrowDownLeft' }}
                onClick={() => {}}
                onAction={() => {}}
              />
              <TransactionRow
                type="transfer"
                secondary="Transferência"
                amountCents={50000}
                icon={{ kind: 'lucide', name: 'ArrowLeftRight' }}
                transferEndpoints={{
                  source: { bank: 'Nubank' },
                  destination: { bank: 'Itaú' },
                }}
                onClick={() => {}}
                onAction={() => {}}
              />
            </ul>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Faixa lateral de 3px por tipo (vermelho/verde/azul). Ícone circular com emoji (gasto com categoria),
            letra (fallback sem emoji) ou Lucide (receita/transferência). Valor com sinal{' '}
            <code>−</code> / <code>+</code> / sem sinal, <code>tabular-nums</code>. Botão MoreVertical usa{' '}
            <code>stopPropagation</code> — não dispara o <code>onClick</code> da linha.
          </p>
        </div>

        <CodeSnippet
          code={`<TransactionRow
  type="expense"
  primary="Imperatriz"
  secondary="Alimentação"
  amountCents={10000}
  method="Master · Inter"
  icon={{ kind: 'emoji', value: '🛒' }}
  onClick={() => openEdit(tx)}
  onAction={() => openDelete(tx)}
/>`}
        />
      </div>
    </Section>
  )
}

function TransactionSummaryCardsSection() {
  return (
    <Section id="transaction-summary-cards" title="TransactionSummaryCards (tela /transactions)">
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-medium">Desktop (md+)</h3>
          <div className="max-w-2xl">
            <TransactionSummaryCards
              expense={{ totalCents: 124700, count: 12 }}
              income={{ totalCents: 650000, count: 2 }}
              transfer={{ totalCents: 48303, count: 3 }}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Mobile (&lt; 768px)</h3>
          <div className="max-w-[360px]">
            <TransactionSummaryCards
              expense={{ totalCents: 124700, count: 12 }}
              income={{ totalCents: 650000, count: 2 }}
              transfer={{ totalCents: 48303, count: 3 }}
              compact
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Variante compacta — labels abreviados (<code>Saídas</code>, <code>Entradas</code>,{' '}
            <code>Transf.</code>), padding e fonte reduzidos. Em produção, a troca acontece
            automaticamente via classes Tailwind responsivas (<code>md:*</code>) conforme o
            viewport — aqui forçamos via prop <code>compact</code> porque o demo fica num
            container estreito dentro de um viewport desktop.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Loading (skeleton)</h3>
          <div className="max-w-2xl">
            <TransactionSummaryCards
              expense={{ totalCents: 0, count: 0 }}
              income={{ totalCents: 0, count: 0 }}
              transfer={{ totalCents: 0, count: 0 }}
              isLoading
            />
          </div>
        </div>

        <CodeSnippet
          code={`<TransactionSummaryCards
  expense={{ totalCents: 124700, count: 12 }}
  income={{ totalCents: 650000, count: 2 }}
  transfer={{ totalCents: 48303, count: 3 }}
  isLoading={false}
/>`}
        />
      </div>
    </Section>
  )
}

const FILTERS_DEMO_CATEGORIES = [
  { id: 'cat-1', name: 'Alimentação', emoji: '🍔' },
  { id: 'cat-2', name: 'Moradia', emoji: '🏠' },
  { id: 'cat-3', name: 'Transporte', emoji: '🚗' },
  { id: 'cat-4', name: 'Lazer', emoji: '🎮' },
]

const FILTERS_DEMO_PAYMENT_METHODS = [
  { id: 'pm-1', label: 'Inter · Corrente', bankName: 'Inter' },
  { id: 'pm-2', label: 'Master Inter', cardBrand: 'mastercard' },
  { id: 'pm-3', label: 'Nubank · Crédito', cardBrand: 'mastercard' },
]

function ActiveFilterChip({
  children,
  onRemove,
}: {
  children: React.ReactNode
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary-light text-primary px-2.5 py-1 rounded-full text-xs font-medium">
      <span className="flex items-center gap-1">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full hover:bg-primary/10 p-0.5"
        aria-label="Remover filtro"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

function TransactionFiltersSection() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TransactionTypeFilter>('all')
  const [month, setMonth] = useState<MonthFilter>({ year: 2026, month: 4 })
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(['cat-1', 'cat-3']),
  )
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<Set<string>>(
    new Set(['pm-2']),
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeCount = selectedCategoryIds.size + selectedPaymentMethodIds.size

  const removeCategory = (id: string) => {
    const next = new Set(selectedCategoryIds)
    next.delete(id)
    setSelectedCategoryIds(next)
  }
  const removePaymentMethod = (id: string) => {
    const next = new Set(selectedPaymentMethodIds)
    next.delete(id)
    setSelectedPaymentMethodIds(next)
  }
  const clearAllAdvanced = () => {
    setSelectedCategoryIds(new Set())
    setSelectedPaymentMethodIds(new Set())
  }

  return (
    <Section id="transaction-filters" title="TransactionFiltersBar + Sheet (tela /transactions)">
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-medium">Barra de filtros (interativa)</h3>
          <TransactionFiltersBar
            search={search}
            type={type}
            month={month}
            activeFiltersCount={activeCount}
            onSearchChange={setSearch}
            onTypeChange={setType}
            onMonthClick={() =>
              setMonth(month === 'all' ? { year: 2026, month: 4 } : 'all')
            }
            onOpenAdvancedFilters={() => setSheetOpen(true)}
          />

          {activeCount > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center mt-3">
              {Array.from(selectedCategoryIds).map((catId) => {
                const cat = FILTERS_DEMO_CATEGORIES.find((c) => c.id === catId)
                if (!cat) return null
                return (
                  <ActiveFilterChip
                    key={catId}
                    onRemove={() => removeCategory(catId)}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </ActiveFilterChip>
                )
              })}
              {Array.from(selectedPaymentMethodIds).map((pmId) => {
                const pm = FILTERS_DEMO_PAYMENT_METHODS.find((p) => p.id === pmId)
                if (!pm) return null
                return (
                  <ActiveFilterChip
                    key={pmId}
                    onRemove={() => removePaymentMethod(pmId)}
                  >
                    {pm.label}
                  </ActiveFilterChip>
                )
              })}
              <button
                type="button"
                onClick={clearAllAdvanced}
                className="text-xs text-muted-foreground italic ml-2 hover:text-foreground"
              >
                Limpar tudo
              </button>
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Busca expansível (<code>flex-1 min-w-0</code> — cresce para preencher todo o
            espaço sobrando), segmented control (Tudo/Saídas/Entradas/Transf.), pílula de
            mês (callback controlado — consumer decide popover ou toggle) e botão Filtros
            com badge. Chips de filtros ativos ficam <strong>fora</strong> da barra
            (renderizados pelo consumer) — padrão da spec (seção 4.4). Clique em Filtros
            para abrir o sheet e alterar a seleção.
          </p>
        </div>

        <TransactionFiltersSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          categories={FILTERS_DEMO_CATEGORIES}
          paymentMethods={FILTERS_DEMO_PAYMENT_METHODS}
          selectedCategoryIds={selectedCategoryIds}
          selectedPaymentMethodIds={selectedPaymentMethodIds}
          onApply={(sel) => {
            setSelectedCategoryIds(sel.categoryIds)
            setSelectedPaymentMethodIds(sel.paymentMethodIds)
          }}
        />

        <CodeSnippet
          code={`<TransactionFiltersBar
  search={search}
  type={type}
  month={month}
  activeFiltersCount={activeCount}
  onSearchChange={setSearch}
  onTypeChange={setType}
  onMonthClick={openMonthPopover}
  onOpenAdvancedFilters={() => setSheetOpen(true)}
/>

{/* Chips de filtros ativos — renderizados pelo consumer */}
{activeCount > 0 && (
  <div className="flex flex-wrap gap-1.5 items-center mt-3">
    {Array.from(selectedCategoryIds).map(id => (
      <Chip key={id} onRemove={() => removeCategory(id)}>
        {cat.emoji} {cat.name}
      </Chip>
    ))}
    {/* ... métodos ... */}
    <button onClick={clearAllAdvanced}>Limpar tudo</button>
  </div>
)}

<TransactionFiltersSheet
  open={sheetOpen}
  onOpenChange={setSheetOpen}
  categories={categories}
  paymentMethods={paymentMethods}
  selectedCategoryIds={selectedCategoryIds}
  selectedPaymentMethodIds={selectedPaymentMethodIds}
  onApply={(sel) => {
    setSelectedCategoryIds(sel.categoryIds)
    setSelectedPaymentMethodIds(sel.paymentMethodIds)
  }}
/>`}
        />
      </div>
    </Section>
  )
}

/* ─── Checklist ─── */

function CardBrand({ brand }: { brand: "visa" | "master" | "elo" | "amex" | "hiper" }) {
  if (brand === "visa") {
    return (
      <span className="inline-flex w-[26px] h-4 shrink-0 items-center justify-center rounded-[3px] border border-foreground/6 bg-[#1A1F71] text-[7px] font-extrabold italic text-white">
        VISA
      </span>
    )
  }
  if (brand === "elo") {
    return (
      <span className="inline-flex w-[26px] h-4 shrink-0 items-center justify-center rounded-[3px] border border-foreground/6 bg-[#000000] text-[7px] font-extrabold text-[#FFCB05]">
        ELO
      </span>
    )
  }
  if (brand === "amex") {
    return (
      <span className="inline-flex w-[26px] h-4 shrink-0 items-center justify-center rounded-[3px] border border-foreground/6 bg-[#006FCF] text-[6px] font-extrabold text-white">
        AMEX
      </span>
    )
  }
  if (brand === "hiper") {
    return (
      <span className="inline-flex w-[26px] h-4 shrink-0 items-center justify-center rounded-[3px] border border-foreground/6 bg-[#822124] text-[6px] font-extrabold text-white">
        HIPER
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
        <Button
          variant="outline"
          size="xs"
          className="shrink-0 border-attention/30 bg-attention-bg text-attention-text hover:bg-attention-bg/80"
        >
          Atualizar fatura
        </Button>
      )}

      {/* Hover actions — text links like proto-10 */}
      {showActions && (
        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="xs">
            Editar
          </Button>
          <Button variant="ghost" size="xs">
            Detalhes
          </Button>
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
            value="R$ 22,00"
            brand="visa"
            meta="Latam Pass · Ciclo Mar"
            status="Pago"
            statusVariant="paid"
            checked={true}
          />
          <CLItem
            name="Netflix"
            value="R$ 45,00"
            brand="visa"
            meta="Latam Pass · Ciclo Mar"
            status="Pago"
            statusVariant="paid"
            checked={true}
          />
          <CLItem
            name="iCloud"
            value="R$ 12,00"
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
            value="~R$ 4.200,00"
            brand="visa"
            meta="Vence 15/03 · Estimativa"
            status="Estimativa"
            statusVariant="estimate"
            showUpdateBtn={true}
          />
          <CLItem
            name="Fatura Pão de Açúcar"
            value="~R$ 1.980,00"
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
            value="R$ 250,00"
            meta="Vence 20/03 · PIX"
            status="Pendente"
            statusVariant="pending"
            showActions={true}
          />
          <CLItem
            name="Condomínio"
            value="R$ 580,00"
            meta="Vence 15/03 · Boleto"
            status="Pendente"
            statusVariant="pending"
            showActions={true}
          />
          <CLItem
            name="Seguro carro"
            value="R$ 230,00"
            meta="Vence 25/03 · Débito"
            status="Pendente"
            statusVariant="pending"
            showActions={true}
          />
          <CLItem
            name="Plano saúde"
            value="R$ 815,00"
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
            <div className="flex items-center gap-2">
              <CardBrand brand="elo" />
              <span className="text-sm text-muted-foreground">Elo</span>
            </div>
            <div className="flex items-center gap-2">
              <CardBrand brand="amex" />
              <span className="text-sm text-muted-foreground">Amex</span>
            </div>
            <div className="flex items-center gap-2">
              <CardBrand brand="hiper" />
              <span className="text-sm text-muted-foreground">Hiper</span>
            </div>
          </div>
        </div>

        {/* Botão atualizar fatura */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Botão &ldquo;Atualizar fatura&rdquo;</h3>
          <Button
            variant="outline"
            size="xs"
            className="border-attention/30 bg-attention-bg text-attention-text hover:bg-attention-bg/80"
          >
            Atualizar fatura
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Usado quando o valor é estimativa e precisa ser confirmado com a fatura real.
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-10: 3 grupos (Recorrente no Cartão, Variável/Fatura, Manual). Checkbox customizado com animação. Card brand badges (VISA/Mastercard) inline. Ações &ldquo;Editar&rdquo;/&ldquo;Detalhes&rdquo; em texto no hover. Badge &ldquo;Atualizar fatura&rdquo; para estimativas.
      </p>
    </Section>
  )
}

/* ─── Parcelas Ativas ─── */

const parcelasData = [
  { compra: "Fotos", total: "R$ 1.710,00", parcela: "8/10", restam: 2, mensal: "R$ 171,00", termino: "Mai 2026" },
  { compra: "Amazon", total: "R$ 750,00", parcela: "2/3", restam: 1, mensal: "R$ 250,00", termino: "Abr 2026" },
  { compra: "Oculos", total: "R$ 1.200,00", parcela: "4/12", restam: 8, mensal: "R$ 100,00", termino: "Nov 2026" },
]

const timelineItems = [
  { name: "Fotos", month: "Mai", width: "25%", gradient: "from-[#6366F1] to-[#818CF8]", libera: "R$ 171,00/mês" },
  { name: "Amazon", month: "Abr", width: "12%", gradient: "from-[#F59E0B] to-[#FBBF24]", libera: "R$ 250,00/mês" },
  { name: "Oculos", month: "Nov", width: "90%", gradient: "from-[#14B8A6] to-[#2DD4BF]", libera: "R$ 100,00/mês" },
]

function ParcelasAtivasSection() {
  return (
    <Section id="parcelas-ativas" title="Parcelas Ativas">
      <Card className="max-w-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Parcelas Ativas</CardTitle>
          <span className="text-xs text-muted-foreground">3 series</span>
        </CardHeader>
        <CardContent className="p-0">
          {/* Tabela de parcelas */}
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Compra</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Total</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Parcela</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Restam</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Mensal</th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Termino</th>
              </tr>
            </thead>
            <tbody>
              {parcelasData.map((p) => (
                <tr key={p.compra} className="border-b border-muted/50 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{p.compra}</td>
                  <td className="px-4 py-2.5 font-medium tabular-nums">{p.total}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.parcela}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.restam}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums">{p.mensal}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{p.termino}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Timeline de parcelas */}
          <div className="border-t px-4 pb-4 pt-3">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">Linha do tempo das parcelas</p>
            <div className="space-y-2.5">
              {timelineItems.map((t) => (
                <div key={t.name} className="flex items-center gap-2.5">
                  <span className="w-14 shrink-0 text-xs font-medium text-muted-foreground">{t.name}</span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted/50">
                    <div
                      className={`flex h-full items-center justify-end rounded bg-gradient-to-r ${t.gradient} pr-2 text-[10px] font-semibold text-white transition-all duration-600`}
                      style={{ width: t.width }}
                    >
                      {t.month}
                    </div>
                  </div>
                  <span className="w-24 shrink-0 text-right text-[10px] font-medium text-muted-foreground/70">libera {t.libera}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-12: tabela de parcelas ativas com colunas (Compra, Total, Parcela, Restam, Mensal, Termino). Contador &ldquo;3 series&rdquo; no header. Timeline abaixo: barras horizontais com gradientes por série, badge do mês de encerramento, texto &ldquo;libera R$ X/mês&rdquo;. Cores: indigo (roxo), amber (amarelo), teal (verde-água).
      </p>
    </Section>
  )
}

/* ─── Card Cartão de Crédito ─── */

const creditCards = [
  {
    name: "Latam Pass Visa",
    flag: "visa" as const,
    fechaDia: 7,
    venceDia: 15,
    disponivel: "R$ 2.820,00",
    limite: "R$ 10.000,00",
    usoPct: 71.8,
    usoStatus: "critical" as const,
  },
  {
    name: "Pão de Açúcar Master",
    flag: "master" as const,
    fechaDia: 3,
    venceDia: 10,
    disponivel: "R$ 3.020,00",
    limite: "R$ 5.000,00",
    usoPct: 39.6,
    usoStatus: "ok" as const,
  },
  {
    name: "Uniclass Visa",
    flag: "visa" as const,
    fechaDia: 10,
    venceDia: 20,
    disponivel: "R$ 7.000,00",
    limite: "R$ 8.000,00",
    usoPct: 12.5,
    usoStatus: "ok" as const,
  },
]

function CCFlagIcon({ flag }: { flag: "visa" | "master" | "elo" | "amex" | "hiper" }) {
  if (flag === "visa") {
    return (
      <div className="flex h-[24px] w-9 items-center justify-center rounded border border-black/5 bg-[#1A1F71] text-[8px] font-extrabold italic text-white">
        VISA
      </div>
    )
  }
  if (flag === "elo") {
    return (
      <div className="flex h-[24px] w-9 items-center justify-center rounded border border-black/5 bg-[#000000] text-[8px] font-extrabold text-[#FFCB05]">
        ELO
      </div>
    )
  }
  if (flag === "amex") {
    return (
      <div className="flex h-[24px] w-9 items-center justify-center rounded border border-black/5 bg-[#006FCF] text-[7px] font-extrabold text-white">
        AMEX
      </div>
    )
  }
  if (flag === "hiper") {
    return (
      <div className="flex h-[24px] w-9 items-center justify-center rounded border border-black/5 bg-[#822124] text-[7px] font-extrabold text-white">
        HIPER
      </div>
    )
  }
  return (
    <div className="relative flex h-[24px] w-9 items-center justify-center overflow-hidden rounded border border-black/5 bg-[#252525]">
      <div className="absolute left-[3px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#EB001B]" />
      <div className="absolute right-[3px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#F79E1B]" />
    </div>
  )
}

function CardCartaoCreditoSection() {
  return (
    <Section id="card-cartao-credito" title="Card Cartão de Crédito">
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {creditCards.map((cc) => (
          <Card key={cc.name}>
            <CardContent className="p-5">
              {/* Flag + nome */}
              <div className="mb-4 flex items-center gap-3">
                <CCFlagIcon flag={cc.flag} />
                <span className="text-sm font-bold">{cc.name}</span>
              </div>

              {/* Datas */}
              <div className="mb-3 flex gap-6">
                <div>
                  <p className="text-[11px] text-muted-foreground/60">Fecha dia</p>
                  <p className="text-sm font-semibold">{cc.fechaDia}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground/60">Vence dia</p>
                  <p className="text-sm font-semibold">{cc.venceDia}</p>
                </div>
              </div>

              {/* Limite usado */}
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Disponível <span className="font-semibold text-foreground tabular-nums">{cc.disponivel}</span></span>
                  <span className="text-muted-foreground">Limite <span className="font-medium tabular-nums">{cc.limite}</span></span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cc.usoStatus === "critical" ? "bg-critical" : cc.usoPct > 30 ? "bg-attention" : "bg-primary"
                    }`}
                    style={{ width: `${cc.usoPct}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-[11px] font-medium tabular-nums text-muted-foreground">
                  {cc.usoPct.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}% usado
                </p>
              </div>

              {/* Ações */}
              <div className="mt-4 flex gap-2 border-t pt-3">
                <Button variant="outline" size="sm" className="flex-1">Editar</Button>
                <Button variant="destructive" size="sm" className="flex-1">Remover</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-14: card com flag (VISA azul #1A1F71, Mastercard com círculos EB001B/F79E1B), datas de fechamento/vencimento, barra de limite usado. Cores de uso: azul (ok &lt;30%), amber (atenção 30-70%), vermelho (crítico &gt;70%). Ações: Editar + Remover.
      </p>
    </Section>
  )
}

/* ─── Card Cartão Hero ─── */

function CardCartaoHeroSection() {
  return (
    <Section id="card-cartao-hero" title="Card Cartão Hero">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Cartão visual (hero)</h3>
          <div className="flex flex-wrap gap-6">
            {/* Visa — gradiente indigo */}
            <div className="relative h-[200px] w-[320px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] p-6 text-white shadow-lg">
              {/* Chip */}
              <div className="mb-6 h-8 w-11 rounded-md bg-gradient-to-br from-[#D4AF37] to-[#F0D060] shadow-inner" />
              {/* Número */}
              <p className="mb-4 font-mono text-lg tracking-[0.2em]">
                •••• •••• •••• 4532
              </p>
              {/* Info */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Titular</p>
                  <p className="text-sm font-semibold">VITOR CASTILHO</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Validade</p>
                  <p className="text-sm font-semibold">12/28</p>
                </div>
                <div className="text-right text-lg font-extrabold italic tracking-tight">
                  VISA
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-12 -left-8 size-32 rounded-full bg-white/5" />
            </div>

            {/* Mastercard — gradiente escuro */}
            <div className="relative h-[200px] w-[320px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C1917] to-[#44403C] p-6 text-white shadow-lg">
              {/* Chip */}
              <div className="mb-6 h-8 w-11 rounded-md bg-gradient-to-br from-[#D4AF37] to-[#F0D060] shadow-inner" />
              {/* Número */}
              <p className="mb-4 font-mono text-lg tracking-[0.2em]">
                •••• •••• •••• 8821
              </p>
              {/* Info */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Titular</p>
                  <p className="text-sm font-semibold">VITOR CASTILHO</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Validade</p>
                  <p className="text-sm font-semibold">08/27</p>
                </div>
                {/* Mastercard circles */}
                <div className="relative h-8 w-14">
                  <div className="absolute left-0 top-0 size-8 rounded-full bg-[#EB001B]" />
                  <div className="absolute right-0 top-0 size-8 rounded-full bg-[#F79E1B]" />
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-12 -left-8 size-32 rounded-full bg-white/5" />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-12: card visual 320×200px com gradiente, chip dourado, número com letter-spacing 0.2em, titular + validade + flag. Visa: gradiente indigo (#4F46E5→#6366F1). Mastercard: gradiente stone (#1C1917→#44403C) com círculos EB001B/F79E1B. Decoração: círculos bg-white/5.
      </p>
    </Section>
  )
}

/* ─── Gráfico de Barras ─── */

const barChartData = [
  { month: "Mar", value: 4200, type: "current" as const, note: "Fatura atual (estimativa)" },
  { month: "Abr", value: 3800, type: "future" as const, note: "Amazon encerra (3/3)" },
  { month: "Mai", value: 3600, type: "future" as const, note: "Fotos encerra (10/10)" },
  { month: "Jun", value: 3430, type: "future" as const, note: "Sem parcelas encerrando" },
  { month: "Jul", value: 3430, type: "future" as const, note: "Sem parcelas encerrando" },
  { month: "Ago", value: 3430, type: "future" as const, note: "Sem parcelas encerrando" },
]

function GraficoBarrasSection() {
  const maxVal = Math.max(...barChartData.map(d => d.value))
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  return (
    <Section id="grafico-barras" title="Gráfico de Barras">
      <Card className="max-w-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Projeção de Faturas</CardTitle>
          <span className="text-xs text-muted-foreground">Próximos 6 meses</span>
        </CardHeader>
        <CardContent>
          {/* Barras */}
          <div className="flex items-end gap-3" style={{ height: 180 }}>
            {barChartData.map((d) => {
              const heightPx = (d.value / maxVal) * 140
              return (
                <div
                  key={d.month}
                  className="relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                  onMouseEnter={() => setHoveredBar(d.month)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Valor */}
                  <span className="mb-1 text-[11px] font-semibold text-muted-foreground tabular-nums">
                    R$ {d.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  {/* Barra */}
                  <div
                    className={`w-full max-w-14 cursor-pointer rounded-t-md rounded-b-[2px] transition-opacity hover:opacity-85 ${
                      d.type === "current"
                        ? "bg-gradient-to-b from-[#EAB308] to-[#F59E0B]"
                        : "bg-gradient-to-b from-[#6366F1] to-[#818CF8]"
                    }`}
                    style={{ height: `${heightPx}px` }}
                  />
                  {/* Label mês */}
                  <span className="mt-2 text-xs font-medium text-muted-foreground">{d.month}</span>
                  {/* Tooltip */}
                  {hoveredBar === d.month && (
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-[11px] font-semibold text-background shadow-lg">
                      {d.note}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Trend banner */}
          <div className="mt-3.5 rounded-lg bg-positive-bg px-3 py-2 text-xs font-medium text-positive-text">
            ↓ Tendência: fatura diminuindo à medida que parcelas terminam
          </div>
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-12: barras verticais CSS puro. Mês atual: gradiente amber (#EAB308→#F59E0B). Futuros: gradiente indigo (#6366F1→#818CF8). Valor no topo, mês embaixo. Hover mostra tooltip escuro com nota. Banner de tendência em bg-positive-bg abaixo.
      </p>
    </Section>
  )
}

/* ─── Coluna Mensal (Projeção) ─── */

/* ─── MonthColumn (proto-11 fiel) ─── */

type MonthItemType = "fixed" | "variable" | "installment" | "planned"

interface MonthItem {
  name: string
  value: string
  type: MonthItemType
  tag?: string        // ex: "8/10" para parcelas
  approx?: boolean    // prefixo ~ para variáveis
  finished?: boolean  // última parcela
}

interface MonthColumnProps {
  month: string
  year?: string
  isCurrent?: boolean
  sections: { label: string; items: MonthItem[] }[]
  margin: string
  isPositive: boolean
  freedBadge?: string
  marginExtra?: string
}

function MonthColumn({
  month,
  year,
  isCurrent = false,
  sections,
  margin,
  isPositive,
  freedBadge,
  marginExtra,
}: MonthColumnProps) {
  return (
    <div
      className={`flex w-[192px] min-w-[192px] flex-col rounded-[var(--radius-md)] border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isCurrent
          ? "border-2 border-positive"
          : isPositive
            ? "border-t-[3px] border-t-positive border-x border-b"
            : "border-t-[3px] border-t-critical border-x border-b"
      }`}
    >
      {/* Header */}
      <div className="border-b px-3.5 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold">{month}</span>
          {year && <span className="text-[11px] font-medium text-text-tertiary">{year}</span>}
          {isCurrent && (
            <span className="ml-1.5 rounded-[3px] bg-positive-bg px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.3px] text-positive-text">
              Atual
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-2.5" style={{ minHeight: 120 }}>
        {sections.map((section) => (
          <div key={section.label}>
            {/* Section label */}
            <div className="mb-0.5 mt-1 text-[10px] font-semibold uppercase tracking-[0.5px] text-text-tertiary first:mt-0">
              {section.label}
            </div>
            {/* Items */}
            {section.items.map((item, i) => {
              const baseStyles: Record<MonthItemType, string> = {
                fixed: "border border-border bg-background",
                variable: "border border-border bg-background",
                installment: item.finished
                  ? "border border-positive bg-positive-bg"
                  : "border border-primary/20 bg-primary-light",
                planned: "border-[1.5px] border-dashed border-primary bg-primary-light cursor-grab hover:shadow-[0_2px_6px_rgba(79,70,229,0.15)] hover:-translate-y-px",
              }
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-[6px] px-2.5 py-2 text-[12px] ${baseStyles[item.type]}`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    {item.type === "planned" && (
                      <span className="text-[12px] text-primary/60">≡</span>
                    )}
                    <span className="truncate font-medium">{item.name}</span>
                    {item.tag && (
                      <span className={`shrink-0 rounded-[2px] px-1 py-px text-[9px] font-semibold ${
                        item.finished
                          ? "bg-positive-bg text-positive-text"
                          : "bg-primary-light text-primary"
                      }`}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums">
                    {item.approx && <span className="text-text-tertiary">~</span>}
                    {item.value}
                  </span>
                </div>
              )
            })}
          </div>
        ))}

        {/* Freed badge */}
        {freedBadge && (
          <div className="mt-0.5 rounded-[6px] border border-positive bg-positive-bg px-2 py-1 text-center text-[10px] font-semibold text-positive-text">
            {freedBadge}
          </div>
        )}
      </div>

      {/* Footer — Margin */}
      <div className="border-t px-2.5 py-2">
        <div className={`flex items-center justify-between rounded-[6px] px-2.5 py-1.5 text-[12px] font-semibold ${
          isPositive
            ? "bg-positive-bg text-positive-text"
            : "bg-critical-bg text-critical-text"
        }`}>
          <span className="text-[11px] font-medium">Margem</span>
          <span className="font-bold tabular-nums">{margin}</span>
        </div>
        {marginExtra && (
          <p className="mt-0.5 text-right text-[10px] font-medium text-positive-text/80">
            {marginExtra}
          </p>
        )}
      </div>
    </div>
  )
}

function ColunaMensalSection() {
  return (
    <Section id="coluna-mensal" title="Coluna Mensal (Projeção)">
      <div className="space-y-6">
        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-5 rounded-[6px] border bg-white px-3.5 py-2.5 text-[12px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 shrink-0 rounded-[3px] border bg-background" />
            Fixo (não arrastável)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 shrink-0 rounded-[3px] border-[1.5px] border-dashed border-primary bg-primary-light" />
            Planejado (arrastável)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 shrink-0 rounded-[3px] border border-positive bg-positive-bg" />
            Margem positiva
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 shrink-0 rounded-[3px] border border-critical bg-critical-bg" />
            Margem negativa
          </span>
        </div>

        {/* Colunas */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <MonthColumn
            month="Mar 2026"
            isCurrent
            sections={[
              { label: "Fixos", items: [
                { name: "Escola", value: "R$ 2.800,00", type: "fixed" },
                { name: "Aluguel", value: "R$ 1.800,00", type: "fixed" },
                { name: "Internet", value: "R$ 158,00", type: "fixed" },
              ]},
              { label: "Variáveis", items: [
                { name: "Supermercado", value: "R$ 3.000,00", approx: true, type: "variable" },
                { name: "Gasolina", value: "R$ 600,00", approx: true, type: "variable" },
              ]},
              { label: "Parcelas", items: [
                { name: "Fotos", value: "R$ 171,00", type: "installment", tag: "8/10" },
              ]},
            ]}
            margin="R$ 750,00"
            isPositive
          />
          <MonthColumn
            month="Mai 2026"
            sections={[
              { label: "Fixos", items: [
                { name: "Escola", value: "R$ 2.800,00", type: "fixed" },
                { name: "Aluguel", value: "R$ 1.800,00", type: "fixed" },
                { name: "Internet", value: "R$ 158,00", type: "fixed" },
              ]},
              { label: "Variáveis", items: [
                { name: "Supermercado", value: "R$ 3.000,00", approx: true, type: "variable" },
                { name: "Gasolina", value: "R$ 600,00", approx: true, type: "variable" },
              ]},
              { label: "Parcelas", items: [
                { name: "Fotos", value: "R$ 171,00", type: "installment", tag: "10/10", finished: true },
              ]},
            ]}
            margin="R$ 920,00"
            isPositive
          />
          <MonthColumn
            month="Jun 2026"
            sections={[
              { label: "Fixos", items: [
                { name: "Escola", value: "R$ 2.800,00", type: "fixed" },
                { name: "Aluguel", value: "R$ 1.800,00", type: "fixed" },
                { name: "Internet", value: "R$ 158,00", type: "fixed" },
              ]},
              { label: "Variáveis", items: [
                { name: "Supermercado", value: "R$ 3.000,00", approx: true, type: "variable" },
                { name: "Gasolina", value: "R$ 600,00", approx: true, type: "variable" },
              ]},
            ]}
            margin="R$ 1.091,00"
            isPositive
            freedBadge="Libera R$ 171,00/mês"
            marginExtra="+R$ 171,00 liberado"
          />
          <MonthColumn
            month="Set 2026"
            sections={[
              { label: "Fixos", items: [
                { name: "Escola", value: "R$ 2.800,00", type: "fixed" },
                { name: "Aluguel", value: "R$ 1.800,00", type: "fixed" },
                { name: "Internet", value: "R$ 158,00", type: "fixed" },
              ]},
              { label: "Planejado", items: [
                { name: "Seguro Carro", value: "R$ 2.800,00", type: "planned" },
                { name: "Troca Óleo", value: "R$ 500,00", type: "planned" },
              ]},
            ]}
            margin="-R$ 1.600,00"
            isPositive={false}
          />
        </div>

        {/* Range selector */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Seletor de período</h3>
          <div className="inline-flex overflow-hidden rounded-[6px] border bg-background">
            <Button variant="ghost" size="sm" className="rounded-none border-r">6 meses</Button>
            <Button variant="default" size="sm" className="rounded-none border-r">12 meses</Button>
            <Button variant="ghost" size="sm" className="rounded-none">24 meses</Button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão Kanban do proto-11: coluna 192px por mês. Seções: FIXOS, VARIÁVEIS, PARCELAS, PLANEJADO. Itens fixos: bg branco + borda. Parcelas: bg roxo claro + tag (8/10). Parcela final: bg verde + tag verde. Planejados: borda dashed + bg primary-light + cursor grab. Badge &ldquo;Libera&rdquo; quando parcela termina. Margem no footer: verde positiva, vermelho negativa. Border-top colorida (3px) por estado da margem. Mês atual: border 2px verde + badge &ldquo;ATUAL&rdquo;.
      </p>
    </Section>
  )
}

/* ─── Painel de Simulação ─── */

function PainelSimulacaoSection() {
  return (
    <Section id="painel-simulacao" title="Painel de Simulação">
      <Card className="max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 pt-5 pb-4">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <span>🏆</span>
            Simular meta — &ldquo;Dá pra ir?&rdquo;
          </h3>
        </div>

        {/* Body — grid 2 colunas */}
        <div className="grid grid-cols-[1fr_1.4fr]">
          {/* Form */}
          <div className="flex flex-col gap-3.5 border-r p-5">
            <div className="grid gap-1">
              <label className="text-[12px] font-semibold text-text-secondary">O que você quer?</label>
              <Input defaultValue="Viagem São Paulo" />
            </div>
            <div className="grid gap-1">
              <label className="text-[12px] font-semibold text-text-secondary">Quanto custa?</label>
              <Input defaultValue="R$ 3.500,00" inputMode="numeric" />
            </div>
            <div className="grid gap-1">
              <label className="text-[12px] font-semibold text-text-secondary">Quando?</label>
              <Select defaultValue="jun">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jun">Jun 2026</SelectItem>
                  <SelectItem value="jul">Jul 2026</SelectItem>
                  <SelectItem value="ago">Ago 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="mt-1 w-full">
              ⚡ Simular
            </Button>
          </div>

          {/* Result */}
          <div className="flex flex-col gap-4 p-5">
            {/* Veredito */}
            <div className="flex items-center gap-2 rounded-[6px] border border-positive bg-positive-bg px-3.5 py-2.5 text-sm font-semibold text-positive-text">
              <span>✓</span>
              Viável com ajustes
            </div>

            <p className="text-[13px] leading-relaxed text-text-secondary">
              Economize <strong className="text-foreground">R$ 945,00/mês</strong> nos próximos <strong className="text-foreground">4 meses</strong> para alcançar sua meta de <strong className="text-foreground">R$ 3.500,00</strong> em Junho 2026.
            </p>

            {/* Cortes */}
            <div>
              <p className="mb-1 text-[13px] font-bold">De onde cortar:</p>
              <div className="space-y-2.5">
                {[
                  { name: "Restaurante", saving: "-R$ 750,00/mês", detail: "Atual R$ 2.500,00 → reduzir 30%", pct: 74, color: "bg-[#6366F1]" },
                  { name: "Delivery", saving: "-R$ 180,00/mês", detail: "Atual R$ 900,00 → reduzir 20%", pct: 18, color: "bg-[#8B5CF6]" },
                  { name: "Compras pessoais", saving: "-R$ 75,00/mês", detail: "Atual R$ 500,00 → reduzir 15%", pct: 8, color: "bg-[#A78BFA]" },
                ].map((cut) => (
                  <div key={cut.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium">{cut.name}</span>
                      <span className="font-bold text-positive-text tabular-nums">{cut.saving}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary">{cut.detail}</p>
                    <div className="h-1.5 w-full overflow-hidden rounded-[3px] bg-background">
                      <div className={`h-full rounded-[3px] ${cut.color}`} style={{ width: `${cut.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between rounded-[6px] border border-[#C7D2FE] bg-primary-light px-3.5 py-2.5">
              <span className="text-[13px] font-semibold text-primary">Total possível</span>
              <span className="text-[15px] font-bold text-primary tabular-nums">R$ 1.005,00/mês</span>
            </div>
            <p className="text-right text-[11px] text-text-secondary">
              R$ 60,00 acima do necessário — folga para imprevistos
            </p>
          </div>
        </div>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-11: grid 2 colunas (form 42% + resultado 58%). Veredito: bg-positive-bg + border-positive + text-positive-text. Barras de corte: cores em escala (indigo 6366F1→A78BFA). Total: bg-primary-light + border #C7D2FE. Nota de folga alinhada à direita.
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
      <div className="max-w-md space-y-6">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Com CTA</p>
          <EmptyState
            icon={Tags}
            title="Nenhuma categoria ainda"
            description="Crie categorias para organizar seus gastos e receitas."
            actionLabel="Adicionar categoria"
            onAction={() => toast.info("Ação de exemplo: adicionar categoria")}
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Sem CTA</p>
          <EmptyState
            icon={Building2}
            title="Nenhuma conta cadastrada"
            description="Cadastre suas contas bancárias para acompanhar saldos."
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Padrão: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">border border-dashed border-border rounded-xl</code> + ícone Lucide + título + descrição + CTA (<code className="rounded bg-muted px-1 py-0.5 text-[11px]">Button variant=&quot;secondary&quot; size=&quot;sm&quot;</code>).
        </p>
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

/* ─── Responsividade / Breakpoints ─── */

function ResponsividadeSection() {
  return (
    <Section id="responsividade" title="Responsividade / Breakpoints">
      <div className="space-y-6">
        {/* Breakpoints */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 pt-4 text-center">
              <Smartphone className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Mobile</p>
                <p className="text-xs text-muted-foreground">&lt; 768px</p>
              </div>
              <div className="w-full space-y-1.5 text-left text-xs text-muted-foreground">
                <p>Bottom nav fixa (56px)</p>
                <p>Layout vertical (stack)</p>
                <p>Cards full-width</p>
                <p>Sheets full-screen</p>
                <p>Touch targets ≥ 44×44px</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-3 pt-4 text-center">
              <Tablet className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Tablet</p>
                <p className="text-xs text-muted-foreground">768px – 1023px</p>
              </div>
              <div className="w-full space-y-1.5 text-left text-xs text-muted-foreground">
                <p>Sidebar recolhida (56px)</p>
                <p>Grid 2 colunas</p>
                <p>Sheets laterais</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-3 pt-4 text-center">
              <Monitor className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Desktop</p>
                <p className="text-xs text-muted-foreground">≥ 1024px</p>
              </div>
              <div className="w-full space-y-1.5 text-left text-xs text-muted-foreground">
                <p>Sidebar expandida (220px)</p>
                <p>Grid multi-coluna</p>
                <p>Layout horizontal</p>
                <p>Dialogs centralizados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layout patterns */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Padrões de layout</h3>
          <div className="overflow-hidden rounded-[var(--radius-card)] border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-semibold">Elemento</th>
                  <th className="px-4 py-2 text-left font-semibold">Mobile</th>
                  <th className="px-4 py-2 text-left font-semibold">Desktop</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Navegação</td>
                  <td className="px-4 py-2 text-muted-foreground">Bottom nav (56px)</td>
                  <td className="px-4 py-2 text-muted-foreground">Sidebar (220px)</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Grid</td>
                  <td className="px-4 py-2 text-muted-foreground">1 coluna</td>
                  <td className="px-4 py-2 text-muted-foreground">2–3 colunas</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Modais</td>
                  <td className="px-4 py-2 text-muted-foreground">Sheet bottom full-screen</td>
                  <td className="px-4 py-2 text-muted-foreground">Dialog centralizado / Sheet lateral</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Touch targets</td>
                  <td className="px-4 py-2 text-muted-foreground">Mínimo 44×44px</td>
                  <td className="px-4 py-2 text-muted-foreground">Padrão (sem restrição extra)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Cada tela canônica tem versão mobile E desktop separadas. Breakpoints via Tailwind: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">md:</code> (768px) e <code className="rounded bg-muted px-1 py-0.5 text-[11px]">lg:</code> (1024px).
        </p>
      </div>
    </Section>
  )
}

/* ─── Ícones ─── */

function IconGrid({ items }: { items: { icon: React.ComponentType<{ className?: string }>; name: string; use: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(({ icon: Icon, name, use }) => (
        <div key={name} className="flex items-center gap-3 rounded-md border px-3 py-2">
          <Icon className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{use}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function IconesSection() {
  const navIcons = [
    { icon: LayoutDashboard, name: "LayoutDashboard", use: "Dashboard" },
    { icon: PiggyBank, name: "PiggyBank", use: "Orçamentos" },
    { icon: CheckSquare, name: "CheckSquare", use: "Checklist" },
    { icon: TrendingUp, name: "TrendingUp", use: "Projeção" },
  ]
  const configIcons = [
    { icon: Building2, name: "Building2", use: "Contas" },
    { icon: CreditCard, name: "CreditCard", use: "Cartões" },
    { icon: Landmark, name: "Landmark", use: "Investimentos" },
    { icon: Wallet, name: "Wallet", use: "Receitas" },
    { icon: Tags, name: "Tags", use: "Categorias" },
  ]
  const actionIcons = [
    { icon: Plus, name: "Plus", use: "Adicionar / FAB" },
    { icon: Pencil, name: "Pencil", use: "Editar" },
    { icon: Trash2, name: "Trash2", use: "Excluir" },
    { icon: Archive, name: "Archive", use: "Arquivar" },
    { icon: Copy, name: "Copy", use: "Duplicar" },
    { icon: LogOut, name: "LogOut", use: "Sair" },
    { icon: MoreVertical, name: "MoreVertical", use: "Menu de ações" },
    { icon: Settings, name: "Settings", use: "Configurações" },
  ]
  const feedbackIcons = [
    { icon: CheckCircle2, name: "CheckCircle2", use: "Sucesso" },
    { icon: AlertTriangle, name: "AlertTriangle", use: "Erro / Warning" },
    { icon: Clock, name: "Clock", use: "Informativo / Pendente" },
    { icon: Loader2, name: "Loader2", use: "Loading (animate-spin)" },
  ]

  return (
    <Section id="icones" title="Ícones">
      <div className="space-y-6">
        {/* Specs */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Especificações</h3>
          <div className="overflow-hidden rounded-[var(--radius-card)] border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-semibold">Aspecto</th>
                  <th className="px-4 py-2 text-left font-semibold">Regra</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Biblioteca</td>
                  <td className="px-4 py-2 text-muted-foreground">Lucide React (exclusivamente)</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Tamanho inline</td>
                  <td className="px-4 py-2 text-muted-foreground"><code className="rounded bg-muted px-1 py-0.5 text-[11px]">size-4</code> (16px)</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Tamanho nav</td>
                  <td className="px-4 py-2 text-muted-foreground"><code className="rounded bg-muted px-1 py-0.5 text-[11px]">size-5</code> (20px)</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Stroke width</td>
                  <td className="px-4 py-2 text-muted-foreground">1.5px (padrão Lucide)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Cores</td>
                  <td className="px-4 py-2 text-muted-foreground">Semânticas via Tailwind (<code className="rounded bg-muted px-1 py-0.5 text-[11px]">text-primary</code>, <code className="rounded bg-muted px-1 py-0.5 text-[11px]">text-muted-foreground</code>, etc.)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tamanhos visuais */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Tamanhos</h3>
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">size-4 (16px)</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <LayoutDashboard className="size-5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">size-5 (20px)</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <LayoutDashboard className="size-6 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">size-6 (24px)</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <LayoutDashboard className="size-8 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">size-8 (32px)</span>
            </div>
          </div>
        </div>

        {/* Catálogo — Navegação */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Navegação (sidebar + bottom nav)</h3>
          <IconGrid items={navIcons} />
        </div>

        {/* Catálogo — Configurações */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Configurações</h3>
          <IconGrid items={configIcons} />
        </div>

        {/* Catálogo — Ações */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Ações comuns</h3>
          <IconGrid items={actionIcons} />
        </div>

        {/* Catálogo — Feedback */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Feedback / Status</h3>
          <IconGrid items={feedbackIcons} />
        </div>
      </div>
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

        <div>
          <h3 className="mb-3 text-sm font-medium">Spinner (ações pontuais)</h3>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-[11px] text-muted-foreground">Salvando...</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Calculando...</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Skeleton: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">animate-pulse bg-muted</code> — replica layout real com placeholders. Transição skeleton → conteúdo: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">fade-in 200ms ease</code>. Spinner: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">Loader2 animate-spin</code> para ações pontuais (salvar, calcular). Transições &lt; 300ms não mostram loading (optimistic UI).
      </p>
    </Section>
  )
}

/* ═══════════════════════════════════════════════
   NOVAS SEÇÕES — Controles
   ═══════════════════════════════════════════════ */

/* ─── Toggle Switch ─── */

function ToggleSwitchComp({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-input"
      }`}
    >
      <span
        className={`pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

function ToggleSwitchSection() {
  const [notif, setNotif] = useState(true)
  const [sound, setSound] = useState(false)
  const [dark, setDark] = useState(false)

  return (
    <Section id="toggle-switch" title="Toggle Switch">
      <div className="max-w-sm space-y-4">
        <div className="flex items-center justify-between rounded-[var(--radius-card)] border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Notificações por email</p>
            <p className="text-xs text-muted-foreground">Receba alertas de vencimento</p>
          </div>
          <ToggleSwitchComp checked={notif} onChange={setNotif} />
        </div>
        <div className="flex items-center justify-between rounded-[var(--radius-card)] border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Sons</p>
            <p className="text-xs text-muted-foreground">Feedback sonoro nas ações</p>
          </div>
          <ToggleSwitchComp checked={sound} onChange={setSound} />
        </div>
        <div className="flex items-center justify-between rounded-[var(--radius-card)] border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Modo escuro</p>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </div>
          <ToggleSwitchComp checked={dark} onChange={setDark} disabled />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-14: label + descrição à esquerda, toggle à direita. Ligado: bg-primary. Desligado: bg-input. 44×24px.
      </p>
    </Section>
  )
}

/* ─── Chips / Seletor ─── */

function ChipsSection() {
  const [selected, setSelected] = useState<string[]>(["Alimentação", "Transporte"])
  const options = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Vestuário", "Assinaturas"]

  const toggle = (opt: string) => {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    )
  }

  return (
    <Section id="chips" title="Chips / Seletor">
      <div className="space-y-4">
        <div>
          <h3 className="mb-3 text-sm font-medium">Multi-seleção (categorias)</h3>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const isSelected = selected.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`cursor-pointer rounded-badge px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium">Chips compactos (filtros)</h3>
          <div className="flex flex-wrap gap-1.5">
            {["Essencial", "Qualidade de vida", "Supérfluo"].map((opt, i) => (
              <span
                key={opt}
                className={`rounded-badge px-2.5 py-1 text-xs font-medium ${
                  i === 0
                    ? "bg-primary-light text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {opt}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-07: grid de chips selecionáveis. Selecionado: bg-primary + text-white. Não selecionado: bg-muted. Border-radius pill.
      </p>
    </Section>
  )
}

/* ─── Divider com Texto ─── */

function DividerTextoSection() {
  return (
    <Section id="divider-texto" title="Divider com Texto">
      <div className="max-w-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">continuar com</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="h-px w-full bg-border" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-01: linha horizontal com texto centralizado. Usado entre form de login e botão OAuth.
      </p>
    </Section>
  )
}

/* ─── Breadcrumbs ─── */

function BreadcrumbsSection() {
  return (
    <Section id="breadcrumbs" title="Breadcrumbs">
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-sm">
          <a href="#breadcrumbs" className="text-primary hover:underline">Mar 2026</a>
          <span className="text-muted-foreground">›</span>
          <a href="#breadcrumbs" className="text-primary hover:underline">Essenciais</a>
          <span className="text-muted-foreground">›</span>
          <span className="font-medium text-foreground">Alimentação</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <a href="#breadcrumbs" className="text-primary hover:underline">Mar 2026</a>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium text-foreground">Essenciais</span>
          </div>
          <a href="#breadcrumbs" className="flex items-center gap-1 text-xs text-primary hover:underline">
            <ChevronLeft className="size-3" />
            Voltar
          </a>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm">
            <a href="#breadcrumbs" className="text-primary hover:underline">Mar 2026</a>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium text-foreground">Essenciais — R$ 7.680,00</span>
          </div>
          <p className="text-xs text-muted-foreground">83,00% do orçamento de R$ 9.258,00</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-09: navegação hierárquica. Separador ›. Item atual sem link + font-medium. Link &ldquo;Voltar&rdquo; opcional com chevron.
      </p>
    </Section>
  )
}

/* ─── Step Indicator ─── */

function StepIndicatorSection() {
  return (
    <Section id="step-indicator" title="Step Indicator">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Dots (proto-07, proto-08)</h3>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`size-2.5 rounded-full transition-colors ${
                  step <= 2 ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">Passo 2 de 4</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium">Barra de progresso (onboarding)</h3>
          <div className="mx-auto max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-3/5 rounded-full bg-primary transition-all" />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Passo 3 de 5</p>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium">Steps numerados (cascade input)</h3>
          <div className="flex items-center gap-0">
            {["Valor", "Categoria", "Detalhes", "Confirmar"].map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                      i < 2
                        ? "bg-primary text-white"
                        : i === 2
                          ? "border-2 border-primary text-primary"
                          : "border-2 border-muted text-muted-foreground"
                    }`}
                  >
                    {i < 2 ? "✓" : i + 1}
                  </div>
                  <span className={`text-[11px] ${i <= 2 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div className={`mx-2 h-0.5 w-8 ${i < 2 ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        3 variantes: dots (simples), barra (onboarding), numerado (cascade). Ativo: bg-primary. Completo: ✓. Futuro: bg-muted.
      </p>
    </Section>
  )
}

/* ═══════════════════════════════════════════════
   NOVAS SEÇÕES — Visualizações
   ═══════════════════════════════════════════════ */

/* ─── Grade Timeline ─── */

const timelineCategories = [
  { name: "Escola", emoji: "🎓", values: [2800, 2800, 2800, 2800], budgets: [2800, 2800, 2800, 2800] },
  { name: "Supermercado", emoji: "🛒", values: [2122, 2550, 2400, 2500], budgets: [3000, 2550, 2400, 2500] },
  { name: "Moradia", emoji: "🏠", values: [1800, 1700, 1800, 1700], budgets: [2200, 1700, 1800, 1700] },
  { name: "Gasolina", emoji: "⛽", values: [420, 450, 450, 500], budgets: [600, 450, 450, 500] },
  { name: "Transporte", emoji: "🚌", values: [380, 400, 380, 380], budgets: [500, 400, 380, 380] },
  { name: "Internet", emoji: "🌐", values: [158, 158, 158, 158], budgets: [158, 158, 158, 158] },
]

const timelineMonths = ["Mar 2026", "Abr 2026", "Mai 2026", "Jun 2026"]

function GradeTimelineSection() {
  return (
    <Section id="grade-timeline" title="Grade Timeline">
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[140px_repeat(4,1fr)] border-b pb-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Categoria</div>
            {timelineMonths.map((month, i) => (
              <div
                key={month}
                className={`text-center text-sm font-semibold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Classification header */}
          <div className="mt-3 mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
            Essenciais
          </div>

          {/* Rows */}
          {timelineCategories.map((cat) => (
            <div key={cat.name} className="grid grid-cols-[140px_repeat(4,1fr)] items-center border-b border-dashed py-2.5">
              <div className="flex items-center gap-2 text-sm">
                <span>{cat.emoji}</span>
                <span className="font-medium">{cat.name}</span>
              </div>
              {cat.values.map((val, i) => {
                const pct = Math.min((val / cat.budgets[i]) * 100, 100)
                const isCurrentMonth = i === 0
                const color = pct >= 100 ? "bg-primary" : pct >= 80 ? "bg-attention" : "bg-positive"
                return (
                  <div key={i} className="px-2">
                    <div className="relative h-6 overflow-hidden rounded-md bg-muted">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-md ${color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white mix-blend-difference">
                        R$ {val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-center text-[10px] text-muted-foreground tabular-nums">
                      {isCurrentMonth
                        ? `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ ${cat.budgets[i].toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : `~R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    </p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Padrão do proto-09 (view Timeline): grade categoria × mês. Barra inline com valor sobreposto. Mês atual: gasto/orçado. Futuros: ~estimativa. Verde (ok), amarelo (&gt;80%), roxo (fixo 100%).
      </p>
    </Section>
  )
}

/* ─── Treemap / Mapa Visual ─── */

/* ── Squarified Treemap algorithm ── */

interface TreemapItem {
  name: string
  value: number
  bg: string
  textColor: string
}

interface TreemapRect {
  item: TreemapItem
  x: number
  y: number
  w: number
  h: number
}

function squarify(
  items: TreemapItem[],
  containerW: number,
  containerH: number,
): TreemapRect[] {
  const totalValue = items.reduce((s, i) => s + i.value, 0)
  const totalArea = containerW * containerH
  const sorted = [...items].sort((a, b) => b.value - a.value)

  const area = (item: TreemapItem) => (item.value / totalValue) * totalArea

  const rects: TreemapRect[] = []
  let x = 0
  let y = 0
  let w = containerW
  let h = containerH

  function worstRatio(row: TreemapItem[], side: number): number {
    const rowArea = row.reduce((s, item) => s + area(item), 0)
    const thickness = rowArea / side
    let worst = 0
    for (const item of row) {
      const itemLen = area(item) / thickness
      const ratio = Math.max(itemLen / thickness, thickness / itemLen)
      worst = Math.max(worst, ratio)
    }
    return worst
  }

  function layoutRow(row: TreemapItem[]) {
    const rowArea = row.reduce((s, item) => s + area(item), 0)

    if (w >= h) {
      // Lado curto = h → coluna na esquerda
      const colW = rowArea / h
      let cy = y
      for (const item of row) {
        const itemH = area(item) / colW
        rects.push({ item, x, y: cy, w: colW, h: itemH })
        cy += itemH
      }
      x += colW
      w -= colW
    } else {
      // Lado curto = w → faixa no topo
      const rowH = rowArea / w
      let cx = x
      for (const item of row) {
        const itemW = area(item) / rowH
        rects.push({ item, x: cx, y, w: itemW, h: rowH })
        cx += itemW
      }
      y += rowH
      h -= rowH
    }
  }

  let remaining = [...sorted]

  while (remaining.length > 0) {
    const shortSide = Math.min(w, h)

    const row: TreemapItem[] = [remaining[0]]
    remaining = remaining.slice(1)

    let currentWorst = worstRatio(row, shortSide)

    while (remaining.length > 0) {
      const candidate = remaining[0]
      const newRow = [...row, candidate]
      const newWorst = worstRatio(newRow, shortSide)

      if (newWorst <= currentWorst) {
        row.push(candidate)
        currentWorst = newWorst
        remaining = remaining.slice(1)
      } else {
        break
      }
    }

    layoutRow(row)
  }

  return rects
}

const treemapItems: TreemapItem[] = [
  { name: "Escola", value: 2800, bg: "#818CF8", textColor: "white" },
  { name: "Supermercado", value: 2122, bg: "#86EFAC", textColor: "#1C1917" },
  { name: "Moradia", value: 1800, bg: "#FDE68A", textColor: "#1C1917" },
  { name: "Saúde", value: 950, bg: "#FDA4AF", textColor: "#1C1917" },
  { name: "Gasolina", value: 420, bg: "#67E8F9", textColor: "#1C1917" },
  { name: "Transporte", value: 380, bg: "#C4B5FD", textColor: "#1C1917" },
  { name: "Lazer", value: 320, bg: "#FCA5A5", textColor: "#1C1917" },
  { name: "Internet", value: 158, bg: "#A5B4FC", textColor: "white" },
  { name: "Assinaturas", value: 140, bg: "#86EFAC", textColor: "#1C1917" },
  { name: "Pets", value: 95, bg: "#FDE68A", textColor: "#1C1917" },
  { name: "Vestuário", value: 80, bg: "#FDA4AF", textColor: "#1C1917" },
]

const TREEMAP_W = 760
const TREEMAP_H = 420

const treemapRects = squarify(treemapItems, TREEMAP_W, TREEMAP_H)
const treemapTotal = treemapItems.reduce((s, i) => s + i.value, 0)

function TreemapSection() {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <Section id="treemap" title="Treemap / Mapa Visual">
      <div className="relative space-y-4">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-[var(--radius-card)]"
          style={{ width: TREEMAP_W, height: TREEMAP_H }}
          onMouseLeave={() => setHoveredBlock(null)}
        >
          {treemapRects.map((r) => {
            const pct = ((r.item.value / treemapTotal) * 100).toFixed(1)
            const isTiny = r.w < 80 && r.h < 50
            return (
              <div
                key={r.item.name}
                className="absolute cursor-pointer border border-white/30 overflow-hidden transition-opacity hover:opacity-85"
                style={{
                  left: r.x,
                  top: r.y,
                  width: r.w,
                  height: r.h,
                  backgroundColor: r.item.bg,
                  color: r.item.textColor,
                }}
                onMouseEnter={(e) => {
                  setHoveredBlock(r.item.name)
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (rect) {
                    const tx = e.clientX - rect.left
                    const ty = e.clientY - rect.top
                    setTooltipPos({
                      x: tx > TREEMAP_W - 200 ? tx - 200 : tx + 12,
                      y: ty > TREEMAP_H - 80 ? ty - 80 : ty + 12,
                    })
                  }
                }}
                onMouseMove={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (rect) {
                    const tx = e.clientX - rect.left
                    const ty = e.clientY - rect.top
                    setTooltipPos({
                      x: tx > TREEMAP_W - 200 ? tx - 200 : tx + 12,
                      y: ty > TREEMAP_H - 80 ? ty - 80 : ty + 12,
                    })
                  }
                }}
              >
                <div className="flex h-full flex-col p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80 leading-tight">
                    {r.item.name}
                  </p>
                  {!isTiny && (
                    <>
                      <p className="mt-0.5 text-sm font-bold leading-tight">
                        R$ {r.item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] opacity-60">{pct}%</p>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tooltip flutuante — fora do overflow-hidden */}
        {hoveredBlock && (() => {
          const item = treemapItems.find(i => i.name === hoveredBlock)
          if (!item) return null
          const pct = ((item.value / treemapTotal) * 100).toFixed(1)
          return (
            <div
              className="pointer-events-none absolute z-10 rounded-lg bg-[#1C1917] px-4 py-3 text-white shadow-lg"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <p className="text-sm font-semibold">{item.name}</p>
              <div className="mt-1.5 space-y-0.5 text-xs">
                <div className="flex justify-between gap-6"><span className="text-white/60">Gasto</span><span className="font-medium tabular-nums">R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between gap-6"><span className="text-white/60">% do total</span><span className="font-medium tabular-nums">{pct}%</span></div>
              </div>
            </div>
          )
        })()}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Treemap squarified real: retângulos com área proporcional ao valor. 11 categorias. Hover mostra tooltip escuro. Cores por classificação. No app real: orçamento + barra de progresso + drill-down por grupo.
      </p>
    </Section>
  )
}

/* ─── Mapa de Gastos (layout simplificado para comparação) ─── */

const mapaGastosData = [
  { name: "ESCOLA", value: 2800, pct: 36, color: "bg-[#818CF8]", textColor: "text-white" },
  { name: "SUPERMERCADO", value: 2122, pct: 28, color: "bg-[#86EFAC]", textColor: "text-foreground" },
  { name: "MORADIA", value: 1800, pct: 23, color: "bg-[#FDE68A]", textColor: "text-foreground" },
]

const mapaGastosSmall = [
  { name: "GASOLINA", value: 420, color: "bg-[#86EFAC]" },
  { name: "TRANSPORTE", value: 380, color: "bg-[#FDE68A]" },
  { name: "INTERNET", value: 158, color: "bg-[#818CF8]" },
]

function MapaGastosSection() {
  return (
    <Section id="mapa-gastos" title="Mapa de Gastos (alternativo)">
      <div className="space-y-4">
        <div className="relative flex h-64 gap-1 overflow-hidden rounded-[var(--radius-card)]">
          {mapaGastosData.map((item) => (
            <div
              key={item.name}
              className={`${item.color} relative cursor-pointer rounded-lg p-3 transition-opacity hover:opacity-90`}
              style={{ width: `${item.pct}%` }}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${item.textColor} opacity-80`}>
                {item.name}
              </p>
              <p className={`text-xl font-bold ${item.textColor}`}>
                R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs ${item.textColor} opacity-70`}>
                {item.pct.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}% do total
              </p>
              <div className={`absolute inset-x-3 bottom-3 text-[10px] ${item.textColor} opacity-60`}>
                <p>Orçam. R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <div className="mt-0.5 h-0.5 rounded-full bg-positive" />
                <p className="mt-0.5">Latam Pass Visa</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {mapaGastosSmall.map((item) => (
            <div
              key={item.name}
              className={`${item.color} flex-1 cursor-pointer rounded-lg p-2.5 transition-opacity hover:opacity-90`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                {item.name}
              </p>
              <p className="text-sm font-bold text-foreground">
                R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Layout simplificado: blocos com largura proporcional (%) e altura fixa. Comparar com o Treemap real acima para decidir qual modelo usar no app.
      </p>
    </Section>
  )
}

/* ─── Tooltip de Detalhe ─── */

function TooltipDetalheSection() {
  return (
    <Section id="tooltip-detalhe" title="Tooltip de Detalhe">
      <div className="flex flex-wrap gap-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Escuro (treemap hover)</h3>
          <div className="inline-block rounded-lg bg-[#1C1917] px-4 py-3 text-white shadow-lg">
            <p className="text-sm font-semibold">Supermercado</p>
            <div className="mt-1.5 space-y-0.5 text-xs">
              <div className="flex justify-between gap-8"><span className="text-white/60">Orçamento</span><span className="font-medium tabular-nums">R$ 3.000,00</span></div>
              <div className="flex justify-between gap-8"><span className="text-white/60">Gasto</span><span className="font-medium tabular-nums">R$ 2.122,00</span></div>
              <div className="flex justify-between gap-8"><span className="text-white/60">Resta</span><span className="font-medium tabular-nums">R$ 878,00</span></div>
              <div className="flex justify-between gap-8"><span className="text-white/60">Uso</span><span className="font-medium tabular-nums">70,00%</span></div>
            </div>
            <p className="mt-2 text-[11px] text-white/50">Latam Pass Visa</p>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium">Claro (cell hover)</h3>
          <div className="inline-block rounded-lg border bg-white px-4 py-3 shadow-md">
            <p className="text-sm font-semibold text-foreground">Internet</p>
            <div className="mt-1.5 space-y-0.5 text-xs">
              <div className="flex justify-between gap-8"><span className="text-muted-foreground">Orçam.</span><span className="font-medium tabular-nums">R$ 158,00</span></div>
              <div className="flex justify-between gap-8"><span className="text-muted-foreground">Gasto</span><span className="font-medium tabular-nums">R$ 158,00</span></div>
              <div className="flex justify-between gap-8"><span className="text-muted-foreground">Status</span><span className="font-medium text-primary">Fixo</span></div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        2 variantes: escuro (bg-foreground, treemap) e claro (bg-white border, tabelas). Labels opacity 60%, valores font-medium tabular-nums.
      </p>
    </Section>
  )
}

/* ─── Legenda ─── */

function LegendaSection() {
  return (
    <Section id="legenda" title="Legenda">
      <div className="space-y-4">
        <div>
          <h3 className="mb-3 text-sm font-medium">Dots coloridos (proto-09)</h3>
          <div className="flex flex-wrap items-center gap-4 text-[13px]">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-positive" />
              Dentro do orçamento
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-attention" />
              Atenção (&gt;80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" />
              Custo fixo (100%)
            </span>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium">Ícones (proto-11)</h3>
          <div className="flex flex-wrap items-center gap-4 text-[13px]">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm border bg-white" />
              Fixo (não arrastável)
            </span>
            <span className="flex items-center gap-1.5">
              <GripVertical className="size-3 text-muted-foreground" />
              Planejado (arrastável)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm border-2 border-positive bg-positive-bg" />
              Margem positiva
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm border-2 border-critical bg-critical-bg" />
              Margem negativa
            </span>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium">Badges (classificações)</h3>
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <Badge className="border-transparent bg-primary-light text-primary">Essencial</Badge>
            <Badge className="border-transparent bg-attention-bg text-attention-text">Qualidade de vida</Badge>
            <Badge className="border-transparent bg-alert-bg text-alert-text">Supérfluo</Badge>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        3 variantes: dots (simples), ícones (proto-11), badges (classificações). Posicionada acima do conteúdo, gap-4, text-13px.
      </p>
    </Section>
  )
}

/* ═══════════════════════════════════════════════
   NOVAS SEÇÕES — Layout & Navegação
   ═══════════════════════════════════════════════ */

/* ─── Bottom Navigation ─── */

function BottomNavigationSection() {
  const [active, setActive] = useState("Dashboard")
  const items = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: PiggyBank, label: "Orçamentos" },
    { icon: Plus, label: "Novo", special: true },
    { icon: CheckSquare, label: "Checklist" },
    { icon: TrendingUp, label: "Projeção" },
  ]

  return (
    <Section id="bottom-navigation" title="Bottom Navigation">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Mobile bottom bar (proto-06)</h3>
          <div className="mx-auto w-[375px] overflow-hidden rounded-[24px] border-2 border-foreground/10 bg-background">
            <div className="flex h-48 items-center justify-center bg-muted/30">
              <span className="text-sm text-muted-foreground">Conteúdo da tela</span>
            </div>
            <div className="flex items-end justify-around border-t bg-white px-2 pb-5 pt-2">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = active === item.label
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActive(item.label)}
                    className={`flex cursor-pointer flex-col items-center gap-0.5 ${
                      item.special ? "" : "min-w-[56px]"
                    }`}
                  >
                    {item.special ? (
                      <div className="flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-md">
                        <Icon className="size-5" />
                      </div>
                    ) : (
                      <>
                        <Icon className={`size-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Layout</p>
            <p className="text-muted-foreground">5 itens, justify-around, border-top, pb safe-area (20px)</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Item ativo</p>
            <p className="text-muted-foreground">text-primary, ícone + label coloridos</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Botão central (FAB)</p>
            <p className="text-muted-foreground">44px circular, bg-primary, shadow-md, elevado</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Safe area</p>
            <p className="text-muted-foreground">padding-bottom 20px para notch/home indicator</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Bottom Sheet ─── */

function BottomSheetSection() {
  const [open, setOpen] = useState(false)

  return (
    <Section id="bottom-sheet" title="Bottom Sheet">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">Drawer inferior (proto-07)</h3>
          <div className="relative mx-auto w-[375px] overflow-hidden rounded-[24px] border-2 border-foreground/10 bg-background">
            <div className="flex h-72 flex-col items-center justify-center gap-3 bg-muted/30">
              <span className="text-sm text-muted-foreground">Conteúdo atrás</span>
              <Button size="sm" onClick={() => setOpen(!open)}>
                {open ? "Fechar sheet" : "Abrir bottom sheet"}
              </Button>
            </div>

            {/* Overlay */}
            {open && (
              <div
                className="absolute inset-0 z-10 bg-black/25 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
              />
            )}

            {/* Bottom sheet */}
            <div
              className={`absolute inset-x-0 bottom-0 z-20 transform rounded-t-2xl bg-white shadow-[0_-4px_25px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
                open ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex justify-center py-3">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between border-b px-5 pb-3">
                <h3 className="text-base font-semibold">Selecione a categoria</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-1 p-4">
                {["🍔 Alimentação", "🚗 Transporte", "🏠 Moradia", "💊 Saúde", "📚 Educação"].map((cat) => (
                  <div
                    key={cat}
                    className="cursor-pointer rounded-button px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    {cat}
                  </div>
                ))}
              </div>
              <div className="h-5" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Handle</p>
            <p className="text-muted-foreground">40×4px, rounded-full, bg-muted-foreground/30, centralizado</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Overlay</p>
            <p className="text-muted-foreground">bg-black/25 + backdrop-blur-sm (mesmo do Dialog)</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Cantos</p>
            <p className="text-muted-foreground">rounded-t-2xl (16px) — só topo arredondado</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Shadow</p>
            <p className="text-muted-foreground">shadow para cima: 0 -4px 25px rgba(0,0,0,0.1)</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Componentes Compostos: CurrencyInput ─── */

function CurrencyInputSection() {
  const [cents, setCents] = useState(0)
  const [centsWithError, setCentsWithError] = useState(0)

  return (
    <Section id="currency-input" title="CurrencyInput">
      <div className="max-w-sm space-y-6">
        <CurrencyInput
          value={cents}
          onChange={setCents}
          label="Saldo inicial (R$)"
          id="ds-currency"
          placeholder="R$ 0,00"
        />
        <p className="text-xs text-muted-foreground">
          Valor em centavos: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{cents}</code>
        </p>

        <CurrencyInput
          value={centsWithError}
          onChange={setCentsWithError}
          label="Limite mensal (R$)"
          id="ds-currency-error"
          error="Valor deve ser maior que zero"
        />

        <CurrencyInput
          value={150000}
          onChange={() => {}}
          label="Valor fixo (disabled)"
          id="ds-currency-disabled"
          disabled
        />

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Props</p>
            <p className="text-muted-foreground">value (cents), onChange, label, placeholder, error, id, disabled, className, labelClassName</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Comportamento</p>
            <p className="text-muted-foreground">Digita só números, vírgula posiciona automaticamente. Prefixo &quot;R$&quot; sempre visível.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Componentes Compostos: PercentageInput ─── */

function PercentageInputSection() {
  const [bp, setBp] = useState(0)
  const [bpWithError, setBpWithError] = useState(0)

  return (
    <Section id="percentage-input" title="PercentageInput">
      <div className="max-w-sm space-y-6">
        <PercentageInput
          value={bp}
          onChange={setBp}
          label="Rendimento anual (%)"
          id="ds-percentage"
          placeholder="0,00"
        />
        <p className="text-xs text-muted-foreground">
          Valor em basis points: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{bp}</code>
        </p>

        <PercentageInput
          value={bpWithError}
          onChange={setBpWithError}
          label="Taxa de juros (%)"
          id="ds-percentage-error"
          error="Informe a taxa"
        />

        <PercentageInput
          value={1250}
          onChange={() => {}}
          label="Taxa fixa (disabled)"
          id="ds-percentage-disabled"
          disabled
        />

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Props</p>
            <p className="text-muted-foreground">value (basis points), onChange, label, placeholder, error, id, disabled, className, labelClassName</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Comportamento</p>
            <p className="text-muted-foreground">Digita só números, vírgula automática. Sufixo &quot;%&quot; posicionado à direita.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Componentes Compostos: PageHeader ─── */

function PageHeaderSection() {
  return (
    <Section id="page-header" title="PageHeader">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Título simples</p>
          <div className="rounded-card border p-4">
            <PageHeader title="Contas Bancárias" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Com descrição</p>
          <div className="rounded-card border p-4">
            <PageHeader
              title="Categorias"
              description="Organize seus gastos em uma hierarquia: classificação → categoria → subcategoria"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Com ação (children)</p>
          <div className="rounded-card border p-4">
            <PageHeader title="Investimentos">
              <Button>Novo Investimento</Button>
            </PageHeader>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Props</p>
            <p className="text-muted-foreground">title, description?, children?</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Layout</p>
            <p className="text-muted-foreground">flex items-center justify-between. Título H1 text-2xl font-bold, descrição text-sm text-muted-foreground.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Componentes Novos (Épico 3): BudgetProgressBar ─── */

function BudgetProgressBarSection() {
  return (
    <Section id="budget-progress-bar" title="BudgetProgressBar">
      <div className="max-w-lg space-y-8">
        {/* 4 faixas de cor */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Faixas de cor (inline)</p>
          <div className="space-y-3 rounded-[var(--radius-card)] border p-4">
            <BudgetProgressBar spent={30000} budget={100000} label="Verde (30%)" showPercentage variant="inline" />
            <BudgetProgressBar spent={70000} budget={100000} label="Amarelo (70%)" showPercentage variant="inline" />
            <BudgetProgressBar spent={92000} budget={100000} label="Laranja (92%)" showPercentage variant="inline" />
            <BudgetProgressBar spent={115000} budget={100000} label="Vermelho (115%)" showPercentage variant="inline" />
          </div>
        </div>

        {/* Expanded com showRemainder */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Variante expanded com resta/excedeu</p>
          <div className="space-y-4 rounded-[var(--radius-card)] border p-4">
            <BudgetProgressBar spent={75000} budget={100000} label="Alimentação" showValues showPercentage showRemainder variant="expanded" />
            <BudgetProgressBar spent={115000} budget={100000} label="Excedeu" showValues showPercentage showRemainder variant="expanded" />
          </div>
        </div>

        {/* Mini */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Variante mini</p>
          <div className="flex items-center gap-4 rounded-[var(--radius-card)] border p-4">
            <span className="text-sm text-muted-foreground">Dentro de card</span>
            <BudgetProgressBar spent={60000} budget={100000} variant="mini" className="flex-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Props</p>
            <p className="text-muted-foreground">spent, budget (centavos), label?, showValues?, showPercentage?, showRemainder?, variant? (inline|expanded|mini)</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Cores (proto-14)</p>
            <p className="text-muted-foreground">&le;60% positive, 60-80% attention, 80-100% alert, &gt;100% critical</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Componentes Novos (Épico 3): SummaryCard ─── */

function SummaryCardSection() {
  return (
    <Section id="summary-card-component" title="SummaryCard (Componente)">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Variante default</p>
          <div className="grid max-w-2xl grid-cols-3 gap-4">
            <SummaryCard label="Receita" value="R$ 8.200,00" trend="positive" trendLabel="+12% vs mês anterior" />
            <SummaryCard label="Gastos" value="R$ 5.300,00" trend="negative" trendLabel="-8% vs mês anterior" />
            <SummaryCard label="Saldo" value="R$ 2.900,00" trend="neutral" trendLabel="Sem variação" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Variante compact com ícone</p>
          <div className="grid max-w-2xl grid-cols-3 gap-4">
            <SummaryCard label="Carteira" value="R$ 3.500,00" icon={Wallet} variant="compact" trend="positive" trendLabel="+5%" />
            <SummaryCard label="Investimentos" value="R$ 12.000,00" icon={TrendingUp} variant="compact" />
            <SummaryCard label="Dívidas" value="R$ 0,00" icon={CreditCard} variant="compact" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Props</p>
            <p className="text-muted-foreground">label, value, trend? (positive|negative|neutral), trendLabel?, icon?, variant? (default|compact)</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Base</p>
            <p className="text-muted-foreground">Usa Card shadcn. Trend positivo = verde + seta up, negativo = vermelho + seta down.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Componentes Novos (Épico 3): ImpactPreview ─── */

function ImpactPreviewSection() {
  return (
    <Section id="impact-preview" title="ImpactPreview">
      <div className="max-w-md space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Normal (dentro do orçamento)</p>
          <ImpactPreview
            items={[
              { label: "Alimentação", before: 45000, after: 48500, budget: 80000 },
              { label: "Transporte", before: 15000, after: 12000 },
            ]}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Atenção (&gt;85% do orçamento)</p>
          <ImpactPreview
            items={[
              { label: "Alimentação", before: 65000, after: 72000, budget: 80000 },
            ]}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Excede orçamento</p>
          <ImpactPreview
            items={[
              { label: "Alimentação", before: 75000, after: 92000, budget: 80000 },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Props</p>
            <p className="text-muted-foreground">items (label, before, after, budget?), variant? (inline|sheet), warningThreshold?</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Comportamento</p>
            <p className="text-muted-foreground">Seta verde = diminui, vermelha = aumenta. Mini budget bar se item tem budget. Badge vermelho se excede.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Componentes Novos (Épico 3): BottomNavigation (Componente) ─── */

function BottomNavigationComponentSection() {
  const [active, setActive] = useState("dashboard")

  return (
    <Section id="bottom-navigation-component" title="BottomNavigation (Componente)">
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Barra completa com badge</p>
          <div className="mx-auto w-[375px] overflow-hidden rounded-[24px] border-2 border-foreground/10 bg-background">
            <div className="flex h-48 items-center justify-center bg-muted/30">
              <span className="text-sm text-muted-foreground">Item ativo: {active}</span>
            </div>
            <BottomNavigation
              activeItem={active}
              onNavigate={setActive}
              onFabClick={() => toast.info("FAB clicado! Abre CascadeInput")}
              badges={{ checklist: 3 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Props</p>
            <p className="text-muted-foreground">activeItem, onNavigate, onFabClick, badges?</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">FAB</p>
            <p className="text-muted-foreground">48px circular, bg-indigo-600, elevado. Clique dispara onFabClick.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Componentes Novos (Épico 3): CascadeInput ─── */

function CascadeInputSection() {
  const [result, setResult] = useState<string | null>(null)

  const mockClassifications = [
    { id: "ess", name: "Essencial", emoji: "🏠" },
    { id: "des", name: "Desejável", emoji: "🎯" },
    { id: "sup", name: "Supérfluo", emoji: "✨" },
  ]

  const mockCategories = [
    { id: "alim", name: "Alimentação", classificationId: "ess", budget: 80000 },
    { id: "trans", name: "Transporte", classificationId: "ess", budget: 30000 },
    { id: "moradia", name: "Moradia", classificationId: "ess", budget: 150000 },
    { id: "lazer", name: "Lazer", classificationId: "des", budget: 40000 },
    { id: "educ", name: "Educação", classificationId: "des", budget: 50000 },
    { id: "luxo", name: "Luxo", classificationId: "sup" },
  ]

  const mockPaymentMethods = [
    { id: "pix", label: "Pix", type: "pix" as const },
    { id: "deb-nu", label: "Débito Nubank", type: "debit" as const },
    { id: "cred-nu", label: "Crédito Nubank", type: "credit" as const },
  ]

  return (
    <Section id="cascade-input-component" title="CascadeInput">
      <div className="space-y-6">
        <p className="text-xs font-medium text-muted-foreground">Fluxo interativo de registro rápido (4 etapas)</p>
        <div className="mx-auto max-w-sm rounded-[var(--radius-card)] border p-6">
          <CascadeInput
            classifications={mockClassifications}
            categories={mockCategories}
            suggestedEstablishments={["Supermercado BH", "iFood", "Posto Shell", "Padaria Real", "Uber"]}
            paymentMethods={mockPaymentMethods}
            defaultPaymentMethodId="pix"
            onConfirm={(data) => setResult(JSON.stringify(data, null, 2))}
            onCancel={() => setResult("Cancelado")}
          />
        </div>

        {result && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Resultado</p>
            <pre className="max-w-sm rounded-md bg-muted p-3 text-xs">{result}</pre>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="font-medium">Steps</p>
            <p className="text-muted-foreground">1. Valor (CurrencyInput) → 2. Classificação + Categoria → 3. Estabelecimento + Pagamento + ImpactPreview → 4. Confirmação</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Props principais</p>
            <p className="text-muted-foreground">classifications, categories, paymentMethods, onConfirm, onCancel. Emite CascadeInputData.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
