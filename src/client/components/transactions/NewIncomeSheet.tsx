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
import { listIncomeSourcesAction } from '@/server/actions/income-source.actions';
import { createIncomeAction } from '@/server/actions/transaction.actions';

interface NewIncomeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IncomeSourceOption {
  id: string;
  name: string;
}

interface BankAccountOption {
  id: string;
  label: string;
}

export function NewIncomeSheet({ open, onOpenChange }: NewIncomeSheetProps) {
  const isMobile = useIsMobile();
  const [incomeSources, setIncomeSources] = useState<IncomeSourceOption[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountOption[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amountCents, setAmountCents] = useState(0);
  const [incomeSourceId, setIncomeSourceId] = useState<string | null>(null);
  const [destinationAccountId, setDestinationAccountId] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const resetForm = useCallback(() => {
    setAmountCents(0);
    setIncomeSourceId(null);
    setDestinationAccountId(null);
    setDescription('');
  }, []);

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      resetForm();
      const [sourcesResult, accountsResult] = await Promise.all([
        listIncomeSourcesAction(undefined),
        listBankAccountsAction(undefined),
      ]);

      if (sourcesResult.success) {
        setIncomeSources(
          sourcesResult.data
            .filter((s: { status: string }) => s.status === 'active')
            .map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })),
        );
      }

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

  const canSubmit =
    amountCents > 0 &&
    !!incomeSourceId &&
    !!destinationAccountId &&
    !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !incomeSourceId || !destinationAccountId) return;

    setIsSubmitting(true);
    const result = await createIncomeAction({
      amountCents,
      incomeSourceId,
      destinationAccountId,
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      onOpenChange(false);
      toast.success('Receita registrada!', {
        action: {
          label: 'Desfazer',
          onClick: () => {
            // TODO: implementar undo em Story 3.3
          },
        },
        duration: 5000,
      });
    } else {
      toast.error(result.error.message);
    }
  }, [
    canSubmit,
    amountCents,
    incomeSourceId,
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
        id="income-amount"
        label="Valor"
        value={amountCents}
        onChange={setAmountCents}
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="income-source">Fonte de receita</Label>
        <Select
          value={incomeSourceId ?? ''}
          onValueChange={(value) => setIncomeSourceId(value || null)}
          disabled={isSubmitting || incomeSources.length === 0}
        >
          <SelectTrigger id="income-source" className="w-full">
            <SelectValue placeholder="Selecione a fonte" />
          </SelectTrigger>
          <SelectContent>
            {incomeSources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {incomeSources.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Nenhuma fonte ativa — cadastre em Receitas antes.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="income-destination">Conta de destino</Label>
        <Select
          value={destinationAccountId ?? ''}
          onValueChange={(value) => setDestinationAccountId(value || null)}
          disabled={isSubmitting || bankAccounts.length === 0}
        >
          <SelectTrigger id="income-destination" className="w-full">
            <SelectValue placeholder="Selecione a conta" />
          </SelectTrigger>
          <SelectContent>
            {bankAccounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {bankAccounts.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Nenhuma conta ativa — cadastre em Contas antes.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="income-description">Descrição (opcional)</Label>
        <Input
          id="income-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Salário de março"
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
          {isSubmitting ? 'Salvando…' : 'Registrar receita'}
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
              <SheetTitle className="text-base font-semibold">Nova Receita</SheetTitle>
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
              <SheetTitle>Nova Receita</SheetTitle>
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
