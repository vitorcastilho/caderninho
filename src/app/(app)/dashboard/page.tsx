import { Card, CardContent } from "@/client/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <div className="col-span-full">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Placeholder cards for layout validation */}
      <Card>
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Saldo Total
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
            R$ 0,00
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Gastos do Mês
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
            R$ 0,00
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Receita do Mês
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
            R$ 0,00
          </p>
        </CardContent>
      </Card>
    </>
  );
}
