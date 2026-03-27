'use client';

import { BookText } from 'lucide-react';
import { Button } from '@/client/components/ui/button';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-5">
      <div className="flex items-center gap-1.5 text-[28px] font-bold text-primary tracking-tight mb-1">
        <BookText className="size-7" />
        Caderninho
      </div>

      <div className="my-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-4xl">
        📊
      </div>

      <h1 className="text-xl font-bold text-foreground mb-2">
        Bem-vindo ao Caderninho!
      </h1>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
        Vamos configurar o básico para você começar. Leva cerca de 5 minutos.
      </p>

      <div className="mt-auto w-full pt-8">
        <Button
          onClick={onNext}
          className="w-full"
          size="lg"
        >
          Começar
        </Button>
      </div>
    </div>
  );
}
