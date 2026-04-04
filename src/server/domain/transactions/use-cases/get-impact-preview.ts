import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { TransactionRepository } from '../repositories/transaction.repository';

export type ImpactData = {
  paymentMethodLabel: string;
  balanceBefore: number;
  balanceAfter: number;
  categoryLabel: string;
  budgetSpent: number;
  budgetTotal: number;
  budgetPercentage: number;
};

interface GetImpactPreviewParams {
  amountCents: number;
  paymentMethodType: string;
  paymentMethodId?: string | null;
  categoryId: string;
  categoryName: string;
  categoryBudgetCents: number;
  paymentMethodLabel: string;
  organizationId: string;
}

interface GetImpactPreviewDeps {
  bankAccountRepository: BankAccountRepository;
  transactionRepository: TransactionRepository;
}

export async function getImpactPreview(
  deps: GetImpactPreviewDeps,
  params: GetImpactPreviewParams,
): Promise<Result<ImpactData>> {
  let balanceBefore = 0;

  // Calcular saldo/limite do metodo de pagamento
  if (
    (params.paymentMethodType === 'debit' || params.paymentMethodType === 'pix') &&
    params.paymentMethodId
  ) {
    const account = await deps.bankAccountRepository.findById(
      params.paymentMethodId,
      params.organizationId,
    );
    if (account) {
      balanceBefore = account.balanceCents;
    }
  }

  const balanceAfter = balanceBefore - params.amountCents;

  // Calcular orcamento gasto da categoria no mes atual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const transactions = await deps.transactionRepository.findByOrganization(params.organizationId);
  const monthlySpent = transactions
    .filter(
      (t) =>
        t.categoryId === params.categoryId &&
        t.transactionDate >= startOfMonth,
    )
    .reduce((sum, t) => sum + t.amountCents, 0);

  const budgetSpent = monthlySpent + params.amountCents;
  const budgetTotal = params.categoryBudgetCents;
  const budgetPercentage = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0;

  return ok({
    paymentMethodLabel: params.paymentMethodLabel,
    balanceBefore,
    balanceAfter,
    categoryLabel: params.categoryName,
    budgetSpent,
    budgetTotal,
    budgetPercentage,
  });
}
