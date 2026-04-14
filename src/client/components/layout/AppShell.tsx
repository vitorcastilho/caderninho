'use client';

import { useState, useCallback } from 'react';

import { Sidebar } from '@/client/components/layout/Sidebar';
import { BottomNavigation } from '@/client/components/layout/BottomNavigation';
import { NewExpenseSheet } from '@/client/components/transactions/NewExpenseSheet';
import { NewIncomeSheet } from '@/client/components/transactions/NewIncomeSheet';
import { NewTransferSheet } from '@/client/components/transactions/NewTransferSheet';
import {
  RegisterTypePicker,
  type RegisterType,
} from '@/client/components/transactions/RegisterTypePicker';

interface AppShellProps {
  userName: string;
  children: React.ReactNode;
}

type ActiveSheet = 'picker' | 'expense' | 'income' | 'transfer' | null;

export function AppShell({ userName, children }: AppShellProps) {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  const openPicker = useCallback(() => setActiveSheet('picker'), []);

  const handlePickerChange = useCallback((open: boolean) => {
    setActiveSheet((prev) => (open ? 'picker' : prev === 'picker' ? null : prev));
  }, []);

  const handleExpenseChange = useCallback((open: boolean) => {
    setActiveSheet((prev) => (open ? 'expense' : prev === 'expense' ? null : prev));
  }, []);

  const handleIncomeChange = useCallback((open: boolean) => {
    setActiveSheet((prev) => (open ? 'income' : prev === 'income' ? null : prev));
  }, []);

  const handleTransferChange = useCallback((open: boolean) => {
    setActiveSheet((prev) => (open ? 'transfer' : prev === 'transfer' ? null : prev));
  }, []);

  const handleSelectType = useCallback((type: RegisterType) => {
    setActiveSheet(type);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-button"
      >
        Pular para conteúdo principal
      </a>

      <Sidebar userName={userName} onRegisterClick={openPicker} />

      <main id="main-content" className="flex-1 overflow-y-auto pb-14 md:pb-0">
        <div className="p-3 md:p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--density-gap)]">
            {children}
          </div>
        </div>
      </main>

      <BottomNavigation onFabClick={openPicker} />

      <RegisterTypePicker
        open={activeSheet === 'picker'}
        onOpenChange={handlePickerChange}
        onSelect={handleSelectType}
      />
      <NewExpenseSheet
        open={activeSheet === 'expense'}
        onOpenChange={handleExpenseChange}
      />
      <NewIncomeSheet
        open={activeSheet === 'income'}
        onOpenChange={handleIncomeChange}
      />
      <NewTransferSheet
        open={activeSheet === 'transfer'}
        onOpenChange={handleTransferChange}
      />
    </div>
  );
}
