/**
 * Use Case: Actualizar LogisticsProvider
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';
import { UpdateLogisticsProviderDto } from '../dto/CreateLogisticsProviderDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateLogisticsProviderUseCase {
  constructor(@inject(TYPES.ILogisticsProviderRepository) private repository: ILogisticsProviderRepository) {}

  async execute(id: string, dto: UpdateLogisticsProviderDto): Promise<LogisticsProvider> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Logistics provider not found');
    }

    // Actualizar
    return await this.repository.update(id, {
      company_name: dto.company_name,
      tax_id: dto.tax_id,
      representative_name: dto.representative_name,
      representative_phone: dto.representative_phone,
      representative_document: dto.representative_document,
      verification_status: dto.verification_status,
      verification_documents: dto.verification_documents,
      status: dto.status,
    });
  }
}

