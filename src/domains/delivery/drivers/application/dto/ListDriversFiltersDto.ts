/**
 * DTO para filtros de listado de Drivers
 */

import { z } from 'zod';

export const listDriversFiltersSchema = z.object({
  search: z.string().optional(),
  availability_status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE', 'SUSPENDED']).optional(),
  work_type: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE']).optional(),
  logistics_provider_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ListDriversFiltersDto = z.infer<typeof listDriversFiltersSchema>;

