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
  Landmark,
  Wallet,
  Tags,
  Building2,
  BookText,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/client/utils/utils";
import { useSidebarState } from "@/client/hooks/use-sidebar-state";
import { authClient } from "@/client/utils/auth-client";
import { Button } from "@/client/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Navegação",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/orcamentos", label: "Orçamentos", icon: PiggyBank },
      { href: "/checklist", label: "Checklist", icon: CheckSquare },
      { href: "/projecao", label: "Projeção", icon: TrendingUp },
    ],
  },
  {
    label: "Configurações",
    items: [
      { href: "/accounts", label: "Contas", icon: Building2 },
      { href: "/credit-cards", label: "Cartões", icon: CreditCard },
      { href: "/investments", label: "Investimentos", icon: Landmark },
      { href: "/income-sources", label: "Receitas", icon: Wallet },
      { href: "/categories", label: "Categorias", icon: Tags },
    ],
  },
];

/** CSS helper: visível apenas quando sidebar está expandida (desktop lg) */
const expandedOnly = (collapsed: boolean) =>
  cn("md:hidden", !collapsed && "lg:inline");

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const { collapsed, toggle } = useSidebarState();
  const pathname = usePathname();
  const router = useRouter();

  const userInitial = userName?.charAt(0).toUpperCase() || "?";

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-in-out",
        "md:w-[60px]",
        collapsed ? "lg:w-[56px]" : "lg:w-[220px]"
      )}
    >
      {/* Logo — DS: text-base font-bold tracking-[-0.01em] text-primary */}
      <div
        className={cn(
          "flex items-center px-4 pt-5 pb-4",
          collapsed && "lg:justify-center"
        )}
      >
        <span className="flex items-center text-base font-bold tracking-[-0.01em] text-primary">
          <BookText className="size-[18px] shrink-0" />
          <span className={expandedOnly(collapsed)}>&nbsp;Caderninho</span>
        </span>
      </div>

      {/* Separator — DS: mx-4 my-1 */}
      <div className="mx-4 my-1 h-px bg-border" />

      {/* Navigation */}
      <nav aria-label="Menu lateral" className="flex-1 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <div key={section.label}>
            {sectionIdx > 0 && (
              <div className="mx-4 my-1 h-px bg-border" />
            )}
            {/* Section label — DS: 11px uppercase tracking-0.06em text-text-tertiary */}
            <div
              className={cn(
                "px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary",
                "md:hidden",
                !collapsed && "lg:block"
              )}
            >
              {section.label}
            </div>
            {/* Nav items — DS: 13px font-medium, gap 10px, px-3 py-2, icons 18px */}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      title={item.label}
                      className={cn(
                        "flex items-center gap-[10px] rounded-button px-3 py-2 text-[13px] font-medium transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2",
                        isActive
                          ? "bg-primary-light text-primary font-semibold"
                          : "text-text-secondary hover:bg-background hover:text-foreground",
                        collapsed && "lg:justify-center lg:px-0"
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      <span className={cn("flex-1 truncate", expandedOnly(collapsed))}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User profile + actions — DS: avatar 32x32, name 13px semibold, role 11px */}
      <div className="mt-auto border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-[10px]",
            collapsed && "lg:justify-center"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
            {userInitial}
          </div>
          <div className={cn("flex flex-col min-w-0", "md:hidden", !collapsed && "lg:flex")}>
            <span className="truncate text-[13px] font-semibold text-foreground">
              {userName}
            </span>
            <span className="text-[11px] text-text-tertiary">
              Administrador
            </span>
          </div>
        </div>

        {/* Logout + Collapse toggle */}
        <div
          className={cn(
            "mt-2 flex items-center",
            collapsed && "lg:flex-col lg:items-center lg:gap-1"
          )}
        >
          <Button
            variant="ghost"
            onClick={handleLogout}
            title="Sair"
            className={cn(
              "flex items-center gap-[10px] rounded-button px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-background hover:text-foreground",
              collapsed && "lg:justify-center lg:px-2"
            )}
          >
            <LogOut className="size-[18px] shrink-0" />
            <span className={expandedOnly(collapsed)}>Sair</span>
          </Button>
          <span
            className={cn("flex-1", collapsed && "lg:hidden")}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggle}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
            className="hidden lg:flex items-center justify-center rounded-button p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="size-[18px]" />
            ) : (
              <ChevronLeft className="size-[18px]" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
