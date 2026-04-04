import { getTableName, getTableColumns } from 'drizzle-orm';

import { establishments } from './establishments';

describe('establishments schema', () => {
  it('should define establishments table with correct name', () => {
    expect(getTableName(establishments)).toBe('establishments');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(establishments);
    expect(columns.id).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.emoji).toBeDefined();
    expect(columns.subcategoryId).toBeDefined();
    expect(columns.source).toBeDefined();
    expect(columns.defaultPaymentMethodType).toBeDefined();
    expect(columns.defaultPaymentMethodId).toBeDefined();
    expect(columns.budgetMinCents).toBeDefined();
    expect(columns.budgetMaxCents).toBeDefined();
    expect(columns.visitCount).toBeDefined();
    expect(columns.lastVisitAt).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(establishments);
    expect(columns.id.primary).toBe(true);
    expect(columns.name.notNull).toBe(true);
    expect(columns.emoji.notNull).toBe(true);
    expect(columns.subcategoryId.notNull).toBe(true);
    expect(columns.source.notNull).toBe(true);
    expect(columns.visitCount.notNull).toBe(true);
    expect(columns.status.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(establishments);
    expect(columns.emoji.hasDefault).toBe(true);
    expect(columns.visitCount.hasDefault).toBe(true);
    expect(columns.status.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should allow nullable columns', () => {
    const columns = getTableColumns(establishments);
    expect(columns.lastVisitAt.notNull).toBe(false);
    expect(columns.defaultPaymentMethodType.notNull).toBe(false);
    expect(columns.defaultPaymentMethodId.notNull).toBe(false);
    expect(columns.budgetMinCents.notNull).toBe(false);
    expect(columns.budgetMaxCents.notNull).toBe(false);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(establishments);
    expect(columns.subcategoryId.name).toBe('subcategory_id');
    expect(columns.defaultPaymentMethodType.name).toBe('default_payment_method_type');
    expect(columns.defaultPaymentMethodId.name).toBe('default_payment_method_id');
    expect(columns.budgetMinCents.name).toBe('budget_min_cents');
    expect(columns.budgetMaxCents.name).toBe('budget_max_cents');
    expect(columns.visitCount.name).toBe('visit_count');
    expect(columns.lastVisitAt.name).toBe('last_visit_at');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
