import { getTableName, getTableColumns } from 'drizzle-orm';

import { creditCards } from './credit-cards';

describe('credit_cards schema', () => {
  it('should define credit_cards table with correct name', () => {
    expect(getTableName(creditCards)).toBe('credit_cards');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(creditCards);
    expect(columns.id).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.brand).toBeDefined();
    expect(columns.limitCents).toBeDefined();
    expect(columns.closingDay).toBeDefined();
    expect(columns.dueDay).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(creditCards);
    expect(columns.id.primary).toBe(true);
    expect(columns.name.notNull).toBe(true);
    expect(columns.brand.notNull).toBe(true);
    expect(columns.limitCents.notNull).toBe(true);
    expect(columns.closingDay.notNull).toBe(true);
    expect(columns.dueDay.notNull).toBe(true);
    expect(columns.status.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(creditCards);
    expect(columns.status.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(creditCards);
    expect(columns.limitCents.name).toBe('limit_cents');
    expect(columns.closingDay.name).toBe('closing_day');
    expect(columns.dueDay.name).toBe('due_day');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
