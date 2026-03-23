'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { completeOnboardingAction } from '@/server/actions/onboarding.actions';
import { centsToDisplayValue } from '@/client/utils/currency-input';

interface CompletionStepProps {
  accountsCount: number;
  cardsCount: number;
  categoriesCount: number;
  totalBalanceCents: number;
}

export function CompletionStep({
  accountsCount,
  cardsCount,
  categoriesCount,
  totalBalanceCents,
}: CompletionStepProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleGoToDashboard() {
    startTransition(async () => {
      const result = await completeOnboardingAction(null);

      if (result.success) {
        router.push('/dashboard');
      } else {
        // Se já completou, apenas redireciona
        if (result.error.code === 'ONBOARDING_ALREADY_COMPLETED') {
          router.push('/dashboard');
        } else {
          toast.error(result.error.message);
        }
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center text-center pt-4">
      {/* Ícone de check */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[28px]">
        ✓
      </div>

      <h2 className="text-xl font-bold text-stone-900 mb-2">Tudo configurado!</h2>
      <p className="text-[13px] text-stone-500 leading-relaxed mb-5">
        Agora é só começar a registrar.<br />Cada gasto leva ~5 segundos.
      </p>

      {/* Resumo */}
      <div className="w-full rounded-xl border border-stone-200 bg-stone-50 p-4 mb-4 text-left">
        <div className="flex items-center gap-2 py-1.5 text-[13px] text-stone-900">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-xs">
            🏦
          </span>
          <span>Contas bancárias</span>
          <span className="ml-auto font-semibold text-indigo-600">{accountsCount}</span>
        </div>

        <div className="border-t border-stone-200" />

        <div className="flex items-center gap-2 py-1.5 text-[13px] text-stone-900">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-xs">
            💳
          </span>
          <span>Cartões de crédito</span>
          <span className="ml-auto font-semibold text-indigo-600">{cardsCount}</span>
        </div>

        <div className="border-t border-stone-200" />

        <div className="flex items-center gap-2 py-1.5 text-[13px] text-stone-900">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-xs">
            📊
          </span>
          <span>Categorias com orçamento</span>
          <span className="ml-auto font-semibold text-indigo-600">{categoriesCount}</span>
        </div>
      </div>

      {/* Saldo total */}
      <div className="w-full flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-2.5 mb-3">
        <span className="text-sm font-semibold text-green-800">Saldo total</span>
        <span className="text-base font-bold text-green-800">
          R$ {centsToDisplayValue(totalBalanceCents)}
        </span>
      </div>

      {/* Ações */}
      <div className="mt-auto w-full flex flex-col gap-1.5 pt-4">
        <button
          onClick={handleGoToDashboard}
          disabled={isPending}
          className="w-full rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Finalizando...' : 'Ir para o Dashboard'}
        </button>
        <button
          disabled
          className="w-full rounded-md bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-600 border border-transparent transition-colors hover:bg-indigo-100 hover:border-indigo-600 disabled:opacity-50"
        >
          Convidar alguém
        </button>
      </div>
    </div>
  );
}
