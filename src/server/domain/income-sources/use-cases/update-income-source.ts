import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  IncomeSource,
  IncomeSourceRepository,
} from '../repositories/income-source.repository';

interface UpdateIncomeSourceParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{
    name: string;
    employmentType: 'pj_propria' | 'clt' | 'freelance' | 'outro';
    isRecurring: boolean;
    baseAmountCents: number | null;
    usualPaymentDay: number | null;
  }>;
}

export async function updateIncomeSource(
  deps: { repository: IncomeSourceRepository; auditLogger: AuditLogger },
  params: UpdateIncomeSourceParams,
): Promise<Result<IncomeSource>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('INCOME_SOURCE_NOT_FOUND', 'Fonte de receita não encontrada.');
  }

  const updated = await deps.repository.update(params.id, params.organizationId, params.data);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'income_source',
    entityId: params.id,
    oldValue: {
      name: existing.name,
      employmentType: existing.employmentType,
      isRecurring: existing.isRecurring,
      baseAmountCents: existing.baseAmountCents,
    },
    newValue: {
      name: updated.name,
      employmentType: updated.employmentType,
      isRecurring: updated.isRecurring,
      baseAmountCents: updated.baseAmountCents,
    },
  });

  return ok(updated);
}
