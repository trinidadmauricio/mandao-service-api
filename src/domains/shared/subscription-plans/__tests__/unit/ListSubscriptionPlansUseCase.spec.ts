/**
 * Tests unitarios para ListSubscriptionPlansUseCase
 */

import { ListSubscriptionPlansUseCase } from '../../application/use-cases/ListSubscriptionPlansUseCase';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('ListSubscriptionPlansUseCase', () => {
  let useCase: ListSubscriptionPlansUseCase;
  let mockRepository: jest.Mocked<ISubscriptionPlanRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ListSubscriptionPlansUseCase(mockRepository);
  });

  it('should return all subscription plans', async () => {
    const plans = [
      new SubscriptionPlan(
        'plan-1',
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
      ),
      new SubscriptionPlan(
        'plan-2',
        'Pro Plan',
        'PRO',
        99.99,
        999.99,
        {},
        1000,
        10000,
        10,
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(plans);

    const result = await useCase.execute();

    expect(result).toEqual(plans);
    expect(mockRepository.findAll).toHaveBeenCalled();
  });
});

