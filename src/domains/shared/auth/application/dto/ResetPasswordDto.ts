/**
 * DTO para Reset Password
 */

import { z } from 'zod';

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(255),
});

export type ResetPasswordRequestDto = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

