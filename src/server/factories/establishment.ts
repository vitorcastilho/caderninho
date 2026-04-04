import { DrizzleEstablishmentRepository } from '@/server/infrastructure/database/repositories/establishment.repository.impl';
import { DrizzleSubcategoryRepository } from '@/server/infrastructure/database/repositories/subcategory.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

const establishmentRepository = new DrizzleEstablishmentRepository();
const subcategoryRepository = new DrizzleSubcategoryRepository();

export const establishmentDeps = {
  repository: establishmentRepository,
  subcategoryRepository,
  auditLogger: logAudit,
};

export const autoCreateEstablishmentDeps = {
  repository: establishmentRepository,
};

export const listEstablishmentsDeps = {
  repository: establishmentRepository,
};
