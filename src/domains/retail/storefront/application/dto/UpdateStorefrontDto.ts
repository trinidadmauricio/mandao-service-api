/**
 * DTO para actualizar configuración del Storefront
 */

import { z } from 'zod';

const validTemplates = ['classic', 'modern', 'minimal', 'fashion'] as const;

export const updateStorefrontSchema = z.object({
  theme_config: z
    .object({
      template: z.enum(validTemplates, {
        errorMap: () => ({
          message: `Template must be one of: ${validTemplates.join(', ')}`,
        }),
      }),
    })
    .passthrough(), // Permite otros campos en theme_config
});

export type UpdateStorefrontDto = z.infer<typeof updateStorefrontSchema>;

