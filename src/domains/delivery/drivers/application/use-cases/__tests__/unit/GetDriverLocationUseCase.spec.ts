/**
 * Unit Tests para GetDriverLocationUseCase
 */

import 'reflect-metadata';
import { GetDriverLocationUseCase } from '../../GetDriverLocationUseCase';
import { UserRole } from '../../../../../../../shared/constants/permissions';

describe('GetDriverLocationUseCase', () => {
  let useCase: GetDriverLocationUseCase;
  let mockDriverRepository: any;
  let mockLocationCache: any;

  const mockDriver = {
    id: 'driver-123',
    logistics_provider_id: 'lp-123',
    user_id: 'user-123',
    availability_status: 'AVAILABLE',
  };

  const mockLocation = {
    driver_id: 'driver-123',
    lat: -12.0464,
    lng: -77.0428,
    accuracy: 10.5,
    speed: 45.2,
    heading: 180,
    order_id: 'order-123',
    recorded_at: '2025-12-11T12:00:00.000Z',
  };

  beforeEach(() => {
    mockDriverRepository = {
      findById: jest.fn(),
    };

    mockLocationCache = {
      getDriverLocation: jest.fn(),
    };

    useCase = new GetDriverLocationUseCase(mockDriverRepository, mockLocationCache);
  });

  describe('successful scenarios', () => {
    it('should return location when driver exists and has location in cache', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);
      mockLocationCache.getDriverLocation.mockResolvedValue(mockLocation);

      const result = await useCase.execute({ driverId: 'driver-123' });

      expect(mockDriverRepository.findById).toHaveBeenCalledWith('driver-123');
      expect(mockLocationCache.getDriverLocation).toHaveBeenCalledWith('driver-123');
      expect(result).toEqual({
        ...mockLocation,
        is_online: true,
      });
    });

    it('should return null when driver exists but has no location in cache', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);
      mockLocationCache.getDriverLocation.mockResolvedValue(null);

      const result = await useCase.execute({ driverId: 'driver-123' });

      expect(result).toBeNull();
    });

    it('should allow SAAS_ADMIN to view any driver location', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);
      mockLocationCache.getDriverLocation.mockResolvedValue(mockLocation);

      const context = {
        currentUserRole: UserRole.SAAS_ADMIN,
        currentUserLogisticsProviderId: null,
        currentUserId: 'admin-user',
      };

      const result = await useCase.execute({ driverId: 'driver-123' }, context);

      expect(result).not.toBeNull();
      expect(result?.is_online).toBe(true);
    });

    it('should allow SAAS_EDITOR to view any driver location', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);
      mockLocationCache.getDriverLocation.mockResolvedValue(mockLocation);

      const context = {
        currentUserRole: UserRole.SAAS_EDITOR,
        currentUserLogisticsProviderId: null,
        currentUserId: 'editor-user',
      };

      const result = await useCase.execute({ driverId: 'driver-123' }, context);

      expect(result).not.toBeNull();
    });

    it('should allow LOGISTICS_PROVIDER to view their own driver location', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);
      mockLocationCache.getDriverLocation.mockResolvedValue(mockLocation);

      const context = {
        currentUserRole: UserRole.LOGISTICS_PROVIDER,
        currentUserLogisticsProviderId: 'lp-123', // Same as driver
        currentUserId: 'lp-user',
      };

      const result = await useCase.execute({ driverId: 'driver-123' }, context);

      expect(result).not.toBeNull();
    });

    it('should allow SUPERVISOR to view their own driver location', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);
      mockLocationCache.getDriverLocation.mockResolvedValue(mockLocation);

      const context = {
        currentUserRole: UserRole.SUPERVISOR,
        currentUserLogisticsProviderId: 'lp-123', // Same as driver
        currentUserId: 'supervisor-user',
      };

      const result = await useCase.execute({ driverId: 'driver-123' }, context);

      expect(result).not.toBeNull();
    });

    it('should allow DRIVER to view their own location', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);
      mockLocationCache.getDriverLocation.mockResolvedValue(mockLocation);

      const context = {
        currentUserRole: UserRole.DRIVER,
        currentUserLogisticsProviderId: 'lp-123',
        currentUserId: 'user-123', // Same as driver.user_id
      };

      const result = await useCase.execute({ driverId: 'driver-123' }, context);

      expect(result).not.toBeNull();
    });
  });

  describe('error scenarios', () => {
    it('should throw error when driver not found', async () => {
      mockDriverRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ driverId: 'non-existent' })).rejects.toThrow(
        'Driver not found'
      );
    });

    it('should throw error when LOGISTICS_PROVIDER tries to view driver from another provider', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);

      const context = {
        currentUserRole: UserRole.LOGISTICS_PROVIDER,
        currentUserLogisticsProviderId: 'lp-other', // Different provider
        currentUserId: 'lp-user',
      };

      await expect(
        useCase.execute({ driverId: 'driver-123' }, context)
      ).rejects.toThrow('You do not have permission to view this driver location');
    });

    it('should throw error when SUPERVISOR tries to view driver from another provider', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);

      const context = {
        currentUserRole: UserRole.SUPERVISOR,
        currentUserLogisticsProviderId: 'lp-other', // Different provider
        currentUserId: 'supervisor-user',
      };

      await expect(
        useCase.execute({ driverId: 'driver-123' }, context)
      ).rejects.toThrow('You do not have permission to view this driver location');
    });

    it('should throw error when DRIVER tries to view another driver location', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);

      const context = {
        currentUserRole: UserRole.DRIVER,
        currentUserLogisticsProviderId: 'lp-123',
        currentUserId: 'other-user', // Different user
      };

      await expect(
        useCase.execute({ driverId: 'driver-123' }, context)
      ).rejects.toThrow('You do not have permission to view this driver location');
    });

    it('should throw error when CUSTOMER tries to view driver location', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);

      const context = {
        currentUserRole: UserRole.CUSTOMER,
        currentUserLogisticsProviderId: null,
        currentUserId: 'customer-user',
      };

      await expect(
        useCase.execute({ driverId: 'driver-123' }, context)
      ).rejects.toThrow('You do not have permission to view driver locations');
    });

    it('should throw error when OWNER tries to view driver location', async () => {
      mockDriverRepository.findById.mockResolvedValue(mockDriver);

      const context = {
        currentUserRole: UserRole.OWNER,
        currentUserLogisticsProviderId: null,
        currentUserId: 'owner-user',
      };

      await expect(
        useCase.execute({ driverId: 'driver-123' }, context)
      ).rejects.toThrow('You do not have permission to view driver locations');
    });
  });
});

