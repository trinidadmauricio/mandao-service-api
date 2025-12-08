/**
 * DTO para crear User
 */

import { z } from 'zod';
import { UserRole, USER_ROLE_VALUES } from '../../../../../shared/constants/permissions';

export const createUserSchema = z
  .object({
    tenant_id: z.string().uuid().nullable().optional(),
    email: z.string().email(),
    password: z.string().min(8).max(255),
    role: z.enum(USER_ROLE_VALUES),
    first_name: z.string().min(1).max(255),
    last_name: z.string().min(1).max(255),
    phone: z.string().max(20).nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    logistics_provider_id: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) => {
      // Si el rol es SUPERVISOR o DRIVER, logistics_provider_id es requerido
      if (
        (data.role === UserRole.SUPERVISOR || data.role === UserRole.DRIVER) &&
        !data.logistics_provider_id
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'SUPERVISOR and DRIVER roles require logistics_provider_id',
      path: ['logistics_provider_id'],
    }
  );

export type CreateUserDto = z.infer<typeof createUserSchema>;
