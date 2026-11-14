/**
 * Totais agregados por tipo de transação para um conjunto de filtros.
 * Fica em `shared/` porque é consumido pelo domínio (use case), pelas actions
 * e pelo client (`TransactionList`) — `client/` não pode importar de `server/`.
 */
export interface TransactionPeriodSummary {
  expense: { totalCents: number; count: number };
  income: { totalCents: number; count: number };
  transfer: { totalCents: number; count: number };
}
