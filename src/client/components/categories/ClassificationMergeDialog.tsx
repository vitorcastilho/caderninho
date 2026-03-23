'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/client/components/ui/button';
import { Label } from '@/client/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select';
import { mergeClassificationsAction } from '@/server/actions/classification.actions';

interface Classification {
  id: string;
  name: string;
}

interface ClassificationMergeDialogProps {
  source: Classification;
  classifications: Classification[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClassificationMergeDialog({
  source,
  classifications,
  onSuccess,
  onCancel,
}: ClassificationMergeDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [targetId, setTargetId] = useState('');

  const availableTargets = classifications.filter((c) => c.id !== source.id);
  const selectedTarget = availableTargets.find((c) => c.id === targetId);

  function handleMerge() {
    if (!targetId) return;

    startTransition(async () => {
      const result = await mergeClassificationsAction({
        sourceId: source.id,
        targetId,
      });

      if (result.success) {
        toast.success(
          `Classificação "${source.name}" mesclada em "${selectedTarget?.name}". ${result.data.migratedCount} categoria(s) migrada(s).`,
        );
        onSuccess?.();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        As categorias de &ldquo;{source.name}&rdquo; serão migradas para a classificação de destino.
        Após a migração, &ldquo;{source.name}&rdquo; será arquivada.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="merge-target">Classificação de destino</Label>
        <Select value={targetId} onValueChange={(val) => setTargetId(val ?? '')}>
          <SelectTrigger className="w-full" id="merge-target">
            <SelectValue>
              {selectedTarget?.name ?? 'Selecione...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableTargets.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={handleMerge}
          disabled={isPending || !targetId}
        >
          {isPending ? 'Mesclando...' : 'Mesclar'}
        </Button>
      </div>
    </div>
  );
}
