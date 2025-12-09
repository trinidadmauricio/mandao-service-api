/**
 * DTOs para CustomerAddress
 */

import { z } from 'zod';

export const createCustomerAddressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  recipient_name: z.string().min(1, 'Recipient name is required'),
  phone: z.string().min(1, 'Phone is required'),
  street: z.string().min(1, 'Street is required'),
  street_line_2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  instructions: z.string().optional().nullable(),
  is_default: z.boolean().optional().default(false),
});

export type CreateCustomerAddressDto = z.infer<typeof createCustomerAddressSchema>;

