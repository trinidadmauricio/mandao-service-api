/**
 * DTO para crear OAuthClient
 */

import { z } from 'zod';

export const createOAuthClientSchema = z.object({
  tenant_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  redirect_uris: z.array(z.string().url()).min(1),
  grant_types: z.array(z.enum(['authorization_code', 'client_credentials', 'refresh_token'])).min(1),
  scope: z.string().default('read write'),
  is_confidential: z.boolean().default(true),
});

export type CreateOAuthClientDto = z.infer<typeof createOAuthClientSchema>;

