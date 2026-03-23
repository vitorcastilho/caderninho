import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Category, CategoryRepository } from '../repositories/category.repository';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { CreditCardRepository } from '@/server/domain/credit-cards/repositories/credit-card.repository';

interface CreateCategoryParams {
  name: string;
  classificationId: string;
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  defaultPaymentMethodType: string | null;
  defaultPaymentMethodId: string | null;
  organizationId: string;
  userId: string;
}

export async function createCategory(
  deps: {
    repository: CategoryRepository;
    classificationRepository: ClassificationRepository;
    bankAccountRepository: BankAccountRepository;
    creditCardRepository: CreditCardRepository;
    auditLogger: AuditLogger;
  },
  params: CreateCategoryParams,
): Promise<Result<Category>> {
  const classification = await deps.classificationRepository.findById(
    params.classificationId,
    params.organizationId,
  );
  if (!classification) {
    return err('CLASSIFICATION_NOT_FOUND', 'Classificação de essencialidade não encontrada.');
  }
  if (classification.status === 'archived') {
    return err('CLASSIFICATION_ARCHIVED', 'Não é possível criar categoria em uma classificação arquivada.');
  }

  if (params.defaultPaymentMethodType && params.defaultPaymentMethodId) {
    if (params.defaultPaymentMethodType === 'credit_card') {
      const card = await deps.creditCardRepository.findById(
        params.defaultPaymentMethodId, params.organizationId,
      );
      if (!card) return err('PAYMENT_METHOD_NOT_FOUND', 'Cartão de crédito não encontrado.');
      if (card.status === 'archived') return err('PAYMENT_METHOD_ARCHIVED', 'Este cartão de crédito está arquivado.');
    } else {
      const account = await deps.bankAccountRepository.findById(
        params.defaultPaymentMethodId, params.organizationId,
      );
      if (!account) return err('PAYMENT_METHOD_NOT_FOUND', 'Conta bancária não encontrada.');
      if (account.status === 'archived') return err('PAYMENT_METHOD_ARCHIVED', 'Esta conta bancária está arquivada.');
    }
  }

  const id = crypto.randomUUID();

  const category = await deps.repository.create({
    id,
    name: params.name,
    classificationId: params.classificationId,
    budgetMinCents: params.budgetMinCents,
    budgetMaxCents: params.budgetMaxCents,
    defaultPaymentMethodType: params.defaultPaymentMethodType,
    defaultPaymentMethodId: params.defaultPaymentMethodId,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'category',
    entityId: category.id,
    oldValue: null,
    newValue: {
      name: category.name,
      classificationId: category.classificationId,
      budgetMinCents: category.budgetMinCents,
      budgetMaxCents: category.budgetMaxCents,
      defaultPaymentMethodType: category.defaultPaymentMethodType,
      defaultPaymentMethodId: category.defaultPaymentMethodId,
    },
  });

  return ok(category);
}
