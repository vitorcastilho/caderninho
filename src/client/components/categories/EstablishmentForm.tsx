'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import {
  createEstablishmentAction,
  updateEstablishmentAction,
} from '@/server/actions/establishment.actions';

interface EstablishmentFormProps {
  mode: 'create' | 'edit';
  subcategoryId?: string;
  defaultValues?: {
    id: string;
    name: string;
    emoji: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EstablishmentForm({
  mode,
  subcategoryId,
  defaultValues,
  onSuccess,
  onCancel,
}: EstablishmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [emoji, setEmoji] = useState(defaultValues?.emoji ?? '📍');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createEstablishmentAction({
              name: name.trim(),
              emoji,
              subcategoryId: subcategoryId!,
            })
          : await updateEstablishmentAction({
              id: defaultValues!.id,
              data: {
                name: name.trim(),
                emoji,
              },
            });

      if (result.success) {
        toast.success(
          mode === 'create'
            ? `Estabelecimento "${name.trim()}" criado.`
            : `Estabelecimento "${name.trim()}" atualizado.`,
        );
        onSuccess?.();
      } else {
        if (result.error.details) {
          setErrors(result.error.details as Record<string, string>);
        } else {
          toast.error(result.error.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="establishment-name">Nome</Label>
        <Input
          id="establishment-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Pão de Açúcar"
          aria-invalid={!!errors.name}
          autoFocus
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="establishment-emoji">Emoji</Label>
        <Input
          id="establishment-emoji"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="📍"
          className="w-20"
          maxLength={10}
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending || name.trim().length === 0}>
          {isPending ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
