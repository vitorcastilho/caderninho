'use client';

import { cn } from '@/client/utils/utils';
import { formatCurrency } from '@/client/utils/format-currency';

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
  label?: string;
  showValues?: boolean;
  showPercentage?: boolean;
  variant?: 'inline' | 'expanded' | 'mini';
  className?: string;
}

function getColorClass(percentage: number): string {
  if (percentage < 70) return 'bg-green-500';
  if (percentage < 85) return 'bg-yellow-500';
  if (percentage < 100) return 'bg-orange-500';
  return 'bg-red-500';
}

function getStatusLabel(percentage: number): string {
  if (percentage < 70) return 'Dentro do orçamento';
  if (percentage < 85) return 'Atenção';
  if (percentage < 100) return 'Próximo do limite';
  return 'Acima do orçamento';
}

export function BudgetProgressBar({
  spent,
  budget,
  label,
  showValues = false,
  showPercentage = false,
  variant = 'inline',
  className,
}: BudgetProgressBarProps) {
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const fillWidth = Math.min(percentage, 100);
  const colorClass = getColorClass(percentage);

  const ariaLabel = label
    ? `${label}: ${percentage}% do orçamento utilizado`
    : `${percentage}% do orçamento utilizado`;

  if (variant === 'mini') {
    return (
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        className={cn('h-1.5 w-full rounded-full bg-stone-200', className)}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', colorClass)}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {(label || showPercentage) && (
          <div className="flex items-center justify-between">
            {label && <span className="text-sm font-medium">{label}</span>}
            <div className="flex items-center gap-2">
              {showPercentage && (
                <span className="text-sm tabular-nums text-muted-foreground">
                  {percentage}%
                </span>
              )}
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  percentage < 70 && 'bg-green-100 text-green-800',
                  percentage >= 70 && percentage < 85 && 'bg-yellow-100 text-yellow-800',
                  percentage >= 85 && percentage < 100 && 'bg-orange-100 text-orange-800',
                  percentage >= 100 && 'bg-red-100 text-red-800',
                )}
              >
                {getStatusLabel(percentage)}
              </span>
            </div>
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={ariaLabel}
          className="h-2 w-full rounded-full bg-stone-200"
        >
          <div
            className={cn('h-full rounded-full transition-all duration-300', colorClass)}
            style={{ width: `${fillWidth}%` }}
          />
        </div>
        {showValues && (
          <p className="text-xs tabular-nums text-muted-foreground">
            {formatCurrency(spent)} / {formatCurrency(budget)}
          </p>
        )}
      </div>
    );
  }

  // variant === 'inline' (default)
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && <span className="shrink-0 text-sm font-medium">{label}</span>}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        className="h-2 flex-1 rounded-full bg-stone-200"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', colorClass)}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
      {showPercentage && (
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {percentage}%
        </span>
      )}
    </div>
  );
}
