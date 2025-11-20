/**
 * Use Case: Obtener producto individual para Storefront
 * 
 * Retorna producto con traducciones, variants y precios en currency solicitada
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { CurrencyService } from '../../../../shared/currency/CurrencyService';
import { TYPES } from '../../../../../config/types';

export interface GetStorefrontProductParams {
  product_id: string;
  tenant_id: string;
  locale?: string;
  currency?: string;
}

export interface StorefrontProductDetail {
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
  images: Record<string, unknown>;
  featured_image_url: string | null;
  is_featured: boolean;
  has_variants: boolean;
  variants: Array<{
    id: string;
    sku: string;
    option1_name: string | null;
    option1_value: string | null;
    option2_name: string | null;
    option2_value: string | null;
    option3_name: string | null;
    option3_value: string | null;
    price_adjustment: number;
    currency: string;
    image_url: string | null;
    is_active: boolean;
  }>;
}

@injectable()
export class GetStorefrontProductUseCase {
  constructor(
    @inject(TYPES.IProductRepository) private productRepository: IProductRepository,
    @inject(TYPES.IProductVariantRepository) private variantRepository: IProductVariantRepository,
    @inject(TYPES.ICategoryRepository) private categoryRepository: ICategoryRepository,
    @inject(TYPES.IBrandRepository) private brandRepository: IBrandRepository,
    @inject(TYPES.CurrencyService) private currencyService: CurrencyService
  ) {}

  async execute(params: GetStorefrontProductParams): Promise<StorefrontProductDetail> {
    const product = await this.productRepository.findById(params.product_id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.tenant_id !== params.tenant_id) {
      throw new Error('Product belongs to different tenant');
    }

    const locale = params.locale || 'es';
    const currency = params.currency || 'USD';

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

    // Convertir precio a currency solicitada
    let selling_price = Number(product.selling_price);
    let compare_at_price = product.compare_at_price ? Number(product.compare_at_price) : null;

    if (product.currency !== currency) {
      if (!this.currencyService.areCompatible(product.currency, currency)) {
        throw new Error(`Currency ${currency} is not compatible with product currency ${product.currency}`);
      }
    }

    // Obtener variants
    const variants = await this.variantRepository.findByProductId(product.id);
    const activeVariants = variants.filter((v) => v.is_active);

    return {
      id: product.id,
      sku: product.sku,
      name,
      description,
      category,
      brand,
      selling_price,
      compare_at_price,
      currency,
      images: product.images,
      featured_image_url: product.featured_image_url,
      is_featured: product.is_featured,
      has_variants: product.has_variants,
      variants: activeVariants.map((v) => ({
        id: v.id,
        sku: v.sku,
        option1_name: v.option1_name,
        option1_value: v.option1_value,
        option2_name: v.option2_name,
        option2_value: v.option2_value,
        option3_name: v.option3_name,
        option3_value: v.option3_value,
        price_adjustment: Number(v.price_adjustment),
        currency: v.currency,
        image_url: v.image_url,
        is_active: v.is_active,
      })),
    };
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

