import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  CreditCard,
  CreditCardRepository,
} from '../repositories/credit-card.repository';

interface ReactivateCreditCardParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function reactivateCreditCard(
  deps: { repository: CreditCardRepository; auditLogger: AuditLogger },
  params: ReactivateCreditCardParams,
): Promise<Result<CreditCard>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CREDIT_CARD_NOT_FOUND', 'Cartão de crédito não encontrado.');
  }

  if (existing.status === 'active') {
    return err('CREDIT_CARD_ALREADY_ACTIVE', 'Este cartão já está ativo.');
  }

  const reactivated = await deps.repository.updateStatus(params.id, params.organizationId, 'active');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'REACTIVATE',
    entityType: 'credit_card',
    entityId: params.id,
    oldValue: { status: 'archived' },
    newValue: { status: 'active' },
  });

  return ok(reactivated);
}
