import { Tenant, User, OAuthClient } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      user?: User;
      oauthClient?: OAuthClient;
      locale?: string;
      currency?: string;
    }
  }
}

// Exportar para asegurar que TypeScript lo reconozca como módulo
export {};

