'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { CurrencyInput } from '@/client/components/ui/currency-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select';
import { useIsMobile } from '@/client/hooks/use-is-mobile';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { createTransferAction } from '@/server/actions/transaction.actions';

interface NewTransferSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BankAccountOption {
  id: string;
  label: string;
}

export function NewTransferSheet({ open, onOpenChange }: NewTransferSheetProps) {
  const isMobile = useIsMobile();
  const [bankAccounts, setBankAccounts] = useState<BankAccountOption[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amountCents, setAmountCents] = useState(0);
  const [sourceAccountId, setSourceAccountId] = useState<string | null>(null);
  const [destinationAccountId, setDestinationAccountId] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const resetForm = useCallback(() => {
    setAmountCents(0);
    setSourceAccountId(null);
    setDestinationAccountId(null);
    setDescription('');
  }, []);

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      resetForm();
      const accountsResult = await listBankAccountsAction(undefined);

      if (accountsResult.success) {
        setBankAccounts(
          accountsResult.data
            .filter((a: { status: string }) => a.status === 'active')
            .map((a: { id: string; name: string; bank: string }) => ({
              id: a.id,
              label: `${a.bank} - ${a.name}`,
            })),
        );
      }
    });
  }, [open, resetForm]);

  const destinationOptions = bankAccounts.filter((acc) => acc.id !== sourceAccountId);

  const canSubmit =
    amountCents > 0 &&
    !!sourceAccountId &&
    !!destinationAccountId &&
    sourceAccountId !== destinationAccountId &&
    !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !sourceAccountId || !destinationAccountId) return;

    setIsSubmitting(true);
    const result = await createTransferAction({
      amountCents,
      sourceAccountId,
      destinationAccountId,
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      onOpenChange(false);
      toast.success('Transferência registrada!');
    } else {
      toast.error(result.error.message);
    }
  }, [
    canSubmit,
    amountCents,
    sourceAccountId,
    destinationAccountId,
    description,
    onOpenChange,
  ]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const formBody = (
    <div className="flex flex-1 flex-col gap-4 px-5 pt-2 pb-5">
      <CurrencyInput
        id="transfer-amount"
        label="Valor"
        value={amountCents}
        onChange={setAmountCents}
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="transfer-source">Conta de origem</Label>
        <Select
          value={sourceAccountId ?? ''}
          onValueChange={(value) => {
            setSourceAccountId(value || null);
            if (destinationAccountId === value) {
              setDestinationAccountId(null);
            }
          }}
          disabled={isSubmitting || bankAccounts.length === 0}
        >
          <SelectTrigger id="transfer-source" className="w-full">
            <SelectValue placeholder="Selecione a conta de origem" />
          </SelectTrigger>
          <SelectContent>
            {bankAccounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="transfer-destination">Conta de destino</Label>
        <Select
          value={destinationAccountId ?? ''}
          onValueChange={(value) => setDestinationAccountId(value || null)}
          disabled={isSubmitting || destinationOptions.length === 0}
        >
          <SelectTrigger id="transfer-destination" className="w-full">
            <SelectValue placeholder="Selecione a conta de destino" />
          </SelectTrigger>
          <SelectContent>
            {destinationOptions.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {bankAccounts.length < 2 && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Transferência exige ao menos 2 contas ativas.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="transfer-description">Descrição (opcional)</Label>
        <Input
          id="transfer-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Reserva de emergência"
          maxLength={500}
          disabled={isSubmitting}
        />
      </div>

      <div className="mt-auto flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Salvando…' : 'Registrar transferência'}
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        showCloseButton={!isMobile}
        overlayClassName={isMobile ? 'bg-black/45' : undefined}
        className={
          isMobile
            ? 'inset-x-0 bottom-0 gap-0 rounded-t-[20px] border-t-0 p-0 data-[side=bottom]:h-[85dvh]'
            : 'w-[420px] data-[side=right]:sm:max-w-[420px]'
        }
      >
        {isMobile ? (
          <>
            <div className="flex justify-center pt-3">
              <div className="h-1 w-9 rounded-full bg-stone-200" />
            </div>

            <SheetHeader className="flex-row items-center justify-between px-5 py-3">
              <SheetTitle className="text-base font-semibold">Nova Transferência</SheetTitle>
              <button
                type="button"
                onClick={handleCancel}
                className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-sm text-stone-500 transition-colors hover:bg-stone-200"
                aria-label="Fechar"
              >
                ✕
              </button>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
              ) : (
                formBody
              )}
            </div>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Nova Transferência</SheetTitle>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
              ) : (
                formBody
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
