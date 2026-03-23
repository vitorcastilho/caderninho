import { getTableName, getTableColumns } from 'drizzle-orm';

import { essentialityClassifications } from './essentiality-classifications';

describe('essentiality_classifications schema', () => {
  it('should define essentiality_classifications table with correct name', () => {
    expect(getTableName(essentialityClassifications)).toBe('essentiality_classifications');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(essentialityClassifications);
    expect(columns.id).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.displayOrder).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(essentialityClassifications);
    expect(columns.id.primary).toBe(true);
    expect(columns.name.notNull).toBe(true);
    expect(columns.displayOrder.notNull).toBe(true);
    expect(columns.status.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(essentialityClassifications);
    expect(columns.status.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(essentialityClassifications);
    expect(columns.displayOrder.name).toBe('display_order');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
