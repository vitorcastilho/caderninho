// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/classification.actions`.
import * as server from '@/server/actions/classification.actions';

import { withActionFallback } from './with-action-fallback';

export const seedDefaultClassificationsAction = withActionFallback((...args: Parameters<typeof server.seedDefaultClassificationsAction>) => server.seedDefaultClassificationsAction(...args));
export const createClassificationAction = withActionFallback((...args: Parameters<typeof server.createClassificationAction>) => server.createClassificationAction(...args));
export const updateClassificationAction = withActionFallback((...args: Parameters<typeof server.updateClassificationAction>) => server.updateClassificationAction(...args));
export const mergeClassificationsAction = withActionFallback((...args: Parameters<typeof server.mergeClassificationsAction>) => server.mergeClassificationsAction(...args));
export const archiveClassificationAction = withActionFallback((...args: Parameters<typeof server.archiveClassificationAction>) => server.archiveClassificationAction(...args));
export const reactivateClassificationAction = withActionFallback((...args: Parameters<typeof server.reactivateClassificationAction>) => server.reactivateClassificationAction(...args));
export const listClassificationsAction = withActionFallback((...args: Parameters<typeof server.listClassificationsAction>) => server.listClassificationsAction(...args));
