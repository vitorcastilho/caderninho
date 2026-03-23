export type Category = {
  id: string;
  name: string;
  classificationId: string;
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CategoryRepository {
  create(data: {
    id: string;
    name: string;
    classificationId: string;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    organizationId: string;
  }): Promise<Category>;

  findById(id: string, organizationId: string): Promise<Category | null>;

  findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Category[]>;

  findByClassification(
    classificationId: string,
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Category[]>;

  countActiveByClassification(
    classificationId: string,
    organizationId: string,
  ): Promise<number>;

  update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      classificationId: string;
      budgetMinCents: number | null;
      budgetMaxCents: number | null;
    }>,
  ): Promise<Category>;

  updateClassificationBulk(
    fromClassificationId: string,
    toClassificationId: string,
    organizationId: string,
  ): Promise<number>;

  updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<Category>;
}
