/**
 * Tests unitarios para UserController
 */

import { Request, Response } from 'express';
import { UserController } from '../../presentation/controllers/UserController';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { GetUserUseCase } from '../../application/use-cases/GetUserUseCase';
import { ListUsersUseCase } from '../../application/use-cases/ListUsersUseCase';
import { UpdateUserUseCase } from '../../application/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../application/use-cases/DeleteUserUseCase';
import { User } from '../../domain/entities/User';

describe('UserController', () => {
  let controller: UserController;
  let mockCreateUseCase: jest.Mocked<CreateUserUseCase>;
  let mockGetUseCase: jest.Mocked<GetUserUseCase>;
  let mockListUseCase: jest.Mocked<ListUsersUseCase>;
  let mockUpdateUseCase: jest.Mocked<UpdateUserUseCase>;
  let mockDeleteUseCase: jest.Mocked<DeleteUserUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const createMockUser = (role: string, tenantId: string | null = 'tenant-id', logisticsProviderId: string | null = null): User => {
    return new User(
      'user-id',
      tenantId,
      'test@example.com',
      'hash',
      role as any,
      'John',
      'Doe',
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      'ACTIVE',
      logisticsProviderId,
      new Date(),
      new Date()
    );
  };

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

    controller = new UserController(
      mockCreateUseCase,
      mockGetUseCase,
      mockListUseCase,
      mockUpdateUseCase,
      mockDeleteUseCase
    );

    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: undefined,
      tenant: undefined,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('list', () => {

    it('should filter by MERCHANT_USER role when user is OWNER', async () => {
      const merchantUser1 = createMockUser('MERCHANT_USER');
      const merchantUser2 = createMockUser('MERCHANT_USER');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;

      mockListUseCase.execute.mockResolvedValue({
        data: [merchantUser1, merchantUser2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        'tenant-id',
        expect.objectContaining({
          role: 'MERCHANT_USER',
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should override manual role filter when user is OWNER', async () => {
      const merchantUser = createMockUser('MERCHANT_USER');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.query = {
        role: 'LOGISTICS_PROVIDER', // OWNER intenta filtrar por otro rol
      };

      mockListUseCase.execute.mockResolvedValue({
        data: [merchantUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      // Debe forzar MERCHANT_USER incluso si hay filtro manual
      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        'tenant-id',
        expect.objectContaining({
          role: 'MERCHANT_USER',
        })
      );
    });

    it('should not filter by role when user is SAAS_ADMIN', async () => {
      const allUsers = [
        createMockUser('OWNER'),
        createMockUser('MERCHANT_USER'),
        createMockUser('LOGISTICS_PROVIDER'),
        createMockUser('SUPERVISOR', null, 'provider-id'),
        createMockUser('SAAS_EDITOR'),
      ];

      mockRequest.user = {
        id: 'saas-admin-id',
        role: 'SAAS_ADMIN',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;

      mockListUseCase.execute.mockResolvedValue({
        data: allUsers,
        total: allUsers.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      // No debe aplicar filtro de rol automático
      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        'tenant-id',
        expect.not.objectContaining({
          role: expect.anything(),
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should filter out SAAS roles when user is SAAS_EDITOR', async () => {
      const allUsers = [
        createMockUser('OWNER'),
        createMockUser('MERCHANT_USER'),
        createMockUser('LOGISTICS_PROVIDER'),
        createMockUser('SAAS_ADMIN'),
        createMockUser('SAAS_EDITOR'),
      ];

      mockRequest.user = {
        id: 'saas-editor-id',
        role: 'SAAS_EDITOR',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;

      mockListUseCase.execute.mockResolvedValue({
        data: allUsers,
        total: allUsers.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      // No debe aplicar filtro de rol automático en la query
      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        'tenant-id',
        expect.not.objectContaining({
          role: expect.anything(),
        })
      );
      
      // Pero debe filtrar los resultados para excluir SAAS roles
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.data).toHaveLength(3); // Solo OWNER, MERCHANT_USER, LOGISTICS_PROVIDER
      expect(responseCall.data.every((u: any) => u.role !== 'SAAS_ADMIN' && u.role !== 'SAAS_EDITOR')).toBe(true);
      expect(responseCall.total).toBe(3); // Total ajustado
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should filter by logistics_provider_id and role SUPERVISOR when user is LOGISTICS_PROVIDER', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const supervisorUser = createMockUser('SUPERVISOR', null, logisticsProviderId);

      mockRequest.user = {
        id: 'provider-id',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.tenant = undefined;

      mockListUseCase.execute.mockResolvedValue({
        data: [supervisorUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          logistics_provider_id: logisticsProviderId,
          role: 'SUPERVISOR',
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should filter by logistics_provider_id when user is SUPERVISOR', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const supervisorUser = createMockUser('SUPERVISOR', null, logisticsProviderId);

      mockRequest.user = {
        id: 'supervisor-id',
        role: 'SUPERVISOR',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.tenant = undefined;

      mockListUseCase.execute.mockResolvedValue({
        data: [supervisorUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          logistics_provider_id: logisticsProviderId,
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should preserve other filters when OWNER filters by role', async () => {
      const merchantUser = createMockUser('MERCHANT_USER');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.query = {
        search: 'john',
        status: 'ACTIVE',
      };

      mockListUseCase.execute.mockResolvedValue({
        data: [merchantUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        'tenant-id',
        expect.objectContaining({
          role: 'MERCHANT_USER',
          search: 'john',
          status: 'ACTIVE',
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const merchantUser = createMockUser('MERCHANT_USER');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.query = {
        page: '2',
        limit: '20',
      };

      mockListUseCase.execute.mockResolvedValue({
        data: [merchantUser],
        total: 25,
        page: 2,
        limit: 20,
        totalPages: 2,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        'tenant-id',
        expect.objectContaining({
          role: 'MERCHANT_USER',
          page: 2,
          limit: 20,
        })
      );

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.total).toBe(25);
      expect(responseCall.page).toBe(2);
      expect(responseCall.limit).toBe(20);
      expect(responseCall.totalPages).toBe(2);
    });

    it('should not return password_hash in response', async () => {
      const merchantUser = createMockUser('MERCHANT_USER');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;

      mockListUseCase.execute.mockResolvedValue({
        data: [merchantUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.list(mockRequest as Request, mockResponse as Response);

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.data[0]).not.toHaveProperty('password_hash');
    });

    it('should handle errors correctly', async () => {
      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;

      const error = new Error('Database error');
      mockListUseCase.execute.mockRejectedValue(error);

      await controller.list(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });

    it('should handle ZodError for invalid filters', async () => {
      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.query = {
        role: 'INVALID_ROLE',
      };

      const zodError = new Error('Invalid filter parameters');
      zodError.name = 'ZodError';
      mockListUseCase.execute.mockRejectedValue(zodError);

      await controller.list(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid filter parameters',
        errors: zodError,
      });
    });
  });

  describe('getById', () => {
    it('should return user when OWNER accesses MERCHANT_USER from same tenant', async () => {
      const merchantUser = createMockUser('MERCHANT_USER', 'tenant-id');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(merchantUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should deny access when OWNER tries to access user from different tenant', async () => {
      const merchantUser = createMockUser('MERCHANT_USER', 'other-tenant-id');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(merchantUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied',
      });
    });

    it('should deny access when OWNER tries to access non-MERCHANT_USER', async () => {
      const ownerUser = createMockUser('OWNER', 'tenant-id');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(ownerUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied',
      });
    });

    it('should return user when LOGISTICS_PROVIDER accesses SUPERVISOR from same logistics_provider_id', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const supervisorUser = createMockUser('SUPERVISOR', null, logisticsProviderId);

      mockRequest.user = {
        id: 'provider-id',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(supervisorUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should deny access when LOGISTICS_PROVIDER tries to access SUPERVISOR from different logistics_provider_id', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const otherProviderId = '223e4567-e89b-12d3-a456-426614174000';
      const supervisorUser = createMockUser('SUPERVISOR', null, otherProviderId);

      mockRequest.user = {
        id: 'provider-id',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(supervisorUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied',
      });
    });

    it('should deny access when LOGISTICS_PROVIDER tries to access non-SUPERVISOR', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const merchantUser = createMockUser('MERCHANT_USER', 'tenant-id', logisticsProviderId);

      mockRequest.user = {
        id: 'provider-id',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(merchantUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied',
      });
    });

    it('should deny access when SAAS_EDITOR tries to access SAAS_ADMIN', async () => {
      const saasAdminUser = createMockUser('SAAS_ADMIN');

      mockRequest.user = {
        id: 'saas-editor-id',
        role: 'SAAS_EDITOR',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(saasAdminUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied',
      });
    });

    it('should deny access when SAAS_EDITOR tries to access SAAS_EDITOR', async () => {
      const saasEditorUser = createMockUser('SAAS_EDITOR');

      mockRequest.user = {
        id: 'saas-editor-id',
        role: 'SAAS_EDITOR',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(saasEditorUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied',
      });
    });

    it('should allow access when SAAS_EDITOR accesses non-SAAS user', async () => {
      const merchantUser = createMockUser('MERCHANT_USER', 'tenant-id');

      mockRequest.user = {
        id: 'saas-editor-id',
        role: 'SAAS_EDITOR',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(merchantUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should allow access when SAAS_ADMIN accesses any user', async () => {
      const saasAdminUser = createMockUser('SAAS_ADMIN');

      mockRequest.user = {
        id: 'saas-admin-id',
        role: 'SAAS_ADMIN',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(saasAdminUser);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('update', () => {
    it('should allow OWNER to update MERCHANT_USER from same tenant', async () => {
      const merchantUser = createMockUser('MERCHANT_USER', 'tenant-id');
      const updatedUser = createMockUser('MERCHANT_USER', 'tenant-id');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.params = { id: 'user-id' };
      mockRequest.body = {
        first_name: 'Updated',
      };

      mockGetUseCase.execute.mockResolvedValue(merchantUser);
      mockUpdateUseCase.execute.mockResolvedValue(updatedUser);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(mockUpdateUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should deny access when OWNER tries to update user from different tenant', async () => {
      const merchantUser = createMockUser('MERCHANT_USER', 'other-tenant-id');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.params = { id: 'user-id' };
      mockRequest.body = {
        first_name: 'Updated',
      };

      mockGetUseCase.execute.mockResolvedValue(merchantUser);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied',
      });
      expect(mockUpdateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should allow LOGISTICS_PROVIDER to update SUPERVISOR from same logistics_provider_id', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const supervisorUser = createMockUser('SUPERVISOR', null, logisticsProviderId);
      const updatedUser = createMockUser('SUPERVISOR', null, logisticsProviderId);

      mockRequest.user = {
        id: 'provider-id',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.params = { id: 'user-id' };
      mockRequest.body = {
        first_name: 'Updated',
      };

      mockGetUseCase.execute.mockResolvedValue(supervisorUser);
      mockUpdateUseCase.execute.mockResolvedValue(updatedUser);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(mockUpdateUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should deny access when LOGISTICS_PROVIDER tries to update SUPERVISOR from different logistics_provider_id', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const otherProviderId = '223e4567-e89b-12d3-a456-426614174000';
      const supervisorUser = createMockUser('SUPERVISOR', null, otherProviderId);

      mockRequest.user = {
        id: 'provider-id',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.params = { id: 'user-id' };
      mockRequest.body = {
        first_name: 'Updated',
      };

      mockGetUseCase.execute.mockResolvedValue(supervisorUser);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockUpdateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should deny access when SAAS_EDITOR tries to update SAAS_ADMIN', async () => {
      const saasAdminUser = createMockUser('SAAS_ADMIN');

      mockRequest.user = {
        id: 'saas-editor-id',
        role: 'SAAS_EDITOR',
      } as any;
      mockRequest.params = { id: 'user-id' };
      mockRequest.body = {
        first_name: 'Updated',
      };

      mockGetUseCase.execute.mockResolvedValue(saasAdminUser);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockUpdateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should allow SAAS_ADMIN to update any user', async () => {
      const saasAdminUser = createMockUser('SAAS_ADMIN');
      const updatedUser = createMockUser('SAAS_ADMIN');

      mockRequest.user = {
        id: 'saas-admin-id',
        role: 'SAAS_ADMIN',
      } as any;
      mockRequest.params = { id: 'user-id' };
      mockRequest.body = {
        first_name: 'Updated',
      };

      mockGetUseCase.execute.mockResolvedValue(saasAdminUser);
      mockUpdateUseCase.execute.mockResolvedValue(updatedUser);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('should allow OWNER to delete MERCHANT_USER from same tenant', async () => {
      const merchantUser = createMockUser('MERCHANT_USER', 'tenant-id');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(merchantUser);
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should deny access when OWNER tries to delete user from different tenant', async () => {
      const merchantUser = createMockUser('MERCHANT_USER', 'other-tenant-id');

      mockRequest.user = {
        id: 'owner-id',
        role: 'OWNER',
      } as any;
      mockRequest.tenant = {
        id: 'tenant-id',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(merchantUser);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockDeleteUseCase.execute).not.toHaveBeenCalled();
    });

    it('should allow LOGISTICS_PROVIDER to delete SUPERVISOR from same logistics_provider_id', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const supervisorUser = createMockUser('SUPERVISOR', null, logisticsProviderId);

      mockRequest.user = {
        id: 'provider-id',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(supervisorUser);
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should deny access when LOGISTICS_PROVIDER tries to delete SUPERVISOR from different logistics_provider_id', async () => {
      const logisticsProviderId = '123e4567-e89b-12d3-a456-426614174000';
      const otherProviderId = '223e4567-e89b-12d3-a456-426614174000';
      const supervisorUser = createMockUser('SUPERVISOR', null, otherProviderId);

      mockRequest.user = {
        id: 'provider-id',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: logisticsProviderId,
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(supervisorUser);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockDeleteUseCase.execute).not.toHaveBeenCalled();
    });

    it('should deny access when SAAS_EDITOR tries to delete SAAS_ADMIN', async () => {
      const saasAdminUser = createMockUser('SAAS_ADMIN');

      mockRequest.user = {
        id: 'saas-editor-id',
        role: 'SAAS_EDITOR',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(saasAdminUser);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockDeleteUseCase.execute).not.toHaveBeenCalled();
    });

    it('should allow SAAS_ADMIN to delete any user', async () => {
      const saasAdminUser = createMockUser('SAAS_ADMIN');

      mockRequest.user = {
        id: 'saas-admin-id',
        role: 'SAAS_ADMIN',
      } as any;
      mockRequest.params = { id: 'user-id' };

      mockGetUseCase.execute.mockResolvedValue(saasAdminUser);
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });
  });
});

