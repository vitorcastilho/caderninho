'use client';

import { ArrowLeftRight, Minus, Plus } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet';
import { useIsMobile } from '@/client/hooks/use-is-mobile';

export type RegisterType = 'expense' | 'income' | 'transfer';

interface RegisterTypePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: RegisterType) => void;
}

const OPTIONS: {
  type: RegisterType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    type: 'expense',
    label: 'Gasto',
    description: 'Registrar uma despesa',
    icon: Minus,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    type: 'income',
    label: 'Receita',
    description: 'Registrar uma entrada',
    icon: Plus,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    type: 'transfer',
    label: 'Transferência',
    description: 'Mover entre contas',
    icon: ArrowLeftRight,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
];

export function RegisterTypePicker({
  open,
  onOpenChange,
  onSelect,
}: RegisterTypePickerProps) {
  const isMobile = useIsMobile();

  const body = (
    <div className="flex flex-col gap-2 px-5 pt-2 pb-5">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onSelect(option.type)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              className={`flex size-10 items-center justify-center rounded-full ${option.iconBg}`}
            >
              <Icon className={`size-5 ${option.iconColor}`} />
            </span>
            <span className="flex flex-col">
              <span className="text-[14px] font-semibold text-foreground">
                {option.label}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        showCloseButton={!isMobile}
        overlayClassName={isMobile ? 'bg-black/45' : undefined}
        className={
          isMobile
            ? 'inset-x-0 bottom-0 gap-0 rounded-t-[20px] border-t-0 p-0 data-[side=bottom]:h-auto'
            : 'w-[420px] data-[side=right]:sm:max-w-[420px]'
        }
      >
        {isMobile ? (
          <>
            <div className="flex justify-center pt-3">
              <div className="h-1 w-9 rounded-full bg-stone-200" />
            </div>

            <SheetHeader className="flex-row items-center justify-between px-5 py-3">
              <SheetTitle className="text-base font-semibold">
                Registrar transação
              </SheetTitle>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-sm text-stone-500 transition-colors hover:bg-stone-200"
                aria-label="Fechar"
              >
                ✕
              </button>
            </SheetHeader>

            {body}
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Registrar transação</SheetTitle>
            </SheetHeader>
            {body}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
