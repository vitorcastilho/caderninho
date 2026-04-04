'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/client/utils/utils';
import { formatCurrency } from '@/client/utils/format-currency';
import { BudgetProgressBar } from '@/client/components/ui/budget-progress-bar';

interface ImpactPreviewItem {
  label: string;
  before: number;
  after: number;
  budget?: number;
}

interface ImpactPreviewProps {
  items: ImpactPreviewItem[];
  variant?: 'inline' | 'sheet';
  warningThreshold?: number;
  className?: string;
}

function getBorderColor(items: ImpactPreviewItem[], warningThreshold: number): string {
  const hasExceeded = items.some((item) => {
    if (item.budget === undefined || item.budget === 0) return false;
    const pct = (item.after / item.budget) * 100;
    return pct > warningThreshold;
  });
  if (hasExceeded) return 'border-red-500';

  const hasWarning = items.some((item) => {
    if (item.budget === undefined || item.budget === 0) return false;
    const pct = (item.after / item.budget) * 100;
    return pct >= 85 && pct <= warningThreshold;
  });
  if (hasWarning) return 'border-orange-500';

  return 'border-indigo-500';
}

export function ImpactPreview({
  items,
  variant = 'inline',
  warningThreshold = 100,
  className,
}: ImpactPreviewProps) {
  const borderColor = getBorderColor(items, warningThreshold);

  const ariaLabel = items
    .map((item) => {
      const direction = item.after > item.before ? 'aumenta' : item.after < item.before ? 'diminui' : 'sem alteração';
      return `${item.label}: ${formatCurrency(item.before)} para ${formatCurrency(item.after)}, ${direction}`;
    })
    .join('. ');

  return (
    <div
      role="alert"
      aria-label={`Impacto: ${ariaLabel}`}
      className={cn(
        'rounded-r-lg border-l-4 bg-stone-50 p-3',
        borderColor,
        variant === 'sheet' && 'p-4',
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const isIncrease = item.after > item.before;
          const isDecrease = item.after < item.before;
          const exceedsBudget = item.budget !== undefined && item.after > item.budget;

          return (
            <div key={`${item.label}-${index}`} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                {exceedsBudget && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    Excede orçamento
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm tabular-nums">
                <span className="text-muted-foreground">{formatCurrency(item.before)}</span>
                <ArrowRight
                  className={cn(
                    'size-3.5',
                    isIncrease && 'text-red-500',
                    isDecrease && 'text-green-500',
                    !isIncrease && !isDecrease && 'text-muted-foreground',
                  )}
                />
                <span
                  className={cn(
                    'font-medium',
                    isIncrease && 'text-red-600',
                    isDecrease && 'text-green-600',
                    !isIncrease && !isDecrease && 'text-muted-foreground',
                  )}
                >
                  {formatCurrency(item.after)}
                </span>
              </div>
              {item.budget !== undefined && (
                <BudgetProgressBar
                  variant="mini"
                  spent={item.after}
                  budget={item.budget}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
