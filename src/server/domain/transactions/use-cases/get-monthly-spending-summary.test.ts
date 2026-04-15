import { createGetMonthlySpendingSummary } from './get-monthly-spending-summary';
import { getEstablishmentSpendingKey } from '@/shared/utils/spending-key';
import type { TransactionRepository } from '@/server/domain/transactions/repositories/transaction.repository';

function createMockRepository(
  data: Awaited<ReturnType<TransactionRepository['getMonthlySpendingSummary']>>,
): TransactionRepository {
  return {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByOrganization: vi.fn(),
    findTopEstablishments: vi.fn(),
    sumMonthlySpentByCategory: vi.fn(),
    getMonthlySpendingSummary: vi.fn().mockResolvedValue(data),
  };
}

describe('getMonthlySpendingSummary', () => {
  it('deve retornar gastos agregados por categoria, subcategoria e estabelecimento', async () => {
    const mockData = {
      byCategory: [
        { categoryId: 'cat-1', totalCents: 150000 },
        { categoryId: 'cat-2', totalCents: 80000 },
      ],
      bySubcategory: [
        { subcategoryId: 'sub-1', totalCents: 100000 },
        { subcategoryId: 'sub-2', totalCents: 50000 },
      ],
      byEstablishment: [
        { establishment: 'Supermercado X', subcategoryId: 'sub-1', totalCents: 60000 },
        { establishment: 'Padaria Y', subcategoryId: 'sub-1', totalCents: 40000 },
      ],
    };

    const repo = createMockRepository(mockData);
    const getSpendingSummary = createGetMonthlySpendingSummary(repo);

    const result = await getSpendingSummary({
      organizationId: 'org-1',
      year: 2026,
      month: 4,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.byCategory.get('cat-1')).toBe(150000);
    expect(result.data.byCategory.get('cat-2')).toBe(80000);
    expect(result.data.bySubcategory.get('sub-1')).toBe(100000);
    expect(result.data.bySubcategory.get('sub-2')).toBe(50000);

    const estKey = getEstablishmentSpendingKey('Supermercado X', 'sub-1');
    expect(result.data.byEstablishment.get(estKey)).toBe(60000);
  });

  it('deve retornar Maps vazios quando não há transações', async () => {
    const repo = createMockRepository({
      byCategory: [],
      bySubcategory: [],
      byEstablishment: [],
    });
    const getSpendingSummary = createGetMonthlySpendingSummary(repo);

    const result = await getSpendingSummary({
      organizationId: 'org-1',
      year: 2026,
      month: 4,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.byCategory.size).toBe(0);
    expect(result.data.bySubcategory.size).toBe(0);
    expect(result.data.byEstablishment.size).toBe(0);
  });

  it('deve chamar o repositório com os parâmetros corretos', async () => {
    const repo = createMockRepository({
      byCategory: [],
      bySubcategory: [],
      byEstablishment: [],
    });
    const getSpendingSummary = createGetMonthlySpendingSummary(repo);

    await getSpendingSummary({
      organizationId: 'org-1',
      year: 2026,
      month: 4,
    });

    expect(repo.getMonthlySpendingSummary).toHaveBeenCalledWith('org-1', 2026, 4);
  });
});

describe('getEstablishmentSpendingKey', () => {
  it('deve gerar chave composta subcategoryId::establishment', () => {
    expect(getEstablishmentSpendingKey('Padaria', 'sub-1')).toBe('sub-1::Padaria');
  });
});
