/**
 * DTO para filtros de listado de transacciones de pago
 */

import { z } from 'zod';

export const listPaymentTransactionsFiltersSchema = z.object({
  transaction_type: z.enum(['CHARGE', 'REFUND', 'AUTHORIZATION', 'CAPTURE']).optional(),
  payment_method: z.enum(['CARD', 'CASH', 'TRANSFER', 'WALLET']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  order_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ListPaymentTransactionsFiltersDto = z.infer<
  typeof listPaymentTransactionsFiltersSchema
>;
