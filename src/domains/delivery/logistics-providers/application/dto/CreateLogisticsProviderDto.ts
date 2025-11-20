/**
 * DTOs para LogisticsProvider
 */

import { z } from 'zod';

export const createLogisticsProviderSchema = z.object({
  tenant_id: z.string().uuid().optional().nullable(),
  company_name: z.string().min(1).max(255),
  tax_id: z.string().min(1).max(50),
  representative_name: z.string().min(1).max(255),
  representative_phone: z.string().min(1).max(50),
  representative_document: z.string().min(1).max(50),
  verification_status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  verification_documents: z.record(z.unknown()).optional().nullable(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']).optional(),
});

export const updateLogisticsProviderSchema = z.object({
  company_name: z.string().min(1).max(255).optional(),
  tax_id: z.string().min(1).max(50).optional(),
  representative_name: z.string().min(1).max(255).optional(),
  representative_phone: z.string().min(1).max(50).optional(),
  representative_document: z.string().min(1).max(50).optional(),
  verification_status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  verification_documents: z.record(z.unknown()).optional().nullable(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']).optional(),
});

export type CreateLogisticsProviderDto = z.infer<typeof createLogisticsProviderSchema>;
export type UpdateLogisticsProviderDto = z.infer<typeof updateLogisticsProviderSchema>;

