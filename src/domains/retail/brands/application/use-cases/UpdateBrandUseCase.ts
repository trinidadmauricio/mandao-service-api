/**
 * Use Case: Actualizar Brand
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBrandRepository } from '../../domain/repositories/IBrandRepository';
import { Brand } from '../../domain/entities/Brand';
import { UpdateBrandDto } from '../dto/CreateBrandDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateBrandUseCase {
  constructor(@inject(TYPES.IBrandRepository) private repository: IBrandRepository) {}

  async execute(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Brand not found');
    }

    // Si se actualiza el slug, verificar que no esté duplicado
    if (dto.slug && dto.slug !== existing.slug) {
      const duplicate = await this.repository.findBySlug(existing.tenant_id, dto.slug);
      if (duplicate) {
        throw new Error('Brand with this slug already exists');
      }
    }

    return await this.repository.update(id, {
      name: dto.name,
      slug: dto.slug,
      logo_url: dto.logo_url,
      description: dto.description,
      is_active: dto.is_active,
    });
  }
}

