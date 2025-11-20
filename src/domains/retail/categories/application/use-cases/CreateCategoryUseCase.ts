/**
 * Use Case: Crear Category
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { CreateCategoryDto } from '../dto/CreateCategoryDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateCategoryUseCase {
  constructor(@inject(TYPES.ICategoryRepository) private repository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDto): Promise<Category> {
    // Verificar que el slug no esté duplicado
    const existing = await this.repository.findBySlug(dto.tenant_id, dto.slug);
    if (existing) {
      throw new Error('Category with this slug already exists');
    }

    // Si tiene parent_id, verificar que existe
    if (dto.parent_id) {
      const parent = await this.repository.findById(dto.parent_id);
      if (!parent) {
        throw new Error('Parent category not found');
      }
      if (parent.tenant_id !== dto.tenant_id) {
        throw new Error('Parent category belongs to different tenant');
      }
    }

    const category = await this.repository.create({
      tenant_id: dto.tenant_id,
      parent_id: dto.parent_id,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      image_url: dto.image_url,
      display_order: dto.display_order,
      is_active: dto.is_active,
    });

    return category;
  }
}

