export const ONBOARDING_CATEGORY_SUGGESTIONS = [
  {
    name: 'Supermercado',
    classificationName: 'Essenciais',
    budgetCents: 300000, // R$ 3.000
    emoji: '🛒',
  },
  {
    name: 'Moradia',
    classificationName: 'Essenciais',
    budgetCents: 220000, // R$ 2.200
    emoji: '🏠',
  },
  {
    name: 'Gasolina',
    classificationName: 'Essenciais',
    budgetCents: 60000, // R$ 600
    emoji: '⛽',
  },
  {
    name: 'Internet/Telefone',
    classificationName: 'Essenciais',
    budgetCents: 15800, // R$ 158
    emoji: '📱',
  },
  {
    name: 'Educação',
    classificationName: 'Essenciais',
    budgetCents: 280000, // R$ 2.800
    emoji: '🎓',
  },
  {
    name: 'Restaurante',
    classificationName: 'Qualidade de Vida',
    budgetCents: 250000, // R$ 2.500
    emoji: '🍕',
  },
] as const;

export type OnboardingCategorySuggestion = (typeof ONBOARDING_CATEGORY_SUGGESTIONS)[number];
