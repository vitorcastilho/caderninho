import { getTableName, getTableColumns } from 'drizzle-orm';

import { incomeSources } from './income-sources';

describe('income_sources schema', () => {
  it('should define income_sources table with correct name', () => {
    expect(getTableName(incomeSources)).toBe('income_sources');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(incomeSources);
    expect(columns.id).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.employmentType).toBeDefined();
    expect(columns.isRecurring).toBeDefined();
    expect(columns.baseAmountCents).toBeDefined();
    expect(columns.usualPaymentDay).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(incomeSources);
    expect(columns.id.primary).toBe(true);
    expect(columns.name.notNull).toBe(true);
    expect(columns.employmentType.notNull).toBe(true);
    expect(columns.isRecurring.notNull).toBe(true);
    expect(columns.status.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should allow nullable columns for optional fields', () => {
    const columns = getTableColumns(incomeSources);
    expect(columns.baseAmountCents.notNull).toBe(false);
    expect(columns.usualPaymentDay.notNull).toBe(false);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(incomeSources);
    expect(columns.isRecurring.hasDefault).toBe(true);
    expect(columns.status.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(incomeSources);
    expect(columns.employmentType.name).toBe('employment_type');
    expect(columns.isRecurring.name).toBe('is_recurring');
    expect(columns.baseAmountCents.name).toBe('base_amount_cents');
    expect(columns.usualPaymentDay.name).toBe('usual_payment_day');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
