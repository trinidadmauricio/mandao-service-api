/**
 * Tests unitarios para StartTrialUseCase
 */

import { StartTrialUseCase } from '../../application/use-cases/StartTrialUseCase';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { Tenant } from '../../../tenants/domain/entities/Tenant';

describe('StartTrialUseCase', () => {
  let useCase: StartTrialUseCase;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;
  let mockPrisma: any;

  beforeEach(() => {
    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    mockPrisma = {
      tenant: {
        update: jest.fn(),
      },
    };

    useCase = new StartTrialUseCase(mockTenantRepository, mockPrisma);
  });

  it('should start trial with default 14 days', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      null,
      'SUSPENDED',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockPrisma.tenant.update.mockResolvedValue({});

    const dto = {
      tenant_id: 'tenant-id',
    };

    await useCase.execute(dto);

    expect(mockTenantRepository.findById).toHaveBeenCalledWith('tenant-id');
    expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant-id' },
      data: {
        subscription_status: 'TRIAL',
        subscription_expires_at: expect.any(Date),
      },
    });

    const updateCall = mockPrisma.tenant.update.mock.calls[0][0];
    const expiresAt = updateCall.data.subscription_expires_at;
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 14);
    expect(expiresAt.getTime()).toBeCloseTo(expectedDate.getTime(), -3);
  });

  it('should start trial with custom days', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      null,
      'SUSPENDED',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockPrisma.tenant.update.mockResolvedValue({});

    const dto = {
      tenant_id: 'tenant-id',
      trial_days: 30,
    };

    await useCase.execute(dto);

    const updateCall = mockPrisma.tenant.update.mock.calls[0][0];
    const expiresAt = updateCall.data.subscription_expires_at;
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 30);
    expect(expiresAt.getTime()).toBeCloseTo(expectedDate.getTime(), -3);
  });

  it('should throw error if tenant not found', async () => {
    mockTenantRepository.findById.mockResolvedValue(null);

    const dto = {
      tenant_id: 'tenant-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Tenant not found');
  });

  it('should throw error if tenant already has active subscription', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      'plan-id',
      'ACTIVE',
      new Date(),
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);

    const dto = {
      tenant_id: 'tenant-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Tenant already has an active subscription');
  });
});

