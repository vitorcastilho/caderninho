export function centsToDisplayValue(cents: number): string {
  const integerPart = Math.floor(cents / 100);
  const decimalPart = cents % 100;
  return `${integerPart.toLocaleString('pt-BR')},${String(decimalPart).padStart(2, '0')}`;
}

export function displayValueToCents(value: string): number {
  const digits = value.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
}
