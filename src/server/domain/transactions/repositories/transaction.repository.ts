export type Transaction = {
  id: string;
  type: string;
  amountCents: number;
  categoryId: string | null;
  subcategoryId: string | null;
  establishment: string | null;
  paymentMethodType: string | null;
  paymentMethodId: string | null;
  installments: number | null;
  description: string | null;
  incomeSourceId: string | null;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
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
    categoryId?: string | null;
    subcategoryId?: string | null;
    establishment?: string | null;
    paymentMethodType?: string | null;
    paymentMethodId?: string | null;
    installments?: number | null;
    description?: string | null;
    incomeSourceId?: string | null;
    sourceAccountId?: string | null;
    destinationAccountId?: string | null;
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

  sumMonthlySpentByCategory(
    categoryId: string,
    organizationId: string,
    year: number,
    month: number,
  ): Promise<number>;

  getMonthlySpendingSummary(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<{
    byCategory: { categoryId: string; totalCents: number }[];
    bySubcategory: { subcategoryId: string; totalCents: number }[];
    byEstablishment: { establishment: string; subcategoryId: string; totalCents: number }[];
  }>;
}
