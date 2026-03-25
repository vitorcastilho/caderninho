import { DrizzleClassificationRepository } from '@/server/infrastructure/database/repositories/classification.repository.impl';
import { DrizzleCategoryRepository } from '@/server/infrastructure/database/repositories/category.repository.impl';
import { DrizzleSubcategoryRepository } from '@/server/infrastructure/database/repositories/subcategory.repository.impl';
import { DrizzleBankAccountRepository } from '@/server/infrastructure/database/repositories/bank-account.repository.impl';
import { DrizzleCreditCardRepository } from '@/server/infrastructure/database/repositories/credit-card.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

const classificationRepository = new DrizzleClassificationRepository();
const categoryRepository = new DrizzleCategoryRepository();
const subcategoryRepository = new DrizzleSubcategoryRepository();
const bankAccountRepository = new DrizzleBankAccountRepository();
const creditCardRepository = new DrizzleCreditCardRepository();

export const classificationDeps = {
  repository: classificationRepository,
  auditLogger: logAudit,
};

export const categoryDeps = {
  repository: categoryRepository,
  classificationRepository,
  bankAccountRepository,
  creditCardRepository,
  auditLogger: logAudit,
};

export const subcategoryDeps = {
  repository: subcategoryRepository,
  categoryRepository,
  bankAccountRepository,
  creditCardRepository,
  auditLogger: logAudit,
};

export const archiveCategoryDeps = {
  repository: categoryRepository,
  subcategoryRepository,
  auditLogger: logAudit,
};

export const archiveClassificationDeps = {
  repository: classificationRepository,
  categoryRepository,
  auditLogger: logAudit,
};

export const mergeDeps = {
  classificationRepository,
  categoryRepository,
  auditLogger: logAudit,
};

export const listClassificationsDeps = {
  classificationRepository,
  categoryRepository,
};
