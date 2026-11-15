// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/credit-card.actions`.
import * as server from '@/server/actions/credit-card.actions';

import { withActionFallback } from './with-action-fallback';

export const createCreditCardAction = withActionFallback((...args: Parameters<typeof server.createCreditCardAction>) => server.createCreditCardAction(...args));
export const updateCreditCardAction = withActionFallback((...args: Parameters<typeof server.updateCreditCardAction>) => server.updateCreditCardAction(...args));
export const archiveCreditCardAction = withActionFallback((...args: Parameters<typeof server.archiveCreditCardAction>) => server.archiveCreditCardAction(...args));
export const reactivateCreditCardAction = withActionFallback((...args: Parameters<typeof server.reactivateCreditCardAction>) => server.reactivateCreditCardAction(...args));
export const listCreditCardsAction = withActionFallback((...args: Parameters<typeof server.listCreditCardsAction>) => server.listCreditCardsAction(...args));
export const getCreditCardAction = withActionFallback((...args: Parameters<typeof server.getCreditCardAction>) => server.getCreditCardAction(...args));
