import { eq, and, desc, sql, gte, lt } from 'drizzle-orm';

import { db, type DbExecutor } from '@/server/infrastructure/database/client';
import { transactions } from '@/server/infrastructure/database/schema';
import type {
  Transaction,
  TransactionRepository,
} from '@/server/domain/transactions/repositories/transaction.repository';

export class DrizzleTransactionRepository implements TransactionRepository {
  constructor(private readonly executor: DbExecutor = db) {}

  async create(data: {
    id: string;
    type: string;
    amountCents: number;
    categoryId?: string | null;
    subcategoryId?: string | null;
    establishment?: string | null;
    paymentMethodType?: string | null;
    paymentMethodId?: string | null;
    installments?: number | null;
    description?: string | null;
    incomeSourceId?: string | null;
    sourceAccountId?: string | null;
    destinationAccountId?: string | null;
    transactionDate: Date;
    referenceMonth?: string | null;
    organizationId: string;
    createdBy: string;
  }): Promise<Transaction> {
    const [transaction] = await this.executor
      .insert(transactions)
      .values(data)
      .returning();
    return transaction as Transaction;
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<Omit<Transaction, 'id' | 'organizationId' | 'createdBy' | 'createdAt'>>,
  ): Promise<Transaction> {
    const [updated] = await this.executor
      .update(transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.organizationId, organizationId)))
      .returning();
    return updated as Transaction;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.executor
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.organizationId, organizationId)));
  }

  async findById(id: string, organizationId: string): Promise<Transaction | null> {
    const results = await this.executor
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.organizationId, organizationId)));
    return (results[0] as Transaction) ?? null;
  }

  async findByOrganization(organizationId: string): Promise<Transaction[]> {
    const results = await this.executor
      .select()
      .from(transactions)
      .where(eq(transactions.organizationId, organizationId))
      .orderBy(desc(transactions.transactionDate));
    return results as Transaction[];
  }

  async findTopEstablishments(
    subcategoryId: string,
    organizationId: string,
    limit: number,
    sinceDays: number,
  ): Promise<string[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    const results = await this.executor
      .select({
        establishment: transactions.establishment,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.subcategoryId, subcategoryId),
          eq(transactions.organizationId, organizationId),
          gte(transactions.transactionDate, sinceDate),
          sql`${transactions.establishment} IS NOT NULL`,
          sql`${transactions.establishment} != ''`,
        ),
      )
      .groupBy(transactions.establishment)
      .orderBy(desc(sql`count`))
      .limit(limit);

    return results
      .map((r) => r.establishment)
      .filter((e): e is string => e !== null);
  }

  async sumMonthlySpentByCategory(
    categoryId: string,
    organizationId: string,
    year: number,
    month: number,
  ): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    const result = await this.executor
      .select({
        total: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`.as('total'),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.categoryId, categoryId),
          eq(transactions.organizationId, organizationId),
          gte(transactions.transactionDate, startOfMonth),
          lt(transactions.transactionDate, startOfNextMonth),
        ),
      );

    return Number(result[0]?.total ?? 0);
  }

  async getMonthlySpendingSummary(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<{
    byCategory: { categoryId: string; totalCents: number }[];
    bySubcategory: { subcategoryId: string; totalCents: number }[];
    byEstablishment: { establishment: string; subcategoryId: string; totalCents: number }[];
  }> {
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    const baseWhere = and(
      eq(transactions.organizationId, organizationId),
      eq(transactions.type, 'expense'),
      gte(transactions.transactionDate, startOfMonth),
      lt(transactions.transactionDate, startOfNextMonth),
    );

    const [byCategory, bySubcategory, byEstablishment] = await Promise.all([
      this.executor
        .select({
          categoryId: transactions.categoryId,
          totalCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`.as('total_cents'),
        })
        .from(transactions)
        .where(baseWhere)
        .groupBy(transactions.categoryId),

      this.executor
        .select({
          subcategoryId: transactions.subcategoryId,
          totalCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`.as('total_cents'),
        })
        .from(transactions)
        .where(and(baseWhere, sql`${transactions.subcategoryId} IS NOT NULL`))
        .groupBy(transactions.subcategoryId),

      this.executor
        .select({
          establishment: transactions.establishment,
          subcategoryId: transactions.subcategoryId,
          totalCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`.as('total_cents'),
        })
        .from(transactions)
        .where(
          and(
            baseWhere,
            sql`${transactions.establishment} IS NOT NULL`,
            sql`${transactions.establishment} != ''`,
            sql`${transactions.subcategoryId} IS NOT NULL`,
          ),
        )
        .groupBy(transactions.establishment, transactions.subcategoryId),
    ]);

    return {
      byCategory: byCategory
        .filter((r): r is typeof r & { categoryId: string } => r.categoryId !== null)
        .map((r) => ({
          categoryId: r.categoryId,
          totalCents: Number(r.totalCents),
        })),
      bySubcategory: bySubcategory
        .filter((r): r is typeof r & { subcategoryId: string } => r.subcategoryId !== null)
        .map((r) => ({
          subcategoryId: r.subcategoryId,
          totalCents: Number(r.totalCents),
        })),
      byEstablishment: byEstablishment
        .filter(
          (r): r is typeof r & { establishment: string; subcategoryId: string } =>
            r.establishment !== null && r.subcategoryId !== null,
        )
        .map((r) => ({
          establishment: r.establishment,
          subcategoryId: r.subcategoryId,
          totalCents: Number(r.totalCents),
        })),
    };
  }
}
