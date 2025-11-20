/**
 * Use Case: Listar productos para Storefront
 * 
 * Retorna productos con traducciones y precios en currency solicitada
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { CurrencyService } from '../../../../shared/currency/CurrencyService';
import { TYPES } from '../../../../../config/types';

export interface ListStorefrontProductsParams {
  tenant_id: string;
  category_id?: string;
  is_active?: boolean;
  locale?: string;
  currency?: string;
  page?: number;
  limit?: number;
}

export interface StorefrontProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  brand: {
    id: string;
    name: string;
  } | null;
  selling_price: number;
  compare_at_price: number | null;
  currency: string;
  featured_image_url: string | null;
  is_featured: boolean;
  has_variants: boolean;
  variants_count: number;
}

@injectable()
export class ListStorefrontProductsUseCase {
  constructor(
    @inject(TYPES.IProductRepository) private productRepository: IProductRepository,
    @inject(TYPES.IProductVariantRepository) private variantRepository: IProductVariantRepository,
    @inject(TYPES.ICategoryRepository) private categoryRepository: ICategoryRepository,
    @inject(TYPES.IBrandRepository) private brandRepository: IBrandRepository,
    @inject(TYPES.CurrencyService) private currencyService: CurrencyService
  ) {}

  async execute(params: ListStorefrontProductsParams): Promise<StorefrontProduct[]> {
    const products = await this.productRepository.findAll(
      params.tenant_id,
      params.category_id,
      params.is_active
    );

    const locale = params.locale || 'es';
    const currency = params.currency || 'USD';

    const result: StorefrontProduct[] = [];

    for (const product of products) {
      // Obtener traducciones
      const name = this.getTranslation(product.name_translations, locale, product.name);
      const description = product.description_translations
        ? this.getTranslation(product.description_translations, locale, product.description)
        : product.description;

      // Obtener categoría
      let category = null;
      if (product.category_id) {
        const cat = await this.categoryRepository.findById(product.category_id);
        if (cat) {
          category = {
            id: cat.id,
            name: cat.name,
          };
        }
      }

      // Obtener marca
      let brand = null;
      if (product.brand_id) {
        const br = await this.brandRepository.findById(product.brand_id);
        if (br) {
          brand = {
            id: br.id,
            name: br.name,
          };
        }
      }

      // Convertir precio a currency solicitada (simplificado - en producción usar servicio de conversión)
      let selling_price = Number(product.selling_price);
      let compare_at_price = product.compare_at_price ? Number(product.compare_at_price) : null;

      if (product.currency !== currency) {
        // Por ahora, solo validamos que la currency sea compatible
        // En producción, aquí se haría la conversión real
        if (!this.currencyService.areCompatible(product.currency, currency)) {
          continue; // Omitir productos con currency incompatible
        }
      }

      // Contar variants
      const variants = await this.variantRepository.findByProductId(product.id);
      const variants_count = variants.filter((v) => v.is_active).length;

      result.push({
        id: product.id,
        sku: product.sku,
        name,
        description,
        category,
        brand,
        selling_price,
        compare_at_price,
        currency,
        featured_image_url: product.featured_image_url,
        is_featured: product.is_featured,
        has_variants: product.has_variants,
        variants_count,
      });
    }

    // Aplicar paginación
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return result.slice(start, end);
  }

  private getTranslation(
    translations: Record<string, string> | null,
    locale: string,
    fallback: string | null
  ): string {
    if (!translations) {
      return fallback || '';
    }
    return translations[locale] || translations['es'] || translations['en'] || fallback || '';
  }
}

