'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog';
import { Button } from '@/client/components/ui/button';
import {
  deleteTransactionAction,
  recreateTransactionFromSnapshotAction,
} from '@/client/actions/transaction.actions';
import type { TransactionDTO } from './TransactionList';

interface ConfirmDeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDTO | null;
  labelResolver: (tx: TransactionDTO) => string;
  onDeleted?: () => void;
}

export function ConfirmDeleteTransactionDialog({
  open,
  onOpenChange,
  transaction,
  labelResolver,
  onDeleted,
}: ConfirmDeleteTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!transaction) return;

    setIsSubmitting(true);
    const result = await deleteTransactionAction({ id: transaction.id });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    const snapshot = result.data.snapshot;
    onOpenChange(false);
    onDeleted?.();

    // HIGH 3: flag de undo em progresso para bloquear cliques concorrentes
    // no botão "Desfazer" do toast. Sonner re-renderiza o action button a cada
    // toque mas preserva o closure — usamos ref para estado mutável.
    const undoInFlight = { current: false };

    toast.success('Transação excluída.', {
      duration: 5000,
      action: {
        label: 'Desfazer',
        onClick: async () => {
          if (undoInFlight.current) return;
          undoInFlight.current = true;
          const undoResult = await recreateTransactionFromSnapshotAction(snapshot);
          if (undoResult.success) {
            toast.success('Exclusão desfeita.');
            onDeleted?.();
          } else {
            toast.error(undoResult.error.message);
            undoInFlight.current = false;
          }
        },
      },
    });
  }, [transaction, onOpenChange, onDeleted]);

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir transação?</DialogTitle>
          <DialogDescription>{labelResolver(transaction)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Excluindo…' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
