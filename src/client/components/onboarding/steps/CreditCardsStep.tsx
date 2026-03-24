'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

import { createCreditCardAction, updateCreditCardAction, archiveCreditCardAction } from '@/server/actions/credit-card.actions';
import { centsToDisplayValue, displayValueToCents } from '@/client/utils/currency-input';
import { CreditCardBrandBadge } from '@/client/components/ui/credit-card-brand-badge';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';

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
  const [limitDisplay, setLimitDisplay] = useState('0,00');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  function resetForm() {
    setName('');
    setBrand('');
    setLimitDisplay('0,00');
    setClosingDay('');
    setDueDay('');
    setEditingId(null);
    setShowForm(false);
  }

  function handleStartEdit(card: CreditCardItem) {
    setEditingId(card.id);
    setName(card.name);
    setBrand(card.brand);
    setLimitDisplay(centsToDisplayValue(card.limitCents));
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

    const limitCents = displayValueToCents(limitDisplay);
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
      <h2 className="text-lg font-bold text-stone-900 mb-1">Seus cartões de crédito</h2>
      <p className="text-[13px] text-stone-500 mb-4 leading-relaxed">
        Cadastre seus cartões para controlar as faturas
      </p>

      {/* Lista de cartões */}
      {activeCards.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {activeCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-1 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 transition-colors hover:border-stone-300"
            >
              <div className="flex items-center gap-2.5">
                <CreditCardBrandBadge brand={card.brand} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-stone-900">{card.name}</div>
                  <div className="text-[11px] text-stone-500">
                    Limite: R$ {centsToDisplayValue(card.limitCents)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartEdit(card)}
                  disabled={isPending}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600 disabled:opacity-50"
                  title="Editar cartão"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
              <div className="text-[11px] text-stone-400 pl-[36px]">
                Fecha dia {card.closingDay} · Vence dia {card.dueDay}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário inline (criar ou editar) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 rounded-md border border-indigo-200 bg-indigo-50 p-3">
          <div className="text-xs font-semibold text-indigo-600 mb-2">
            {editingId ? 'Editar cartão' : 'Adicionar cartão'}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <Label htmlFor="onb-card-name" className="text-xs text-stone-500">Nome do cartão</Label>
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
                <Label htmlFor="onb-card-brand" className="text-xs text-stone-500">Bandeira</Label>
                <select
                  id="onb-card-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="h-8 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20"
                >
                  <option value="">Selecionar...</option>
                  {BRAND_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="onb-card-limit" className="text-xs text-stone-500">Limite (R$)</Label>
                <Input
                  id="onb-card-limit"
                  value={`R$ ${limitDisplay}`}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    const cents = parseInt(digits || '0', 10);
                    setLimitDisplay(centsToDisplayValue(cents));
                  }}
                  inputMode="numeric"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="onb-closing-day" className="text-xs text-stone-500">Dia de fechamento</Label>
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
                <Label htmlFor="onb-due-day" className="text-xs text-stone-500">Dia de vencimento</Label>
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
                <button
                  type="button"
                  onClick={() => handleRemoveCard(editingId)}
                  disabled={isPending}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Remover
                </button>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !name.trim() || !brand || !closingDay || !dueDay}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!showForm && (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full rounded-md border border-dashed border-indigo-400 px-4 py-2.5 text-[13px] font-medium text-indigo-600 transition-colors hover:border-indigo-500 hover:bg-indigo-50"
        >
          + Adicionar cartão
        </button>
      )}

      <div className="mt-auto flex flex-col gap-1.5 pt-4">
        <button
          onClick={onNext}
          className="w-full rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Próximo
        </button>
        <button
          onClick={onSkip}
          className="w-full rounded-md px-4 py-2.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-indigo-600 hover:bg-indigo-50"
        >
          Pular
        </button>
      </div>
    </div>
  );
}
