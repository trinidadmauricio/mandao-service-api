/**
 * Use Case: Obtener categoría pública por slug para Storefront
 * 
 * Retorna categoría con breadcrumbs
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { TYPES } from '../../../../../config/types';

export interface GetStorefrontCategoryBySlugParams {
  tenant_id: string;
  slug: string;
}

export interface StorefrontCategoryDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  breadcrumbs: Array<{
    name: string;
    slug: string;
  }>;
}

@injectable()
export class GetStorefrontCategoryBySlugUseCase {
  constructor(@inject(TYPES.ICategoryRepository) private categoryRepository: ICategoryRepository) {}

  async execute(params: GetStorefrontCategoryBySlugParams): Promise<StorefrontCategoryDetail> {
    const { tenant_id, slug } = params;

    const category = await this.categoryRepository.findBySlug(tenant_id, slug);

    if (!category) {
      throw new Error('Category not found');
    }

    if (!category.is_active) {
      throw new Error('Category is not active');
    }

    // Construir breadcrumbs
    const breadcrumbs: Array<{ name: string; slug: string }> = [
      { name: 'Home', slug: '/' },
    ];

    // Obtener ancestros recursivamente
    let currentCategory = category;
    const ancestors: Array<{ name: string; slug: string }> = [];

    while (currentCategory.parent_id) {
      const parent = await this.categoryRepository.findById(currentCategory.parent_id);
      if (parent) {
        ancestors.unshift({ name: parent.name, slug: parent.slug });
        currentCategory = parent;
      } else {
        break;
      }
    }

    breadcrumbs.push(...ancestors);
    breadcrumbs.push({ name: category.name, slug: category.slug });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image_url,
      breadcrumbs,
    };
  }
}

