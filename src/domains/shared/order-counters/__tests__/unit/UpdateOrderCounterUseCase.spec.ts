/**
 * Tests unitarios para UpdateOrderCounterUseCase
 */

import { UpdateOrderCounterUseCase } from '../../application/use-cases/UpdateOrderCounterUseCase';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';

describe('UpdateOrderCounterUseCase', () => {
  let useCase: UpdateOrderCounterUseCase;
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

    useCase = new UpdateOrderCounterUseCase(mockRepository);
  });

  it('should update order counter successfully', async () => {
    const existingCounter = new OrderCounter(
      'counter-id',
      'tenant-id',
      BigInt(100),
      'ORD',
      6,
      null,
      new Date(),
      new Date()
    );

    const updatedCounter = new OrderCounter(
      'counter-id',
      'tenant-id',
      BigInt(200),
      'NEW',
      8,
      null,
      new Date(),
      new Date()
    );

    mockRepository.findByTenantId.mockResolvedValue(existingCounter);
    mockRepository.update.mockResolvedValue(updatedCounter);

    const dto = {
      current_value: 200,
      prefix: 'NEW',
      padding_length: 8,
    };

    const result = await useCase.execute('tenant-id', dto);

    expect(result).toEqual(updatedCounter);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should reset counter when reset flag is true', async () => {
    const existingCounter = new OrderCounter(
      'counter-id',
      'tenant-id',
      BigInt(100),
      'ORD',
      6,
      null,
      new Date(),
      new Date()
    );

    const resetCounter = new OrderCounter(
      'counter-id',
      'tenant-id',
      BigInt(0),
      'ORD',
      6,
      new Date(),
      new Date(),
      new Date()
    );

    mockRepository.findByTenantId.mockResolvedValue(existingCounter);
    mockRepository.update.mockResolvedValue(resetCounter);

    const dto = { reset: true };

    const result = await useCase.execute('tenant-id', dto);

    expect(result).toEqual(resetCounter);
    expect(mockRepository.update).toHaveBeenCalledWith(
      'counter-id',
      expect.objectContaining({
        current_value: BigInt(0),
        last_reset_at: expect.any(Date),
      })
    );
  });

  it('should throw error when counter not found', async () => {
    mockRepository.findByTenantId.mockResolvedValue(null);

    await expect(useCase.execute('tenant-id', { current_value: 200 })).rejects.toThrow(
      'Order counter not found'
    );
  });
});

