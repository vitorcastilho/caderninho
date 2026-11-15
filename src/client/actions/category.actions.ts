// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/category.actions`.
import * as server from '@/server/actions/category.actions';

import { withActionFallback } from './with-action-fallback';

export const createCategoryAction = withActionFallback((...args: Parameters<typeof server.createCategoryAction>) => server.createCategoryAction(...args));
export const updateCategoryAction = withActionFallback((...args: Parameters<typeof server.updateCategoryAction>) => server.updateCategoryAction(...args));
export const archiveCategoryAction = withActionFallback((...args: Parameters<typeof server.archiveCategoryAction>) => server.archiveCategoryAction(...args));
export const reactivateCategoryAction = withActionFallback((...args: Parameters<typeof server.reactivateCategoryAction>) => server.reactivateCategoryAction(...args));
export const listCategoriesAction = withActionFallback((...args: Parameters<typeof server.listCategoriesAction>) => server.listCategoriesAction(...args));
export const getCategoryAction = withActionFallback((...args: Parameters<typeof server.getCategoryAction>) => server.getCategoryAction(...args));
