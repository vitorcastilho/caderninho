import { redirect } from 'next/navigation';

import { checkOnboardingStatusAction } from '@/server/actions/onboarding.actions';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listClassificationsAction } from '@/server/actions/classification.actions';
import { OnboardingWizard } from '@/client/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
  // Se já completou onboarding, vai para dashboard
  const onboardingResult = await checkOnboardingStatusAction(null);
  if (onboardingResult.success && onboardingResult.data.completed) {
    redirect('/dashboard');
  }

  // Carregar dados existentes (para retomada de progresso)
  const [accountsResult, cardsResult, categoriesResult, classificationsResult] = await Promise.all([
    listBankAccountsAction(null),
    listCreditCardsAction(null),
    listCategoriesAction(null),
    listClassificationsAction(null),
  ]);

  const existingAccounts = accountsResult.success ? accountsResult.data : [];
  const existingCards = cardsResult.success ? cardsResult.data : [];
  const existingCategories = categoriesResult.success ? categoriesResult.data : [];
  const classifications = classificationsResult.success ? classificationsResult.data : [];

  return (
    <OnboardingWizard
      existingAccounts={existingAccounts}
      existingCards={existingCards}
      existingCategories={existingCategories}
      classifications={classifications}
    />
  );
}
