export default function DashboardPage() {
  return (
    <>
      <div className="col-span-full">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Placeholder cards for layout validation */}
      <div className="rounded-radius-card bg-card p-[var(--density-card-padding)] border border-border">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Saldo Total
        </p>
        <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
          R$ 0,00
        </p>
      </div>

      <div className="rounded-radius-card bg-card p-[var(--density-card-padding)] border border-border">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Gastos do Mês
        </p>
        <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
          R$ 0,00
        </p>
      </div>

      <div className="rounded-radius-card bg-card p-[var(--density-card-padding)] border border-border">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Receita do Mês
        </p>
        <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
          R$ 0,00
        </p>
      </div>
    </>
  );
}
