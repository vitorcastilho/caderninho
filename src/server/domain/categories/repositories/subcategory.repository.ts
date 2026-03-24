export type Subcategory = {
  id: string;
  name: string;
  categoryId: string;
  defaultPaymentMethodType: string | null;
  defaultPaymentMethodId: string | null;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface SubcategoryRepository {
  create(data: {
    id: string;
    name: string;
    categoryId: string;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
    organizationId: string;
  }): Promise<Subcategory>;

  findById(id: string, organizationId: string): Promise<Subcategory | null>;

  findAllByOrganization(
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Subcategory[]>;

  findByCategory(
    categoryId: string,
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Subcategory[]>;

  countActiveByCategory(
    categoryId: string,
    organizationId: string,
  ): Promise<number>;

  update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      defaultPaymentMethodType: string | null;
      defaultPaymentMethodId: string | null;
    }>,
  ): Promise<Subcategory>;

  updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<Subcategory>;
}
