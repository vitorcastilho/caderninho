import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Subcategory, SubcategoryRepository } from '../repositories/subcategory.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { CreditCardRepository } from '@/server/domain/credit-cards/repositories/credit-card.repository';

interface UpdateSubcategoryParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{
    name: string;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
  }>;
}

export async function updateSubcategory(
  deps: {
    repository: SubcategoryRepository;
    bankAccountRepository: BankAccountRepository;
    creditCardRepository: CreditCardRepository;
    auditLogger: AuditLogger;
  },
  params: UpdateSubcategoryParams,
): Promise<Result<Subcategory>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('SUBCATEGORY_NOT_FOUND', 'Subcategoria não encontrada.');
  }

  if (params.data.defaultPaymentMethodType && params.data.defaultPaymentMethodId) {
    if (params.data.defaultPaymentMethodType === 'credit') {
      const card = await deps.creditCardRepository.findById(
        params.data.defaultPaymentMethodId, params.organizationId,
      );
      if (!card) return err('PAYMENT_METHOD_NOT_FOUND', 'Cartão de crédito não encontrado.');
      if (card.status === 'archived') return err('PAYMENT_METHOD_ARCHIVED', 'Este cartão de crédito está arquivado.');
    } else {
      const account = await deps.bankAccountRepository.findById(
        params.data.defaultPaymentMethodId, params.organizationId,
      );
      if (!account) return err('PAYMENT_METHOD_NOT_FOUND', 'Conta bancária não encontrada.');
      if (account.status === 'archived') return err('PAYMENT_METHOD_ARCHIVED', 'Esta conta bancária está arquivada.');
    }
  }

  const updated = await deps.repository.update(params.id, params.organizationId, params.data);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'subcategory',
    entityId: params.id,
    oldValue: {
      name: existing.name,
      defaultPaymentMethodType: existing.defaultPaymentMethodType,
      defaultPaymentMethodId: existing.defaultPaymentMethodId,
    },
    newValue: {
      name: updated.name,
      defaultPaymentMethodType: updated.defaultPaymentMethodType,
      defaultPaymentMethodId: updated.defaultPaymentMethodId,
    },
  });

  return ok(updated);
}
