/**
 * Tests unitarios para DeleteSubscriptionPlanUseCase
 */

import { DeleteSubscriptionPlanUseCase } from '../../application/use-cases/DeleteSubscriptionPlanUseCase';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('DeleteSubscriptionPlanUseCase', () => {
  let useCase: DeleteSubscriptionPlanUseCase;
  let mockRepository: jest.Mocked<ISubscriptionPlanRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteSubscriptionPlanUseCase(mockRepository);
  });

  it('should delete subscription plan successfully', async () => {
    const plan = new SubscriptionPlan(
      'plan-id',
      'Basic Plan',
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

    mockRepository.findById.mockResolvedValue(plan);
    mockRepository.delete.mockResolvedValue();

    await useCase.execute('plan-id');

    expect(mockRepository.delete).toHaveBeenCalledWith('plan-id');
  });

  it('should throw error when plan not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      'Subscription plan not found'
    );
  });
});

