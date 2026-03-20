import { eq, and } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { investments } from '@/server/infrastructure/database/schema';
import type {
  Investment,
  InvestmentRepository,
} from '@/server/domain/investments/repositories/investment.repository';

export class DrizzleInvestmentRepository implements InvestmentRepository {
  async create(data: {
    id: string;
    name: string;
    institution: string;
    type: 'renda_fixa' | 'renda_variavel' | 'reserva';
    balanceCents: number;
    yieldRateBasisPoints?: number | null;
    maturityDate?: string | null;
    organizationId: string;
  }): Promise<Investment> {
    const [investment] = await db
      .insert(investments)
      .values(data)
      .returning();
    return investment as Investment;
  }

  async findById(id: string, organizationId: string): Promise<Investment | null> {
    const results = await db
      .select()
      .from(investments)
      .where(and(eq(investments.id, id), eq(investments.organizationId, organizationId)));
    return (results[0] as Investment) ?? null;
  }

  async findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Investment[]> {
    const conditions = includeArchived
      ? eq(investments.organizationId, organizationId)
      : and(eq(investments.organizationId, organizationId), eq(investments.status, 'active'));

    const results = await db.select().from(investments).where(conditions);
    return results as Investment[];
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      institution: string;
      type: 'renda_fixa' | 'renda_variavel' | 'reserva';
      balanceCents: number;
      yieldRateBasisPoints: number | null;
      maturityDate: string | null;
    }>,
  ): Promise<Investment> {
    const now = new Date();
    const setData: Record<string, unknown> = { ...data, updatedAt: now };

    // H1 fix: auto-update lastBalanceUpdate when balanceCents changes
    if ('balanceCents' in data) {
      setData.lastBalanceUpdate = now;
    }

    const [investment] = await db
      .update(investments)
      .set(setData)
      .where(and(eq(investments.id, id), eq(investments.organizationId, organizationId)))
      .returning();
    return investment as Investment;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<Investment> {
    const [investment] = await db
      .update(investments)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(investments.id, id), eq(investments.organizationId, organizationId)))
      .returning();
    return investment as Investment;
  }
}
