/**
 * Tests unitarios para GetStorefrontConfigUseCase
 */

import { GetStorefrontConfigUseCase } from '../../application/use-cases/GetStorefrontConfigUseCase';

describe('GetStorefrontConfigUseCase', () => {
  let useCase: GetStorefrontConfigUseCase;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      storefront: {
        findUnique: jest.fn(),
      },
      tenant: {
        findUnique: jest.fn(),
      },
    };

    useCase = new GetStorefrontConfigUseCase(mockPrisma);
  });

  it('should get storefront config successfully', async () => {
    const mockStorefront = {
      id: 'storefront-id',
      tenant_id: 'tenant-id',
      subdomain: 'test-store',
      custom_domain: null,
      is_active: true,
      theme_config: { primary_color: '#000000' },
      seo_config: { meta_title: 'Test Store' },
      business_hours: { monday: { open: '09:00', close: '18:00' } },
      about_us: 'About us text',
      terms: 'Terms text',
      privacy_policy: 'Privacy text',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockTenant = {
      id: 'tenant-id',
      slug: 'test-tenant',
      name: 'Test Tenant',
      type: 'RETAIL' as const,
      subscription_plan_id: null,
      subscription_status: 'ACTIVE' as const,
      subscription_expires_at: null,
      default_locale: 'es',
      default_currency: 'USD',
      settings: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPrisma.storefront.findUnique.mockResolvedValue(mockStorefront as any);
    mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant as any);

    const params = {
      tenant_id: 'tenant-id',
    };

    const result = await useCase.execute(params);

    expect(result).toHaveProperty('storefront');
    expect(result).toHaveProperty('tenant');
    expect(result.storefront).toHaveProperty('id', 'storefront-id');
    expect(result.storefront).toHaveProperty('subdomain', 'test-store');
    expect(result.storefront).toHaveProperty('theme_config', { primary_color: '#000000' });
    expect(result.tenant).toHaveProperty('id', 'tenant-id');
    expect(result.tenant).toHaveProperty('default_currency', 'USD');
    expect(result.tenant).toHaveProperty('default_locale', 'es');
  });

  it('should throw error if storefront not found', async () => {
    mockPrisma.storefront.findUnique.mockResolvedValue(null);

    const params = {
      tenant_id: 'tenant-id',
    };

    await expect(useCase.execute(params)).rejects.toThrow('Storefront not found for tenant');
  });

  it('should throw error if storefront is not active', async () => {
    const mockStorefront = {
      id: 'storefront-id',
      tenant_id: 'tenant-id',
      subdomain: 'test-store',
      custom_domain: null,
      is_active: false,
      theme_config: {},
      seo_config: null,
      business_hours: null,
      about_us: null,
      terms: null,
      privacy_policy: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPrisma.storefront.findUnique.mockResolvedValue(mockStorefront as any);

    const params = {
      tenant_id: 'tenant-id',
    };

    await expect(useCase.execute(params)).rejects.toThrow('Storefront is not active');
  });

  it('should throw error if tenant not found', async () => {
    const mockStorefront = {
      id: 'storefront-id',
      tenant_id: 'tenant-id',
      subdomain: 'test-store',
      custom_domain: null,
      is_active: true,
      theme_config: {},
      seo_config: null,
      business_hours: null,
      about_us: null,
      terms: null,
      privacy_policy: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPrisma.storefront.findUnique.mockResolvedValue(mockStorefront as any);
    mockPrisma.tenant.findUnique.mockResolvedValue(null);

    const params = {
      tenant_id: 'tenant-id',
    };

    await expect(useCase.execute(params)).rejects.toThrow('Tenant not found');
  });
});

