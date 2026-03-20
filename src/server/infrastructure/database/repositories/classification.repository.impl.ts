import { eq, and, asc, count } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { essentialityClassifications } from '@/server/infrastructure/database/schema';
import type {
  EssentialityClassification,
  ClassificationRepository,
} from '@/server/domain/categories/repositories/classification.repository';

export class DrizzleClassificationRepository implements ClassificationRepository {
  async create(data: {
    id: string;
    name: string;
    displayOrder: number;
    organizationId: string;
  }): Promise<EssentialityClassification> {
    const [classification] = await db
      .insert(essentialityClassifications)
      .values(data)
      .returning();
    return classification as EssentialityClassification;
  }

  async findById(id: string, organizationId: string): Promise<EssentialityClassification | null> {
    const results = await db
      .select()
      .from(essentialityClassifications)
      .where(and(eq(essentialityClassifications.id, id), eq(essentialityClassifications.organizationId, organizationId)));
    return (results[0] as EssentialityClassification) ?? null;
  }

  async findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<EssentialityClassification[]> {
    const conditions = includeArchived
      ? eq(essentialityClassifications.organizationId, organizationId)
      : and(eq(essentialityClassifications.organizationId, organizationId), eq(essentialityClassifications.status, 'active'));

    const results = await db
      .select()
      .from(essentialityClassifications)
      .where(conditions)
      .orderBy(asc(essentialityClassifications.displayOrder));
    return results as EssentialityClassification[];
  }

  async countByOrganization(organizationId: string): Promise<number> {
    const results = await db
      .select({ count: count() })
      .from(essentialityClassifications)
      .where(eq(essentialityClassifications.organizationId, organizationId));
    return results[0]?.count ?? 0;
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{ name: string; displayOrder: number }>,
  ): Promise<EssentialityClassification> {
    const [classification] = await db
      .update(essentialityClassifications)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(essentialityClassifications.id, id), eq(essentialityClassifications.organizationId, organizationId)))
      .returning();
    return classification as EssentialityClassification;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<EssentialityClassification> {
    const [classification] = await db
      .update(essentialityClassifications)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(essentialityClassifications.id, id), eq(essentialityClassifications.organizationId, organizationId)))
      .returning();
    return classification as EssentialityClassification;
  }
}
