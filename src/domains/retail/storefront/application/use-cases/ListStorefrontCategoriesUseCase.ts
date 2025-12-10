/**
 * Use Case: Listar categorías públicas para Storefront
 *
 * Retorna categorías activas con jerarquía parent/child
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { TYPES } from '../../../../../config/types';

export interface ListStorefrontCategoriesParams {
  tenant_id: string;
  include_children?: boolean;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  children?: StorefrontCategory[];
  product_count?: number;
}

@injectable()
export class ListStorefrontCategoriesUseCase {
  constructor(@inject(TYPES.ICategoryRepository) private categoryRepository: ICategoryRepository) {}

  async execute(params: ListStorefrontCategoriesParams): Promise<StorefrontCategory[]> {
    const { tenant_id, include_children = true } = params;

    // Obtener todas las categorías activas del tenant
    const allCategories = await this.categoryRepository.findAll(tenant_id);
    const activeCategories = allCategories.filter((cat) => cat.is_active);

    // Construir árbol de categorías
    const categoryMap = new Map<string, StorefrontCategory>();
    const rootCategories: StorefrontCategory[] = [];

    // Primero, crear todos los nodos
    for (const category of activeCategories) {
      const storefrontCategory: StorefrontCategory = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url,
        parent_id: category.parent_id,
      };

      if (include_children) {
        storefrontCategory.children = [];
      }

      categoryMap.set(category.id, storefrontCategory);
    }

    // Luego, construir la jerarquía
    for (const category of activeCategories) {
      const storefrontCategory = categoryMap.get(category.id)!;

      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent && include_children) {
          parent.children!.push(storefrontCategory);
        }
      } else {
        rootCategories.push(storefrontCategory);
      }
    }

    // Si no se incluyen children, retornar todas las categorías planas
    if (!include_children) {
      return Array.from(categoryMap.values());
    }

    // Ordenar por display_order
    const sortByDisplayOrder = (categories: StorefrontCategory[]): StorefrontCategory[] => {
      return categories.sort((a, b) => {
        const catA = activeCategories.find((c) => c.id === a.id);
        const catB = activeCategories.find((c) => c.id === b.id);
        return (catA?.display_order || 0) - (catB?.display_order || 0);
      });
    };

    const sortedRoot = sortByDisplayOrder(rootCategories);

    // Ordenar recursivamente los children
    const sortRecursive = (cats: StorefrontCategory[]): void => {
      for (const cat of cats) {
        if (cat.children && cat.children.length > 0) {
          cat.children = sortByDisplayOrder(cat.children);
          sortRecursive(cat.children);
        }
      }
    };

    sortRecursive(sortedRoot);

    return sortedRoot;
  }
}
