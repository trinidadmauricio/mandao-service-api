/**
 * Tests unitarios para GetSubscriptionPlanUseCase
 */

import { GetSubscriptionPlanUseCase } from '../../application/use-cases/GetSubscriptionPlanUseCase';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('GetSubscriptionPlanUseCase', () => {
  let useCase: GetSubscriptionPlanUseCase;
  let mockRepository: jest.Mocked<ISubscriptionPlanRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetSubscriptionPlanUseCase(mockRepository);
  });

  it('should return subscription plan when found', async () => {
    const plan = new SubscriptionPlan(
      'plan-id',
      'Basic Plan',
      'BASIC',
      29.99,
      299.99,
      { max_products: 100 },
      100,
      1000,
      1,
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(plan);

    const result = await useCase.execute('plan-id');

    expect(result).toEqual(plan);
  });

  it('should throw error when plan not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      'Subscription plan not found'
    );
  });
});

