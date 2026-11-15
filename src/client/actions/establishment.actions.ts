// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/establishment.actions`.
import * as server from '@/server/actions/establishment.actions';

import { withActionFallback } from './with-action-fallback';

export const createEstablishmentAction = withActionFallback((...args: Parameters<typeof server.createEstablishmentAction>) => server.createEstablishmentAction(...args));
export const updateEstablishmentAction = withActionFallback((...args: Parameters<typeof server.updateEstablishmentAction>) => server.updateEstablishmentAction(...args));
export const deleteEstablishmentAction = withActionFallback((...args: Parameters<typeof server.deleteEstablishmentAction>) => server.deleteEstablishmentAction(...args));
export const listEstablishmentsBySubcategoryAction = withActionFallback((...args: Parameters<typeof server.listEstablishmentsBySubcategoryAction>) => server.listEstablishmentsBySubcategoryAction(...args));
