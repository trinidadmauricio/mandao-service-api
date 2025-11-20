/**
 * Tests unitarios para CreateOrderCounterUseCase
 */

import { CreateOrderCounterUseCase } from '../../application/use-cases/CreateOrderCounterUseCase';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';

describe('CreateOrderCounterUseCase', () => {
  let useCase: CreateOrderCounterUseCase;
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

    useCase = new CreateOrderCounterUseCase(mockRepository);
  });

  it('should create order counter successfully', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      prefix: 'ORD',
      padding_length: 6,
    };

    const counter = new OrderCounter(
      'counter-id',
      'tenant-id',
      BigInt(0),
      'ORD',
      6,
      null,
      new Date(),
      new Date()
    );

    mockRepository.findByTenantId.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(counter);

    const result = await useCase.execute(dto);

    expect(result).toEqual(counter);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should throw error if counter already exists for tenant', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      prefix: 'ORD',
    };

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

    mockRepository.findByTenantId.mockResolvedValue(existingCounter);

    await expect(useCase.execute(dto)).rejects.toThrow(
      'Order counter already exists for this tenant'
    );
  });
});

