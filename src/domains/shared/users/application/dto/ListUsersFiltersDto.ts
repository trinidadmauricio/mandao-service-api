/**
 * DTO para filtros de listado de Users
 */

import { z } from 'zod';

export const listUsersFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['SAAS_ADMIN', 'SAAS_EDITOR', 'OWNER', 'SUPERVISOR', 'MERCHANT_USER', 'LOGISTICS_PROVIDER', 'CUSTOMER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ListUsersFiltersDto = z.infer<typeof listUsersFiltersSchema>;

