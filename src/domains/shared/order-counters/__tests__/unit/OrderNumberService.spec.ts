/**
 * Tests unitarios para OrderNumberService
 * Verifica concurrencia segura con row locks
 */

import { OrderNumberService } from '../../application/services/OrderNumberService';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';

describe('OrderNumberService', () => {
  let service: OrderNumberService;
  let mockRepository: jest.Mocked<IOrderCounterRepository>;

  beforeEach(() => {
    mockRepository = {
      findByTenantId: jest.fn(),
      increment: jest.fn(),
      incrementWithLock: jest.fn(),
    } as any;

    service = new OrderNumberService(mockRepository);
  });

  describe('getNextOrderNumber', () => {
    it('should generate next order number with prefix', async () => {
      const tenantId = 'tenant-123';
      const counter = new OrderCounter(
        'counter-id',
        tenantId,
        BigInt(100),
        'ORD',
        6,
        null,
        new Date(),
        new Date()
      );

      mockRepository.incrementWithLock.mockResolvedValue(counter);

      const orderNumber = await service.getNextOrderNumber(tenantId);

      expect(orderNumber).toBe('ORD-000101');
      expect(mockRepository.incrementWithLock).toHaveBeenCalledWith(tenantId);
    });

    it('should generate next order number without prefix', async () => {
      const tenantId = 'tenant-123';
      const counter = new OrderCounter(
        'counter-id',
        tenantId,
        BigInt(100),
        null,
        6,
        null,
        new Date(),
        new Date()
      );

      mockRepository.incrementWithLock.mockResolvedValue(counter);

      const orderNumber = await service.getNextOrderNumber(tenantId);

      expect(orderNumber).toBe('000101');
      expect(mockRepository.incrementWithLock).toHaveBeenCalledWith(tenantId);
    });

    it('should throw error if counter not found', async () => {
      const tenantId = 'tenant-123';

      mockRepository.incrementWithLock.mockRejectedValue(
        new Error('Order counter not found')
      );

      await expect(service.getNextOrderNumber(tenantId)).rejects.toThrow(
        'Order counter not found'
      );
    });
  });

  describe('concurrency safety', () => {
    it('should generate unique numbers with concurrent requests', async () => {
      const tenantId = 'tenant-123';
      let currentValue = BigInt(100);

      // Simular incrementWithLock que incrementa el valor
      mockRepository.incrementWithLock.mockImplementation(async () => {
        const counter = new OrderCounter(
          'counter-id',
          tenantId,
          currentValue,
          'ORD',
          6,
          null,
          new Date(),
          new Date()
        );
        currentValue = currentValue + BigInt(1);
        return counter;
      });

      // Simular 100 requests concurrentes
      const promises = Array.from({ length: 100 }, () =>
        service.getNextOrderNumber(tenantId)
      );

      const numbers = await Promise.all(promises);

      // Verificar que todos son únicos
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(100);

      // Verificar formato
      numbers.forEach((num) => {
        expect(num).toMatch(/^ORD-\d{6}$/);
      });
    });
  });
});

