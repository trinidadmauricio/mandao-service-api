/**
 * Tests unitarios para ConvertTrialToPaidUseCase
 */

import { ConvertTrialToPaidUseCase } from '../../application/use-cases/ConvertTrialToPaidUseCase';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { Tenant } from '../../../tenants/domain/entities/Tenant';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('ConvertTrialToPaidUseCase', () => {
  let useCase: ConvertTrialToPaidUseCase;
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

    useCase = new ConvertTrialToPaidUseCase(
      mockTenantRepository,
      mockSubscriptionPlanRepository,
      mockPrisma
    );
  });

  it('should convert trial to monthly paid plan', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      null,
      'TRIAL',
      new Date(),
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    const plan = new SubscriptionPlan(
      'plan-id',
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
    mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);
    mockPrisma.tenant.update.mockResolvedValue({});

    const dto = {
      tenant_id: 'tenant-id',
      plan_id: 'plan-id',
      billing_period: 'MONTHLY' as const,
    };

    await useCase.execute(dto);

    expect(mockTenantRepository.findById).toHaveBeenCalledWith('tenant-id');
    expect(mockSubscriptionPlanRepository.findById).toHaveBeenCalledWith('plan-id');
    expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant-id' },
      data: {
        subscription_plan_id: 'plan-id',
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

  it('should convert trial to yearly paid plan', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      null,
      'TRIAL',
      new Date(),
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    const plan = new SubscriptionPlan(
      'plan-id',
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
    mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);
    mockPrisma.tenant.update.mockResolvedValue({});

    const dto = {
      tenant_id: 'tenant-id',
      plan_id: 'plan-id',
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
      plan_id: 'plan-id',
      billing_period: 'MONTHLY' as const,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Tenant not found');
  });

  it('should throw error if tenant is not in trial', async () => {
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
      plan_id: 'plan-id',
      billing_period: 'MONTHLY' as const,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Tenant is not in trial period');
  });

  it('should throw error if subscription plan not found', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      null,
      'TRIAL',
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
      plan_id: 'plan-id',
      billing_period: 'MONTHLY' as const,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Subscription plan not found');
  });
});

