'use client';

import { useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

import { Building2 } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Breadcrumb } from '@/client/components/ui/breadcrumb';
import { EmptyState } from '@/client/components/ui/empty-state';
import { PageHeader } from '@/client/components/ui/page-header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog';
import { BankAccountCard } from './BankAccountCard';
import { BankAccountForm } from './BankAccountForm';
import { listBankAccountsAction, getBankAccountAction } from '@/server/actions/bank-account.actions';

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  balanceCents: number;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BankAccountListProps {
  initialAccounts: BankAccount[];
}

export function BankAccountList({ initialAccounts }: BankAccountListProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<{
    id: string;
    name: string;
    bank: string;
    balanceCents: number;
  } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [, startTransition] = useTransition();

  const refreshAccounts = useCallback(() => {
    startTransition(async () => {
      const result = await listBankAccountsAction(undefined);
      if (result.success) {
        setAccounts(result.data);
      } else {
        toast.error('Erro ao atualizar lista de contas.');
      }
    });
  }, []);

  function handleEdit(id: string) {
    startTransition(async () => {
      const result = await getBankAccountAction({ id });
      if (result.success) {
        setEditingAccount({
          id: result.data.id,
          name: result.data.name,
          bank: result.data.bank,
          balanceCents: result.data.balanceCents,
        });
      } else {
        toast.error(result.error.message);
      }
    });
  }

  const activeAccounts = accounts.filter((a) => a.status === 'active');
  const archivedAccounts = accounts.filter((a) => a.status === 'archived');

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Configurações' },
            { label: 'Contas Bancárias' },
          ]}
          className="mb-1"
        />
        <PageHeader title="Contas Bancárias">
          <Button onClick={() => setShowCreateForm(true)}>Nova Conta</Button>
        </PageHeader>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta Bancária</DialogTitle>
          </DialogHeader>
          <BankAccountForm
            mode="create"
            onSuccess={() => {
              setShowCreateForm(false);
              refreshAccounts();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conta Bancária</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <BankAccountForm
              mode="edit"
              defaultValues={editingAccount}
              onSuccess={() => {
                setEditingAccount(null);
                refreshAccounts();
              }}
              onCancel={() => setEditingAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Active Accounts */}
      {activeAccounts.length === 0 && archivedAccounts.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma conta cadastrada"
          description="Cadastre suas contas bancárias para acompanhar saldos."
          actionLabel="Nova Conta"
          onAction={() => setShowCreateForm(true)}
        />
      ) : (
        <>
          {activeAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conta ativa.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAccounts.map((account) => (
                <BankAccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onStatusChange={refreshAccounts}
                />
              ))}
            </div>
          )}

          {/* Archived Accounts */}
          {archivedAccounts.length > 0 && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? 'Ocultar arquivadas' : `Mostrar arquivadas (${archivedAccounts.length})`}
              </Button>
              {showArchived && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 opacity-60">
                  {archivedAccounts.map((account) => (
                    <BankAccountCard
                      key={account.id}
                      account={account}
                      onEdit={handleEdit}
                      onStatusChange={refreshAccounts}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
