export type CreditCard = {
  id: string;
  name: string;
  brand: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreditCardRepository {
  create(data: {
    id: string;
    name: string;
    brand: string;
    limitCents: number;
    closingDay: number;
    dueDay: number;
    organizationId: string;
  }): Promise<CreditCard>;

  findById(id: string, organizationId: string): Promise<CreditCard | null>;

  findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<CreditCard[]>;

  update(
    id: string,
    organizationId: string,
    data: Partial<{ name: string; brand: string; limitCents: number; closingDay: number; dueDay: number }>,
  ): Promise<CreditCard>;

  updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<CreditCard>;
}
