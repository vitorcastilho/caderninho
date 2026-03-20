import { eq, and } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { incomeSources } from '@/server/infrastructure/database/schema';
import type {
  IncomeSource,
  IncomeSourceRepository,
} from '@/server/domain/income-sources/repositories/income-source.repository';

export class DrizzleIncomeSourceRepository implements IncomeSourceRepository {
  async create(data: {
    id: string;
    name: string;
    employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
    isRecurring: boolean;
    baseAmountCents?: number | null;
    usualPaymentDay?: number | null;
    organizationId: string;
  }): Promise<IncomeSource> {
    const [incomeSource] = await db
      .insert(incomeSources)
      .values(data)
      .returning();
    return incomeSource as IncomeSource;
  }

  async findById(id: string, organizationId: string): Promise<IncomeSource | null> {
    const results = await db
      .select()
      .from(incomeSources)
      .where(and(eq(incomeSources.id, id), eq(incomeSources.organizationId, organizationId)));
    return (results[0] as IncomeSource) ?? null;
  }

  async findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<IncomeSource[]> {
    const conditions = includeArchived
      ? eq(incomeSources.organizationId, organizationId)
      : and(eq(incomeSources.organizationId, organizationId), eq(incomeSources.status, 'active'));

    const results = await db.select().from(incomeSources).where(conditions);
    return results as IncomeSource[];
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
      isRecurring: boolean;
      baseAmountCents: number | null;
      usualPaymentDay: number | null;
    }>,
  ): Promise<IncomeSource> {
    const [incomeSource] = await db
      .update(incomeSources)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(incomeSources.id, id), eq(incomeSources.organizationId, organizationId)))
      .returning();
    return incomeSource as IncomeSource;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<IncomeSource> {
    const [incomeSource] = await db
      .update(incomeSources)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(incomeSources.id, id), eq(incomeSources.organizationId, organizationId)))
      .returning();
    return incomeSource as IncomeSource;
  }
}
