/**
 * Tests unitarios para PrismaDriverRepository
 */

import { PrismaDriverRepository } from '../../infrastructure/repositories/PrismaDriverRepository';
import { PrismaClient } from '@prisma/client';
import { Driver } from '../../domain/entities/Driver';

describe('PrismaDriverRepository', () => {
  let repository: PrismaDriverRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      driver: {
        findUnique: jest.fn() as jest.Mock,
        findFirst: jest.fn() as jest.Mock,
        findMany: jest.fn() as jest.Mock,
        create: jest.fn() as jest.Mock,
        update: jest.fn() as jest.Mock,
        delete: jest.fn() as jest.Mock,
        count: jest.fn() as jest.Mock,
      },
    } as any;

    repository = new PrismaDriverRepository(mockPrisma);
  });

  describe('findByUserId', () => {
    it('should return driver when exists for user_id', async () => {
      const data = {
        id: 'driver-id',
        logistics_provider_id: 'logistics-provider-id',
        user_id: 'user-id',
        identity_document: '12345678',
        driving_license: 'DL123456',
        date_of_birth: new Date('1990-01-01'),
        emergency_contact: { name: 'John Doe', phone: '1234567890' },
        has_own_vehicle: true,
        vehicle_id: 'vehicle-id',
        work_type: 'FULL_TIME',
        work_zone: null,
        availability_status: 'AVAILABLE',
        rating_avg: null,
        total_deliveries: 0,
        documents: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      (mockPrisma.driver.findFirst as jest.Mock).mockResolvedValue(data);

      const result = await repository.findByUserId('user-id');

      expect(result).toBeInstanceOf(Driver);
      expect(result?.user_id).toBe('user-id');
      expect(mockPrisma.driver.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-id' },
      });
    });

    it('should return null when driver does not exist for user_id', async () => {
      (mockPrisma.driver.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByUserId('non-existent-user-id');

      expect(result).toBeNull();
      expect(mockPrisma.driver.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'non-existent-user-id' },
      });
    });

    it('should return the correct driver for a user_id', async () => {
      const data = {
        id: 'driver-id-1',
        logistics_provider_id: 'logistics-provider-id',
        user_id: 'user-id-1',
        identity_document: '12345678',
        driving_license: 'DL123456',
        date_of_birth: new Date('1990-01-01'),
        emergency_contact: { name: 'John Doe', phone: '1234567890' },
        has_own_vehicle: true,
        vehicle_id: 'vehicle-id',
        work_type: 'FULL_TIME',
        work_zone: null,
        availability_status: 'AVAILABLE',
        rating_avg: 4.5,
        total_deliveries: 10,
        documents: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      (mockPrisma.driver.findFirst as jest.Mock).mockResolvedValue(data);

      const result = await repository.findByUserId('user-id-1');

      expect(result).toBeInstanceOf(Driver);
      expect(result?.id).toBe('driver-id-1');
      expect(result?.user_id).toBe('user-id-1');
      expect(result?.logistics_provider_id).toBe('logistics-provider-id');
    });
  });
});

