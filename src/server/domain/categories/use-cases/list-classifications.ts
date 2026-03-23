import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  EssentialityClassification,
  ClassificationRepository,
} from '../repositories/classification.repository';
import type { CategoryRepository } from '../repositories/category.repository';

export type ClassificationWithCount = EssentialityClassification & {
  activeCategoryCount: number;
};

interface ListClassificationsParams {
  organizationId: string;
  includeArchived?: boolean;
}

export async function listClassifications(
  deps: {
    classificationRepository: ClassificationRepository;
    categoryRepository: CategoryRepository;
  },
  params: ListClassificationsParams,
): Promise<Result<ClassificationWithCount[]>> {
  const classifications = await deps.classificationRepository.findAllByOrganization(
    params.organizationId,
    params.includeArchived,
  );

  const withCounts: ClassificationWithCount[] = await Promise.all(
    classifications.map(async (c) => {
      const activeCategoryCount = await deps.categoryRepository.countActiveByClassification(
        c.id,
        params.organizationId,
      );
      return { ...c, activeCategoryCount };
    }),
  );

  return ok(withCounts);
}
