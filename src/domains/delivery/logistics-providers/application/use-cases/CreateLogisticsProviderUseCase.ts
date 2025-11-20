/**
 * Use Case: Crear LogisticsProvider
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';
import { CreateLogisticsProviderDto } from '../dto/CreateLogisticsProviderDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateLogisticsProviderUseCase {
  constructor(@inject(TYPES.ILogisticsProviderRepository) private repository: ILogisticsProviderRepository) {}

  async execute(dto: CreateLogisticsProviderDto): Promise<LogisticsProvider> {
    // Crear provider
    const provider = await this.repository.create({
      tenant_id: dto.tenant_id,
      company_name: dto.company_name,
      tax_id: dto.tax_id,
      representative_name: dto.representative_name,
      representative_phone: dto.representative_phone,
      representative_document: dto.representative_document,
      verification_status: dto.verification_status,
      verification_documents: dto.verification_documents,
      status: dto.status,
    });

    return provider;
  }
}

