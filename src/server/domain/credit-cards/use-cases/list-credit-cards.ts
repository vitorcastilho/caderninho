import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  CreditCard,
  CreditCardRepository,
} from '../repositories/credit-card.repository';

interface ListCreditCardsParams {
  organizationId: string;
  includeArchived?: boolean;
}

export async function listCreditCards(
  repository: CreditCardRepository,
  params: ListCreditCardsParams,
): Promise<Result<CreditCard[]>> {
  const cards = await repository.findAllByOrganization(
    params.organizationId,
    params.includeArchived,
  );
  return ok(cards);
}
