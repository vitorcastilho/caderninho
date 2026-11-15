'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

import { createCreditCardAction, updateCreditCardAction, archiveCreditCardAction } from '@/client/actions/credit-card.actions';
import { centsToDisplayValue } from '@/client/utils/currency-input';
import { CreditCardBrandBadge } from '@/client/components/ui/credit-card-brand-badge';
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

interface CreditCardItem {
  id: string;
  name: string;
  brand: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  status: string;
}

interface CreditCardsStepProps {
  existingCards: CreditCardItem[];
  onNext: () => void;
  onSkip: () => void;
  onCardAdded: (card: CreditCardItem) => void;
  onCardRemoved: (cardId: string) => void;
}

const BRAND_OPTIONS = ['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard'];

export function CreditCardsStep({ existingCards, onNext, onSkip, onCardAdded, onCardRemoved }: CreditCardsStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [limitCents, setLimitCents] = useState(0);
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  function resetForm() {
    setName('');
    setBrand('');
    setLimitCents(0);
    setClosingDay('');
    setDueDay('');
    setEditingId(null);
    setShowForm(false);
  }

  function handleStartEdit(card: CreditCardItem) {
    setEditingId(card.id);
    setName(card.name);
    setBrand(card.brand);
    setLimitCents(card.limitCents);
    setClosingDay(String(card.closingDay));
    setDueDay(String(card.dueDay));
    setShowForm(true);
  }

  function handleRemoveCard(id: string) {
    startTransition(async () => {
      const result = await archiveCreditCardAction({ id });
      if (result.success) {
        toast.success('Cartão removido.');
        onCardRemoved(id);
        resetForm();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const closingDayNum = parseInt(closingDay || '0', 10);
    const dueDayNum = parseInt(dueDay || '0', 10);

    if (closingDayNum < 1 || closingDayNum > 31 || dueDayNum < 1 || dueDayNum > 31) {
      toast.error('Dia de fechamento e vencimento devem ser entre 1 e 31.');
      return;
    }

    startTransition(async () => {
      if (editingId) {
        const result = await updateCreditCardAction({
          id: editingId,
          data: { name, brand, limitCents, closingDay: closingDayNum, dueDay: dueDayNum },
        });
        if (result.success) {
          toast.success('Cartão atualizado!');
          onCardRemoved(editingId);
          onCardAdded(result.data as CreditCardItem);
          resetForm();
        } else {
          toast.error(result.error.message);
        }
      } else {
        const result = await createCreditCardAction({
          name,
          brand,
          limitCents,
          closingDay: closingDayNum,
          dueDay: dueDayNum,
        });
        if (result.success) {
          toast.success('Cartão adicionado!');
          onCardAdded(result.data as CreditCardItem);
          resetForm();
        } else {
          toast.error(result.error.message);
        }
      }
    });
  }

  const activeCards = existingCards.filter(c => c.status !== 'archived');

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-lg font-bold text-foreground mb-1">Seus cartões de crédito</h2>
      <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
        Cadastre seus cartões para controlar as faturas
      </p>

      {/* Lista de cartões */}
      {activeCards.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {activeCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-1 rounded-md border border-border bg-secondary px-3 py-2.5 transition-colors hover:border-border-hover"
            >
              <div className="flex items-center gap-2.5">
                <CreditCardBrandBadge brand={card.brand} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground">{card.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Limite: R$ {centsToDisplayValue(card.limitCents)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleStartEdit(card)}
                  disabled={isPending}
                  title="Editar cartão"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>
              <div className="text-[11px] text-text-tertiary pl-[36px]">
                Fecha dia {card.closingDay} · Vence dia {card.dueDay}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário inline (criar ou editar) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 rounded-md border border-primary/20 bg-primary-light p-3">
          <div className="text-xs font-semibold text-primary mb-2">
            {editingId ? 'Editar cartão' : 'Adicionar cartão'}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <Label htmlFor="onb-card-name" className="text-xs text-muted-foreground">Nome do cartão</Label>
              <Input
                id="onb-card-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank Mastercard"
                className="h-8 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Bandeira</Label>
                <Select value={brand} onValueChange={(val) => setBrand(val ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CurrencyInput
                value={limitCents}
                onChange={setLimitCents}
                label="Limite (R$)"
                id="onb-card-limit"
                className="h-8 text-sm"
                labelClassName="text-xs text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="onb-closing-day" className="text-xs text-muted-foreground">Dia de fechamento</Label>
                <Input
                  id="onb-closing-day"
                  type="number"
                  min={1}
                  max={31}
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  placeholder="Ex: 7"
                  inputMode="numeric"
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="onb-due-day" className="text-xs text-muted-foreground">Dia de vencimento</Label>
                <Input
                  id="onb-due-day"
                  type="number"
                  min={1}
                  max={31}
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="Ex: 15"
                  inputMode="numeric"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCard(editingId)}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  Remover
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !name.trim() || !brand || !closingDay || !dueDay}
                className="flex-1"
              >
                {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {!showForm && (
        <Button
          variant="outline"
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full border-dashed border-primary/40 text-primary hover:border-primary/60 hover:bg-primary-light"
        >
          + Adicionar cartão
        </Button>
      )}

      <div className="mt-auto flex flex-col gap-1.5 pt-4">
        <Button onClick={onNext} className="w-full" size="lg">
          Próximo
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full text-muted-foreground"
        >
          Pular
        </Button>
      </div>
    </div>
  );
}
