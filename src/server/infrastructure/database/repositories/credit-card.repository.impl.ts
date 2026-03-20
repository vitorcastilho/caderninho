import { eq, and, asc } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { creditCards } from '@/server/infrastructure/database/schema';
import type {
  CreditCard,
  CreditCardRepository,
} from '@/server/domain/credit-cards/repositories/credit-card.repository';

export class DrizzleCreditCardRepository implements CreditCardRepository {
  async create(data: {
    id: string;
    name: string;
    brand: string;
    limitCents: number;
    closingDay: number;
    dueDay: number;
    organizationId: string;
  }): Promise<CreditCard> {
    const [card] = await db
      .insert(creditCards)
      .values(data)
      .returning();
    return card as CreditCard;
  }

  async findById(id: string, organizationId: string): Promise<CreditCard | null> {
    const results = await db
      .select()
      .from(creditCards)
      .where(and(eq(creditCards.id, id), eq(creditCards.organizationId, organizationId)));
    return (results[0] as CreditCard) ?? null;
  }

  async findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<CreditCard[]> {
    const conditions = includeArchived
      ? eq(creditCards.organizationId, organizationId)
      : and(eq(creditCards.organizationId, organizationId), eq(creditCards.status, 'active'));

    const results = await db.select().from(creditCards).where(conditions).orderBy(asc(creditCards.createdAt));
    return results as CreditCard[];
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{ name: string; brand: string; limitCents: number; closingDay: number; dueDay: number }>,
  ): Promise<CreditCard> {
    const [card] = await db
      .update(creditCards)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creditCards.id, id), eq(creditCards.organizationId, organizationId)))
      .returning();
    return card as CreditCard;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<CreditCard> {
    const [card] = await db
      .update(creditCards)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(creditCards.id, id), eq(creditCards.organizationId, organizationId)))
      .returning();
    return card as CreditCard;
  }
}
