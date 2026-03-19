import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  CreditCard,
  CreditCardRepository,
} from '../repositories/credit-card.repository';

interface ArchiveCreditCardParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function archiveCreditCard(
  deps: { repository: CreditCardRepository; auditLogger: AuditLogger },
  params: ArchiveCreditCardParams,
): Promise<Result<CreditCard>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CREDIT_CARD_NOT_FOUND', 'Cartão de crédito não encontrado.');
  }

  if (existing.status === 'archived') {
    return err('CREDIT_CARD_ALREADY_ARCHIVED', 'Este cartão já está arquivado.');
  }

  const archived = await deps.repository.updateStatus(params.id, params.organizationId, 'archived');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'ARCHIVE',
    entityType: 'credit_card',
    entityId: params.id,
    oldValue: { status: 'active' },
    newValue: { status: 'archived' },
  });

  return ok(archived);
}
