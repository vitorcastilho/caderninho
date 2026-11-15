// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/investment.actions`.
import * as server from '@/server/actions/investment.actions';

import { withActionFallback } from './with-action-fallback';

export const createInvestmentAction = withActionFallback((...args: Parameters<typeof server.createInvestmentAction>) => server.createInvestmentAction(...args));
export const updateInvestmentAction = withActionFallback((...args: Parameters<typeof server.updateInvestmentAction>) => server.updateInvestmentAction(...args));
export const archiveInvestmentAction = withActionFallback((...args: Parameters<typeof server.archiveInvestmentAction>) => server.archiveInvestmentAction(...args));
export const reactivateInvestmentAction = withActionFallback((...args: Parameters<typeof server.reactivateInvestmentAction>) => server.reactivateInvestmentAction(...args));
export const listInvestmentsAction = withActionFallback((...args: Parameters<typeof server.listInvestmentsAction>) => server.listInvestmentsAction(...args));
export const getInvestmentAction = withActionFallback((...args: Parameters<typeof server.getInvestmentAction>) => server.getInvestmentAction(...args));
