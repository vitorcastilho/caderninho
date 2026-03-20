/**
 * Converte basis points (integer) para string de exibição.
 * Ex: 11050 → "110,50"  |  2503 → "25,03"  |  0 → "0,00"
 */
export function basisPointsToDisplayValue(basisPoints: number): string {
  const intPart = Math.floor(basisPoints / 100);
  const decPart = basisPoints % 100;
  return `${intPart},${String(decPart).padStart(2, '0')}`;
}

/**
 * Converte string de input numérico para basis points (integer).
 * Ex: "11050" → 11050  |  "2503" → 2503  |  "" → 0
 * Usuário digita apenas dígitos — a vírgula é posicionada automaticamente.
 */
export function displayValueToBasisPoints(displayValue: string): number {
  const digits = displayValue.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
}
