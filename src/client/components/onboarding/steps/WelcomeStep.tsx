'use client';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-5">
      <div className="text-[28px] font-bold text-indigo-600 tracking-tight mb-1">
        <span className="text-xl mr-0.5">✏</span> Caderninho
      </div>

      <div className="my-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-4xl">
        📊
      </div>

      <h1 className="text-xl font-bold text-stone-900 mb-2">
        Bem-vindo ao Caderninho!
      </h1>

      <p className="text-sm text-stone-500 leading-relaxed max-w-[240px]">
        Vamos configurar o básico para você começar. Leva cerca de 5 minutos.
      </p>

      <div className="mt-auto w-full pt-8">
        <button
          onClick={onNext}
          className="w-full rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Começar
        </button>
      </div>
    </div>
  );
}
