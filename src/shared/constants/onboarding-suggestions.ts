/**
 * Sugestões do onboarding. Cada categoria já vem com subcategorias, para o
 * usuário conseguir registrar o primeiro gasto (o Novo Gasto exige uma
 * subcategoria) — Story 3.4e. Tudo pode ser renomeado/apagado em /categories.
 */
export const ONBOARDING_CATEGORY_SUGGESTIONS = [
  {
    name: 'Supermercado',
    classificationName: 'Essenciais',
    budgetCents: 300000, // R$ 3.000
    emoji: '🛒',
    subcategories: [
      { name: 'Compra do mês', emoji: '🛒' },
      { name: 'Reposição da semana', emoji: '🧺' },
      { name: 'Padaria', emoji: '🥖' },
      { name: 'Hortifrúti', emoji: '🥬' },
      { name: 'Açougue', emoji: '🥩' },
    ],
  },
  {
    name: 'Moradia',
    classificationName: 'Essenciais',
    budgetCents: 220000, // R$ 2.200
    emoji: '🏠',
    subcategories: [
      { name: 'Aluguel', emoji: '🔑' },
      { name: 'Condomínio', emoji: '🏢' },
      { name: 'Luz', emoji: '💡' },
      { name: 'Água', emoji: '💧' },
      { name: 'Gás', emoji: '🔥' },
      { name: 'IPTU', emoji: '🧾' },
    ],
  },
  {
    name: 'Gasolina',
    classificationName: 'Essenciais',
    budgetCents: 60000, // R$ 600
    emoji: '⛽',
    subcategories: [
      { name: 'Abastecimento', emoji: '⛽' },
      { name: 'Estacionamento', emoji: '🅿️' },
      { name: 'Lavagem', emoji: '🧽' },
    ],
  },
  {
    name: 'Internet/Telefone',
    classificationName: 'Essenciais',
    budgetCents: 15800, // R$ 158
    emoji: '📱',
    subcategories: [
      { name: 'Internet de casa', emoji: '🌐' },
      { name: 'Celular', emoji: '📱' },
      { name: 'Streaming', emoji: '📺' },
    ],
  },
  {
    name: 'Educação',
    classificationName: 'Essenciais',
    budgetCents: 280000, // R$ 2.800
    emoji: '🎓',
    subcategories: [
      { name: 'Mensalidade', emoji: '🏫' },
      { name: 'Curso', emoji: '📚' },
      { name: 'Material escolar', emoji: '✏️' },
      { name: 'Livros', emoji: '📖' },
    ],
  },
  {
    name: 'Restaurante',
    classificationName: 'Qualidade de Vida',
    budgetCents: 250000, // R$ 2.500
    emoji: '🍕',
    subcategories: [
      { name: 'Delivery', emoji: '🛵' },
      { name: 'Almoço no trabalho', emoji: '🍱' },
      { name: 'Jantar fora', emoji: '🍽️' },
      { name: 'Café/lanche', emoji: '☕' },
    ],
  },
] as const;

export type OnboardingCategorySuggestion = (typeof ONBOARDING_CATEGORY_SUGGESTIONS)[number];
