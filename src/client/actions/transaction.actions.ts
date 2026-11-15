// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/transaction.actions`.
import * as server from '@/server/actions/transaction.actions';

import { withActionFallback } from './with-action-fallback';

export const createTransactionAction = withActionFallback((...args: Parameters<typeof server.createTransactionAction>) => server.createTransactionAction(...args));
export const createIncomeAction = withActionFallback((...args: Parameters<typeof server.createIncomeAction>) => server.createIncomeAction(...args));
export const updateExpenseTransactionAction = withActionFallback((...args: Parameters<typeof server.updateExpenseTransactionAction>) => server.updateExpenseTransactionAction(...args));
export const deleteTransactionAction = withActionFallback((...args: Parameters<typeof server.deleteTransactionAction>) => server.deleteTransactionAction(...args));
export const listTransactionsAction = withActionFallback((...args: Parameters<typeof server.listTransactionsAction>) => server.listTransactionsAction(...args));
export const getTransactionPeriodSummaryAction = withActionFallback((...args: Parameters<typeof server.getTransactionPeriodSummaryAction>) => server.getTransactionPeriodSummaryAction(...args));
export const recreateTransactionFromSnapshotAction = withActionFallback((...args: Parameters<typeof server.recreateTransactionFromSnapshotAction>) => server.recreateTransactionFromSnapshotAction(...args));
export const createTransferAction = withActionFallback((...args: Parameters<typeof server.createTransferAction>) => server.createTransferAction(...args));
export const getSuggestedEstablishmentsAction = withActionFallback((...args: Parameters<typeof server.getSuggestedEstablishmentsAction>) => server.getSuggestedEstablishmentsAction(...args));
export const getImpactPreviewAction = withActionFallback((...args: Parameters<typeof server.getImpactPreviewAction>) => server.getImpactPreviewAction(...args));
export const getMonthlySpendingSummaryAction = withActionFallback((...args: Parameters<typeof server.getMonthlySpendingSummaryAction>) => server.getMonthlySpendingSummaryAction(...args));
