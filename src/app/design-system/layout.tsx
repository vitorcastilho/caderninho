const sections = [
  { id: "cores", label: "Cores / Tokens" },
  { id: "tipografia", label: "Tipografia" },
  { id: "botoes", label: "Botoes" },
  { id: "cards", label: "Cards" },
  { id: "formularios", label: "Formularios" },
  { id: "badges", label: "Badges" },
  { id: "dialogs", label: "Dialogs" },
  { id: "tabelas", label: "Tabelas" },
  { id: "tabs", label: "Tabs" },
  { id: "empty-states", label: "Empty States" },
  { id: "lista-colapsavel", label: "Lista Colapsavel" },
  { id: "cursores", label: "Cursores" },
  { id: "espacamento", label: "Espacamento" },
  { id: "skeleton", label: "Skeleton" },
]

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <nav className="fixed top-0 left-0 h-screen w-56 overflow-y-auto border-r bg-background p-4">
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
      <main className="ml-56 max-w-5xl flex-1 p-6">{children}</main>
    </div>
  )
}
