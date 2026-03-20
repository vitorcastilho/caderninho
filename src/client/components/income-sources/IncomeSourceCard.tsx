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
import { EMPLOYMENT_TYPE_LABELS } from '@/shared/constants/income-source.constants';
import { archiveIncomeSourceAction, reactivateIncomeSourceAction } from '@/server/actions/income-source.actions';

interface IncomeSourceCardProps {
  incomeSource: {
    id: string;
    name: string;
    employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
    isRecurring: boolean;
    baseAmountCents: number | null;
    status: 'active' | 'archived';
  };
  onEdit: (id: string) => void;
  onStatusChange: () => void;
}

export function IncomeSourceCard({ incomeSource, onEdit, onStatusChange }: IncomeSourceCardProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveIncomeSourceAction({ id: incomeSource.id });
      if (result.success) {
        toast.success('Fonte de receita arquivada com sucesso!');
        setDialogOpen(false);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateIncomeSourceAction({ id: incomeSource.id });
      if (result.success) {
        toast.success('Fonte de receita reativada com sucesso!');
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{incomeSource.name}</CardTitle>
        <CardAction>
          <div className="flex gap-1">
            <Button variant="ghost" size="xs" onClick={() => onEdit(incomeSource.id)}>
              Editar
            </Button>
            {incomeSource.status === 'active' ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button variant="destructive" size="xs" />}>
                  Arquivar
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Arquivar fonte de receita</DialogTitle>
                    <DialogDescription>
                      A fonte &ldquo;{incomeSource.name}&rdquo; será arquivada. Você pode
                      reativá-la a qualquer momento.
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
          <p className="text-xs text-muted-foreground">
            {EMPLOYMENT_TYPE_LABELS[incomeSource.employmentType]}
          </p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="text-xs text-muted-foreground">
            {incomeSource.isRecurring ? 'Recorrente' : 'Eventual'}
          </p>
        </div>
        {incomeSource.baseAmountCents != null && (
          <p className="text-lg font-bold tabular-nums text-foreground mt-1">
            {formatCurrency(incomeSource.baseAmountCents)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
