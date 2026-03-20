export type EssentialityClassification = {
  id: string;
  name: string;
  displayOrder: number;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface ClassificationRepository {
  create(data: {
    id: string;
    name: string;
    displayOrder: number;
    organizationId: string;
  }): Promise<EssentialityClassification>;

  findById(id: string, organizationId: string): Promise<EssentialityClassification | null>;

  findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<EssentialityClassification[]>;

  countByOrganization(organizationId: string): Promise<number>;

  update(
    id: string,
    organizationId: string,
    data: Partial<{ name: string; displayOrder: number }>,
  ): Promise<EssentialityClassification>;

  updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<EssentialityClassification>;
}
