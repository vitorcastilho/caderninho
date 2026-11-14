import { describe, it, expect } from 'vitest';

import { getCurrentMonthBR, getLastNMonthsBR, monthToDateRangeBR } from './month-range';

describe('getCurrentMonthBR', () => {
  it('usa o fuso de Brasília: 01/12 02:00 UTC ainda é novembro em Brasília', () => {
    expect(getCurrentMonthBR(new Date('2026-12-01T02:00:00Z'))).toEqual({ year: 2026, month: 11 });
  });

  it('01/12 03:00 UTC já é dezembro em Brasília', () => {
    expect(getCurrentMonthBR(new Date('2026-12-01T03:00:00Z'))).toEqual({ year: 2026, month: 12 });
  });

  it('vira o ano corretamente', () => {
    expect(getCurrentMonthBR(new Date('2027-01-01T02:59:59Z'))).toEqual({ year: 2026, month: 12 });
  });
});

describe('monthToDateRangeBR', () => {
  it('intervalo de novembro/2026 começa 00:00 e termina 23:59:59.999 de Brasília', () => {
    const { dateFrom, dateTo } = monthToDateRangeBR({ year: 2026, month: 11 });
    expect(dateFrom.toISOString()).toBe('2026-11-01T03:00:00.000Z');
    expect(dateTo.toISOString()).toBe('2026-12-01T02:59:59.999Z');
  });

  it('dezembro termina na virada do ano', () => {
    const { dateTo } = monthToDateRangeBR({ year: 2026, month: 12 });
    expect(dateTo.toISOString()).toBe('2027-01-01T02:59:59.999Z');
  });

  it('fevereiro de ano bissexto', () => {
    const { dateTo } = monthToDateRangeBR({ year: 2028, month: 2 });
    expect(dateTo.toISOString()).toBe('2028-03-01T02:59:59.999Z');
  });
});

describe('getLastNMonthsBR', () => {
  it('retorna n meses do mais recente para o mais antigo, cruzando o ano', () => {
    expect(getLastNMonthsBR(3, new Date('2027-01-15T12:00:00Z'))).toEqual([
      { year: 2027, month: 1 },
      { year: 2026, month: 12 },
      { year: 2026, month: 11 },
    ]);
  });
});
