/**
 * Tests unitarios para CreateLogisticsProviderUseCase
 */

import { CreateLogisticsProviderUseCase } from '../../application/use-cases/CreateLogisticsProviderUseCase';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';

describe('CreateLogisticsProviderUseCase', () => {
  let useCase: CreateLogisticsProviderUseCase;
  let mockRepository: jest.Mocked<ILogisticsProviderRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new CreateLogisticsProviderUseCase(mockRepository);
  });

  it('should create a logistics provider', async () => {
    const dto = {
      company_name: 'Test Logistics',
      tax_id: 'TAX123',
      representative_name: 'John Doe',
      representative_phone: '+50212345678',
      representative_document: 'DOC123',
    };

    const provider = new LogisticsProvider(
      'provider-id',
      null,
      dto.company_name,
      dto.tax_id,
      dto.representative_name,
      dto.representative_phone,
      dto.representative_document,
      'PENDING',
      null,
      null,
      0,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(provider);

    const result = await useCase.execute(dto);

    expect(result).toEqual(provider);
    expect(mockRepository.create).toHaveBeenCalledWith({
      tenant_id: undefined,
      company_name: dto.company_name,
      tax_id: dto.tax_id,
      representative_name: dto.representative_name,
      representative_phone: dto.representative_phone,
      representative_document: dto.representative_document,
      verification_status: undefined,
      verification_documents: undefined,
      status: undefined,
    });
  });
});

