'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { createCategoryAction } from '@/server/actions/category.actions';
import { ONBOARDING_CATEGORY_SUGGESTIONS } from '@/shared/constants/onboarding-suggestions';
import { centsToDisplayValue, displayValueToCents } from '@/client/utils/currency-input';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';

interface Classification {
  id: string;
  name: string;
}

interface CategorySuggestion {
  name: string;
  classificationName: string;
  budgetCents: number;
  emoji: string;
  enabled: boolean;
}

interface CategoriesStepProps {
  classifications: Classification[];
  existingCategories: { id: string; name: string }[];
  onNext: () => void;
  onSkip: () => void;
  onCategoriesCreated: (count: number) => void;
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
  const [newName, setNewName] = useState('');
  const [newClassification, setNewClassification] = useState('');
  const [newBudgetDisplay, setNewBudgetDisplay] = useState('0,00');
  const [newEmoji, setNewEmoji] = useState('📂');

  // Inicializar sugestões com estado editável
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>(() =>
    ONBOARDING_CATEGORY_SUGGESTIONS.map((s) => ({
      ...s,
      // Desabilitar se já existe categoria com mesmo nome
      enabled: !existingCategories.some(
        (c) => c.name.toLowerCase() === s.name.toLowerCase(),
      ),
      budgetCents: s.budgetCents,
    })),
  );

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

  function handleAddCustomCategory() {
    const budgetCents = displayValueToCents(newBudgetDisplay);
    const classificationName = classifications.find((c) => c.id === newClassification)?.name;
    if (!classificationName) return;

    setSuggestions((prev) => [
      ...prev,
      {
        name: newName.trim(),
        classificationName,
        budgetCents,
        emoji: newEmoji,
        enabled: true,
      },
    ]);

    setNewName('');
    setNewClassification('');
    setNewBudgetDisplay('0,00');
    setNewEmoji('📂');
    setShowForm(false);
  }

  function handleCreateCategories() {
    const enabledSuggestions = suggestions.filter((s) => s.enabled);
    if (enabledSuggestions.length === 0) {
      onNext();
      return;
    }

    startTransition(async () => {
      let createdCount = 0;

      for (const suggestion of enabledSuggestions) {
        // Encontrar classification ID pelo nome
        const classification = classifications.find(
          (c) => c.name === suggestion.classificationName,
        );
        if (!classification) continue;

        const result = await createCategoryAction({
          name: suggestion.name,
          classificationId: classification.id,
          budgetMinCents: suggestion.budgetCents,
          budgetMaxCents: null,
          defaultPaymentMethodType: null,
          defaultPaymentMethodId: null,
        });

        if (result.success) {
          createdCount++;
        }
      }

      if (createdCount > 0) {
        toast.success(`${createdCount} categorias criadas!`);
        onCategoriesCreated(createdCount);
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
      <h2 className="text-lg font-bold text-stone-900 mb-1">Organize seus gastos</h2>
      <p className="text-[13px] text-stone-500 mb-4 leading-relaxed">
        Sugerimos categorias com base nos mais comuns. Ajuste os valores.
      </p>

      <div className="flex flex-col gap-3.5 mb-3">
        {Object.entries(grouped).map(([groupName, group]) => (
          <div key={groupName} className="flex flex-col gap-2">
            <div className="border-b border-stone-200 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
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
                      ? 'border-stone-200 bg-stone-50 hover:border-stone-300'
                      : 'border-stone-100 bg-stone-50/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg shrink-0 w-6 text-center">{suggestion.emoji}</span>
                    <span className="text-[13px] font-medium text-stone-900 flex-1 min-w-0">
                      {suggestion.name}
                      {existsAlready && (
                        <span className="ml-1 text-[10px] text-stone-400">(já existe)</span>
                      )}
                    </span>

                    {!existsAlready && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <span className="text-xs text-stone-500">R$</span>
                        <input
                          type="text"
                          value={centsToDisplayValue(suggestion.budgetCents)}
                          onChange={(e) => handleBudgetChange(suggestion.index, e.target.value)}
                          inputMode="numeric"
                          disabled={!suggestion.enabled}
                          className="w-[100px] rounded border border-stone-200 bg-white px-2 py-1.5 text-right text-sm font-medium text-stone-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 disabled:opacity-50"
                        />
                        <span className="text-[11px] text-stone-400">/ mês</span>
                      </div>
                    )}

                    {!existsAlready && (
                      <button
                        type="button"
                        onClick={() => toggleSuggestion(suggestion.index)}
                        className={`ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] transition-colors ${
                          suggestion.enabled
                            ? 'bg-green-50 text-green-800'
                            : 'bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        {suggestion.enabled ? '✓' : '✕'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Formulário inline para adicionar categoria */}
      {showForm && (
        <div className="mb-3 rounded-md border border-indigo-200 bg-indigo-50 p-3">
          <div className="text-xs font-semibold text-indigo-600 mb-2">Adicionar categoria</div>
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="onb-cat-emoji" className="text-xs text-stone-500">Emoji</Label>
                <Input
                  id="onb-cat-emoji"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="h-8 w-14 text-center text-sm"
                  maxLength={2}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="onb-cat-name" className="text-xs text-stone-500">Nome da categoria</Label>
                <Input
                  id="onb-cat-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Transporte"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="onb-cat-class" className="text-xs text-stone-500">Classificação</Label>
                <select
                  id="onb-cat-class"
                  value={newClassification}
                  onChange={(e) => setNewClassification(e.target.value)}
                  className="h-8 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20"
                >
                  <option value="">Selecionar...</option>
                  {classifications.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="onb-cat-budget" className="text-xs text-stone-500">Orçamento / mês</Label>
                <Input
                  id="onb-cat-budget"
                  value={`R$ ${newBudgetDisplay}`}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    const cents = parseInt(digits || '0', 10);
                    setNewBudgetDisplay(centsToDisplayValue(cents));
                  }}
                  inputMode="numeric"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddCustomCategory}
                disabled={!newName.trim() || !newClassification}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão adicionar categoria */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-md border border-dashed border-indigo-400 px-4 py-2.5 text-[13px] font-medium text-indigo-600 transition-colors hover:border-indigo-500 hover:bg-indigo-50"
        >
          + Adicionar categoria
        </button>
      )}

      <div className="mt-auto flex flex-col gap-1.5 pt-4">
        <button
          onClick={handleCreateCategories}
          disabled={isPending}
          className="w-full rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Criando categorias...' : 'Próximo'}
        </button>
        <button
          onClick={onSkip}
          disabled={isPending}
          className="w-full rounded-md px-4 py-2.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
        >
          Pular
        </button>
      </div>
    </div>
  );
}
