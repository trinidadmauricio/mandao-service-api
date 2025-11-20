/**
 * Tests unitarios para OrderCounter entity
 */

import { OrderCounter } from '../../domain/entities/OrderCounter';

describe('OrderCounter Entity', () => {
  describe('generateNextNumber', () => {
    it('should generate next number with prefix', () => {
      const counter = new OrderCounter(
        'id',
        'tenant-id',
        BigInt(100),
        'ORD',
        6,
        null,
        new Date(),
        new Date()
      );

      const nextNumber = counter.generateNextNumber();
      expect(nextNumber).toBe('ORD-000101');
    });

    it('should generate next number without prefix', () => {
      const counter = new OrderCounter(
        'id',
        'tenant-id',
        BigInt(100),
        null,
        6,
        null,
        new Date(),
        new Date()
      );

      const nextNumber = counter.generateNextNumber();
      expect(nextNumber).toBe('000101');
    });

    it('should pad number correctly', () => {
      const counter = new OrderCounter(
        'id',
        'tenant-id',
        BigInt(5),
        'ORD',
        6,
        null,
        new Date(),
        new Date()
      );

      const nextNumber = counter.generateNextNumber();
      expect(nextNumber).toBe('ORD-000006');
    });
  });
});

