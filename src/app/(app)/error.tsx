'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import { EmptyState } from '@/client/components/ui/empty-state';

/**
 * Error boundary das páginas logadas. Sem ele, qualquer erro (ex.: uma
 * server action respondendo 429) trocava a tela inteira por
 * "Application error: a client-side exception" (Story 1.11). Aqui o layout
 * (sidebar) continua e o usuário pode tentar de novo.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="col-span-full flex flex-col items-center gap-2 py-12">
      <EmptyState
        icon={AlertTriangle}
        title="Algo deu errado ao carregar esta página"
        description="Pode ter sido uma instabilidade momentânea. Tente de novo em alguns segundos."
        actionLabel="Tentar de novo"
        onAction={reset}
      />
      {error.digest && (
        <p className="text-xs text-muted-foreground">Código do erro: {error.digest}</p>
      )}
    </div>
  );
}
