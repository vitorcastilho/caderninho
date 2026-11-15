// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/income-source.actions`.
import * as server from '@/server/actions/income-source.actions';

import { withActionFallback } from './with-action-fallback';

export const createIncomeSourceAction = withActionFallback((...args: Parameters<typeof server.createIncomeSourceAction>) => server.createIncomeSourceAction(...args));
export const updateIncomeSourceAction = withActionFallback((...args: Parameters<typeof server.updateIncomeSourceAction>) => server.updateIncomeSourceAction(...args));
export const archiveIncomeSourceAction = withActionFallback((...args: Parameters<typeof server.archiveIncomeSourceAction>) => server.archiveIncomeSourceAction(...args));
export const reactivateIncomeSourceAction = withActionFallback((...args: Parameters<typeof server.reactivateIncomeSourceAction>) => server.reactivateIncomeSourceAction(...args));
export const listIncomeSourcesAction = withActionFallback((...args: Parameters<typeof server.listIncomeSourcesAction>) => server.listIncomeSourcesAction(...args));
export const getIncomeSourceAction = withActionFallback((...args: Parameters<typeof server.getIncomeSourceAction>) => server.getIncomeSourceAction(...args));
