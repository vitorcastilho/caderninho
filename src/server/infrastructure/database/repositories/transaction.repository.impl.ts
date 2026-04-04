import { eq, and, desc, sql, gte } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { transactions } from '@/server/infrastructure/database/schema';
import type {
  Transaction,
  TransactionRepository,
} from '@/server/domain/transactions/repositories/transaction.repository';

export class DrizzleTransactionRepository implements TransactionRepository {
  async create(data: {
    id: string;
    type: string;
    amountCents: number;
    categoryId: string;
    subcategoryId?: string | null;
    establishment?: string | null;
    paymentMethodType: string;
    paymentMethodId?: string | null;
    description?: string | null;
    transactionDate: Date;
    referenceMonth?: string | null;
    organizationId: string;
    createdBy: string;
  }): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(data)
      .returning();
    return transaction as Transaction;
  }

  async findById(id: string, organizationId: string): Promise<Transaction | null> {
    const results = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.organizationId, organizationId)));
    return (results[0] as Transaction) ?? null;
  }

  async findByOrganization(organizationId: string): Promise<Transaction[]> {
    const results = await db
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

    const results = await db
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
}
