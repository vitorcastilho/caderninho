export type Establishment = {
  id: string;
  name: string;
  emoji: string;
  subcategoryId: string;
  source: 'auto' | 'manual';
  visitCount: number;
  lastVisitAt: Date | null;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface EstablishmentRepository {
  create(data: {
    id: string;
    name: string;
    emoji: string;
    subcategoryId: string;
    source: 'auto' | 'manual';
    organizationId: string;
  }): Promise<Establishment>;

  findById(id: string, organizationId: string): Promise<Establishment | null>;

  findBySubcategory(
    subcategoryId: string,
    organizationId: string,
    includeArchived?: boolean,
  ): Promise<Establishment[]>;

  findByNameAndSubcategory(
    name: string,
    subcategoryId: string,
    organizationId: string,
  ): Promise<Establishment | null>;

  update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      emoji: string;
      subcategoryId: string;
    }>,
  ): Promise<Establishment>;

  updateStatus(
    id: string,
    organizationId: string,
    status: 'active' | 'archived',
  ): Promise<Establishment>;

  incrementVisitCount(id: string, organizationId: string): Promise<Establishment>;
}
