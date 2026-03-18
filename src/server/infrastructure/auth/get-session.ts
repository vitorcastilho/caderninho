import { headers } from "next/headers";

import { auth } from "./config";

export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
