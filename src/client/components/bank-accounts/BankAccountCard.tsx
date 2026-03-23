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
import { archiveBankAccountAction, reactivateBankAccountAction } from '@/server/actions/bank-account.actions';

interface BankAccountCardProps {
  account: {
    id: string;
    name: string;
    bank: string;
    balanceCents: number;
    status: 'active' | 'archived';
  };
  onEdit: (id: string) => void;
  onStatusChange: () => void;
}

export function BankAccountCard({ account, onEdit, onStatusChange }: BankAccountCardProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveBankAccountAction({ id: account.id });
      if (result.success) {
        toast.success('Conta arquivada com sucesso!');
        setDialogOpen(false);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateBankAccountAction({ id: account.id });
      if (result.success) {
        toast.success('Conta reativada com sucesso!');
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
        <CardAction>
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" onClick={() => onEdit(account.id)}>
              Editar
            </Button>
            {account.status === 'active' ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button variant="destructive" size="xs" />}>
                  Arquivar
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Arquivar conta</DialogTitle>
                    <DialogDescription>
                      A conta &ldquo;{account.name}&rdquo; será arquivada. Ela não aparecerá em novas
                      transações, mas o histórico será preservado. Você pode reativá-la a qualquer
                      momento.
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
        <p className="text-xs text-muted-foreground">{account.bank}</p>
        <p className="text-lg font-bold tabular-nums text-foreground mt-1">
          {formatCurrency(account.balanceCents)}
        </p>
      </CardContent>
    </Card>
  );
}
