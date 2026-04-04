export type Transaction = {
  id: string;
  type: string;
  amountCents: number;
  categoryId: string;
  subcategoryId: string | null;
  establishment: string | null;
  paymentMethodType: string;
  paymentMethodId: string | null;
  description: string | null;
  transactionDate: Date;
  referenceMonth: string | null;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface TransactionRepository {
  create(data: {
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
  }): Promise<Transaction>;

  findById(id: string, organizationId: string): Promise<Transaction | null>;

  findByOrganization(organizationId: string): Promise<Transaction[]>;

  findTopEstablishments(
    subcategoryId: string,
    organizationId: string,
    limit: number,
    sinceDays: number,
  ): Promise<string[]>;
}
