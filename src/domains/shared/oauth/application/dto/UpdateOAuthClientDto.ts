/**
 * DTO para actualizar OAuthClient
 */

import { z } from 'zod';

export const updateOAuthClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  redirect_uris: z.array(z.string().url()).optional(),
  grant_types: z.array(z.enum(['authorization_code', 'client_credentials', 'refresh_token'])).optional(),
  scope: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateOAuthClientDto = z.infer<typeof updateOAuthClientSchema>;

