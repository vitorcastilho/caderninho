import { headers } from "next/headers";

import { auth } from "./config";

export async function ensureUserHasOrganization(
  userId: string,
  userName: string,
  activeOrganizationId: string | null | undefined,
) {
  try {
    const reqHeaders = await headers();

    const orgs = await auth.api.listOrganizations({
      headers: reqHeaders,
      query: { userId },
    });

    let org = orgs.length > 0 ? orgs[0] : null;

    if (!org) {
      const firstName = userName.trim().split(" ")[0] || "";
      const orgName = firstName ? `Família ${firstName}` : "Família";
      const slug = orgName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      org = await auth.api.createOrganization({
        headers: reqHeaders,
        body: {
          name: orgName,
          slug,
          userId,
        },
      });
    }

    if (org && !activeOrganizationId) {
      await auth.api.setActiveOrganization({
        headers: reqHeaders,
        body: { organizationId: org.id },
      });
    }

    return org;
  } catch {
    return null;
  }
}
