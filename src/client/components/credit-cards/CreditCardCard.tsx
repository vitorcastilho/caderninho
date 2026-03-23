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
import { archiveCreditCardAction, reactivateCreditCardAction } from '@/server/actions/credit-card.actions';

interface CreditCardCardProps {
  card: {
    id: string;
    name: string;
    brand: string;
    limitCents: number;
    closingDay: number;
    dueDay: number;
    status: 'active' | 'archived';
  };
  onEdit: (id: string) => void;
  onStatusChange: () => void;
}

export function CreditCardCard({ card, onEdit, onStatusChange }: CreditCardCardProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveCreditCardAction({ id: card.id });
      if (result.success) {
        toast.success('Cartão arquivado com sucesso!');
        setDialogOpen(false);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateCreditCardAction({ id: card.id });
      if (result.success) {
        toast.success('Cartão reativado com sucesso!');
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{card.name}</CardTitle>
        <CardAction>
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" onClick={() => onEdit(card.id)}>
              Editar
            </Button>
            {card.status === 'active' ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button variant="destructive" size="xs" />}>
                  Arquivar
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Arquivar cartão</DialogTitle>
                    <DialogDescription>
                      O cartão &ldquo;{card.name}&rdquo; será arquivado. Ele não aparecerá em novas
                      transações, mas o histórico será preservado. Você pode reativá-lo a qualquer
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
        <p className="text-xs text-muted-foreground">{card.brand}</p>
        <p className="text-lg font-bold tabular-nums text-foreground mt-1">
          {formatCurrency(card.limitCents)}
        </p>
        <div className="flex gap-4 mt-1">
          <p className="text-xs text-muted-foreground">
            Fecha dia {card.closingDay}
          </p>
          <p className="text-xs text-muted-foreground">
            Vence dia {card.dueDay}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
