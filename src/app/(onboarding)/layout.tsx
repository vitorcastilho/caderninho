import { redirect } from "next/navigation";

import { getAuthSession } from "@/server/infrastructure/auth/get-session";
import { ensureUserHasOrganization } from "@/server/infrastructure/auth/ensure-organization";

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  await ensureUserHasOrganization(session.user.id, session.user.name, session.session.activeOrganizationId);

  return (
    <div className="min-h-screen bg-background">
      <main id="main-content">
        {children}
      </main>
    </div>
  );
}
