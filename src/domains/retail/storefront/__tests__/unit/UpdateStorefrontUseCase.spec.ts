/**
 * Tests unitarios para UpdateStorefrontUseCase
 */

import { UpdateStorefrontUseCase } from '../../application/use-cases/UpdateStorefrontUseCase';

describe('UpdateStorefrontUseCase', () => {
  let useCase: UpdateStorefrontUseCase;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      storefront: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    useCase = new UpdateStorefrontUseCase(mockPrisma);
  });

  it('should update storefront theme_config template successfully', async () => {
    const existingStorefront = {
      id: 'storefront-id',
      tenant_id: 'tenant-id',
      subdomain: 'test-store',
      custom_domain: null,
      is_active: true,
      theme_config: { template: 'classic', primary_color: '#000000' },
      seo_config: null,
      business_hours: null,
      about_us: null,
      terms: null,
      privacy_policy: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedStorefront = {
      ...existingStorefront,
      theme_config: { template: 'modern', primary_color: '#000000' },
      updated_at: new Date(),
    };

    mockPrisma.storefront.findUnique.mockResolvedValue(existingStorefront as any);
    mockPrisma.storefront.update.mockResolvedValue(updatedStorefront as any);

    const params = {
      tenant_id: 'tenant-id',
      theme_config: {
        template: 'modern' as const,
      },
    };

    const result = await useCase.execute(params);

    expect(mockPrisma.storefront.findUnique).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-id' },
    });
    expect(mockPrisma.storefront.update).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-id' },
      data: {
        theme_config: {
          template: 'modern',
          primary_color: '#000000',
        },
      },
    });
    expect(result.theme_config.template).toBe('modern');
  });

  it('should preserve existing theme_config fields when updating template', async () => {
    const existingStorefront = {
      id: 'storefront-id',
      tenant_id: 'tenant-id',
      subdomain: 'test-store',
      custom_domain: null,
      is_active: true,
      theme_config: {
        template: 'classic',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        font_family: 'Inter',
      },
      seo_config: null,
      business_hours: null,
      about_us: null,
      terms: null,
      privacy_policy: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedStorefront = {
      ...existingStorefront,
      theme_config: {
        template: 'minimal',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        font_family: 'Inter',
      },
      updated_at: new Date(),
    };

    mockPrisma.storefront.findUnique.mockResolvedValue(existingStorefront as any);
    mockPrisma.storefront.update.mockResolvedValue(updatedStorefront as any);

    const params = {
      tenant_id: 'tenant-id',
      theme_config: {
        template: 'minimal' as const,
      },
    };

    const result = await useCase.execute(params);

    expect(mockPrisma.storefront.update).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-id' },
      data: {
        theme_config: {
          template: 'minimal',
          primary_color: '#000000',
          secondary_color: '#ffffff',
          font_family: 'Inter',
        },
      },
    });
    expect(result.theme_config.template).toBe('minimal');
    expect(result.theme_config.primary_color).toBe('#000000');
    expect(result.theme_config.secondary_color).toBe('#ffffff');
  });

  it('should throw error if storefront not found', async () => {
    mockPrisma.storefront.findUnique.mockResolvedValue(null);

    const params = {
      tenant_id: 'tenant-id',
      theme_config: {
        template: 'modern' as const,
      },
    };

    await expect(useCase.execute(params)).rejects.toThrow(
      'Storefront not found for tenant'
    );
  });

  it('should throw error if template is invalid', async () => {
    const params = {
      tenant_id: 'tenant-id',
      theme_config: {
        template: 'invalid-template' as any,
      },
    };

    // La validación del DTO debería rechazar esto antes de llegar al UseCase
    // Pero si llega, el UseCase debería manejarlo
    await expect(useCase.execute(params)).rejects.toThrow();
  });

  it('should update to fashion template successfully', async () => {
    const existingStorefront = {
      id: 'storefront-id',
      tenant_id: 'tenant-id',
      subdomain: 'test-store',
      custom_domain: null,
      is_active: true,
      theme_config: { template: 'classic' },
      seo_config: null,
      business_hours: null,
      about_us: null,
      terms: null,
      privacy_policy: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedStorefront = {
      ...existingStorefront,
      theme_config: { template: 'fashion' },
      updated_at: new Date(),
    };

    mockPrisma.storefront.findUnique.mockResolvedValue(existingStorefront as any);
    mockPrisma.storefront.update.mockResolvedValue(updatedStorefront as any);

    const params = {
      tenant_id: 'tenant-id',
      theme_config: {
        template: 'fashion' as const,
      },
    };

    const result = await useCase.execute(params);

    expect(result.theme_config.template).toBe('fashion');
  });
});

