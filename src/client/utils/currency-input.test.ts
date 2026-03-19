import { centsToDisplayValue, displayValueToCents } from './currency-input';

describe('centsToDisplayValue', () => {
  it('should format zero cents', () => {
    expect(centsToDisplayValue(0)).toBe('0,00');
  });

  it('should format single digit cents', () => {
    expect(centsToDisplayValue(5)).toBe('0,05');
  });

  it('should format double digit cents', () => {
    expect(centsToDisplayValue(99)).toBe('0,99');
  });

  it('should format whole reais', () => {
    expect(centsToDisplayValue(100)).toBe('1,00');
  });

  it('should format mixed values', () => {
    expect(centsToDisplayValue(1978)).toBe('19,78');
  });

  it('should format large values with thousands separator', () => {
    expect(centsToDisplayValue(1000000)).toBe('10.000,00');
  });

  it('should format very large values', () => {
    expect(centsToDisplayValue(15000050)).toBe('150.000,50');
  });
});

describe('displayValueToCents', () => {
  it('should convert empty string to zero', () => {
    expect(displayValueToCents('')).toBe(0);
  });

  it('should strip non-digit characters and parse', () => {
    expect(displayValueToCents('R$ 19,78')).toBe(1978);
  });

  it('should handle plain digits', () => {
    expect(displayValueToCents('1978')).toBe(1978);
  });

  it('should handle value with thousands separator', () => {
    expect(displayValueToCents('10.000,00')).toBe(1000000);
  });

  it('should handle only non-digit characters as zero', () => {
    expect(displayValueToCents('R$ ')).toBe(0);
  });
});
