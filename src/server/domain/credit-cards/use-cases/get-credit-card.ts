import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  CreditCard,
  CreditCardRepository,
} from '../repositories/credit-card.repository';

interface GetCreditCardParams {
  id: string;
  organizationId: string;
}

export async function getCreditCard(
  repository: CreditCardRepository,
  params: GetCreditCardParams,
): Promise<Result<CreditCard>> {
  const card = await repository.findById(params.id, params.organizationId);
  if (!card) {
    return err('CREDIT_CARD_NOT_FOUND', 'Cartão de crédito não encontrado.');
  }
  return ok(card);
}
