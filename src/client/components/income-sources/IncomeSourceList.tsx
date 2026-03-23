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
import { IncomeSourceCard } from './IncomeSourceCard';
import { IncomeSourceForm } from './IncomeSourceForm';
import { listIncomeSourcesAction, getIncomeSourceAction } from '@/server/actions/income-source.actions';

interface IncomeSource {
  id: string;
  name: string;
  employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
  isRecurring: boolean;
  baseAmountCents: number | null;
  usualPaymentDay: number | null;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IncomeSourceListProps {
  initialIncomeSources: IncomeSource[];
}

export function IncomeSourceList({ initialIncomeSources }: IncomeSourceListProps) {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(initialIncomeSources);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSource, setEditingSource] = useState<{
    id: string;
    name: string;
    employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
    isRecurring: boolean;
    baseAmountCents: number | null;
    usualPaymentDay: number | null;
  } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [, startTransition] = useTransition();

  const refreshSources = useCallback(() => {
    startTransition(async () => {
      const result = await listIncomeSourcesAction(undefined);
      if (result.success) {
        setIncomeSources(result.data);
      } else {
        toast.error('Erro ao atualizar lista de fontes de receita.');
      }
    });
  }, []);

  function handleEdit(id: string) {
    startTransition(async () => {
      const result = await getIncomeSourceAction({ id });
      if (result.success) {
        setEditingSource({
          id: result.data.id,
          name: result.data.name,
          employmentType: result.data.employmentType,
          isRecurring: result.data.isRecurring,
          baseAmountCents: result.data.baseAmountCents,
          usualPaymentDay: result.data.usualPaymentDay,
        });
      } else {
        toast.error(result.error.message);
      }
    });
  }

  const activeSources = incomeSources.filter((s) => s.status === 'active');
  const archivedSources = incomeSources.filter((s) => s.status === 'archived');

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Fontes de Receita</h1>
        <Button onClick={() => setShowCreateForm(true)}>Nova Fonte</Button>
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Fonte de Receita</DialogTitle>
          </DialogHeader>
          <IncomeSourceForm
            mode="create"
            onSuccess={() => {
              setShowCreateForm(false);
              refreshSources();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSource} onOpenChange={(open) => !open && setEditingSource(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fonte de Receita</DialogTitle>
          </DialogHeader>
          {editingSource && (
            <IncomeSourceForm
              mode="edit"
              defaultValues={editingSource}
              onSuccess={() => {
                setEditingSource(null);
                refreshSources();
              }}
              onCancel={() => setEditingSource(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {activeSources.length === 0 && archivedSources.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma fonte de receita cadastrada.</p>
          <Button variant="secondary" size="sm" onClick={() => setShowCreateForm(true)}>
            Nova Fonte
          </Button>
          <p className="text-xs text-muted-foreground">Cadastre suas fontes de renda (CLT, PJ, freelance...).</p>
        </div>
      ) : (
        <>
          {activeSources.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma fonte ativa.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSources.map((source) => (
                <IncomeSourceCard
                  key={source.id}
                  incomeSource={source}
                  onEdit={handleEdit}
                  onStatusChange={refreshSources}
                />
              ))}
            </div>
          )}

          {archivedSources.length > 0 && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived
                  ? 'Ocultar arquivadas'
                  : `Mostrar arquivadas (${archivedSources.length})`}
              </Button>
              {showArchived && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 opacity-60">
                  {archivedSources.map((source) => (
                    <IncomeSourceCard
                      key={source.id}
                      incomeSource={source}
                      onEdit={handleEdit}
                      onStatusChange={refreshSources}
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
