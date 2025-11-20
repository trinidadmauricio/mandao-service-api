/**
 * Tests unitarios para GetOrderCounterUseCase
 */

import { GetOrderCounterUseCase } from '../../application/use-cases/GetOrderCounterUseCase';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';

describe('GetOrderCounterUseCase', () => {
  let useCase: GetOrderCounterUseCase;
  let mockRepository: jest.Mocked<IOrderCounterRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByTenantId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      increment: jest.fn(),
      incrementWithLock: jest.fn(),
    };

    useCase = new GetOrderCounterUseCase(mockRepository);
  });

  it('should return order counter when found', async () => {
    const counter = new OrderCounter(
      'counter-id',
      'tenant-id',
      BigInt(100),
      'ORD',
      6,
      null,
      new Date(),
      new Date()
    );

    mockRepository.findByTenantId.mockResolvedValue(counter);

    const result = await useCase.execute('tenant-id');

    expect(result).toEqual(counter);
  });

  it('should throw error when counter not found', async () => {
    mockRepository.findByTenantId.mockResolvedValue(null);

    await expect(useCase.execute('tenant-id')).rejects.toThrow('Order counter not found');
  });
});

