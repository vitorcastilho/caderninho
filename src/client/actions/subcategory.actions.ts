// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/subcategory.actions`.
import * as server from '@/server/actions/subcategory.actions';

import { withActionFallback } from './with-action-fallback';

export const createSubcategoryAction = withActionFallback((...args: Parameters<typeof server.createSubcategoryAction>) => server.createSubcategoryAction(...args));
export const updateSubcategoryAction = withActionFallback((...args: Parameters<typeof server.updateSubcategoryAction>) => server.updateSubcategoryAction(...args));
export const archiveSubcategoryAction = withActionFallback((...args: Parameters<typeof server.archiveSubcategoryAction>) => server.archiveSubcategoryAction(...args));
export const reactivateSubcategoryAction = withActionFallback((...args: Parameters<typeof server.reactivateSubcategoryAction>) => server.reactivateSubcategoryAction(...args));
export const listSubcategoriesAction = withActionFallback((...args: Parameters<typeof server.listSubcategoriesAction>) => server.listSubcategoriesAction(...args));
export const getSubcategoryAction = withActionFallback((...args: Parameters<typeof server.getSubcategoryAction>) => server.getSubcategoryAction(...args));
