'use client';

import { Delete } from 'lucide-react';
import { cn } from '@/client/utils/utils';

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  className?: string;
}

const KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '', '0', 'back',
];

export function NumericKeypad({ onDigit, onBackspace, className }: NumericKeypadProps) {
  return (
    <div
      className={cn('grid grid-cols-3 gap-2 px-5 pb-6 pt-3', className)}
      role="group"
      aria-label="Teclado numérico"
    >
      {KEYS.map((key, i) => {
        if (key === '') {
          return <div key={`empty-${i}`} aria-hidden="true" />;
        }

        if (key === 'back') {
          return (
            <button
              key="back"
              type="button"
              onClick={onBackspace}
              className="flex h-[52px] items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition-all active:scale-95 active:bg-stone-200"
              aria-label="Apagar"
            >
              <Delete className="size-[18px]" />
            </button>
          );
        }

        return (
          <button
            key={key}
            type="button"
            onClick={() => onDigit(key)}
            className="flex h-[52px] items-center justify-center rounded-lg border border-stone-200 bg-white text-xl font-medium text-stone-900 transition-all hover:bg-stone-50 active:scale-95 active:bg-stone-200"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
