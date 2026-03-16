import { Sidebar } from "@/client/components/layout/Sidebar";
import { BottomNavigation } from "@/client/components/layout/BottomNavigation";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — visible on tablet (md: collapsed) and desktop (lg: toggle) */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-14 md:pb-0">
        <div className="p-3 md:p-4 lg:p-6">
          {/* Responsive grid: mobile 1col, tablet 2col, desktop 3col */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom navigation — mobile only (< 768px) */}
      <BottomNavigation />
    </div>
  );
}
