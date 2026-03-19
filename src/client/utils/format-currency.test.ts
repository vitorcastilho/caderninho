import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('should format positive values correctly', () => {
    expect(formatCurrency(14999)).toBe('R$ 149,99');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });

  it('should format single cents correctly', () => {
    expect(formatCurrency(1)).toBe('R$ 0,01');
  });

  it('should format large values correctly', () => {
    expect(formatCurrency(1000000)).toBe('R$ 10.000,00');
  });
});
