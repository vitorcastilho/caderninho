'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import {
  createClassificationAction,
  updateClassificationAction,
} from '@/server/actions/classification.actions';

interface ClassificationFormProps {
  mode: 'create' | 'edit';
  defaultValues?: { id: string; name: string };
  nextDisplayOrder?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClassificationForm({
  mode,
  defaultValues,
  nextDisplayOrder,
  onSuccess,
  onCancel,
}: ClassificationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createClassificationAction({
              name: name.trim(),
              displayOrder: nextDisplayOrder ?? 1,
            })
          : await updateClassificationAction({
              id: defaultValues!.id,
              data: { name: name.trim() },
            });

      if (result.success) {
        toast.success(
          mode === 'create'
            ? `Classificação "${name.trim()}" criada.`
            : `Classificação renomeada para "${name.trim()}".`,
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
        <Label htmlFor="classification-name">Nome</Label>
        <Input
          id="classification-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Essenciais"
          aria-invalid={!!errors.name}
          autoFocus
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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
