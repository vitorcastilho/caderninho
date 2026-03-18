import { headers } from "next/headers";

import { auth } from "./config";

export async function ensureUserHasOrganization(
  userId: string,
  userName: string,
) {
  const reqHeaders = await headers();

  const orgs = await auth.api.listOrganizations({
    headers: reqHeaders,
    query: { userId },
  });

  if (orgs.length > 0) {
    return orgs[0];
  }

  const firstName = userName.trim().split(" ")[0] || "";
  const orgName = firstName ? `Família ${firstName}` : "Família";
  const slug = orgName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newOrg = await auth.api.createOrganization({
    headers: reqHeaders,
    body: {
      name: orgName,
      slug,
      userId,
    },
  });

  return newOrg;
}
