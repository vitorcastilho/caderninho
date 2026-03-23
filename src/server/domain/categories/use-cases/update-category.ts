import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Category, CategoryRepository } from '../repositories/category.repository';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { CreditCardRepository } from '@/server/domain/credit-cards/repositories/credit-card.repository';

interface UpdateCategoryParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{
    name: string;
    classificationId: string;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
  }>;
}

export async function updateCategory(
  deps: {
    repository: CategoryRepository;
    classificationRepository: ClassificationRepository;
    bankAccountRepository: BankAccountRepository;
    creditCardRepository: CreditCardRepository;
    auditLogger: AuditLogger;
  },
  params: UpdateCategoryParams,
): Promise<Result<Category>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  }

  if (params.data.classificationId && params.data.classificationId !== existing.classificationId) {
    const classification = await deps.classificationRepository.findById(
      params.data.classificationId,
      params.organizationId,
    );
    if (!classification) {
      return err('CLASSIFICATION_NOT_FOUND', 'Classificação de essencialidade não encontrada.');
    }
    if (classification.status === 'archived') {
      return err('CLASSIFICATION_ARCHIVED', 'Não é possível mover categoria para uma classificação arquivada.');
    }
  }

  if (params.data.defaultPaymentMethodType && params.data.defaultPaymentMethodId) {
    if (params.data.defaultPaymentMethodType === 'credit_card') {
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
    entityType: 'category',
    entityId: params.id,
    oldValue: {
      name: existing.name,
      classificationId: existing.classificationId,
      budgetMinCents: existing.budgetMinCents,
      budgetMaxCents: existing.budgetMaxCents,
      defaultPaymentMethodType: existing.defaultPaymentMethodType,
      defaultPaymentMethodId: existing.defaultPaymentMethodId,
    },
    newValue: {
      name: updated.name,
      classificationId: updated.classificationId,
      budgetMinCents: updated.budgetMinCents,
      budgetMaxCents: updated.budgetMaxCents,
      defaultPaymentMethodType: updated.defaultPaymentMethodType,
      defaultPaymentMethodId: updated.defaultPaymentMethodId,
    },
  });

  return ok(updated);
}
