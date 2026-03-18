import { headers } from 'next/headers';

import { auth } from './config';

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
