/**
 * Unit Tests para DriverController.getMe()
 */

import 'reflect-metadata';
import { Request, Response } from 'express';
import { DriverController } from '../../presentation/controllers/DriverController';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('DriverController.getMe', () => {
  let controller: DriverController;
  let mockRequest: any;
  let mockResponse: Partial<Response>;
  let mockCreateUseCase: any;
  let mockGetUseCase: any;
  let mockListUseCase: any;
  let mockUpdateUseCase: any;
  let mockDeleteUseCase: any;
  let mockUserRepository: any;
  let mockDriverRepository: any;
  let mockVehicleRepository: any;

  const mockDriver = {
    id: 'driver-123',
    logistics_provider_id: 'lp-123',
    user_id: 'user-123',
    identity_document: '12345678',
    driving_license: 'LICENSE123',
    date_of_birth: new Date('1990-01-15'),
    emergency_contact: { name: 'John', phone: '123456' },
    has_own_vehicle: true,
    vehicle_id: 'vehicle-123',
    work_type: 'FULL_TIME',
    work_zone: 'Zone A',
    availability_status: 'AVAILABLE',
    rating_avg: 4.5,
    total_deliveries: 100,
    documents: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'driver@test.com',
    first_name: 'Test',
    last_name: 'Driver',
    phone: '+1234567890',
    role: UserRole.DRIVER,
  };

  const mockVehicle = {
    id: 'vehicle-123',
    vehicle_type: 'SEDAN',
    license_plate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'White',
  };

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn() };
    mockGetUseCase = { execute: jest.fn() };
    mockListUseCase = { execute: jest.fn() };
    mockUpdateUseCase = { execute: jest.fn() };
    mockDeleteUseCase = { execute: jest.fn() };
    mockUserRepository = { findById: jest.fn() };
    mockDriverRepository = { findByUserId: jest.fn() };
    mockVehicleRepository = { findById: jest.fn() };

    controller = new DriverController(
      mockCreateUseCase,
      mockGetUseCase,
      mockListUseCase,
      mockUpdateUseCase,
      mockDeleteUseCase,
      mockUserRepository,
      mockDriverRepository,
      mockVehicleRepository
    );

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('successful scenarios', () => {
    it('should return driver profile with user and vehicle data', async () => {
      mockRequest = {
        user: {
          id: 'user-123',
          role: UserRole.DRIVER,
        },
      };

      mockDriverRepository.findByUserId.mockResolvedValue(mockDriver);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);

      await controller.getMe(mockRequest as Request, mockResponse as Response);

      expect(mockDriverRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockVehicleRepository.findById).toHaveBeenCalledWith('vehicle-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          id: 'driver-123',
          user: expect.objectContaining({
            id: 'user-123',
            email: 'driver@test.com',
          }),
          vehicle: expect.objectContaining({
            id: 'vehicle-123',
            vehicle_type: 'SEDAN',
          }),
        }),
      });
    });

    it('should return driver profile without vehicle if none assigned', async () => {
      const driverWithoutVehicle = { ...mockDriver, vehicle_id: null };
      mockRequest = {
        user: {
          id: 'user-123',
          role: UserRole.DRIVER,
        },
      };

      mockDriverRepository.findByUserId.mockResolvedValue(driverWithoutVehicle);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await controller.getMe(mockRequest as Request, mockResponse as Response);

      expect(mockVehicleRepository.findById).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          id: 'driver-123',
          vehicle: undefined,
        }),
      });
    });
  });

  describe('error scenarios', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
      };

      await controller.getMe(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not authenticated',
      });
    });

    it('should return 401 if user id is missing', async () => {
      mockRequest = {
        user: {
          role: UserRole.DRIVER,
        },
      };

      await controller.getMe(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not authenticated',
      });
    });

    it('should return 403 if user is not a driver', async () => {
      mockRequest = {
        user: {
          id: 'user-123',
          role: UserRole.SUPERVISOR,
        },
      };

      await controller.getMe(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Only drivers can access this endpoint',
      });
    });

    it('should return 403 for SAAS_ADMIN role', async () => {
      mockRequest = {
        user: {
          id: 'user-123',
          role: UserRole.SAAS_ADMIN,
        },
      };

      await controller.getMe(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Only drivers can access this endpoint',
      });
    });

    it('should return 404 if driver profile not found', async () => {
      mockRequest = {
        user: {
          id: 'user-123',
          role: UserRole.DRIVER,
        },
      };

      mockDriverRepository.findByUserId.mockResolvedValue(null);

      await controller.getMe(mockRequest as Request, mockResponse as Response);

      expect(mockDriverRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Driver profile not found',
      });
    });

    it('should return 500 on internal error', async () => {
      mockRequest = {
        user: {
          id: 'user-123',
          role: UserRole.DRIVER,
        },
      };

      mockDriverRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await controller.getMe(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });
});

