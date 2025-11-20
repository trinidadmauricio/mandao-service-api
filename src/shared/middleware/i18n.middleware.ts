/**
 * Middleware para i18n
 * Detecta el locale del Accept-Language header
 */

import { Request, Response, NextFunction } from 'express';
import { i18nService } from '../../domains/shared/i18n/I18nService';

export const i18nMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  // Inicializar i18n si no está inicializado
  await i18nService.initialize();

  // Obtener locale del tenant si está disponible, o del header
  const locale = i18nService.getLocale(req, req.tenant?.default_locale);
  req.locale = locale;

  // Cambiar idioma de i18next
  i18nService.changeLanguage(locale);

  next();
};
