/**
 * Servicio de internacionalización
 */

import i18next from 'i18next';
import { Request } from 'express';
import { logger } from '../../../shared/utils/logger';

// Importar recursos de traducción
import esTranslations from './locales/es/translation.json';
import enTranslations from './locales/en/translation.json';

class I18nService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await i18next.init({
      lng: 'es', // Idioma por defecto
      fallbackLng: 'es',
      resources: {
        es: {
          translation: esTranslations,
        },
        en: {
          translation: enTranslations,
        },
      },
      interpolation: {
        escapeValue: false,
      },
    });

    this.initialized = true;
    logger.info('I18nService initialized');
  }

  /**
   * Obtiene el locale de la request (Accept-Language header o tenant default)
   */
  getLocale(req: Request, tenantLocale?: string): string {
    // Prioridad: header Accept-Language > tenant default > es
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      const locale = acceptLanguage.split(',')[0].split('-')[0];
      if (['es', 'en'].includes(locale)) {
        return locale;
      }
    }
    return tenantLocale || 'es';
  }

  /**
   * Traduce una key
   */
  t(key: string, options?: Record<string, unknown>): string {
    if (!this.initialized) {
      logger.warn('I18nService not initialized, returning key');
      return key;
    }
    return i18next.t(key, options);
  }

  /**
   * Cambia el idioma actual
   */
  changeLanguage(locale: string): void {
    if (!this.initialized) {
      return;
    }
    i18next.changeLanguage(locale);
  }
}

export const i18nService = new I18nService();
