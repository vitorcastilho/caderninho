'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

import { createCategoryAction } from '@/client/actions/category.actions';
import { createSubcategoryAction } from '@/client/actions/subcategory.actions';
import { ONBOARDING_CATEGORY_SUGGESTIONS } from '@/shared/constants/onboarding-suggestions';
import { centsToDisplayValue } from '@/client/utils/currency-input';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { CurrencyInput } from '@/client/components/ui/currency-input';
import { EmojiPicker } from '@/client/components/ui/emoji-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select';

interface Classification {
  id: string;
  name: string;
}

interface CategorySuggestion {
  name: string;
  classificationName: string;
  budgetCents: number;
  emoji: string;
  /** Subcategorias criadas junto com a categoria (vazio para categorias customizadas). */
  subcategories: readonly { name: string; emoji: string }[];
  enabled: boolean;
}

interface CreatedCategory {
  id: string;
  name: string;
}

interface CategoriesStepProps {
  classifications: Classification[];
  existingCategories: { id: string; name: string }[];
  onNext: () => void;
  onSkip: () => void;
  onCategoriesCreated: (categories: CreatedCategory[]) => void;
}

export function CategoriesStep({
  classifications,
  existingCategories,
  onNext,
  onSkip,
  onCategoriesCreated,
}: CategoriesStepProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newClassification, setNewClassification] = useState('');
  const [newBudgetCents, setNewBudgetCents] = useState(0);
  const [newEmoji, setNewEmoji] = useState('📂');

  // Inicializar sugestões com estado editável
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>(() =>
    ONBOARDING_CATEGORY_SUGGESTIONS.map((s) => ({
      ...s,
      enabled: !existingCategories.some(
        (c) => c.name.toLowerCase() === s.name.toLowerCase(),
      ),
      budgetCents: s.budgetCents,
    })),
  );

  function resetForm() {
    setNewName('');
    setNewClassification('');
    setNewBudgetCents(0);
    setNewEmoji('📂');
    setEditingIndex(null);
    setShowForm(false);
  }

  function handleStartEdit(index: number) {
    const s = suggestions[index];
    setEditingIndex(index);
    setNewName(s.name);
    setNewEmoji(s.emoji);
    setNewBudgetCents(s.budgetCents);
    const classification = classifications.find((c) => c.name === s.classificationName);
    setNewClassification(classification?.id ?? '');
    setShowForm(true);
  }

  function handleBudgetChange(index: number, value: string) {
    const digits = value.replace(/\D/g, '');
    const cents = parseInt(digits || '0', 10);
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, budgetCents: cents } : s)),
    );
  }

  function toggleSuggestion(index: number) {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)),
    );
  }

  function handleRemoveSuggestion(index: number) {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
    resetForm();
  }

  function handleSaveCategory() {
    const budgetCents = newBudgetCents;
    const classificationName = classifications.find((c) => c.id === newClassification)?.name;
    if (!classificationName) return;

    if (editingIndex !== null) {
      setSuggestions((prev) =>
        prev.map((s, i) =>
          i === editingIndex
            ? { ...s, name: newName.trim(), classificationName, budgetCents, emoji: newEmoji }
            : s,
        ),
      );
    } else {
      setSuggestions((prev) => [
        ...prev,
        {
          name: newName.trim(),
          classificationName,
          budgetCents,
          emoji: newEmoji,
          subcategories: [],
          enabled: true,
        },
      ]);
    }

    resetForm();
  }

  function handleCreateCategories() {
    const enabledSuggestions = suggestions.filter((s) => s.enabled);
    if (enabledSuggestions.length === 0) {
      onNext();
      return;
    }

    startTransition(async () => {
      const results = await Promise.all(
        enabledSuggestions.map((suggestion) => {
          const classification = classifications.find(
            (c) => c.name === suggestion.classificationName,
          );
          if (!classification) return Promise.resolve(null);

          return createCategoryAction({
            name: suggestion.name,
            emoji: suggestion.emoji,
            classificationId: classification.id,
            budgetMinCents: suggestion.budgetCents,
            budgetMaxCents: null,
            defaultPaymentMethodType: null,
            defaultPaymentMethodId: null,
          });
        }),
      );

      const created: CreatedCategory[] = [];
      let failedCount = 0;

      for (const result of results) {
        if (!result) continue;
        if (result.success) {
          created.push({ id: result.data.id, name: result.data.name });
        } else {
          failedCount++;
        }
      }

      // Subcategorias sugeridas de cada categoria criada (Story 3.4e).
      const subcategoryResults = await Promise.all(
        results.flatMap((result, i) => {
          if (!result?.success) return [];
          const suggestion = enabledSuggestions[i]!;
          return suggestion.subcategories.map((sub) =>
            createSubcategoryAction({
              name: sub.name,
              emoji: sub.emoji,
              categoryId: result.data.id,
            }),
          );
        }),
      );
      const failedSubcategories = subcategoryResults.filter((r) => !r.success).length;

      if (created.length > 0) {
        toast.success(`${created.length} categorias criadas!`);
        onCategoriesCreated(created);
      }

      if (failedCount > 0) {
        toast.error(`${failedCount} categoria(s) não puderam ser criadas.`);
      }

      if (failedSubcategories > 0) {
        toast.error(`${failedSubcategories} subcategoria(s) não puderam ser criadas.`);
      }

      onNext();
    });
  }

  // Agrupar sugestões por classificação
  const grouped = suggestions.reduce<Record<string, { suggestions: (CategorySuggestion & { index: number })[] }>>(
    (acc, suggestion, index) => {
      const group = suggestion.classificationName;
      if (!acc[group]) {
        acc[group] = { suggestions: [] };
      }
      acc[group].suggestions.push({ ...suggestion, index });
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-lg font-bold text-foreground mb-1">Organize seus gastos</h2>
      <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
        Sugerimos categorias com base nos mais comuns. Ajuste os valores.
      </p>

      <div className="flex flex-col gap-3.5 mb-3">
        {Object.entries(grouped).map(([groupName, group]) => (
          <div key={groupName} className="flex flex-col gap-2">
            <div className="border-b border-border pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {groupName}
              </span>
            </div>

            {group.suggestions.map((suggestion) => {
              const existsAlready = existingCategories.some(
                (c) => c.name.toLowerCase() === suggestion.name.toLowerCase(),
              );

              return (
                <div
                  key={suggestion.index}
                  className={`rounded-md border px-2.5 py-2 transition-colors ${
                    suggestion.enabled && !existsAlready
                      ? 'border-border bg-secondary hover:border-border-hover'
                      : 'border-border/50 bg-secondary/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg shrink-0 w-6 text-center">{suggestion.emoji}</span>
                    <span className="text-[13px] font-medium text-foreground flex-1 min-w-0">
                      {suggestion.name}
                      {existsAlready && (
                        <span className="ml-1 text-[10px] text-text-tertiary">(já existe)</span>
                      )}
                      {suggestion.subcategories.length > 0 && !existsAlready && (
                        <span className="block truncate text-[11px] font-normal text-text-tertiary">
                          {suggestion.subcategories.map((sub) => sub.name).join(', ')}
                        </span>
                      )}
                    </span>

                    {!existsAlready && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <span className="text-xs text-muted-foreground">R$</span>
                        <Input
                          value={centsToDisplayValue(suggestion.budgetCents)}
                          onChange={(e) => handleBudgetChange(suggestion.index, e.target.value)}
                          inputMode="numeric"
                          disabled={!suggestion.enabled}
                          className="w-[100px] h-7 text-right text-sm font-medium"
                        />
                        <span className="text-[11px] text-text-tertiary">/ mês</span>
                      </div>
                    )}

                    {!existsAlready && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleStartEdit(suggestion.index)}
                        title="Editar categoria"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    )}

                    {!existsAlready && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => toggleSuggestion(suggestion.index)}
                        className={
                          suggestion.enabled
                            ? 'text-positive-text bg-positive-bg hover:bg-positive-bg'
                            : 'text-muted-foreground bg-muted hover:bg-muted'
                        }
                      >
                        <span className="text-[10px]">{suggestion.enabled ? '✓' : '✕'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Formulário inline (adicionar ou editar) */}
      {showForm && (
        <div className="mb-3 rounded-md border border-primary/20 bg-primary-light p-3">
          <div className="text-xs font-semibold text-primary mb-2">
            {editingIndex !== null ? 'Editar categoria' : 'Adicionar categoria'}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Ícone</Label>
                <EmojiPicker value={newEmoji} onChange={setNewEmoji} />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="onb-cat-name" className="text-xs text-muted-foreground">Nome da categoria</Label>
                <Input
                  id="onb-cat-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Transporte"
                  className="h-10 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Classificação</Label>
                <Select value={newClassification} onValueChange={(val) => setNewClassification(val ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classifications.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CurrencyInput
                value={newBudgetCents}
                onChange={setNewBudgetCents}
                label="Orçamento / mês"
                id="onb-cat-budget"
                className="h-8 text-sm"
                labelClassName="text-xs text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              {editingIndex !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSuggestion(editingIndex)}
                  className="text-destructive hover:text-destructive"
                >
                  Remover
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveCategory}
                disabled={!newName.trim() || !newClassification}
                className="flex-1"
              >
                {editingIndex !== null ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Botão adicionar categoria */}
      {!showForm && (
        <Button
          variant="outline"
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full border-dashed border-primary/40 text-primary hover:border-primary/60 hover:bg-primary-light"
        >
          + Adicionar categoria
        </Button>
      )}

      <div className="mt-auto flex flex-col gap-1.5 pt-4">
        <Button
          onClick={handleCreateCategories}
          disabled={isPending}
          className="w-full"
          size="lg"
        >
          {isPending ? 'Criando categorias...' : 'Próximo'}
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isPending}
          className="w-full text-muted-foreground"
        >
          Pular
        </Button>
      </div>
    </div>
  );
}
