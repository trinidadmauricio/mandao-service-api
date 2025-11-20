/**
 * Tests unitarios para CreateOAuthClientUseCase
 */

import { CreateOAuthClientUseCase } from '../../application/use-cases/CreateOAuthClientUseCase';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { OAuthClient } from '../../domain/entities/OAuthClient';

describe('CreateOAuthClientUseCase', () => {
  let useCase: CreateOAuthClientUseCase;
  let mockRepository: jest.Mocked<IOAuthClientRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByClientId: jest.fn(),
      findByTenantId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateOAuthClientUseCase(mockRepository);
  });

  it('should create OAuth client with generated credentials', async () => {
    const dto = {
      name: 'Test Client',
      redirect_uris: ['http://localhost:3000/callback'],
      grant_types: ['authorization_code', 'refresh_token'] as ('authorization_code' | 'refresh_token' | 'client_credentials')[],
      scope: 'read write',
      is_confidential: true,
    };

    const client = new OAuthClient(
      'client-id',
      null,
      'client_abc123',
      'hashed-secret',
      'Test Client',
      ['http://localhost:3000/callback'],
      ['authorization_code', 'refresh_token'],
      'read write',
      true,
      true,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(client);

    const result = await useCase.execute(dto);

    expect(result).toHaveProperty('client');
    expect(result).toHaveProperty('client_secret');
    expect(result.client_secret).toBeTruthy();
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Client',
        redirect_uris: ['http://localhost:3000/callback'],
        grant_types: ['authorization_code', 'refresh_token'],
        scope: 'read write',
        is_confidential: true,
        client_id: expect.any(String),
        client_secret_hash: expect.any(String),
      })
    );
  });
});

