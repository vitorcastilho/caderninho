import { redirect } from "next/navigation";

import { AppShell } from "@/client/components/layout/AppShell";
import { getAuthSession } from "@/server/infrastructure/auth/get-session";
import { ensureUserHasOrganization } from "@/server/infrastructure/auth/ensure-organization";
import { checkOnboardingStatusAction } from "@/server/actions/onboarding.actions";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  await ensureUserHasOrganization(session.user.id, session.user.name, session.session.activeOrganizationId);

  // Detectar se o onboarding foi completado — redirect para /onboarding se não
  const onboardingResult = await checkOnboardingStatusAction(null);
  if (onboardingResult.success && !onboardingResult.data.completed) {
    redirect("/onboarding");
  }

  return <AppShell userName={session.user.name}>{children}</AppShell>;
}
