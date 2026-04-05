import { getTableName, getTableColumns } from 'drizzle-orm';

import { subcategories } from './subcategories';

describe('subcategories schema', () => {
  it('should define subcategories table with correct name', () => {
    expect(getTableName(subcategories)).toBe('subcategories');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(subcategories);
    expect(columns.id).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.emoji).toBeDefined();
    expect(columns.categoryId).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(subcategories);
    expect(columns.id.primary).toBe(true);
    expect(columns.name.notNull).toBe(true);
    expect(columns.emoji.notNull).toBe(true);
    expect(columns.categoryId.notNull).toBe(true);
    expect(columns.status.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(subcategories);
    expect(columns.emoji.hasDefault).toBe(true);
    expect(columns.status.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(subcategories);
    expect(columns.categoryId.name).toBe('category_id');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
