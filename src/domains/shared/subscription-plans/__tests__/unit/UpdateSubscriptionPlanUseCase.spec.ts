/**
 * Tests unitarios para UpdateSubscriptionPlanUseCase
 */

import { UpdateSubscriptionPlanUseCase } from '../../application/use-cases/UpdateSubscriptionPlanUseCase';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('UpdateSubscriptionPlanUseCase', () => {
  let useCase: UpdateSubscriptionPlanUseCase;
  let mockRepository: jest.Mocked<ISubscriptionPlanRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new UpdateSubscriptionPlanUseCase(mockRepository);
  });

  it('should update subscription plan successfully', async () => {
    const existingPlan = new SubscriptionPlan(
      'plan-id',
      'Old Name',
      'BASIC',
      29.99,
      299.99,
      {},
      100,
      1000,
      1,
      new Date(),
      new Date()
    );

    const updatedPlan = new SubscriptionPlan(
      'plan-id',
      'New Name',
      'BASIC',
      39.99,
      399.99,
      {},
      200,
      2000,
      2,
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(existingPlan);
    mockRepository.update.mockResolvedValue(updatedPlan);

    const dto = {
      name: 'New Name',
      price_monthly: 39.99,
      price_yearly: 399.99,
      max_products: 200,
      max_orders_month: 2000,
      max_branches: 2,
    };

    const result = await useCase.execute('plan-id', dto);

    expect(result).toEqual(updatedPlan);
    expect(mockRepository.update).toHaveBeenCalledWith('plan-id', dto);
  });

  it('should throw error when plan not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', { name: 'New Name' })).rejects.toThrow(
      'Subscription plan not found'
    );
  });
});

