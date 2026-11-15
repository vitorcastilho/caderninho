'use client';

import { useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

import { Landmark } from 'lucide-react';
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
import { InvestmentCard } from './InvestmentCard';
import { InvestmentForm } from './InvestmentForm';
import { listInvestmentsAction, getInvestmentAction } from '@/client/actions/investment.actions';

interface Investment {
  id: string;
  name: string;
  institution: string;
  type: 'renda_fixa' | 'renda_variavel' | 'reserva';
  balanceCents: number;
  yieldRateBasisPoints: number | null;
  lastBalanceUpdate: Date;
  maturityDate: string | null;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InvestmentListProps {
  initialInvestments: Investment[];
}

export function InvestmentList({ initialInvestments }: InvestmentListProps) {
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<{
    id: string;
    name: string;
    institution: string;
    type: 'renda_fixa' | 'renda_variavel' | 'reserva';
    balanceCents: number;
    yieldRateBasisPoints: number | null;
    maturityDate: string | null;
  } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [, startTransition] = useTransition();

  const refreshInvestments = useCallback(() => {
    startTransition(async () => {
      const result = await listInvestmentsAction(undefined);
      if (result.success) {
        setInvestments(result.data);
      } else {
        toast.error('Erro ao atualizar lista de investimentos.');
      }
    });
  }, []);

  function handleEdit(id: string) {
    startTransition(async () => {
      const result = await getInvestmentAction({ id });
      if (result.success) {
        setEditingInvestment({
          id: result.data.id,
          name: result.data.name,
          institution: result.data.institution,
          type: result.data.type,
          balanceCents: result.data.balanceCents,
          yieldRateBasisPoints: result.data.yieldRateBasisPoints,
          maturityDate: result.data.maturityDate,
        });
      } else {
        toast.error(result.error.message);
      }
    });
  }

  const activeInvestments = investments.filter((i) => i.status === 'active');
  const archivedInvestments = investments.filter((i) => i.status === 'archived');

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Configurações' },
            { label: 'Investimentos' },
          ]}
          className="mb-1"
        />
        <PageHeader title="Investimentos">
          <Button onClick={() => setShowCreateForm(true)}>Novo Investimento</Button>
        </PageHeader>
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Investimento</DialogTitle>
          </DialogHeader>
          <InvestmentForm
            mode="create"
            onSuccess={() => {
              setShowCreateForm(false);
              refreshInvestments();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingInvestment} onOpenChange={(open) => !open && setEditingInvestment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Investimento</DialogTitle>
          </DialogHeader>
          {editingInvestment && (
            <InvestmentForm
              mode="edit"
              defaultValues={editingInvestment}
              onSuccess={() => {
                setEditingInvestment(null);
                refreshInvestments();
              }}
              onCancel={() => setEditingInvestment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {activeInvestments.length === 0 && archivedInvestments.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Nenhum investimento cadastrado"
          description="Ex: CDB, Tesouro Direto, Ações..."
          actionLabel="Novo Investimento"
          onAction={() => setShowCreateForm(true)}
        />
      ) : (
        <>
          {activeInvestments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum investimento ativo.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeInvestments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onEdit={handleEdit}
                  onStatusChange={refreshInvestments}
                />
              ))}
            </div>
          )}

          {archivedInvestments.length > 0 && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived
                  ? 'Ocultar arquivados'
                  : `Mostrar arquivados (${archivedInvestments.length})`}
              </Button>
              {showArchived && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 opacity-60">
                  {archivedInvestments.map((investment) => (
                    <InvestmentCard
                      key={investment.id}
                      investment={investment}
                      onEdit={handleEdit}
                      onStatusChange={refreshInvestments}
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
