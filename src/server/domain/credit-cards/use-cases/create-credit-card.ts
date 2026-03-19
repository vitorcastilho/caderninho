import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  CreditCard,
  CreditCardRepository,
} from '../repositories/credit-card.repository';

interface CreateCreditCardParams {
  name: string;
  brand: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  organizationId: string;
  userId: string;
}

export async function createCreditCard(
  deps: { repository: CreditCardRepository; auditLogger: AuditLogger },
  params: CreateCreditCardParams,
): Promise<Result<CreditCard>> {
  const id = crypto.randomUUID();

  const card = await deps.repository.create({
    id,
    name: params.name,
    brand: params.brand,
    limitCents: params.limitCents,
    closingDay: params.closingDay,
    dueDay: params.dueDay,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'credit_card',
    entityId: card.id,
    oldValue: null,
    newValue: { name: card.name, brand: card.brand, limitCents: card.limitCents, closingDay: card.closingDay, dueDay: card.dueDay },
  });

  return ok(card);
}
