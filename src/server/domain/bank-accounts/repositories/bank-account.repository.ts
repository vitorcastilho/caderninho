export type BankAccount = {
  id: string;
  name: string;
  bank: string;
  balanceCents: number;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface BankAccountRepository {
  create(data: {
    id: string;
    name: string;
    bank: string;
    balanceCents: number;
    organizationId: string;
  }): Promise<BankAccount>;

  findById(id: string, organizationId: string): Promise<BankAccount | null>;

  findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<BankAccount[]>;

  update(
    id: string,
    organizationId: string,
    data: Partial<{ name: string; bank: string; balanceCents: number }>,
  ): Promise<BankAccount>;

  updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<BankAccount>;
}
