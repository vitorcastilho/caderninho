const sections = [
  // Fundamentos
  { id: "cores", label: "Cores / Tokens" },
  { id: "tipografia", label: "Tipografia" },
  { id: "cursores", label: "Cursores" },
  { id: "espacamento", label: "Espaçamento" },
  // Componentes base
  { id: "botoes", label: "Botões" },
  { id: "formularios", label: "Formulários" },
  { id: "badges", label: "Badges" },
  { id: "cards", label: "Cards" },
  { id: "tabelas", label: "Tabelas" },
  { id: "tabs", label: "Tabs" },
  { id: "dialogs", label: "Dialogs & Sheets" },
  { id: "dropdown-menu", label: "Dropdown Menu" },
  { id: "toast", label: "Toast / Notificações" },
  { id: "skeleton", label: "Skeleton" },
  // Controles
  { id: "toggle-switch", label: "Toggle Switch" },
  { id: "chips", label: "Chips / Seletor" },
  { id: "divider-texto", label: "Divider com Texto" },
  { id: "breadcrumbs", label: "Breadcrumbs" },
  { id: "step-indicator", label: "Step Indicator" },
  // Composições
  { id: "banners", label: "Banners" },
  { id: "summary-cards", label: "Summary Cards" },
  { id: "barras-progresso", label: "Barras de Progresso" },
  { id: "progress-ring", label: "Progress Ring" },
  { id: "cards-orcamento", label: "Cards de Orçamento" },
  { id: "barra-resumo", label: "Barra de Resumo" },
  { id: "seletor-mes", label: "Seletor de Mês" },
  { id: "controle-segmentado", label: "Controle Segmentado" },
  { id: "lista-transacoes", label: "Lista de Transações" },
  { id: "checklist", label: "Checklist" },
  { id: "parcelas-ativas", label: "Parcelas Ativas" },
  { id: "card-cartao-credito", label: "Card Cartão de Crédito" },
  { id: "card-cartao-hero", label: "Card Cartão Hero" },
  { id: "lista-colapsavel", label: "Lista Colapsável" },
  { id: "empty-states", label: "Empty States" },
  // Visualizações
  { id: "grafico-barras", label: "Gráfico de Barras" },
  { id: "grade-timeline", label: "Grade Timeline" },
  { id: "treemap", label: "Treemap / Mapa Visual" },
  { id: "tooltip-detalhe", label: "Tooltip de Detalhe" },
  { id: "legenda", label: "Legenda" },
  { id: "coluna-mensal", label: "Coluna Mensal" },
  { id: "painel-simulacao", label: "Painel de Simulação" },
  // Layout & Navegação
  { id: "menu-lateral", label: "Menu Lateral" },
  { id: "bottom-navigation", label: "Bottom Navigation" },
  { id: "bottom-sheet", label: "Bottom Sheet" },
]

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <nav className="fixed top-0 left-0 h-screen w-[220px] overflow-y-auto border-r bg-background p-4">
        <h1 className="mb-6 text-base font-semibold">
          Design System
          <span className="block text-xs font-normal text-muted-foreground">
            Caderninho
          </span>
        </h1>
        <ul className="flex flex-col gap-0.5">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="ml-[220px] max-w-5xl flex-1 cursor-default p-6">{children}</main>
    </div>
  )
}
