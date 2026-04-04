'use client';

import { useState } from 'react';

import { Sidebar } from '@/client/components/layout/Sidebar';
import { BottomNavigation } from '@/client/components/layout/BottomNavigation';
import { NewExpenseSheet } from '@/client/components/transactions/NewExpenseSheet';

interface AppShellProps {
  userName: string;
  children: React.ReactNode;
}

export function AppShell({ userName, children }: AppShellProps) {
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-button"
      >
        Pular para conteúdo principal
      </a>

      <Sidebar userName={userName} onRegisterClick={() => setExpenseSheetOpen(true)} />

      <main id="main-content" className="flex-1 overflow-y-auto pb-14 md:pb-0">
        <div className="p-3 md:p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--density-gap)]">
            {children}
          </div>
        </div>
      </main>

      <BottomNavigation onFabClick={() => setExpenseSheetOpen(true)} />

      <NewExpenseSheet open={expenseSheetOpen} onOpenChange={setExpenseSheetOpen} />
    </div>
  );
}
