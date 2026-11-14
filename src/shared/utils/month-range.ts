/**
 * Recorte mensal no fuso de Brasília.
 *
 * Usado pelo SSR (`/transactions/page.tsx`, roda em UTC na Vercel) e pelo client
 * (`TransactionList`, roda no fuso do navegador). Os dois precisam produzir o
 * MESMO intervalo, senão o summary/lista do SSR divergem do primeiro refetch.
 * Por isso o cálculo não usa o fuso local do processo: usa UTC−3 fixo
 * (o Brasil não tem horário de verão desde 2019).
 *
 * `transactionDate` é gravado como instante (`new Date()` no servidor), então
 * o mês "de Brasília" é o recorte correto para o usuário.
 */

export interface MonthRef {
  year: number;
  /** 1–12 */
  month: number;
}

const BRT_OFFSET_HOURS = 3; // UTC−3

export function getCurrentMonthBR(now: Date = new Date()): MonthRef {
  const shifted = new Date(now.getTime() - BRT_OFFSET_HOURS * 60 * 60 * 1000);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 };
}

export function monthToDateRangeBR(month: MonthRef): { dateFrom: Date; dateTo: Date } {
  const dateFrom = new Date(Date.UTC(month.year, month.month - 1, 1, BRT_OFFSET_HOURS));
  const nextMonthStart = Date.UTC(month.year, month.month, 1, BRT_OFFSET_HOURS);
  const dateTo = new Date(nextMonthStart - 1);
  return { dateFrom, dateTo };
}

/** Últimos `n` meses (mais recente primeiro), a partir do mês corrente de Brasília. */
export function getLastNMonthsBR(n: number, now: Date = new Date()): MonthRef[] {
  const current = getCurrentMonthBR(now);
  const result: MonthRef[] = [];
  for (let i = 0; i < n; i++) {
    const total = current.year * 12 + (current.month - 1) - i;
    result.push({ year: Math.floor(total / 12), month: (total % 12) + 1 });
  }
  return result;
}
