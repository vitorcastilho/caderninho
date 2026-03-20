import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  IncomeSource,
  IncomeSourceRepository,
} from '../repositories/income-source.repository';

interface CreateIncomeSourceParams {
  name: string;
  employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
  isRecurring: boolean;
  baseAmountCents?: number;
  usualPaymentDay?: number;
  organizationId: string;
  userId: string;
}

export async function createIncomeSource(
  deps: { repository: IncomeSourceRepository; auditLogger: AuditLogger },
  params: CreateIncomeSourceParams,
): Promise<Result<IncomeSource>> {
  const id = crypto.randomUUID();

  const incomeSource = await deps.repository.create({
    id,
    name: params.name,
    employmentType: params.employmentType,
    isRecurring: params.isRecurring,
    baseAmountCents: params.baseAmountCents ?? null,
    usualPaymentDay: params.usualPaymentDay ?? null,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'income_source',
    entityId: incomeSource.id,
    oldValue: null,
    newValue: {
      name: incomeSource.name,
      employmentType: incomeSource.employmentType,
      isRecurring: incomeSource.isRecurring,
      baseAmountCents: incomeSource.baseAmountCents,
    },
  });

  return ok(incomeSource);
}
