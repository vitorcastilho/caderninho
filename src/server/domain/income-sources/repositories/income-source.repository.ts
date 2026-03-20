export type IncomeSource = {
  id: string;
  name: string;
  employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
  isRecurring: boolean;
  baseAmountCents: number | null;
  usualPaymentDay: number | null;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface IncomeSourceRepository {
  create(data: {
    id: string;
    name: string;
    employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
    isRecurring: boolean;
    baseAmountCents?: number | null;
    usualPaymentDay?: number | null;
    organizationId: string;
  }): Promise<IncomeSource>;

  findById(id: string, organizationId: string): Promise<IncomeSource | null>;

  findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<IncomeSource[]>;

  update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
      isRecurring: boolean;
      baseAmountCents: number | null;
      usualPaymentDay: number | null;
    }>,
  ): Promise<IncomeSource>;

  updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<IncomeSource>;
}
