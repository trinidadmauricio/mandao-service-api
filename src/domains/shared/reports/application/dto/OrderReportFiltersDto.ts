/**
 * DTO para filtros de reporte de órdenes
 */

import { z } from 'zod';

export const orderReportFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED']).optional(),
  order_type: z.enum(['RETAIL', 'ON_DEMAND']).optional(),
  currency: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  branch_id: z.string().uuid().optional(),
  driver_id: z.string().uuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(1000).default(50),
});

export type OrderReportFiltersDto = z.infer<typeof orderReportFiltersSchema>;

