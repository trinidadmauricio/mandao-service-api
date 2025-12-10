/**
 * DTOs para CustomerAddress
 */

import { z } from 'zod';

export const updateCustomerAddressSchema = z.object({
  label: z.string().min(1).optional(),
  recipient_name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  street: z.string().min(1).optional(),
  street_line_2: z.string().optional().nullable(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zip_code: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  instructions: z.string().optional().nullable(),
  is_default: z.boolean().optional(),
});

export type UpdateCustomerAddressDto = z.infer<typeof updateCustomerAddressSchema>;

