import { getTableName, getTableColumns } from 'drizzle-orm';

import { investments } from './investments';

describe('investments schema', () => {
  it('should define investments table with correct name', () => {
    expect(getTableName(investments)).toBe('investments');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(investments);
    expect(columns.id).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.institution).toBeDefined();
    expect(columns.type).toBeDefined();
    expect(columns.balanceCents).toBeDefined();
    expect(columns.yieldRateBasisPoints).toBeDefined();
    expect(columns.lastBalanceUpdate).toBeDefined();
    expect(columns.maturityDate).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(investments);
    expect(columns.id.primary).toBe(true);
    expect(columns.name.notNull).toBe(true);
    expect(columns.institution.notNull).toBe(true);
    expect(columns.type.notNull).toBe(true);
    expect(columns.balanceCents.notNull).toBe(true);
    expect(columns.lastBalanceUpdate.notNull).toBe(true);
    expect(columns.status.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should allow nullable columns for optional fields', () => {
    const columns = getTableColumns(investments);
    expect(columns.yieldRateBasisPoints.notNull).toBe(false);
    expect(columns.maturityDate.notNull).toBe(false);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(investments);
    expect(columns.lastBalanceUpdate.hasDefault).toBe(true);
    expect(columns.status.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(investments);
    expect(columns.balanceCents.name).toBe('balance_cents');
    expect(columns.yieldRateBasisPoints.name).toBe('yield_rate_basis_points');
    expect(columns.lastBalanceUpdate.name).toBe('last_balance_update');
    expect(columns.maturityDate.name).toBe('maturity_date');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
