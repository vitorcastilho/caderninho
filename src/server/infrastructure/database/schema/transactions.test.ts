import { getTableName, getTableColumns } from 'drizzle-orm';

import { transactions } from './transactions';

describe('transactions schema', () => {
  it('should define transactions table with correct name', () => {
    expect(getTableName(transactions)).toBe('transactions');
  });

  it('should have all expected columns', () => {
    const columns = getTableColumns(transactions);
    expect(columns.id).toBeDefined();
    expect(columns.type).toBeDefined();
    expect(columns.amountCents).toBeDefined();
    expect(columns.categoryId).toBeDefined();
    expect(columns.subcategoryId).toBeDefined();
    expect(columns.establishment).toBeDefined();
    expect(columns.paymentMethodType).toBeDefined();
    expect(columns.paymentMethodId).toBeDefined();
    expect(columns.description).toBeDefined();
    expect(columns.transactionDate).toBeDefined();
    expect(columns.referenceMonth).toBeDefined();
    expect(columns.organizationId).toBeDefined();
    expect(columns.createdBy).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('should enforce notNull constraints on required columns', () => {
    const columns = getTableColumns(transactions);
    expect(columns.id.primary).toBe(true);
    expect(columns.type.notNull).toBe(true);
    expect(columns.amountCents.notNull).toBe(true);
    expect(columns.categoryId.notNull).toBe(true);
    expect(columns.paymentMethodType.notNull).toBe(true);
    expect(columns.organizationId.notNull).toBe(true);
    expect(columns.createdBy.notNull).toBe(true);
    expect(columns.createdAt.notNull).toBe(true);
    expect(columns.updatedAt.notNull).toBe(true);
  });

  it('should allow nullable columns', () => {
    const columns = getTableColumns(transactions);
    expect(columns.subcategoryId.notNull).toBe(false);
    expect(columns.establishment.notNull).toBe(false);
    expect(columns.paymentMethodId.notNull).toBe(false);
    expect(columns.description.notNull).toBe(false);
    expect(columns.referenceMonth.notNull).toBe(false);
  });

  it('should have correct default values', () => {
    const columns = getTableColumns(transactions);
    expect(columns.transactionDate.hasDefault).toBe(true);
    expect(columns.createdAt.hasDefault).toBe(true);
    expect(columns.updatedAt.hasDefault).toBe(true);
  });

  it('should use snake_case for DB column names', () => {
    const columns = getTableColumns(transactions);
    expect(columns.amountCents.name).toBe('amount_cents');
    expect(columns.categoryId.name).toBe('category_id');
    expect(columns.subcategoryId.name).toBe('subcategory_id');
    expect(columns.paymentMethodType.name).toBe('payment_method_type');
    expect(columns.paymentMethodId.name).toBe('payment_method_id');
    expect(columns.transactionDate.name).toBe('transaction_date');
    expect(columns.referenceMonth.name).toBe('reference_month');
    expect(columns.organizationId.name).toBe('organization_id');
    expect(columns.createdBy.name).toBe('created_by');
    expect(columns.createdAt.name).toBe('created_at');
    expect(columns.updatedAt.name).toBe('updated_at');
  });
});
