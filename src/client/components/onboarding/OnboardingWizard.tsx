'use client';

import { useState } from 'react';

import { StepIndicator } from './StepIndicator';
import { WelcomeStep } from './steps/WelcomeStep';
import { BankAccountsStep } from './steps/BankAccountsStep';
import { CreditCardsStep } from './steps/CreditCardsStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { CompletionStep } from './steps/CompletionStep';

interface BankAccountData {
  id: string;
  name: string;
  bank: string;
  balanceCents: number;
  status: string;
}

interface CreditCardData {
  id: string;
  name: string;
  brand: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  status: string;
}

interface CategoryData {
  id: string;
  name: string;
}

interface ClassificationData {
  id: string;
  name: string;
}

interface OnboardingWizardProps {
  existingAccounts: BankAccountData[];
  existingCards: CreditCardData[];
  existingCategories: CategoryData[];
  classifications: ClassificationData[];
}

const TOTAL_STEPS = 5;

export function OnboardingWizard({
  existingAccounts,
  existingCards,
  existingCategories,
  classifications,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [accounts, setAccounts] = useState<BankAccountData[]>(existingAccounts);
  const [cards, setCards] = useState<CreditCardData[]>(existingCards);
  const [categories, setCategories] = useState<CategoryData[]>(existingCategories);

  function goNext() {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }

  function goBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  function handleAccountAdded(account: BankAccountData) {
    setAccounts((prev) => [...prev, account]);
  }

  function handleCardAdded(card: CreditCardData) {
    setCards((prev) => [...prev, card]);
  }

  function handleCategoriesCreated(createdCategories: CategoryData[]) {
    setCategories((prev) => [...prev, ...createdCategories]);
  }

  // Calcular totais para o step de completion
  const activeAccounts = accounts.filter(a => a.status !== 'archived');
  const activeCards = cards.filter(c => c.status !== 'archived');
  const totalBalanceCents = activeAccounts.reduce((sum, a) => sum + a.balanceCents, 0);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-lg flex-col" style={{ minHeight: '580px' }}>
        {/* Botão voltar (exceto step 1) */}
        {currentStep > 1 && currentStep < TOTAL_STEPS && (
          <button
            onClick={goBack}
            className="mb-2 self-start text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-700"
          >
            ← Voltar
          </button>
        )}

        {/* Conteúdo do step */}
        <div className="flex flex-1 flex-col">
          {currentStep === 1 && (
            <WelcomeStep onNext={goNext} />
          )}

          {currentStep === 2 && (
            <BankAccountsStep
              existingAccounts={accounts}
              onNext={goNext}
              onSkip={goNext}
              onAccountAdded={handleAccountAdded}
            />
          )}

          {currentStep === 3 && (
            <CreditCardsStep
              existingCards={cards}
              onNext={goNext}
              onSkip={goNext}
              onCardAdded={handleCardAdded}
            />
          )}

          {currentStep === 4 && (
            <CategoriesStep
              classifications={classifications}
              existingCategories={categories}
              onNext={goNext}
              onSkip={goNext}
              onCategoriesCreated={handleCategoriesCreated}
            />
          )}

          {currentStep === 5 && (
            <CompletionStep
              accountsCount={activeAccounts.length}
              cardsCount={activeCards.length}
              categoriesCount={categories.length}
              totalBalanceCents={totalBalanceCents}
            />
          )}
        </div>

        {/* Step indicator */}
        <StepIndicator totalSteps={TOTAL_STEPS} currentStep={currentStep} />
      </div>
    </div>
  );
}
