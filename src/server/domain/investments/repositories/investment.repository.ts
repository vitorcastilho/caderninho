export type Investment = {
  id: string;
  name: string;
  institution: string;
  type: 'renda_fixa' | 'renda_variavel' | 'reserva';
  balanceCents: number;
  yieldRateBasisPoints: number | null;
  lastBalanceUpdate: Date;
  maturityDate: string | null;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface InvestmentRepository {
  create(data: {
    id: string;
    name: string;
    institution: string;
    type: 'renda_fixa' | 'renda_variavel' | 'reserva';
    balanceCents: number;
    yieldRateBasisPoints?: number | null;
    maturityDate?: string | null;
    organizationId: string;
  }): Promise<Investment>;

  findById(id: string, organizationId: string): Promise<Investment | null>;

  findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Investment[]>;

  update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      institution: string;
      type: 'renda_fixa' | 'renda_variavel' | 'reserva';
      balanceCents: number;
      yieldRateBasisPoints: number | null;
      maturityDate: string | null;
    }>,
  ): Promise<Investment>;

  updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<Investment>;
}
