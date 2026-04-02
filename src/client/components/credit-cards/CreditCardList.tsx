'use client';

import { useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

import { listCreditCardsAction, getCreditCardAction } from '@/server/actions/credit-card.actions';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Breadcrumb } from '@/client/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog';
import { CreditCardCard } from './CreditCardCard';
import { CreditCardForm } from './CreditCardForm';

interface CreditCard {
  id: string;
  name: string;
  brand: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  status: 'active' | 'archived';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreditCardListProps {
  initialCards: CreditCard[];
}

export function CreditCardList({ initialCards }: CreditCardListProps) {
  const [cards, setCards] = useState<CreditCard[]>(initialCards);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    id: string;
    name: string;
    brand: string;
    limitCents: number;
    closingDay: number;
    dueDay: number;
  } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refreshCards = useCallback(() => {
    startTransition(async () => {
      const result = await listCreditCardsAction(undefined);
      if (result.success) {
        setCards(result.data);
      } else {
        toast.error('Erro ao atualizar lista de cartões.');
      }
    });
  }, []);

  function handleEdit(id: string) {
    startTransition(async () => {
      const result = await getCreditCardAction({ id });
      if (result.success) {
        setEditingCard({
          id: result.data.id,
          name: result.data.name,
          brand: result.data.brand,
          limitCents: result.data.limitCents,
          closingDay: result.data.closingDay,
          dueDay: result.data.dueDay,
        });
      } else {
        toast.error(result.error.message);
      }
    });
  }

  const activeCards = cards.filter((c) => c.status === 'active');
  const archivedCards = cards.filter((c) => c.status === 'archived');

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Configurações' },
            { label: 'Cartões de Crédito' },
          ]}
          className="mb-1"
        />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Cartões de Crédito</h1>
          <Button onClick={() => setShowCreateForm(true)}>Novo Cartão</Button>
        </div>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cartão de Crédito</DialogTitle>
          </DialogHeader>
          <CreditCardForm
            mode="create"
            onSuccess={() => {
              setShowCreateForm(false);
              refreshCards();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cartão de Crédito</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <CreditCardForm
              mode="edit"
              defaultValues={editingCard}
              onSuccess={() => {
                setEditingCard(null);
                refreshCards();
              }}
              onCancel={() => setEditingCard(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Active Cards */}
      {activeCards.length === 0 && archivedCards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-8 text-center">
          <CreditCardIcon className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">Nenhum cartão cadastrado</p>
          <p className="text-xs text-muted-foreground">Cadastre seus cartões de crédito para acompanhar limites e faturas.</p>
          <Button variant="secondary" size="sm" onClick={() => setShowCreateForm(true)}>
            Novo Cartão
          </Button>
        </div>
      ) : (
        <>
          {activeCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cartão ativo.</p>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
              {activeCards.map((card) => (
                <CreditCardCard
                  key={card.id}
                  card={card}
                  onEdit={handleEdit}
                  onStatusChange={refreshCards}
                />
              ))}
            </div>
          )}

          {/* Archived Cards */}
          {archivedCards.length > 0 && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? 'Ocultar arquivados' : `Mostrar arquivados (${archivedCards.length})`}
              </Button>
              {showArchived && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 opacity-60">
                  {archivedCards.map((card) => (
                    <CreditCardCard
                      key={card.id}
                      card={card}
                      onEdit={handleEdit}
                      onStatusChange={refreshCards}
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
