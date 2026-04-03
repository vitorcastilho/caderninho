'use client';

import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/client/utils/utils';
import { Card, CardContent } from '@/client/components/ui/card';

interface SummaryCardProps {
  label: string;
  value: string;
  trend?: 'positive' | 'negative' | 'neutral';
  trendLabel?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'compact';
  className?: string;
}

export function SummaryCard({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  variant = 'default',
  className,
}: SummaryCardProps) {
  const trendAriaText = trend === 'positive'
    ? 'tendência positiva'
    : trend === 'negative'
      ? 'tendência negativa'
      : '';

  const ariaLabel = [label, value, trendAriaText, trendLabel]
    .filter(Boolean)
    .join(', ');

  const isCompact = variant === 'compact';

  return (
    <Card
      size={isCompact ? 'sm' : 'default'}
      className={cn('transition-shadow hover:shadow-sm', className)}
      role="region"
      aria-label={ariaLabel}
    >
      <CardContent className={cn(isCompact ? 'flex items-center gap-3' : 'flex flex-col gap-2')}>
        {Icon && (
          <div className={cn(
            'flex items-center justify-center rounded-lg bg-muted',
            isCompact ? 'size-8' : 'size-10',
          )}>
            <Icon className={cn('text-muted-foreground', isCompact ? 'size-4' : 'size-5')} />
          </div>
        )}
        <div className={cn(isCompact && 'flex-1')}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn(
            'font-bold tabular-nums',
            isCompact ? 'text-lg' : 'text-2xl',
          )}>
            {value}
          </p>
        </div>
        {trend && trend !== 'neutral' && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trend === 'positive' && 'text-green-600',
            trend === 'negative' && 'text-red-600',
          )}>
            {trend === 'positive' ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
        {trend === 'neutral' && trendLabel && (
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <span>{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
