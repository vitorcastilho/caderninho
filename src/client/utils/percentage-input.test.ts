import { basisPointsToDisplayValue, displayValueToBasisPoints } from './percentage-input';

describe('basisPointsToDisplayValue', () => {
  it('should convert 11050 to "110,50"', () => {
    expect(basisPointsToDisplayValue(11050)).toBe('110,50');
  });

  it('should convert 2503 to "25,03"', () => {
    expect(basisPointsToDisplayValue(2503)).toBe('25,03');
  });

  it('should convert 100 to "1,00"', () => {
    expect(basisPointsToDisplayValue(100)).toBe('1,00');
  });

  it('should convert 0 to "0,00"', () => {
    expect(basisPointsToDisplayValue(0)).toBe('0,00');
  });
});

describe('displayValueToBasisPoints', () => {
  it('should convert "11050" to 11050', () => {
    expect(displayValueToBasisPoints('11050')).toBe(11050);
  });

  it('should convert empty string to 0', () => {
    expect(displayValueToBasisPoints('')).toBe(0);
  });

  it('should convert "abc" to 0', () => {
    expect(displayValueToBasisPoints('abc')).toBe(0);
  });
});
