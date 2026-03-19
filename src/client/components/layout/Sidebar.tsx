"use client";

import {
  LayoutDashboard,
  PiggyBank,
  CheckSquare,
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/client/utils/utils";
import { useSidebarState } from "@/client/hooks/use-sidebar-state";
import { authClient } from "@/client/utils/auth-client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/credit-cards", label: "Cartões", icon: CreditCard },
  { href: "/orcamentos", label: "Orçamentos", icon: PiggyBank },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/projecao", label: "Projeção", icon: TrendingUp },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarState();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-in-out",
        /* Tablet (md): always collapsed 60px; Desktop (lg): respects user toggle */
        "md:w-[60px]",
        collapsed ? "lg:w-[56px]" : "lg:w-[220px]"
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
        <span
          className={cn(
            "text-lg font-bold text-sidebar-foreground",
            "md:hidden",
            !collapsed && "lg:block"
          )}
        >
          Caderninho
        </span>
        <span
          className={cn(
            "hidden text-lg font-bold text-sidebar-foreground",
            "md:block",
            !collapsed && "lg:hidden"
          )}
        >
          C
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Menu lateral" className="flex-1 py-2">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  title={item.label}
                  className={cn(
                    "flex items-center gap-3 rounded-button px-2 py-2 text-sm transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2",
                    isActive
                      ? "bg-primary-light text-primary font-semibold"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  <span
                    className={cn(
                      "truncate",
                      "md:hidden",
                      !collapsed && "lg:inline"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2 pb-1">
        <button
          onClick={handleLogout}
          title="Sair"
          className="flex items-center gap-3 w-full rounded-button px-2 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <LogOut className="size-5 shrink-0" />
          <span
            className={cn(
              "truncate",
              "md:hidden",
              !collapsed && "lg:inline"
            )}
          >
            Sair
          </span>
        </button>
      </div>

      {/* Collapse toggle button — desktop only */}
      <div className="hidden lg:block border-t border-sidebar-border p-2">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
          className="flex items-center justify-center w-full rounded-button p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {collapsed ? (
            <ChevronRight className="size-5" />
          ) : (
            <ChevronLeft className="size-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
