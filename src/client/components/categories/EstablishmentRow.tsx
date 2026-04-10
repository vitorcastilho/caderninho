'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { formatCurrency } from '@/client/utils/format-currency';
import { getEstablishmentSpendingKey } from '@/shared/utils/spending-key';

interface Establishment {
  id: string;
  name: string;
  emoji: string;
  subcategoryId: string;
  source: 'auto' | 'manual';
  defaultPaymentMethodType: string | null;
  defaultPaymentMethodId: string | null;
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  visitCount: number;
  lastVisitAt: string | null;
  status: 'active' | 'archived';
}

interface EstablishmentRowProps {
  establishment: Establishment;
  subcategoryName?: string;
  spendingByEstablishment?: Map<string, number>;
  subcategorySpent?: number;
  onEdit: (establishment: Establishment) => void;
  onStatusChange: () => void;
}

function formatLastVisit(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

export function EstablishmentRow({
  establishment,
  subcategoryName,
  spendingByEstablishment,
  subcategorySpent,
  onEdit,
}: EstablishmentRowProps) {
  const visitInfo = establishment.visitCount > 0
    ? `${establishment.visitCount} visita${establishment.visitCount > 1 ? 's' : ''}${establishment.lastVisitAt ? ` · ultimo ${formatLastVisit(establishment.lastVisitAt)}` : ''}`
    : establishment.source === 'manual' ? 'adicionado manualmente' : '';

  const estKey = getEstablishmentSpendingKey(establishment.name, establishment.subcategoryId);
  const estSpent = spendingByEstablishment?.get(estKey) ?? 0;
  const estPercentOfSub = subcategorySpent && subcategorySpent > 0
    ? Math.round((estSpent / subcategorySpent) * 100)
    : 0;

  return (
    <div className="group/est flex items-center gap-2.5 border-t border-border border-l-4 border-l-transparent bg-muted py-2.5 pr-4 pl-[88px] text-xs transition-colors hover:bg-muted/80">
      <span className="shrink-0 text-sm">{establishment.emoji}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{establishment.name}</span>
          <span
            className={
              establishment.source === 'auto'
                ? 'shrink-0 rounded-full bg-emerald-100 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-emerald-800'
                : 'shrink-0 rounded-full bg-indigo-100 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-indigo-700'
            }
          >
            {establishment.source}
          </span>
        </div>
        {visitInfo && (
          <span className="text-muted-foreground">{visitInfo}</span>
        )}
      </div>

      {estSpent > 0 && (
        <div className="flex min-w-0 flex-col items-end gap-0.5">
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(estSpent)}</span>
          <div className="flex items-center gap-1.5 w-20">
            <div className="h-[3px] w-full rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-stone-400 transition-all duration-300"
                style={{ width: `${Math.min(estPercentOfSub, 100)}%` }}
              />
            </div>
          </div>
          {subcategoryName && (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {estPercentOfSub}% de {subcategoryName}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onEdit(establishment)}
          title="Editar estabelecimento"
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
