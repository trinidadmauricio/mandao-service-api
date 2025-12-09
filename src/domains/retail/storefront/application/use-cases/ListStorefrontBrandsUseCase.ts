/**
 * Use Case: Listar marcas públicas para Storefront
 * 
 * Retorna marcas activas
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { TYPES } from '../../../../../config/types';

export interface ListStorefrontBrandsParams {
  tenant_id: string;
}

export interface StorefrontBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
}

@injectable()
export class ListStorefrontBrandsUseCase {
  constructor(@inject(TYPES.IBrandRepository) private brandRepository: IBrandRepository) {}

  async execute(params: ListStorefrontBrandsParams): Promise<StorefrontBrand[]> {
    const { tenant_id } = params;

    // Obtener todas las marcas del tenant
    const allBrands = await this.brandRepository.findAll(tenant_id);
    
    // Filtrar solo las activas
    const activeBrands = allBrands.filter((brand) => brand.is_active);

    return activeBrands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url,
      description: brand.description,
    }));
  }
}

