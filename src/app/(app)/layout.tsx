import { redirect } from "next/navigation";

import { Sidebar } from "@/client/components/layout/Sidebar";
import { BottomNavigation } from "@/client/components/layout/BottomNavigation";
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-button"
      >
        Pular para conteúdo principal
      </a>

      {/* Sidebar — visible on tablet (md: collapsed) and desktop (lg: toggle) */}
      <Sidebar userName={session.user.name} />

      {/* Main content area */}
      <main id="main-content" className="flex-1 overflow-y-auto pb-14 md:pb-0">
        <div className="p-3 md:p-4 lg:p-6">
          {/* Responsive grid: mobile 1col, tablet 2col, desktop 3col */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--density-gap)]">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom navigation — mobile only (< 768px) */}
      <BottomNavigation />
    </div>
  );
}
