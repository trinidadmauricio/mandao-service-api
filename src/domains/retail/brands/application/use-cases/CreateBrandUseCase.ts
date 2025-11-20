/**
 * Use Case: Crear Brand
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBrandRepository } from '../../domain/repositories/IBrandRepository';
import { Brand } from '../../domain/entities/Brand';
import { CreateBrandDto } from '../dto/CreateBrandDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateBrandUseCase {
  constructor(@inject(TYPES.IBrandRepository) private repository: IBrandRepository) {}

  async execute(dto: CreateBrandDto): Promise<Brand> {
    // Verificar que el slug no esté duplicado
    const existing = await this.repository.findBySlug(dto.tenant_id, dto.slug);
    if (existing) {
      throw new Error('Brand with this slug already exists');
    }

    const brand = await this.repository.create({
      tenant_id: dto.tenant_id,
      name: dto.name,
      slug: dto.slug,
      logo_url: dto.logo_url,
      description: dto.description,
      is_active: dto.is_active,
    });

    return brand;
  }
}

