/**
 * Tests unitarios para VerifyEmailUseCase
 */

import { VerifyEmailUseCase } from '../../application/use-cases/VerifyEmailUseCase';
import { AuthService } from '../../application/services/AuthService';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      verifyEmail: jest.fn(),
    } as any;

    useCase = new VerifyEmailUseCase(mockAuthService);
  });

  it('should call authService.verifyEmail with token', async () => {
    const token = 'verification-token-123';
    mockAuthService.verifyEmail.mockResolvedValue();

    await useCase.execute(token);

    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(token);
  });
});

