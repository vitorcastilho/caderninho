import { eq, and, asc, count } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { categories } from '@/server/infrastructure/database/schema';
import type {
  Category,
  CategoryRepository,
} from '@/server/domain/categories/repositories/category.repository';

export class DrizzleCategoryRepository implements CategoryRepository {
  async create(data: {
    id: string;
    name: string;
    classificationId: string;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
    organizationId: string;
  }): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(data)
      .returning();
    return category as Category;
  }

  async findById(id: string, organizationId: string): Promise<Category | null> {
    const results = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.organizationId, organizationId)));
    return (results[0] as Category) ?? null;
  }

  async findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Category[]> {
    const conditions = includeArchived
      ? eq(categories.organizationId, organizationId)
      : and(eq(categories.organizationId, organizationId), eq(categories.status, 'active'));

    const results = await db
      .select()
      .from(categories)
      .where(conditions)
      .orderBy(asc(categories.createdAt));
    return results as Category[];
  }

  async findByClassification(
    classificationId: string,
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Category[]> {
    const conditions = includeArchived
      ? and(eq(categories.classificationId, classificationId), eq(categories.organizationId, organizationId))
      : and(
          eq(categories.classificationId, classificationId),
          eq(categories.organizationId, organizationId),
          eq(categories.status, 'active'),
        );

    const results = await db
      .select()
      .from(categories)
      .where(conditions)
      .orderBy(asc(categories.createdAt));
    return results as Category[];
  }

  async countActiveByClassification(
    classificationId: string,
    organizationId: string,
  ): Promise<number> {
    const results = await db
      .select({ count: count() })
      .from(categories)
      .where(
        and(
          eq(categories.classificationId, classificationId),
          eq(categories.organizationId, organizationId),
          eq(categories.status, 'active'),
        ),
      );
    return results[0]?.count ?? 0;
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      classificationId: string;
      budgetMinCents: number | null;
      budgetMaxCents: number | null;
      defaultPaymentMethodType: string | null;
      defaultPaymentMethodId: string | null;
    }>,
  ): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.organizationId, organizationId)))
      .returning();
    return category as Category;
  }

  async updateClassificationBulk(
    fromClassificationId: string,
    toClassificationId: string,
    organizationId: string,
  ): Promise<number> {
    const result = await db
      .update(categories)
      .set({ classificationId: toClassificationId, updatedAt: new Date() })
      .where(
        and(
          eq(categories.classificationId, fromClassificationId),
          eq(categories.organizationId, organizationId),
          eq(categories.status, 'active'),
        ),
      )
      .returning();
    return result.length;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.organizationId, organizationId)))
      .returning();
    return category as Category;
  }
}
