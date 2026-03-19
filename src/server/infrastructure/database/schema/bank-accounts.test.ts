import { getTableName, getTableColumns } from 'drizzle-orm';

import { bankAccounts } from './bank-accounts';

describe('bank_accounts schema', () => {
  it('should define bank_accounts table with correct name', () => {
    expect(getTableName(bankAccounts)).toBe('bank_accounts');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(bankAccounts);
    expect(columns.id).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.bank).toBeDefined();
    expect(columns.balanceCents).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(bankAccounts);
    expect(columns.id.primary).toBe(true);
    expect(columns.name.notNull).toBe(true);
    expect(columns.bank.notNull).toBe(true);
    expect(columns.balanceCents.notNull).toBe(true);
    expect(columns.status.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(bankAccounts);
    expect(columns.balanceCents.hasDefault).toBe(true);
    expect(columns.status.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(bankAccounts);
    expect(columns.balanceCents.name).toBe('balance_cents');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
