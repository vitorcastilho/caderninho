'use client';

import { useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/client/utils/utils';
import { formatCurrency } from '@/client/utils/format-currency';
import { CurrencyInput } from '@/client/components/ui/currency-input';
import { ImpactPreview } from '@/client/components/ui/impact-preview';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';

export interface CascadeInputData {
  valueCents: number;
  classificationId: string;
  categoryId: string;
  establishment: string;
  paymentMethodId: string;
}

interface Classification {
  id: string;
  name: string;
  emoji: string;
}

interface Category {
  id: string;
  name: string;
  classificationId: string;
  budget?: number;
}

interface PaymentMethod {
  id: string;
  label: string;
  type: 'debit' | 'credit' | 'pix';
}

interface CascadeInputProps {
  classifications: Classification[];
  categories: Category[];
  suggestedEstablishments?: string[];
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string;
  onConfirm: (data: CascadeInputData) => void;
  onCancel: () => void;
  className?: string;
}

const TOTAL_STEPS = 4;

export function CascadeInput({
  classifications,
  categories,
  suggestedEstablishments = [],
  paymentMethods,
  defaultPaymentMethodId,
  onConfirm,
  onCancel,
  className,
}: CascadeInputProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [valueCents, setValueCents] = useState(0);
  const [classificationId, setClassificationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(defaultPaymentMethodId ?? '');

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedClassification = classifications.find((c) => c.id === classificationId);
  const selectedPayment = paymentMethods.find((p) => p.id === paymentMethodId);

  const filteredCategories = classificationId
    ? categories.filter((c) => c.classificationId === classificationId)
    : [];

  const canAdvanceStep1 = valueCents > 0;
  const canAdvanceStep2 = classificationId !== '' && categoryId !== '';
  const canAdvanceStep3 = paymentMethodId !== '';

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleConfirm = useCallback(() => {
    onConfirm({
      valueCents,
      classificationId,
      categoryId,
      establishment,
      paymentMethodId,
    });
  }, [onConfirm, valueCents, classificationId, categoryId, establishment, paymentMethodId]);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2" role="group" aria-label="Progresso do registro">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;

          return (
            <div
              key={stepNum}
              className={cn(
                'flex items-center justify-center rounded-full transition-all',
                isActive && 'h-2 w-6 bg-indigo-500',
                isComplete && 'size-2 bg-indigo-500',
                !isActive && !isComplete && 'size-2 bg-stone-300',
              )}
              aria-label={
                isComplete
                  ? `Etapa ${stepNum}: concluída`
                  : isActive
                    ? `Etapa ${stepNum}: atual`
                    : `Etapa ${stepNum}: pendente`
              }
            >
              {isComplete && <Check className="size-1.5 text-white" />}
            </div>
          );
        })}
      </div>

      {/* Wrapper persistente para aria-live — screen readers detectam transições de step */}
      <div aria-live="polite" aria-atomic="true">
        {/* Step 1: Valor */}
        {currentStep === 1 && (
          <div aria-label="Etapa 1: Valor" className="flex flex-col gap-4">
            <h3 className="text-center text-lg font-semibold">Qual o valor?</h3>
            <CurrencyInput
              value={valueCents}
              onChange={setValueCents}
              label="Valor do gasto"
              id="cascade-value"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={goNext} disabled={!canAdvanceStep1} className="flex-1">
                Avançar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Classificação + Categoria */}
        {currentStep === 2 && (
          <div aria-label="Etapa 2: Classificação e Categoria" className="flex flex-col gap-4">
            <h3 className="text-center text-lg font-semibold">Classificação e Categoria</h3>

            {/* Classification pills */}
            <div className="flex flex-wrap gap-2">
              {classifications.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => {
                    setClassificationId(cls.id);
                    setCategoryId('');
                  }}
                  className={cn(
                    'rounded-full border-[1.5px] px-4 py-2 text-sm font-medium transition-colors',
                    classificationId === cls.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-stone-200 text-stone-700 hover:border-stone-300',
                  )}
                >
                  {cls.emoji} {cls.name}
                </button>
              ))}
            </div>

            {/* Category chips */}
            {filteredCategories.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      'rounded-[10px] border-[1.5px] p-3 text-center text-sm font-medium transition-colors',
                      categoryId === cat.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-stone-200 text-stone-700 hover:border-stone-300',
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={goBack} className="flex-1">
                Voltar
              </Button>
              <Button onClick={goNext} disabled={!canAdvanceStep2} className="flex-1">
                Avançar
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Estabelecimento + Pagamento */}
        {currentStep === 3 && (
          <div aria-label="Etapa 3: Estabelecimento e Pagamento" className="flex flex-col gap-4">
            <h3 className="text-center text-lg font-semibold">Detalhes</h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cascade-establishment" className="text-sm font-medium">
                Estabelecimento
              </label>
              <Input
                id="cascade-establishment"
                value={establishment}
                onChange={(e) => setEstablishment(e.target.value)}
                placeholder="Ex: Supermercado, Restaurante..."
              />
              {suggestedEstablishments.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {suggestedEstablishments.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setEstablishment(name)}
                      className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-200"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Método de pagamento</span>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethodId(method.id)}
                    className={cn(
                      'rounded-lg border-[1.5px] px-3 py-2 text-sm font-medium transition-colors',
                      paymentMethodId === method.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-stone-200 text-stone-700 hover:border-stone-300',
                    )}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Preview se a categoria tem budget */}
            {selectedCategory?.budget !== undefined && (
              <ImpactPreview
                items={[
                  {
                    label: selectedCategory.name,
                    before: 0,
                    after: valueCents,
                    budget: selectedCategory.budget,
                  },
                ]}
              />
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={goBack} className="flex-1">
                Voltar
              </Button>
              <Button onClick={goNext} disabled={!canAdvanceStep3} className="flex-1">
                Avançar
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmação */}
        {currentStep === 4 && (
          <div aria-label="Etapa 4: Confirmação" className="flex flex-col gap-4">
            <h3 className="text-center text-lg font-semibold">Confirmar</h3>

            <div className="rounded-lg border bg-card p-4">
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Valor</dt>
                  <dd className="font-medium tabular-nums">{formatCurrency(valueCents)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Classificação</dt>
                  <dd className="font-medium">
                    {selectedClassification ? `${selectedClassification.emoji} ${selectedClassification.name}` : '-'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Categoria</dt>
                  <dd className="font-medium">{selectedCategory?.name ?? '-'}</dd>
                </div>
                {establishment && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estabelecimento</dt>
                    <dd className="font-medium">{establishment}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pagamento</dt>
                  <dd className="font-medium">{selectedPayment?.label ?? '-'}</dd>
                </div>
              </dl>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={goBack} className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
