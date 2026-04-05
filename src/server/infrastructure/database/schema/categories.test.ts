import { getTableName, getTableColumns } from 'drizzle-orm';

import { categories } from './categories';

describe('categories schema', () => {
  it('should define categories table with correct name', () => {
    expect(getTableName(categories)).toBe('categories');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(categories);
    expect(columns.id).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.emoji).toBeDefined();
    expect(columns.classificationId).toBeDefined();
    expect(columns.budgetMinCents).toBeDefined();
    expect(columns.budgetMaxCents).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(categories);
    expect(columns.id.primary).toBe(true);
    expect(columns.name.notNull).toBe(true);
    expect(columns.emoji.notNull).toBe(true);
    expect(columns.classificationId.notNull).toBe(true);
    expect(columns.status.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should allow nullable budget columns', () => {
    const columns = getTableColumns(categories);
    expect(columns.budgetMinCents.notNull).toBe(false);
    expect(columns.budgetMaxCents.notNull).toBe(false);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(categories);
    expect(columns.emoji.hasDefault).toBe(true);
    expect(columns.status.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(categories);
    expect(columns.classificationId.name).toBe('classification_id');
    expect(columns.budgetMinCents.name).toBe('budget_min_cents');
    expect(columns.budgetMaxCents.name).toBe('budget_max_cents');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
