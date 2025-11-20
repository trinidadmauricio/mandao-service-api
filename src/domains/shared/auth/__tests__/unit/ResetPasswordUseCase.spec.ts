/**
 * Tests unitarios para ResetPasswordUseCase
 */

import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { AuthService } from '../../application/services/AuthService';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      resetPassword: jest.fn(),
    } as any;

    useCase = new ResetPasswordUseCase(mockAuthService);
  });

  it('should call authService.resetPassword with token and password', async () => {
    const dto = {
      token: 'reset-token-123',
      password: 'newPassword123',
    };

    mockAuthService.resetPassword.mockResolvedValue();

    await useCase.execute(dto);

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('reset-token-123', 'newPassword123');
  });
});

