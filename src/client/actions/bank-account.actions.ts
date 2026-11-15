// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/bank-account.actions`.
import * as server from '@/server/actions/bank-account.actions';

import { withActionFallback } from './with-action-fallback';

export const createBankAccountAction = withActionFallback((...args: Parameters<typeof server.createBankAccountAction>) => server.createBankAccountAction(...args));
export const updateBankAccountAction = withActionFallback((...args: Parameters<typeof server.updateBankAccountAction>) => server.updateBankAccountAction(...args));
export const archiveBankAccountAction = withActionFallback((...args: Parameters<typeof server.archiveBankAccountAction>) => server.archiveBankAccountAction(...args));
export const reactivateBankAccountAction = withActionFallback((...args: Parameters<typeof server.reactivateBankAccountAction>) => server.reactivateBankAccountAction(...args));
export const listBankAccountsAction = withActionFallback((...args: Parameters<typeof server.listBankAccountsAction>) => server.listBankAccountsAction(...args));
export const getBankAccountAction = withActionFallback((...args: Parameters<typeof server.getBankAccountAction>) => server.getBankAccountAction(...args));
