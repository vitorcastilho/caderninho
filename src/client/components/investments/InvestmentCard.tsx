'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/client/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/client/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/client/components/ui/dialog';
import { formatCurrency } from '@/client/utils/format-currency';
import { basisPointsToDisplayValue } from '@/client/utils/percentage-input';
import { INVESTMENT_TYPE_LABELS } from '@/shared/constants/investment.constants';
import { archiveInvestmentAction, reactivateInvestmentAction } from '@/client/actions/investment.actions';

interface InvestmentCardProps {
  investment: {
    id: string;
    name: string;
    institution: string;
    type: 'renda_fixa' | 'renda_variavel' | 'reserva';
    balanceCents: number;
    yieldRateBasisPoints: number | null;
    status: 'active' | 'archived';
  };
  onEdit: (id: string) => void;
  onStatusChange: () => void;
}

export function InvestmentCard({ investment, onEdit, onStatusChange }: InvestmentCardProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveInvestmentAction({ id: investment.id });
      if (result.success) {
        toast.success('Investimento arquivado com sucesso!');
        setDialogOpen(false);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateInvestmentAction({ id: investment.id });
      if (result.success) {
        toast.success('Investimento reativado com sucesso!');
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{investment.name}</CardTitle>
        <CardAction>
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" onClick={() => onEdit(investment.id)}>
              Editar
            </Button>
            {investment.status === 'active' ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button variant="destructive" size="xs" />}>
                  Arquivar
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Arquivar investimento</DialogTitle>
                    <DialogDescription>
                      O investimento &ldquo;{investment.name}&rdquo; será arquivado. Você pode
                      reativá-lo a qualquer momento.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                    <Button variant="destructive" onClick={handleArchive} disabled={isPending}>
                      {isPending ? 'Arquivando...' : 'Confirmar arquivamento'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="outline" size="xs" onClick={handleReactivate} disabled={isPending}>
                {isPending ? 'Reativando...' : 'Reativar'}
              </Button>
            )}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{investment.institution}</p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="text-xs text-muted-foreground">
            {INVESTMENT_TYPE_LABELS[investment.type]}
          </p>
        </div>
        <p className="text-lg font-bold tabular-nums text-foreground mt-1">
          {formatCurrency(investment.balanceCents)}
        </p>
        {investment.yieldRateBasisPoints != null && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Rendimento: {basisPointsToDisplayValue(investment.yieldRateBasisPoints)}% CDI
          </p>
        )}
      </CardContent>
    </Card>
  );
}
