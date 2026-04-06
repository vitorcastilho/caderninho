'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/client/utils/utils';
import { formatCurrency } from '@/client/utils/format-currency';
import { centsToDisplayValue } from '@/client/utils/currency-input';
import { CreditCardBrandBadge } from '@/client/components/ui/credit-card-brand-badge';
import { NumericKeypad } from '@/client/components/ui/numeric-keypad';
import { InstallmentStrip } from '@/client/components/ui/installment-strip';
import { ImpactPreview } from '@/client/components/ui/impact-preview';
import { CurrencyInput } from '@/client/components/ui/currency-input';
import { Input } from '@/client/components/ui/input';

// ── Types ──

export interface CascadeInputData {
  valueCents: number;
  classificationId: string;
  categoryId: string;
  subcategoryId: string;
  establishment: string;
  paymentMethodId: string;
  installments: number;
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

export interface Classification {
  id: string;
  name: string;
  emoji: string;
}

export interface Category {
  id: string;
  name: string;
  classificationId: string;
  budget?: number;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  defaultPaymentMethodId?: string | null;
  defaultPaymentMethodLabel?: string | null;
  defaultPaymentMethodBrand?: string | null;
}

export interface PaymentMethod {
  id: string;
  label: string;
  type: 'debit' | 'credit' | 'pix';
  brand?: string | null;
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
  isMobile?: boolean;
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
  isMobile = false,
  onConfirm,
  onCancel,
  onSubcategorySelect,
  onRequestImpact,
  className,
}: CascadeInputProps) {
  // ── State ──
  const [currentStep, setCurrentStep] = useState(1);
  const [valueCents, setValueCents] = useState(0);
  const [valueDigits, setValueDigits] = useState('');
  const [classificationId, setClassificationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [showCustomEstablishment, setShowCustomEstablishment] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState(defaultPaymentMethodId ?? '');
  const [installments, setInstallments] = useState(0);

  // ── Derived ──
  const selectedClassification = classifications.find((c) => c.id === classificationId);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedSubcategory = subcategories.find((s) => s.id === subcategoryId);
  const selectedPayment = paymentMethods.find((p) => p.id === paymentMethodId);
  const isCredit = selectedPayment?.type === 'credit';

  const filteredCategories = classificationId
    ? categories.filter((c) => c.classificationId === classificationId)
    : [];

  const filteredSubcategories = categoryId
    ? subcategories.filter((s) => s.categoryId === categoryId)
    : [];

  // ── Handlers ──
  const handleKeypadDigit = useCallback((digit: string) => {
    setValueDigits((prev) => {
      if (prev.length >= 10) return prev;
      const next = prev + digit;
      setValueCents(parseInt(next, 10));
      return next;
    });
  }, []);

  const handleKeypadBackspace = useCallback(() => {
    setValueDigits((prev) => {
      const next = prev.slice(0, -1);
      setValueCents(next ? parseInt(next, 10) : 0);
      return next;
    });
  }, []);

  const handleSelectClassification = useCallback((id: string) => {
    setClassificationId(id);
    setCategoryId('');
    setSubcategoryId('');
    setEstablishment('');
    setShowCustomEstablishment(false);
  }, []);

  const handleSelectCategory = useCallback((id: string) => {
    setCategoryId(id);
    setSubcategoryId('');
    setEstablishment('');
    setShowCustomEstablishment(false);
    if (isMobile) {
      // Auto-advance: classificação+categoria → subcategoria
      setCurrentStep(3);
    }
  }, [isMobile]);

  const handleSelectSubcategory = useCallback((sub: Subcategory) => {
    setSubcategoryId(sub.id);
    if (sub.defaultPaymentMethodId) {
      setPaymentMethodId(sub.defaultPaymentMethodId);
    }
    setEstablishment('');
    setShowCustomEstablishment(false);
    onSubcategorySelect?.(sub.id);
    if (isMobile) {
      // Auto-advance: subcategoria → onde/pagamento
      setCurrentStep(4);
    }
  }, [isMobile, onSubcategorySelect]);

  const handleSelectEstablishment = useCallback((name: string) => {
    setEstablishment(name);
    setShowCustomEstablishment(false);
  }, []);

  const handleSelectPayment = (method: PaymentMethod) => {
    setPaymentMethodId(method.id);
    if (method.type !== 'credit') {
      setInstallments(0);
    }
    if (onRequestImpact && categoryId) {
      onRequestImpact({
        amountCents: valueCents,
        paymentMethodId: method.id,
        categoryId,
      });
    }
  };

  const handleAdvanceToConfirm = useCallback(() => {
    if (onRequestImpact && paymentMethodId && categoryId) {
      onRequestImpact({
        amountCents: valueCents,
        paymentMethodId,
        categoryId,
      });
    }
    setCurrentStep(5);
  }, [onRequestImpact, paymentMethodId, categoryId, valueCents]);

  const handleConfirm = useCallback(() => {
    onConfirm({
      valueCents,
      classificationId,
      categoryId,
      subcategoryId,
      establishment,
      paymentMethodId,
      installments: isCredit ? installments : 0,
    });
  }, [onConfirm, valueCents, classificationId, categoryId, subcategoryId, establishment, paymentMethodId, installments, isCredit]);

  const handleGoBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const requestImpactForCurrent = useCallback(() => {
    if (onRequestImpact && paymentMethodId && categoryId) {
      onRequestImpact({ amountCents: valueCents, paymentMethodId, categoryId });
    }
  }, [onRequestImpact, paymentMethodId, categoryId, valueCents]);

  // ── Shared render helpers ──

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-1 py-2" role="group" aria-label="Progresso do registro">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        return (
          <div
            key={stepNum}
            className={cn(
              'rounded transition-all',
              isActive && 'h-2 w-5 bg-indigo-600',
              isDone && 'size-2 rounded-full bg-indigo-600 opacity-40',
              !isActive && !isDone && 'size-2 rounded-full bg-stone-300',
            )}
            aria-label={
              isDone
                ? `Etapa ${stepNum}: concluída`
                : isActive
                  ? `Etapa ${stepNum}: atual`
                  : `Etapa ${stepNum}: pendente`
            }
          />
        );
      })}
    </div>
  );

  const renderSummaryBar = () => {
    if (currentStep <= 1) return null;

    return (
      <button
        type="button"
        onClick={handleGoBack}
        className="flex items-center gap-2 overflow-hidden border-b border-stone-200 bg-stone-100 px-5 py-3"
        aria-label="Voltar ao passo anterior"
      >
        <span className="shrink-0 text-lg font-bold tabular-nums text-stone-900">
          {formatCurrency(valueCents)}
        </span>
        {selectedCategory && (
          <>
            <span className="shrink-0 text-[13px] text-stone-400">&middot;</span>
            <span className="inline-flex min-w-0 shrink items-center truncate rounded-full bg-indigo-50 px-2 py-1 text-[13px] font-medium text-indigo-600">
              {selectedClassification?.emoji && `${selectedClassification.emoji} `}{selectedCategory.name}
            </span>
          </>
        )}
      </button>
    );
  };

  const renderFieldLabel = (label: string) => (
    <div className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
      {label}
    </div>
  );

  const renderImpactPreview = () => {
    if (!impactData) return null;
    return (
      <ImpactPreview
        items={[
          {
            label: impactData.paymentMethodLabel,
            before: impactData.balanceBefore,
            after: impactData.balanceAfter,
          },
          ...(impactData.budgetTotal > 0
            ? [{
                label: impactData.categoryLabel,
                before: impactData.budgetSpent - valueCents,
                after: impactData.budgetSpent,
                budget: impactData.budgetTotal,
              }]
            : []),
        ]}
      />
    );
  };

  const renderConfirmButtonText = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="size-4 animate-spin" />
          Enviando...
        </>
      );
    }
    if (isCredit && installments > 1) {
      return <>✓ Confirmar {installments}x {formatCurrency(Math.ceil(valueCents / installments))}</>;
    }
    return '✓ Confirmar';
  };

  const renderEstablishmentChips = (padding: string) => (
    <>
      <div className={cn('flex flex-wrap gap-2', padding)}>
        {suggestedEstablishments.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => handleSelectEstablishment(name)}
            className={cn(
              'rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
              establishment === name && !showCustomEstablishment
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-stone-200 text-stone-900 hover:border-indigo-600 hover:bg-indigo-50',
            )}
          >
            {name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setShowCustomEstablishment(true);
            setEstablishment('');
          }}
          className={cn(
            'rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
            showCustomEstablishment
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-indigo-100 text-indigo-600 hover:bg-indigo-50',
          )}
        >
          + Outro
        </button>
      </div>
      {showCustomEstablishment && (
        <div className={cn('pt-2', padding)}>
          <Input
            value={establishment}
            onChange={(e) => setEstablishment(e.target.value)}
            placeholder="Nome do estabelecimento"
            autoFocus
          />
        </div>
      )}
    </>
  );

  const renderPaymentChips = (padding: string) => (
    <div className={cn('flex flex-wrap gap-2', padding)}>
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => handleSelectPayment(method)}
          className={cn(
            'flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
            paymentMethodId === method.id
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-stone-200 text-stone-900 hover:border-indigo-600 hover:bg-indigo-50',
          )}
        >
          {method.brand && <CreditCardBrandBadge brand={method.brand} />}
          {method.label}
        </button>
      ))}
    </div>
  );

  // ── Mobile Render ──
  if (isMobile) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)} aria-live="polite">
        {/* Step 1: Valor com NumericKeypad */}
        {currentStep === 1 && (
          <div className="flex flex-1 flex-col">
            <div className="py-8 text-center">
              <span className="text-base font-medium text-stone-400">R$ </span>
              <span className={cn(
                'text-[32px] font-bold tracking-tight tabular-nums',
                valueDigits ? 'text-stone-900' : 'text-stone-300',
              )}>
                {valueDigits ? centsToDisplayValue(valueCents) : '____'}
              </span>
              <span className="ml-0.5 inline-block h-8 w-0.5 animate-pulse bg-indigo-600 align-middle" />
            </div>
            {renderStepIndicator()}
            <NumericKeypad
              onDigit={handleKeypadDigit}
              onBackspace={handleKeypadBackspace}
            />
            <div className="px-5 pb-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={valueCents === 0}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Classificação + Categoria (selection-driven) */}
        {currentStep === 2 && (
          <div className="flex flex-1 flex-col">
            {renderSummaryBar()}
            {renderStepIndicator()}

            {renderFieldLabel('Classificação')}
            <div className="flex gap-1.5 overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {classifications.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleSelectClassification(cls.id)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
                    classificationId === cls.id
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-stone-200 text-stone-500 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600',
                  )}
                >
                  {cls.emoji} {cls.name}
                </button>
              ))}
            </div>

            {filteredCategories.length > 0 && (
              <>
                {renderFieldLabel('Categoria')}
                <div className="grid grid-cols-2 gap-2 px-5">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border p-3 text-[13px] font-medium transition-colors',
                        categoryId === cat.id
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-stone-200 text-stone-900 hover:border-indigo-600 hover:bg-indigo-50',
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Subcategoria (selection-driven → auto-advance) */}
        {currentStep === 3 && (
          <div className="flex flex-1 flex-col">
            {renderSummaryBar()}
            {renderStepIndicator()}

            {renderFieldLabel('Subcategoria')}
            {filteredSubcategories.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 px-5">
                {filteredSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSelectSubcategory(sub)}
                    className={cn(
                      'flex flex-col items-start rounded-xl border p-3 text-left transition-colors',
                      subcategoryId === sub.id
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-stone-200 text-stone-900 hover:border-indigo-600 hover:bg-indigo-50',
                    )}
                  >
                    <span className="text-[13px] font-medium">{sub.name}</span>
                    {sub.defaultPaymentMethodLabel && (
                      <span className={cn(
                        'mt-0.5 flex items-center gap-1 text-[10px]',
                        subcategoryId === sub.id ? 'text-white/70' : 'text-stone-400',
                      )}>
                        {sub.defaultPaymentMethodBrand && (
                          <CreditCardBrandBadge brand={sub.defaultPaymentMethodBrand} />
                        )}
                        {sub.defaultPaymentMethodLabel}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-5 text-center text-sm text-stone-400">
                Nenhuma subcategoria disponível
              </p>
            )}
          </div>
        )}

        {/* Step 4: Onde + Pagamento (+ Parcelas se crédito) */}
        {currentStep === 4 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto">
              {renderSummaryBar()}
              {renderStepIndicator()}

              {renderFieldLabel('Onde?')}
              {renderEstablishmentChips('px-5')}

              {renderFieldLabel('Pagamento')}
              {renderPaymentChips('px-5')}

              {isCredit && (
                <>
                  {renderFieldLabel('Parcelas')}
                  <div className="px-5">
                    <InstallmentStrip
                      amountCents={valueCents}
                      selected={installments}
                      onSelect={setInstallments}
                    />
                  </div>
                </>
              )}

              {impactData && (
                <div className="px-5 py-4">
                  {renderImpactPreview()}
                </div>
              )}
            </div>

            {/* Footer fixo com botão avançar para confirmação */}
            <div className="shrink-0 border-t border-stone-200 bg-white px-5 py-2">
              <button
                type="button"
                onClick={handleAdvanceToConfirm}
                disabled={!paymentMethodId}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isCredit && installments > 1
                  ? <>✓ Confirmar {installments}x {formatCurrency(Math.ceil(valueCents / installments))}</>
                  : '✓ Confirmar'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmação */}
        {currentStep === 5 && (
          <div className="flex flex-1 flex-col">
            {renderStepIndicator()}

            <div className="px-5 pt-4 text-center">
              <div className="text-[28px] font-bold tabular-nums text-stone-900">
                {formatCurrency(valueCents)}
              </div>
              <div className="mt-2 text-[13px] leading-relaxed text-stone-500">
                <strong className="font-semibold text-stone-900">
                  {selectedCategory?.name}
                </strong>
                {selectedSubcategory && (
                  <> <span className="text-stone-400">→</span> {selectedSubcategory.name}</>
                )}
                {establishment && (
                  <> <span className="text-stone-400">→</span> {establishment}</>
                )}
                {selectedPayment && (
                  <>
                    <br />
                    {selectedPayment.brand && (
                      <CreditCardBrandBadge brand={selectedPayment.brand} />
                    )}
                    {' '}{selectedPayment.label}
                    {' · '}
                    {isCredit && installments > 1
                      ? `${installments}x`
                      : 'à vista'}
                  </>
                )}
              </div>
            </div>

            {impactData && (
              <div className="px-5 pt-4">
                {renderImpactPreview()}
              </div>
            )}

            <div className="mt-auto px-5 pb-4 pt-4">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              >
                {renderConfirmButtonText()}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="mt-2 w-full py-2 text-center text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop Render (single pane, all fields visible) ──
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Valor */}
        <CurrencyInput
          value={valueCents}
          onChange={setValueCents}
          label="Valor"
          id="cascade-value"
        />

        {/* Classificação — select dropdown no desktop */}
        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="cascade-classification" className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Classificação
          </label>
          <select
            id="cascade-classification"
            value={classificationId}
            onChange={(e) => handleSelectClassification(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-lg border border-stone-200 bg-white bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2378716C%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 py-2.5 pr-8 text-[13px] font-medium text-stone-900 transition-colors hover:border-stone-300 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">Selecione...</option>
            {classifications.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.emoji} {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria — chips grid */}
        {filteredCategories.length > 0 && (
          <div className="mt-4">
            <div className="pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Categoria
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    setSubcategoryId('');
                    setEstablishment('');
                    setShowCustomEstablishment(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-3 text-[13px] font-medium transition-colors',
                    categoryId === cat.id
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-stone-200 text-stone-900 hover:border-indigo-600 hover:bg-indigo-50',
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategoria — chips grid com badge método */}
        {filteredSubcategories.length > 0 && (
          <div className="mt-4">
            <div className="pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Subcategoria
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filteredSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    handleSelectSubcategory(sub);
                    const resolvedPaymentId = sub.defaultPaymentMethodId ?? paymentMethodId;
                    if (onRequestImpact && resolvedPaymentId && categoryId) {
                      onRequestImpact({
                        amountCents: valueCents,
                        paymentMethodId: resolvedPaymentId,
                        categoryId,
                      });
                    }
                  }}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-3 text-left transition-colors',
                    subcategoryId === sub.id
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-stone-200 text-stone-900 hover:border-indigo-600 hover:bg-indigo-50',
                  )}
                >
                  <span className="text-[13px] font-medium">{sub.name}</span>
                  {sub.defaultPaymentMethodLabel && (
                    <span className={cn(
                      'mt-0.5 flex items-center gap-1 text-[10px]',
                      subcategoryId === sub.id ? 'text-white/70' : 'text-stone-400',
                    )}>
                      {sub.defaultPaymentMethodBrand && (
                        <CreditCardBrandBadge brand={sub.defaultPaymentMethodBrand} />
                      )}
                      {sub.defaultPaymentMethodLabel}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Onde? */}
        {subcategoryId && (
          <div className="mt-4">
            <div className="pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Onde?
            </div>
            {renderEstablishmentChips('')}
          </div>
        )}

        {/* Pagamento */}
        {subcategoryId && (
          <div className="mt-4">
            <div className="pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Pagamento
            </div>
            {renderPaymentChips('')}
          </div>
        )}

        {/* Parcelas (se crédito) */}
        {isCredit && (
          <div className="mt-4">
            <div className="pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Parcelas
            </div>
            <InstallmentStrip
              amountCents={valueCents}
              selected={installments}
              onSelect={setInstallments}
            />
          </div>
        )}

        {/* Impact Preview */}
        {impactData && (
          <div className="mt-4">
            {renderImpactPreview()}
          </div>
        )}
      </div>

      {/* Footer — sempre visível no desktop */}
      <div className="shrink-0 border-t border-stone-200 bg-white px-6 py-3">
        <button
          type="button"
          onClick={() => {
            requestImpactForCurrent();
            handleConfirm();
          }}
          disabled={isSubmitting || valueCents === 0 || !categoryId || !paymentMethodId}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
        >
          {renderConfirmButtonText()}
        </button>
      </div>
    </div>
  );
}
