/**
 * Use Case: Actualizar Category
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { UpdateCategoryDto } from '../dto/CreateCategoryDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateCategoryUseCase {
  constructor(@inject(TYPES.ICategoryRepository) private repository: ICategoryRepository) {}

  async execute(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Category not found');
    }

    // Si se actualiza el slug, verificar que no esté duplicado
    if (dto.slug && dto.slug !== existing.slug) {
      const duplicate = await this.repository.findBySlug(existing.tenant_id, dto.slug);
      if (duplicate) {
        throw new Error('Category with this slug already exists');
      }
    }

    // Si se actualiza parent_id, verificar que existe y no crea ciclo
    if (dto.parent_id !== undefined && dto.parent_id !== existing.parent_id) {
      if (dto.parent_id) {
        const parent = await this.repository.findById(dto.parent_id);
        if (!parent) {
          throw new Error('Parent category not found');
        }
        if (parent.tenant_id !== existing.tenant_id) {
          throw new Error('Parent category belongs to different tenant');
        }
        // Verificar que no se crea un ciclo (el parent no puede ser hijo de esta categoría)
        if (dto.parent_id === id) {
          throw new Error('Category cannot be its own parent');
        }
      }
    }

    return await this.repository.update(id, {
      parent_id: dto.parent_id,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      image_url: dto.image_url,
      display_order: dto.display_order,
      is_active: dto.is_active,
    });
  }
}

