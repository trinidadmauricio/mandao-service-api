/**
 * Tests unitarios para LoginUseCase
 */

import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { AuthService } from '../../application/services/AuthService';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn(),
    } as any;

    loginUseCase = new LoginUseCase(mockAuthService);
  });

  it('should call authService.login with correct parameters', async () => {
    const credentials = { email: 'test@example.com', password: 'password123' };
    const tenantId = 'tenant-id';
    const expectedResult = {
      access_token: 'token',
      token_type: 'Bearer',
      expires_in: 86400,
      user: {
        id: 'user-id',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'MERCHANT_USER',
        email_verified: true,
      },
    };

    mockAuthService.login.mockResolvedValue(expectedResult);

    const result = await loginUseCase.execute(credentials, tenantId);

    expect(mockAuthService.login).toHaveBeenCalledWith(credentials, tenantId);
    expect(result).toEqual(expectedResult);
  });
});

