export function getEstablishmentSpendingKey(establishment: string, subcategoryId: string): string {
  return `${subcategoryId}::${establishment}`;
}
