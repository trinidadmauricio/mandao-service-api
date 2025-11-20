/**
 * Tests unitarios para IncrementOrderCounterUseCase
 */

import { IncrementOrderCounterUseCase } from '../../application/use-cases/IncrementOrderCounterUseCase';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';

describe('IncrementOrderCounterUseCase', () => {
  let useCase: IncrementOrderCounterUseCase;
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

    useCase = new IncrementOrderCounterUseCase(mockRepository);
  });

  it('should increment order counter successfully', async () => {
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

    const incrementedCounter = new OrderCounter(
      'counter-id',
      'tenant-id',
      BigInt(101),
      'ORD',
      6,
      null,
      new Date(),
      new Date()
    );

    mockRepository.findByTenantId.mockResolvedValue(counter);
    mockRepository.increment.mockResolvedValue(incrementedCounter);

    const result = await useCase.execute('tenant-id');

    expect(result).toEqual(incrementedCounter);
    expect(mockRepository.increment).toHaveBeenCalledWith('counter-id');
  });

  it('should throw error when counter not found', async () => {
    mockRepository.findByTenantId.mockResolvedValue(null);

    await expect(useCase.execute('tenant-id')).rejects.toThrow('Order counter not found');
  });
});

