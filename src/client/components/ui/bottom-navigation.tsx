'use client';

import {
  LayoutDashboard,
  PiggyBank,
  Plus,
  CheckSquare,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/client/utils/utils';

interface BottomNavigationProps {
  activeItem: string;
  onNavigate: (key: string) => void;
  onFabClick: () => void;
  badges?: Record<string, number>;
  className?: string;
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'budgets', label: 'Orçamentos', icon: PiggyBank },
  { key: 'fab', label: 'Novo', icon: Plus },
  { key: 'checklist', label: 'Checklist', icon: CheckSquare },
  { key: 'projection', label: 'Projeção', icon: TrendingUp },
] as const;

export function BottomNavigation({
  activeItem,
  onNavigate,
  onFabClick,
  badges,
  className,
}: BottomNavigationProps) {
  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      className={cn(
        'flex items-end justify-around border-t bg-white px-2 pb-5 pt-2',
        className,
      )}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isFab = item.key === 'fab';
        const isActive = activeItem === item.key;
        const badgeCount = badges?.[item.key];

        if (isFab) {
          return (
            <button
              key={item.key}
              type="button"
              onClick={onFabClick}
              aria-label="Registrar nova transação"
              className="flex cursor-pointer flex-col items-center gap-0.5"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
                <Icon className="size-5" />
              </div>
            </button>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.key)}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex min-w-[56px] cursor-pointer flex-col items-center gap-0.5"
          >
            <div className="relative">
              <Icon
                className={cn(
                  'size-5',
                  isActive ? 'text-indigo-600' : 'text-stone-400',
                )}
              />
              {badgeCount !== undefined && badgeCount > 0 && (
                <span className="absolute -right-2 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-medium',
                isActive ? 'text-indigo-600' : 'text-stone-400',
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
