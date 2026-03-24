import { eq, and, asc, count } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { subcategories } from '@/server/infrastructure/database/schema';
import type {
  Subcategory,
  SubcategoryRepository,
} from '@/server/domain/categories/repositories/subcategory.repository';

export class DrizzleSubcategoryRepository implements SubcategoryRepository {
  async create(data: {
    id: string;
    name: string;
    categoryId: string;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
    organizationId: string;
  }): Promise<Subcategory> {
    const [subcategory] = await db
      .insert(subcategories)
      .values(data)
      .returning();
    return subcategory as Subcategory;
  }

  async findById(id: string, organizationId: string): Promise<Subcategory | null> {
    const results = await db
      .select()
      .from(subcategories)
      .where(and(eq(subcategories.id, id), eq(subcategories.organizationId, organizationId)));
    return (results[0] as Subcategory) ?? null;
  }

  async findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Subcategory[]> {
    const conditions = includeArchived
      ? eq(subcategories.organizationId, organizationId)
      : and(eq(subcategories.organizationId, organizationId), eq(subcategories.status, 'active'));

    const results = await db
      .select()
      .from(subcategories)
      .where(conditions)
      .orderBy(asc(subcategories.createdAt));
    return results as Subcategory[];
  }

  async findByCategory(
    categoryId: string,
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Subcategory[]> {
    const conditions = includeArchived
      ? and(eq(subcategories.categoryId, categoryId), eq(subcategories.organizationId, organizationId))
      : and(
          eq(subcategories.categoryId, categoryId),
          eq(subcategories.organizationId, organizationId),
          eq(subcategories.status, 'active'),
        );

    const results = await db
      .select()
      .from(subcategories)
      .where(conditions)
      .orderBy(asc(subcategories.createdAt));
    return results as Subcategory[];
  }

  async countActiveByCategory(
    categoryId: string,
    organizationId: string,
  ): Promise<number> {
    const results = await db
      .select({ count: count() })
      .from(subcategories)
      .where(
        and(
          eq(subcategories.categoryId, categoryId),
          eq(subcategories.organizationId, organizationId),
          eq(subcategories.status, 'active'),
        ),
      );
    return results[0]?.count ?? 0;
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      defaultPaymentMethodType: string | null;
      defaultPaymentMethodId: string | null;
    }>,
  ): Promise<Subcategory> {
    const [subcategory] = await db
      .update(subcategories)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(subcategories.id, id), eq(subcategories.organizationId, organizationId)))
      .returning();
    return subcategory as Subcategory;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<Subcategory> {
    const [subcategory] = await db
      .update(subcategories)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(subcategories.id, id), eq(subcategories.organizationId, organizationId)))
      .returning();
    return subcategory as Subcategory;
  }
}
