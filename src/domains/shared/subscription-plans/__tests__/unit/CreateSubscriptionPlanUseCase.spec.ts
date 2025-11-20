/**
 * Tests unitarios para CreateSubscriptionPlanUseCase
 */

import { CreateSubscriptionPlanUseCase } from '../../application/use-cases/CreateSubscriptionPlanUseCase';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('CreateSubscriptionPlanUseCase', () => {
  let useCase: CreateSubscriptionPlanUseCase;
  let mockRepository: jest.Mocked<ISubscriptionPlanRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateSubscriptionPlanUseCase(mockRepository);
  });

  it('should create subscription plan successfully', async () => {
    const dto = {
      name: 'Basic Plan',
      type: 'BASIC' as const,
      price_monthly: 29.99,
      price_yearly: 299.99,
      features: { max_products: 100 },
      max_products: 100,
      max_orders_month: 1000,
      max_branches: 1,
    };

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

    mockRepository.create.mockResolvedValue(plan);

    const result = await useCase.execute(dto);

    expect(result).toEqual(plan);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
  });
});

