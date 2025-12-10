/**
 * Use Case: Obtener configuración pública del Storefront
 * 
 * Retorna theme_config, seo_config, business_hours del Storefront
 * y currency, locale del Tenant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface GetStorefrontConfigParams {
  tenant_id: string;
}

export interface StorefrontConfig {
  // Storefront data
  storefront: {
    id: string;
    subdomain: string;
    custom_domain: string | null;
    is_active: boolean;
    theme_config: Record<string, unknown>;
    seo_config: Record<string, unknown> | null;
    business_hours: Record<string, unknown> | null;
    about_us: string | null;
    terms: string | null;
    privacy_policy: string | null;
  };
  // Tenant data
  tenant: {
    id: string;
    name: string;
    default_currency: string;
    default_locale: string;
  };
}

@injectable()
export class GetStorefrontConfigUseCase {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async execute(params: GetStorefrontConfigParams): Promise<StorefrontConfig> {
    // Obtener Storefront
    const storefront = await this.prisma.storefront.findUnique({
      where: { tenant_id: params.tenant_id },
    });

    if (!storefront) {
      throw new Error('Storefront not found for tenant');
    }

    if (!storefront.is_active) {
      throw new Error('Storefront is not active');
    }

    // Obtener Tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: params.tenant_id },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return {
      storefront: {
        id: storefront.id,
        subdomain: storefront.subdomain,
        custom_domain: storefront.custom_domain,
        is_active: storefront.is_active,
        theme_config: storefront.theme_config as Record<string, unknown>,
        seo_config: storefront.seo_config as Record<string, unknown> | null,
        business_hours: storefront.business_hours as Record<string, unknown> | null,
        about_us: storefront.about_us,
        terms: storefront.terms,
        privacy_policy: storefront.privacy_policy,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        default_currency: tenant.default_currency,
        default_locale: tenant.default_locale,
      },
    };
  }
}

