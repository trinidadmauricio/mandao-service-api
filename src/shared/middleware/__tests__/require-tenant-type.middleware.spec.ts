/**
 * Tests unitarios para requireTenantType middleware
 */

import { Request, Response, NextFunction } from 'express';
import { requireTenantType } from '../require-tenant-type.middleware';

describe('requireTenantType middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let middleware: ReturnType<typeof requireTenantType>;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      user: undefined,
      tenant: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    middleware = requireTenantType(['RETAIL']);
  });

  it('should allow LOGISTICS_PROVIDER without tenant', () => {
    mockRequest.user = {
      id: 'user-id',
      role: 'LOGISTICS_PROVIDER',
      logistics_provider_id: 'provider-id',
    } as any;
    mockRequest.tenant = undefined;

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow SUPERVISOR without tenant', () => {
    mockRequest.user = {
      id: 'user-id',
      role: 'SUPERVISOR',
      logistics_provider_id: 'provider-id',
    } as any;
    mockRequest.tenant = undefined;

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow SAAS_ADMIN without tenant restrictions', () => {
    mockRequest.user = {
      id: 'user-id',
      role: 'SAAS_ADMIN',
    } as any;
    mockRequest.tenant = {
      id: 'tenant-id',
      type: 'ON_DEMAND',
    } as any;

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow SAAS_EDITOR without tenant restrictions', () => {
    mockRequest.user = {
      id: 'user-id',
      role: 'SAAS_EDITOR',
    } as any;
    mockRequest.tenant = {
      id: 'tenant-id',
      type: 'ON_DEMAND',
    } as any;

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow RETAIL tenant for RETAIL requirement', () => {
    mockRequest.user = {
      id: 'user-id',
      role: 'OWNER',
    } as any;
    mockRequest.tenant = {
      id: 'tenant-id',
      type: 'RETAIL',
    } as any;

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should reject ON_DEMAND tenant for RETAIL requirement', () => {
    mockRequest.user = {
      id: 'user-id',
      role: 'OWNER',
    } as any;
    mockRequest.tenant = {
      id: 'tenant-id',
      type: 'ON_DEMAND',
    } as any;

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.stringContaining('RETAIL'),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject request without tenant for non-SAAS/LOGISTICS roles', () => {
    mockRequest.user = {
      id: 'user-id',
      role: 'OWNER',
    } as any;
    mockRequest.tenant = undefined;

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Tenant is required',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow ON_DEMAND tenant for ON_DEMAND requirement', () => {
    const onDemandMiddleware = requireTenantType(['ON_DEMAND']);
    mockRequest.user = {
      id: 'user-id',
      role: 'OWNER',
    } as any;
    mockRequest.tenant = {
      id: 'tenant-id',
      type: 'ON_DEMAND',
    } as any;

    onDemandMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow both RETAIL and ON_DEMAND for multiple types', () => {
    const multiTypeMiddleware = requireTenantType(['RETAIL', 'ON_DEMAND']);
    mockRequest.user = {
      id: 'user-id',
      role: 'OWNER',
    } as any;
    mockRequest.tenant = {
      id: 'tenant-id',
      type: 'RETAIL',
    } as any;

    multiTypeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});

