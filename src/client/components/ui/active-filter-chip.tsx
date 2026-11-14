'use client';

import { X } from 'lucide-react';

import { cn } from '@/client/utils/utils';

export interface ActiveFilterChipProps {
  children: React.ReactNode;
  onRemove: () => void;
  /** Nome acessível do botão de remover. Ex.: "Remover filtro Mercado". */
  removeLabel?: string;
  className?: string;
}

/**
 * Chip de filtro ativo (spec proto-18 §4.5). Renderizado pelo consumer abaixo
 * da `TransactionFiltersBar` — um por categoria/método selecionado.
 */
export function ActiveFilterChip({
  children,
  onRemove,
  removeLabel = 'Remover filtro',
  className,
}: ActiveFilterChipProps) {
  return (
    <span
      data-slot="active-filter-chip"
      className={cn(
        'inline-flex items-center gap-1 rounded-badge bg-primary-light px-2.5 py-1 text-xs font-medium text-primary',
        className,
      )}
    >
      <span className="flex items-center gap-1">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full hover:bg-primary/10 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={removeLabel}
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}
