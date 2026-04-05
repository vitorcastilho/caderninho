import { eq, and, asc, sql } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { establishments } from '@/server/infrastructure/database/schema';
import type {
  Establishment,
  EstablishmentRepository,
} from '@/server/domain/establishments/repositories/establishment.repository';

export class DrizzleEstablishmentRepository implements EstablishmentRepository {
  async create(data: {
    id: string;
    name: string;
    emoji: string;
    subcategoryId: string;
    source: 'auto' | 'manual';
    defaultPaymentMethodType?: string | null;
    defaultPaymentMethodId?: string | null;
    budgetMinCents?: number | null;
    budgetMaxCents?: number | null;
    organizationId: string;
  }): Promise<Establishment> {
    const [establishment] = await db
      .insert(establishments)
      .values(data)
      .returning();
    return establishment as Establishment;
  }

  async findById(id: string, organizationId: string): Promise<Establishment | null> {
    const results = await db
      .select()
      .from(establishments)
      .where(and(eq(establishments.id, id), eq(establishments.organizationId, organizationId)));
    return (results[0] as Establishment) ?? null;
  }

  async findBySubcategory(
    subcategoryId: string,
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Establishment[]> {
    const conditions = includeArchived
      ? and(eq(establishments.subcategoryId, subcategoryId), eq(establishments.organizationId, organizationId))
      : and(
          eq(establishments.subcategoryId, subcategoryId),
          eq(establishments.organizationId, organizationId),
          eq(establishments.status, 'active'),
        );

    const results = await db
      .select()
      .from(establishments)
      .where(conditions)
      .orderBy(asc(establishments.name));
    return results as Establishment[];
  }

  async findByNameAndSubcategory(
    name: string,
    subcategoryId: string,
    organizationId: string,
  ): Promise<Establishment | null> {
    const results = await db
      .select()
      .from(establishments)
      .where(
        and(
          eq(establishments.name, name),
          eq(establishments.subcategoryId, subcategoryId),
          eq(establishments.organizationId, organizationId),
          eq(establishments.status, 'active'),
        ),
      );
    return (results[0] as Establishment) ?? null;
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      emoji: string;
      subcategoryId: string;
      defaultPaymentMethodType: string | null;
      defaultPaymentMethodId: string | null;
      budgetMinCents: number | null;
      budgetMaxCents: number | null;
    }>,
  ): Promise<Establishment> {
    const [establishment] = await db
      .update(establishments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(establishments.id, id), eq(establishments.organizationId, organizationId)))
      .returning();
    return establishment as Establishment;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<Establishment> {
    const [establishment] = await db
      .update(establishments)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(establishments.id, id), eq(establishments.organizationId, organizationId)))
      .returning();
    return establishment as Establishment;
  }

  async incrementVisitCount(id: string, organizationId: string): Promise<Establishment> {
    const [establishment] = await db
      .update(establishments)
      .set({
        visitCount: sql`${establishments.visitCount} + 1`,
        lastVisitAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(establishments.id, id), eq(establishments.organizationId, organizationId)))
      .returning();
    return establishment as Establishment;
  }
}
