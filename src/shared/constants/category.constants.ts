export const PAYMENT_METHOD_TYPES = ['credit', 'debit', 'pix'] as const;
export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[number];

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  credit: 'Cartão de crédito',
  debit: 'Débito',
  pix: 'Pix',
};

export const DEFAULT_CLASSIFICATION_NAMES = [
  'Essenciais',
  'Qualidade de Vida',
  'Investimentos',
  'Proteção',
  'Doações',
  'Impostos e Obrigações',
  'Dívidas',
] as const;
