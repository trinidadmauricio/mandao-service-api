/**
 * DTO para filtros de listado de Users
 */

import { z } from 'zod';
import { USER_ROLE_VALUES } from '../../../../../shared/constants/permissions';

export const listUsersFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  logistics_provider_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ListUsersFiltersDto = z.infer<typeof listUsersFiltersSchema>;

