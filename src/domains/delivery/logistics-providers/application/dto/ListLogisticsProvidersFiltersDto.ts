/**
 * DTO para filtros de listado de LogisticsProviders
 */

import { z } from 'zod';

export const listLogisticsProvidersFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']).optional(),
  verification_status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  is_global: z.boolean().optional(),
});

export type ListLogisticsProvidersFiltersDto = z.infer<typeof listLogisticsProvidersFiltersSchema>;
