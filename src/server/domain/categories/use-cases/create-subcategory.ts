import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Subcategory, SubcategoryRepository } from '../repositories/subcategory.repository';
import type { CategoryRepository } from '../repositories/category.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { CreditCardRepository } from '@/server/domain/credit-cards/repositories/credit-card.repository';

interface CreateSubcategoryParams {
  name: string;
  categoryId: string;
  defaultPaymentMethodType: string | null;
  defaultPaymentMethodId: string | null;
  organizationId: string;
  userId: string;
}

export async function createSubcategory(
  deps: {
    repository: SubcategoryRepository;
    categoryRepository: CategoryRepository;
    bankAccountRepository: BankAccountRepository;
    creditCardRepository: CreditCardRepository;
    auditLogger: AuditLogger;
  },
  params: CreateSubcategoryParams,
): Promise<Result<Subcategory>> {
  const category = await deps.categoryRepository.findById(
    params.categoryId,
    params.organizationId,
  );
  if (!category) {
    return err('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  }
  if (category.status === 'archived') {
    return err('CATEGORY_ARCHIVED', 'Não é possível criar subcategoria em uma categoria arquivada.');
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

  const subcategory = await deps.repository.create({
    id,
    name: params.name,
    categoryId: params.categoryId,
    defaultPaymentMethodType: params.defaultPaymentMethodType,
    defaultPaymentMethodId: params.defaultPaymentMethodId,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'subcategory',
    entityId: subcategory.id,
    oldValue: null,
    newValue: {
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      defaultPaymentMethodType: subcategory.defaultPaymentMethodType,
      defaultPaymentMethodId: subcategory.defaultPaymentMethodId,
    },
  });

  return ok(subcategory);
}
