'use client';

import { useState, useCallback } from 'react';
import { Check, Loader2 } from 'lucide-react';
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
  subcategoryId: string;
  establishment: string;
  paymentMethodId: string;
}

export interface CascadeImpactData {
  paymentMethodLabel: string;
  balanceBefore: number;
  balanceAfter: number;
  categoryLabel: string;
  budgetSpent: number;
  budgetTotal: number;
  budgetPercentage: number;
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

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  defaultPaymentMethodId?: string | null;
  defaultPaymentMethodLabel?: string | null;
}

interface PaymentMethod {
  id: string;
  label: string;
  type: 'debit' | 'credit' | 'pix';
}

interface CascadeInputProps {
  classifications: Classification[];
  categories: Category[];
  subcategories?: Subcategory[];
  suggestedEstablishments?: string[];
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string;
  impactData?: CascadeImpactData | null;
  isSubmitting?: boolean;
  onConfirm: (data: CascadeInputData) => void;
  onCancel: () => void;
  onSubcategorySelect?: (subcategoryId: string) => void;
  onRequestImpact?: (data: {
    amountCents: number;
    paymentMethodId: string;
    categoryId: string;
  }) => void;
  className?: string;
}

const TOTAL_STEPS = 5;

export function CascadeInput({
  classifications,
  categories,
  subcategories = [],
  suggestedEstablishments = [],
  paymentMethods,
  defaultPaymentMethodId,
  impactData,
  isSubmitting = false,
  onConfirm,
  onCancel,
  onSubcategorySelect,
  onRequestImpact,
  className,
}: CascadeInputProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [valueCents, setValueCents] = useState(0);
  const [classificationId, setClassificationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(defaultPaymentMethodId ?? '');

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedClassification = classifications.find((c) => c.id === classificationId);
  const selectedSubcategory = subcategories.find((s) => s.id === subcategoryId);
  const selectedPayment = paymentMethods.find((p) => p.id === paymentMethodId);

  const filteredCategories = classificationId
    ? categories.filter((c) => c.classificationId === classificationId)
    : [];

  const filteredSubcategories = categoryId
    ? subcategories.filter((s) => s.categoryId === categoryId)
    : [];

  const canAdvanceStep1 = valueCents > 0;
  const canAdvanceStep2 = classificationId !== '' && categoryId !== '';
  const canAdvanceStep3 = subcategoryId !== '' || filteredSubcategories.length === 0;
  const canAdvanceStep4 = paymentMethodId !== '';

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

  const handleSelectSubcategory = useCallback(
    (sub: Subcategory) => {
      setSubcategoryId(sub.id);
      if (sub.defaultPaymentMethodId) {
        setPaymentMethodId(sub.defaultPaymentMethodId);
      }
      onSubcategorySelect?.(sub.id);
    },
    [onSubcategorySelect],
  );

  const handleAdvanceToStep5 = useCallback(() => {
    // Solicitar dados de impacto antes de avançar para confirmação
    if (onRequestImpact && paymentMethodId && categoryId) {
      onRequestImpact({
        amountCents: valueCents,
        paymentMethodId,
        categoryId,
      });
    }
    goNext();
  }, [onRequestImpact, paymentMethodId, categoryId, valueCents, goNext]);

  const handleConfirm = useCallback(() => {
    onConfirm({
      valueCents,
      classificationId,
      categoryId,
      subcategoryId,
      establishment,
      paymentMethodId,
    });
  }, [onConfirm, valueCents, classificationId, categoryId, subcategoryId, establishment, paymentMethodId]);

  // Summary bar — mostra dados já preenchidos nos steps 2-4
  const renderSummaryBar = () => {
    const parts: string[] = [];
    if (valueCents > 0) parts.push(formatCurrency(valueCents));
    if (selectedClassification) parts.push(selectedClassification.name);
    if (selectedCategory) parts.push(selectedCategory.name);
    if (selectedSubcategory) parts.push(selectedSubcategory.name);

    if (parts.length === 0) return null;

    return (
      <div className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600">
        {parts.join(' · ')}
      </div>
    );
  };

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
            {renderSummaryBar()}
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
                    setSubcategoryId('');
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
                    onClick={() => {
                      setCategoryId(cat.id);
                      setSubcategoryId('');
                    }}
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

        {/* Step 3: Subcategoria */}
        {currentStep === 3 && (
          <div aria-label="Etapa 3: Subcategoria" className="flex flex-col gap-4">
            {renderSummaryBar()}
            <h3 className="text-center text-lg font-semibold">Subcategoria</h3>

            {filteredSubcategories.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSelectSubcategory(sub)}
                    className={cn(
                      'flex flex-col items-start rounded-[10px] border-[1.5px] p-3 text-left text-sm font-medium transition-colors',
                      subcategoryId === sub.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-stone-200 text-stone-700 hover:border-stone-300',
                    )}
                  >
                    <span>{sub.name}</span>
                    {sub.defaultPaymentMethodLabel && (
                      <span
                        className={cn(
                          'mt-1 text-xs',
                          subcategoryId === sub.id
                            ? 'text-indigo-500'
                            : 'text-stone-400',
                        )}
                      >
                        {sub.defaultPaymentMethodLabel}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma subcategoria disponível
              </p>
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

        {/* Step 4: Estabelecimento + Pagamento */}
        {currentStep === 4 && (
          <div aria-label="Etapa 4: Estabelecimento e Pagamento" className="flex flex-col gap-4">
            {renderSummaryBar()}
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

            <div className="flex gap-2">
              <Button variant="outline" onClick={goBack} className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleAdvanceToStep5} disabled={!canAdvanceStep4} className="flex-1">
                Avançar
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmação */}
        {currentStep === 5 && (
          <div aria-label="Etapa 5: Confirmação" className="flex flex-col gap-4">
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
                {selectedSubcategory && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subcategoria</dt>
                    <dd className="font-medium">{selectedSubcategory.name}</dd>
                  </div>
                )}
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

            {/* Impact Preview — F9: mostra na confirmação conforme proto-07 */}
            {impactData && (
              <ImpactPreview
                items={[
                  {
                    label: impactData.paymentMethodLabel,
                    before: impactData.balanceBefore,
                    after: impactData.balanceAfter,
                  },
                  ...(impactData.budgetTotal > 0
                    ? [
                        {
                          label: impactData.categoryLabel,
                          before: impactData.budgetSpent - valueCents,
                          after: impactData.budgetSpent,
                          budget: impactData.budgetTotal,
                        },
                      ]
                    : []),
                ]}
              />
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={goBack} disabled={isSubmitting} className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleConfirm} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
