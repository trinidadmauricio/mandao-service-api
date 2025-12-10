/**
 * Use Case: Actualizar configuración del Storefront
 * 
 * Actualiza el theme_config del storefront, específicamente el template
 * Preserva los demás campos del theme_config existente
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { TYPES } from '../../../../../config/types';
import { UpdateStorefrontDto } from '../dto/UpdateStorefrontDto';

export interface UpdateStorefrontParams {
  tenant_id: string;
  theme_config: UpdateStorefrontDto['theme_config'];
}

@injectable()
export class UpdateStorefrontUseCase {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async execute(params: UpdateStorefrontParams) {
    // Obtener Storefront existente
    const storefront = await this.prisma.storefront.findUnique({
      where: { tenant_id: params.tenant_id },
    });

    if (!storefront) {
      throw new Error('Storefront not found for tenant');
    }

    // Obtener theme_config actual
    const currentThemeConfig = (storefront.theme_config as Record<string, unknown>) || {};

    // Actualizar theme_config preservando campos existentes
    const updatedThemeConfig = {
      ...currentThemeConfig,
      ...params.theme_config,
    };

    // Actualizar storefront
    const updated = await this.prisma.storefront.update({
      where: { tenant_id: params.tenant_id },
      data: {
        theme_config: updatedThemeConfig as Prisma.InputJsonValue,
      },
    });

    return {
      id: updated.id,
      tenant_id: updated.tenant_id,
      subdomain: updated.subdomain,
      custom_domain: updated.custom_domain,
      is_active: updated.is_active,
      theme_config: updated.theme_config as Record<string, unknown>,
      seo_config: updated.seo_config as Record<string, unknown> | null,
      business_hours: updated.business_hours as Record<string, unknown> | null,
      about_us: updated.about_us,
      terms: updated.terms,
      privacy_policy: updated.privacy_policy,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}

