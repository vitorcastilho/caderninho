'use client';

import { useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '@/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog';
import { InvestmentCard } from './InvestmentCard';
import { InvestmentForm } from './InvestmentForm';
import { listInvestmentsAction, getInvestmentAction } from '@/server/actions/investment.actions';

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Investimentos</h1>
        <Button onClick={() => setShowCreateForm(true)}>Novo Investimento</Button>
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
        <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum investimento cadastrado.</p>
          <Button variant="secondary" size="sm" onClick={() => setShowCreateForm(true)}>
            Novo Investimento
          </Button>
          <p className="text-xs text-muted-foreground">Ex: CDB, Tesouro Direto, Ações...</p>
        </div>
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
