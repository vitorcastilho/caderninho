import type { TransactionRepository } from '@/server/domain/transactions/repositories/transaction.repository';
import type { Result } from '@/shared/types/result';
import { getEstablishmentSpendingKey } from '@/shared/utils/spending-key';

export interface MonthlySpendingSummary {
  byCategory: Map<string, number>;
  bySubcategory: Map<string, number>;
  byEstablishment: Map<string, number>;
}

interface GetMonthlySpendingSummaryInput {
  organizationId: string;
  year: number;
  month: number;
}

export function createGetMonthlySpendingSummary(transactionRepository: TransactionRepository) {
  return async function getMonthlySpendingSummary(
    input: GetMonthlySpendingSummaryInput,
  ): Promise<Result<MonthlySpendingSummary>> {
    const raw = await transactionRepository.getMonthlySpendingSummary(
      input.organizationId,
      input.year,
      input.month,
    );

    const byCategory = new Map<string, number>();
    for (const item of raw.byCategory) {
      byCategory.set(item.categoryId, item.totalCents);
    }

    const bySubcategory = new Map<string, number>();
    for (const item of raw.bySubcategory) {
      bySubcategory.set(item.subcategoryId, item.totalCents);
    }

    const byEstablishment = new Map<string, number>();
    for (const item of raw.byEstablishment) {
      const key = getEstablishmentSpendingKey(item.establishment, item.subcategoryId);
      byEstablishment.set(key, item.totalCents);
    }

    return {
      success: true,
      data: { byCategory, bySubcategory, byEstablishment },
    };
  };
}
