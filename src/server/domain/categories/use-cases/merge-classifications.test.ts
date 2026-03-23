import { vi } from 'vitest';

import { mergeClassifications } from './merge-classifications';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { CategoryRepository } from '../repositories/category.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockClassificationRepository: ClassificationRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  countByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockCategoryRepository: CategoryRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(),
  countActiveByClassification: vi.fn(),
  update: vi.fn(),
  updateClassificationBulk: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sourceClassification = {
  id: 'source-1',
  name: 'Doações',
  displayOrder: 5,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const targetClassification = {
  id: 'target-1',
  name: 'Essenciais',
  displayOrder: 1,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const deps = {
  classificationRepository: mockClassificationRepository,
  categoryRepository: mockCategoryRepository,
  auditLogger: mockAuditLogger,
};

describe('mergeClassifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should merge classifications successfully', async () => {
    vi.mocked(mockClassificationRepository.findById)
      .mockResolvedValueOnce(sourceClassification)
      .mockResolvedValueOnce(targetClassification);
    vi.mocked(mockCategoryRepository.updateClassificationBulk).mockResolvedValue(3);
    vi.mocked(mockClassificationRepository.updateStatus).mockResolvedValue({
      ...sourceClassification,
      status: 'archived',
    });

    const result = await mergeClassifications(deps, {
      sourceId: 'source-1',
      targetId: 'target-1',
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.migratedCount).toBe(3);
    }
  });

  it('should return error when source equals target', async () => {
    const result = await mergeClassifications(deps, {
      sourceId: 'same-id',
      targetId: 'same-id',
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_MERGE');
    }
  });

  it('should return error when source not found', async () => {
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue(null);

    const result = await mergeClassifications(deps, {
      sourceId: 'nonexistent',
      targetId: 'target-1',
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
    }
  });

  it('should return error when source is archived', async () => {
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue({
      ...sourceClassification,
      status: 'archived',
    });

    const result = await mergeClassifications(deps, {
      sourceId: 'source-1',
      targetId: 'target-1',
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CLASSIFICATION_ALREADY_ARCHIVED');
    }
  });

  it('should return error when target not found', async () => {
    vi.mocked(mockClassificationRepository.findById)
      .mockResolvedValueOnce(sourceClassification)
      .mockResolvedValueOnce(null);

    const result = await mergeClassifications(deps, {
      sourceId: 'source-1',
      targetId: 'nonexistent',
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
    }
  });

  it('should return error when target is archived', async () => {
    vi.mocked(mockClassificationRepository.findById)
      .mockResolvedValueOnce(sourceClassification)
      .mockResolvedValueOnce({ ...targetClassification, status: 'archived' });

    const result = await mergeClassifications(deps, {
      sourceId: 'source-1',
      targetId: 'target-1',
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('TARGET_CLASSIFICATION_ARCHIVED');
    }
  });

  it('should work when source has zero categories', async () => {
    vi.mocked(mockClassificationRepository.findById)
      .mockResolvedValueOnce(sourceClassification)
      .mockResolvedValueOnce(targetClassification);
    vi.mocked(mockCategoryRepository.updateClassificationBulk).mockResolvedValue(0);
    vi.mocked(mockClassificationRepository.updateStatus).mockResolvedValue({
      ...sourceClassification,
      status: 'archived',
    });

    const result = await mergeClassifications(deps, {
      sourceId: 'source-1',
      targetId: 'target-1',
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.migratedCount).toBe(0);
    }
  });
});
