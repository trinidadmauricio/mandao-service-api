/**
 * DTO para filtros de listado de Órdenes
 */

import { z } from 'zod';

export const listOrdersFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED']).optional(),
  order_type: z.enum(['RETAIL', 'ON_DEMAND']).optional(),
  driver_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ListOrdersFiltersDto = z.infer<typeof listOrdersFiltersSchema>;

