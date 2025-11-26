/**
 * Tests unitarios para TenantController
 */

import { Request, Response } from 'express';
import { TenantController } from '../../presentation/controllers/TenantController';
import { CreateTenantUseCase } from '../../application/use-cases/CreateTenantUseCase';
import { GetTenantUseCase } from '../../application/use-cases/GetTenantUseCase';
import { ListTenantsUseCase } from '../../application/use-cases/ListTenantsUseCase';
import { UpdateTenantUseCase } from '../../application/use-cases/UpdateTenantUseCase';
import { DeleteTenantUseCase } from '../../application/use-cases/DeleteTenantUseCase';
import { Tenant } from '../../domain/entities/Tenant';

describe('TenantController', () => {
  let controller: TenantController;
  let mockCreateUseCase: jest.Mocked<CreateTenantUseCase>;
  let mockGetUseCase: jest.Mocked<GetTenantUseCase>;
  let mockListUseCase: jest.Mocked<ListTenantsUseCase>;
  let mockUpdateUseCase: jest.Mocked<UpdateTenantUseCase>;
  let mockDeleteUseCase: jest.Mocked<DeleteTenantUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockCreateUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetUseCase = {
      execute: jest.fn(),
    } as any;

    mockListUseCase = {
      execute: jest.fn(),
    } as any;

    mockUpdateUseCase = {
      execute: jest.fn(),
    } as any;

    mockDeleteUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new TenantController(
      mockCreateUseCase,
      mockGetUseCase,
      mockListUseCase,
      mockUpdateUseCase,
      mockDeleteUseCase
    );

    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('create', () => {
    it('should reject HYBRID tenant type with 400 error', async () => {
      mockRequest.body = {
        slug: 'hybrid-tenant',
        name: 'Hybrid Tenant',
        type: 'HYBRID',
      };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'HYBRID tenant type is not allowed. Only RETAIL and ON_DEMAND are supported.',
      });
      expect(mockCreateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should create RETAIL tenant successfully', async () => {
      const tenant = new Tenant(
        'tenant-id',
        'retail-tenant',
        'Retail Tenant',
        'RETAIL',
        null,
        'TRIAL',
        null,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      mockRequest.body = {
        slug: 'retail-tenant',
        name: 'Retail Tenant',
        type: 'RETAIL',
      };

      mockCreateUseCase.execute.mockResolvedValue(tenant);

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: tenant,
      });
      expect(mockCreateUseCase.execute).toHaveBeenCalled();
    });

    it('should create ON_DEMAND tenant successfully', async () => {
      const tenant = new Tenant(
        'tenant-id',
        'on-demand-tenant',
        'On Demand Tenant',
        'ON_DEMAND',
        null,
        'TRIAL',
        null,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      mockRequest.body = {
        slug: 'on-demand-tenant',
        name: 'On Demand Tenant',
        type: 'ON_DEMAND',
      };

      mockCreateUseCase.execute.mockResolvedValue(tenant);

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: tenant,
      });
      expect(mockCreateUseCase.execute).toHaveBeenCalled();
    });
  });
});

