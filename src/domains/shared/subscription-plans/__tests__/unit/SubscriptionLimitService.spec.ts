/**
 * Tests unitarios para SubscriptionLimitService
 */

import { SubscriptionLimitService } from '../../application/services/SubscriptionLimitService';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { Tenant } from '../../../tenants/domain/entities/Tenant';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('SubscriptionLimitService', () => {
  let service: SubscriptionLimitService;
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
      product: {
        count: jest.fn(),
      },
      branch: {
        count: jest.fn(),
      },
      order: {
        count: jest.fn(),
      },
    };

    service = new SubscriptionLimitService(
      mockTenantRepository,
      mockSubscriptionPlanRepository,
      mockPrisma
    );
  });

  describe('checkProductLimit', () => {
    it('should return allowed if tenant has no plan', async () => {
      const tenant = new Tenant(
        'tenant-id',
        'tenant-slug',
        'Tenant Name',
        'RETAIL',
        null,
        'ACTIVE',
        null,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);

      const result = await service.checkProductLimit('tenant-id');

      expect(result).toEqual({
        allowed: true,
        current: 0,
        limit: null,
      });
    });

    it('should return allowed if plan has no product limit', async () => {
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

      const plan = new SubscriptionPlan(
        'plan-id',
        'Premium Plan',
        'PRO',
        1000,
        1000,
        {},
        null,
        null,
        null,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);

      const result = await service.checkProductLimit('tenant-id');

      expect(result).toEqual({
        allowed: true,
        current: 0,
        limit: null,
      });
    });

    it('should return allowed if product count is below limit', async () => {
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

      const plan = new SubscriptionPlan(
        'plan-id',
        'Premium Plan',
        'PRO',
        1000,
        1000,
        {},
        50,
        null,
        null,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);
      mockPrisma.product.count.mockResolvedValue(30);

      const result = await service.checkProductLimit('tenant-id');

      expect(result).toEqual({
        allowed: true,
        current: 30,
        limit: 50,
      });
    });

    it('should return not allowed if product count exceeds limit', async () => {
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

      const plan = new SubscriptionPlan(
        'plan-id',
        'Premium Plan',
        'PRO',
        1000,
        1000,
        {},
        50,
        null,
        null,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);
      mockPrisma.product.count.mockResolvedValue(60);

      const result = await service.checkProductLimit('tenant-id');

      expect(result).toEqual({
        allowed: false,
        current: 60,
        limit: 50,
        message: 'Product limit reached. Current: 60, Limit: 50',
      });
    });
  });

  describe('checkBranchLimit', () => {
    it('should return allowed if branch count is below limit', async () => {
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

      const plan = new SubscriptionPlan(
        'plan-id',
        'Premium Plan',
        'PRO',
        1000,
        1000,
        {},
        null,
        null,
        10,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);
      mockPrisma.branch.count.mockResolvedValue(5);

      const result = await service.checkBranchLimit('tenant-id');

      expect(result).toEqual({
        allowed: true,
        current: 5,
        limit: 10,
      });
    });

    it('should return not allowed if branch count exceeds limit', async () => {
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

      const plan = new SubscriptionPlan(
        'plan-id',
        'Premium Plan',
        'PRO',
        1000,
        1000,
        {},
        null,
        null,
        10,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);
      mockPrisma.branch.count.mockResolvedValue(15);

      const result = await service.checkBranchLimit('tenant-id');

      expect(result).toEqual({
        allowed: false,
        current: 15,
        limit: 10,
        message: 'Branch limit reached. Current: 15, Limit: 10',
      });
    });
  });

  describe('checkOrderLimit', () => {
    it('should return allowed if order count is below monthly limit', async () => {
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

      const plan = new SubscriptionPlan(
        'plan-id',
        'Premium Plan',
        'PRO',
        1000,
        1000,
        {},
        null,
        1000,
        null,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);
      mockPrisma.order.count.mockResolvedValue(500);

      const result = await service.checkOrderLimit('tenant-id');

      expect(result).toEqual({
        allowed: true,
        current: 500,
        limit: 1000,
      });
    });

    it('should return not allowed if order count exceeds monthly limit', async () => {
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

      const plan = new SubscriptionPlan(
        'plan-id',
        'Premium Plan',
        'PRO',
        1000,
        1000,
        {},
        null,
        1000,
        null,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockSubscriptionPlanRepository.findById.mockResolvedValue(plan);
      mockPrisma.order.count.mockResolvedValue(1200);

      const result = await service.checkOrderLimit('tenant-id');

      expect(result).toEqual({
        allowed: false,
        current: 1200,
        limit: 1000,
        message: 'Monthly order limit reached. Current: 1200, Limit: 1000',
      });
    });
  });

  describe('checkTrialStatus', () => {
    it('should return trial status for tenant in trial', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const tenant = new Tenant(
        'tenant-id',
        'tenant-slug',
        'Tenant Name',
        'RETAIL',
        null,
        'TRIAL',
        expiresAt,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);

      const result = await service.checkTrialStatus('tenant-id');

      expect(result).toEqual({
        isTrial: true,
        expired: false,
        expiresAt,
      });
    });

    it('should return expired trial status', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() - 1);

      const tenant = new Tenant(
        'tenant-id',
        'tenant-slug',
        'Tenant Name',
        'RETAIL',
        null,
        'TRIAL',
        expiresAt,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      mockTenantRepository.findById.mockResolvedValue(tenant);

      const result = await service.checkTrialStatus('tenant-id');

      expect(result).toEqual({
        isTrial: true,
        expired: true,
        expiresAt,
      });
    });

    it('should return false for non-trial tenant', async () => {
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

      const result = await service.checkTrialStatus('tenant-id');

      expect(result).toEqual({
        isTrial: false,
        expired: false,
        expiresAt: expect.any(Date),
      });
    });
  });
});

