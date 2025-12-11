/**
 * DTO para registro de device token
 */

import { z } from 'zod';

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  platform: z.enum(['ios', 'android', 'web']),
  device_info: z.record(z.unknown()).optional(),
});

export type RegisterDeviceTokenDto = z.infer<typeof registerDeviceTokenSchema>;

export const deactivateDeviceTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type DeactivateDeviceTokenDto = z.infer<typeof deactivateDeviceTokenSchema>;

