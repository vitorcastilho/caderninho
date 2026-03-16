"use client";

import {
  LayoutDashboard,
  PiggyBank,
  Plus,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/client/utils/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isFab?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orcamentos", label: "Orçamentos", icon: PiggyBank },
  { href: "/registrar", label: "Registrar", icon: Plus, isFab: true },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/projecao", label: "Projeção", icon: TrendingUp },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navegação inferior"
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-14 bg-card border-t border-border"
    >
      <ul className="flex w-full items-end justify-around">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <li key={item.href} className="flex flex-col items-center -mt-4">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-150 ease-in-out active:scale-95"
                >
                  <Icon className="size-6" />
                </Link>
                <span className="mt-0.5 text-[10px] font-medium text-primary">
                  {item.label}
                </span>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-[75px] min-h-[44px] transition-colors duration-150 ease-in-out",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
