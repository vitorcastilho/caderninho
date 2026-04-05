'use client';

import { cn } from '@/client/utils/utils';
import { formatCurrency } from '@/client/utils/format-currency';

interface InstallmentStripProps {
  amountCents: number;
  selected: number;
  onSelect: (installments: number) => void;
  className?: string;
}

const OPTIONS = [0, 1, 2, 3, 4];

function getLabel(n: number): string {
  return n === 0 ? 'À vista' : `${n}x`;
}

export function InstallmentStrip({
  amountCents,
  selected,
  onSelect,
  className,
}: InstallmentStripProps) {
  const installmentValue = selected > 1
    ? Math.ceil(amountCents / selected)
    : amountCents;

  const getResultText = () => {
    if (selected <= 1) {
      return `${formatCurrency(amountCents)} à vista`;
    }
    return `${selected}x de ${formatCurrency(installmentValue)}`;
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        className="flex h-11 items-center overflow-hidden rounded-xl border border-stone-200 bg-white"
        role="radiogroup"
        aria-label="Parcelas"
      >
        {OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected === n}
            onClick={() => onSelect(n)}
            className={cn(
              'flex h-full flex-1 items-center justify-center whitespace-nowrap px-1 text-[13px] font-medium text-stone-400 transition-all',
              selected === n
                ? 'm-1 h-[calc(100%-8px)] flex-[1.1] rounded-lg bg-indigo-600 text-sm font-semibold text-white'
                : 'hover:bg-stone-50 hover:text-stone-600',
            )}
          >
            {getLabel(n)}
          </button>
        ))}
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold tabular-nums text-stone-900">
          {getResultText()}
        </div>
        {selected > 1 && (
          <div className="mt-0.5 text-[11px] font-medium italic text-indigo-600">
            Comprometimento total no cartão: {formatCurrency(amountCents)}
          </div>
        )}
      </div>
    </div>
  );
}
