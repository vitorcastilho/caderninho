import { eq, and, asc } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { bankAccounts } from '@/server/infrastructure/database/schema';
import type {
  BankAccount,
  BankAccountRepository,
} from '@/server/domain/bank-accounts/repositories/bank-account.repository';

export class DrizzleBankAccountRepository implements BankAccountRepository {
  async create(data: {
    id: string;
    name: string;
    bank: string;
    balanceCents: number;
    organizationId: string;
  }): Promise<BankAccount> {
    const [account] = await db
      .insert(bankAccounts)
      .values(data)
      .returning();
    return account as BankAccount;
  }

  async findById(id: string, organizationId: string): Promise<BankAccount | null> {
    const results = await db
      .select()
      .from(bankAccounts)
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.organizationId, organizationId)));
    return (results[0] as BankAccount) ?? null;
  }

  async findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<BankAccount[]> {
    const conditions = includeArchived
      ? eq(bankAccounts.organizationId, organizationId)
      : and(eq(bankAccounts.organizationId, organizationId), eq(bankAccounts.status, 'active'));

    const results = await db.select().from(bankAccounts).where(conditions).orderBy(asc(bankAccounts.createdAt));
    return results as BankAccount[];
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{ name: string; bank: string; balanceCents: number }>,
  ): Promise<BankAccount> {
    const [account] = await db
      .update(bankAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.organizationId, organizationId)))
      .returning();
    return account as BankAccount;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<BankAccount> {
    const [account] = await db
      .update(bankAccounts)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.organizationId, organizationId)))
      .returning();
    return account as BankAccount;
  }
}
