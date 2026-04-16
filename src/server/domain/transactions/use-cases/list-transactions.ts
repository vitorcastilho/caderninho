import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  Transaction,
  TransactionRepository,
} from '../repositories/transaction.repository';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export interface ListTransactionsFilters {
  types?: Array<'expense' | 'income' | 'transfer'>;
  categoryIds?: string[];
  paymentMethodIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ListTransactionsPagination {
  limit?: number;
  offset?: number;
}

export interface ListTransactionsParams {
  organizationId: string;
  filters?: ListTransactionsFilters;
  pagination?: ListTransactionsPagination;
}

export interface ListTransactionsResult {
  rows: Transaction[];
  total: number;
  hasMore: boolean;
}

export function parseSearchAmountCents(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  // Aceita "42", "42,50", "42.50", "1.234,56"
  const normalized = (() => {
    const hasComma = trimmed.includes(',');
    const hasDot = trimmed.includes('.');
    if (hasComma && hasDot) {
      // assume pt-BR: ponto = milhar, vírgula = decimal
      return trimmed.replace(/\./g, '').replace(',', '.');
    }
    if (hasComma) return trimmed.replace(',', '.');
    return trimmed;
  })();

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const asNumber = Number(normalized);
  if (!Number.isFinite(asNumber) || asNumber < 0) return null;
  return Math.round(asNumber * 100);
}

export interface ListTransactionsDeps {
  repository: TransactionRepository;
}

export async function listTransactions(
  deps: ListTransactionsDeps,
  params: ListTransactionsParams,
): Promise<Result<ListTransactionsResult>> {
  const limitRaw = params.pagination?.limit ?? DEFAULT_LIMIT;
  const offsetRaw = params.pagination?.offset ?? 0;
  const limit = Math.min(Math.max(1, Math.floor(limitRaw)), MAX_LIMIT);
  const offset = Math.max(0, Math.floor(offsetRaw));

  const rawSearch = params.filters?.search?.trim() ?? '';
  const search = rawSearch.length > 0 ? rawSearch : undefined;
  const searchAmountCents = search ? parseSearchAmountCents(search) : null;

  const { rows, total } = await deps.repository.findByOrganizationFiltered(
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
    { limit, offset },
  );

  const hasMore = offset + rows.length < total;

  return ok({ rows, total, hasMore });
}
