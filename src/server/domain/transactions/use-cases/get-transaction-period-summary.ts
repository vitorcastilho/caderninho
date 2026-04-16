import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { TransactionRepository } from '../repositories/transaction.repository';
import { parseSearchAmountCents } from './list-transactions';

export interface GetTransactionPeriodSummaryFilters {
  types?: Array<'expense' | 'income' | 'transfer'>;
  categoryIds?: string[];
  paymentMethodIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface GetTransactionPeriodSummaryParams {
  organizationId: string;
  filters?: GetTransactionPeriodSummaryFilters;
}

export interface TransactionPeriodSummary {
  expense: { totalCents: number; count: number };
  income: { totalCents: number; count: number };
  transfer: { totalCents: number; count: number };
}

export interface GetTransactionPeriodSummaryDeps {
  repository: TransactionRepository;
}

export async function getTransactionPeriodSummary(
  deps: GetTransactionPeriodSummaryDeps,
  params: GetTransactionPeriodSummaryParams,
): Promise<Result<TransactionPeriodSummary>> {
  const rawSearch = params.filters?.search?.trim() ?? '';
  const search = rawSearch.length > 0 ? rawSearch : undefined;
  const searchAmountCents = search ? parseSearchAmountCents(search) : null;

  const rows = await deps.repository.aggregateByTypeForOrganizationFiltered(
    params.organizationId,
    {
      types: params.filters?.types,
      categoryIds: params.filters?.categoryIds,
      paymentMethodIds: params.filters?.paymentMethodIds,
      dateFrom: params.filters?.dateFrom,
      dateTo: params.filters?.dateTo,
      search,
      searchAmountCents,
    },
  );

  const summary: TransactionPeriodSummary = {
    expense: { totalCents: 0, count: 0 },
    income: { totalCents: 0, count: 0 },
    transfer: { totalCents: 0, count: 0 },
  };

  for (const row of rows) {
    summary[row.type] = { totalCents: row.totalCents, count: row.count };
  }

  return ok(summary);
}
