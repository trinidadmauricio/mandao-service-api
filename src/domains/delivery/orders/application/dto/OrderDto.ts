/**
 * DTOs para endpoints de Orders
 */

import { z } from 'zod';

// DTO para actualizar estado de orden
export const updateOrderStatusSchema = z.object({
  to_status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED']),
  notes: z.string().optional(),
  cancellation_reason: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

// DTO para asignar driver
export const assignDriverSchema = z.object({
  driver_id: z.string().uuid(),
});

export type AssignDriverDto = z.infer<typeof assignDriverSchema>;

// DTO para cambiar branch
export const changeBranchSchema = z.object({
  branch_id: z.string().uuid(),
});

export type ChangeBranchDto = z.infer<typeof changeBranchSchema>;

// DTO para modificar items
export const orderItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  variant_id: z.string().uuid().optional().nullable(),
  product_snapshot: z.record(z.unknown()),
  quantity: z.number().min(0.001),
  unit_price: z.number().min(0),
  notes: z.string().optional().nullable(),
});

export const modifyItemsSchema = z.object({
  items: z.array(orderItemSchema).min(1),
});

export type ModifyItemsDto = z.infer<typeof modifyItemsSchema>;
export type OrderItemDto = z.infer<typeof orderItemSchema>;

// DTO para recalcular totales
export const recalculateTotalsSchema = z.object({
  tax_rate: z.number().min(0).max(1).optional(),
  discount_amount: z.number().min(0).optional(),
});

export type RecalculateTotalsDto = z.infer<typeof recalculateTotalsSchema>;

// DTO para agregar delivery proof
export const addDeliveryProofSchema = z.object({
  proof_type: z.enum(['SIGNATURE', 'PHOTO', 'CODE', 'NONE']),
  proof_data: z.record(z.unknown()),
  delivered_to_name: z.string().min(1),
  delivered_at: z.coerce.date(),
  driver_notes: z.string().optional(),
});

export type AddDeliveryProofDto = z.infer<typeof addDeliveryProofSchema>;

// DTO para agregar rating
export const addDeliveryRatingSchema = z.object({
  customer_rating: z.number().min(1).max(5),
  driver_rating: z.number().min(1).max(5).optional(),
  customer_comment: z.string().optional(),
  driver_comment: z.string().optional(),
});

export type AddDeliveryRatingDto = z.infer<typeof addDeliveryRatingSchema>;

