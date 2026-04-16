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

  update(
    id: string,
    organizationId: string,
    data: Partial<Omit<Transaction, 'id' | 'organizationId' | 'createdBy' | 'createdAt'>>,
  ): Promise<Transaction>;

  delete(id: string, organizationId: string): Promise<void>;

  findById(id: string, organizationId: string): Promise<Transaction | null>;

  findByOrganization(organizationId: string): Promise<Transaction[]>;

  findByOrganizationFiltered(
    organizationId: string,
    filters: {
      types?: Array<'expense' | 'income' | 'transfer'>;
      categoryIds?: string[];
      paymentMethodIds?: string[];
      dateFrom?: Date;
      dateTo?: Date;
      search?: string;
      searchAmountCents?: number | null;
    },
    pagination: { limit: number; offset: number },
  ): Promise<{ rows: Transaction[]; total: number }>;

  aggregateByTypeForOrganizationFiltered(
    organizationId: string,
    filters: {
      types?: Array<'expense' | 'income' | 'transfer'>;
      categoryIds?: string[];
      paymentMethodIds?: string[];
      dateFrom?: Date;
      dateTo?: Date;
      search?: string;
      searchAmountCents?: number | null;
    },
  ): Promise<
    Array<{ type: 'expense' | 'income' | 'transfer'; totalCents: number; count: number }>
  >;

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
