'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/client/components/ui/button';
import { deleteEstablishmentAction } from '@/server/actions/establishment.actions';

interface Establishment {
  id: string;
  name: string;
  emoji: string;
  subcategoryId: string;
  source: 'auto' | 'manual';
  visitCount: number;
  lastVisitAt: string | null;
  status: 'active' | 'archived';
}

interface EstablishmentRowProps {
  establishment: Establishment;
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

export function EstablishmentRow({ establishment, onEdit, onStatusChange }: EstablishmentRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEstablishmentAction({ id: establishment.id });
      if (result.success) {
        toast.success(`Estabelecimento "${establishment.name}" removido.`);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  const visitInfo = establishment.visitCount > 0
    ? `${establishment.visitCount} visita${establishment.visitCount > 1 ? 's' : ''}${establishment.lastVisitAt ? ` · último ${formatLastVisit(establishment.lastVisitAt)}` : ''}`
    : establishment.source === 'manual' ? 'adicionado manualmente' : '';

  return (
    <div className="group/est flex items-center gap-2.5 border-t border-border bg-muted/20 py-2.5 pr-4 pl-[88px] text-xs transition-colors hover:bg-muted/40">
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
      <div className="flex gap-1 opacity-0 transition-opacity group-hover/est:opacity-100">
        <Button
          variant="ghost"
          size="xs"
          className="h-6 text-xs"
          onClick={() => onEdit(establishment)}
        >
          Editar
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="h-6 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          Excluir
        </Button>
      </div>
    </div>
  );
}
