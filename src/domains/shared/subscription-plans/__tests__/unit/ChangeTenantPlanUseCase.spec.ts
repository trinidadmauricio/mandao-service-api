/**
 * Tests unitarios para ChangeTenantPlanUseCase
 */

import { ChangeTenantPlanUseCase } from '../../application/use-cases/ChangeTenantPlanUseCase';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { Tenant } from '../../../tenants/domain/entities/Tenant';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('ChangeTenantPlanUseCase', () => {
  let useCase: ChangeTenantPlanUseCase;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;
  let mockSubscriptionPlanRepository: jest.Mocked<ISubscriptionPlanRepository>;
  let mockPrisma: any;

  beforeEach(() => {
    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    mockSubscriptionPlanRepository = {
      findById: jest.fn(),
    } as any;

    mockPrisma = {
      tenant: {
        update: jest.fn(),
      },
    };

    useCase = new ChangeTenantPlanUseCase(
      mockTenantRepository,
      mockSubscriptionPlanRepository,
      mockPrisma
    );
  });

  it('should change tenant plan to monthly', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      'old-plan-id',
      'ACTIVE',
      new Date(),
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    const newPlan = new SubscriptionPlan(
      'new-plan-id',
      'Premium Plan',
      'PRO',
      1000,
      1000,
      {},
      50,
      100,
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockSubscriptionPlanRepository.findById.mockResolvedValue(newPlan);
    mockPrisma.tenant.update.mockResolvedValue({});

    const dto = {
      tenant_id: 'tenant-id',
      new_plan_id: 'new-plan-id',
      billing_period: 'MONTHLY' as const,
    };

    await useCase.execute(dto);

    expect(mockTenantRepository.findById).toHaveBeenCalledWith('tenant-id');
    expect(mockSubscriptionPlanRepository.findById).toHaveBeenCalledWith('new-plan-id');
    expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant-id' },
      data: {
        subscription_plan_id: 'new-plan-id',
        subscription_status: 'ACTIVE',
        subscription_expires_at: expect.any(Date),
      },
    });

    const updateCall = mockPrisma.tenant.update.mock.calls[0][0];
    const expiresAt = updateCall.data.subscription_expires_at;
    const expectedDate = new Date();
    expectedDate.setMonth(expectedDate.getMonth() + 1);
    expect(expiresAt.getTime()).toBeCloseTo(expectedDate.getTime(), -3);
  });

  it('should change tenant plan to yearly', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      'old-plan-id',
      'ACTIVE',
      new Date(),
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    const newPlan = new SubscriptionPlan(
      'new-plan-id',
      'Premium Plan',
      'PRO',
      1000,
      1000,
      {},
      50,
      100,
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockSubscriptionPlanRepository.findById.mockResolvedValue(newPlan);
    mockPrisma.tenant.update.mockResolvedValue({});

    const dto = {
      tenant_id: 'tenant-id',
      new_plan_id: 'new-plan-id',
      billing_period: 'YEARLY' as const,
    };

    await useCase.execute(dto);

    const updateCall = mockPrisma.tenant.update.mock.calls[0][0];
    const expiresAt = updateCall.data.subscription_expires_at;
    const expectedDate = new Date();
    expectedDate.setFullYear(expectedDate.getFullYear() + 1);
    expect(expiresAt.getTime()).toBeCloseTo(expectedDate.getTime(), -3);
  });

  it('should throw error if tenant not found', async () => {
    mockTenantRepository.findById.mockResolvedValue(null);

    const dto = {
      tenant_id: 'tenant-id',
      new_plan_id: 'new-plan-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Tenant not found');
  });

  it('should throw error if subscription plan not found', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      'old-plan-id',
      'ACTIVE',
      new Date(),
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockSubscriptionPlanRepository.findById.mockResolvedValue(null);

    const dto = {
      tenant_id: 'tenant-id',
      new_plan_id: 'new-plan-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Subscription plan not found');
  });
});

