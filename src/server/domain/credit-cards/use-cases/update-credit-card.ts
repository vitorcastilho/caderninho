import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  CreditCard,
  CreditCardRepository,
} from '../repositories/credit-card.repository';

interface UpdateCreditCardParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{ name: string; brand: string; limitCents: number; closingDay: number; dueDay: number }>;
}

export async function updateCreditCard(
  deps: { repository: CreditCardRepository; auditLogger: AuditLogger },
  params: UpdateCreditCardParams,
): Promise<Result<CreditCard>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CREDIT_CARD_NOT_FOUND', 'Cartão de crédito não encontrado.');
  }

  const updated = await deps.repository.update(params.id, params.organizationId, params.data);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'credit_card',
    entityId: params.id,
    oldValue: { name: existing.name, brand: existing.brand, limitCents: existing.limitCents, closingDay: existing.closingDay, dueDay: existing.dueDay },
    newValue: { name: updated.name, brand: updated.brand, limitCents: updated.limitCents, closingDay: updated.closingDay, dueDay: updated.dueDay },
  });

  return ok(updated);
}
