import { listCreditCardsAction } from '@/server/actions/credit-card.actions';
import { CreditCardList } from '@/client/components/credit-cards/CreditCardList';

export default async function CreditCardsPage() {
  const result = await listCreditCardsAction(undefined);

  const cards = result.success ? result.data : [];

  return <CreditCardList initialCards={cards} />;
}
