// Wrappers das server actions para componentes do navegador (code review 1.11).
// Ver `with-action-fallback.ts`. Acesso preguiçoso a `server.x` para funcionar com mocks parciais nos testes. Gerado a partir de `@/server/actions/onboarding.actions`.
import * as server from '@/server/actions/onboarding.actions';

import { withActionFallback } from './with-action-fallback';

export const checkOnboardingStatusAction = withActionFallback((...args: Parameters<typeof server.checkOnboardingStatusAction>) => server.checkOnboardingStatusAction(...args));
export const completeOnboardingAction = withActionFallback((...args: Parameters<typeof server.completeOnboardingAction>) => server.completeOnboardingAction(...args));
