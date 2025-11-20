/**
 * Servicio para manejo de monedas
 */

import currency from 'currency.js';
import { logger } from '../../../shared/utils/logger';

export type CurrencyCode = 'USD' | 'EUR' | 'MXN' | 'GTQ' | 'CRC' | 'PAB';

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'MXN', 'GTQ', 'CRC', 'PAB'];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  MXN: '$',
  GTQ: 'Q',
  CRC: '₡',
  PAB: 'B/.',
};

export class CurrencyService {
  /**
   * Valida que una currency sea soportada
   */
  isValidCurrency(currencyCode: string): currencyCode is CurrencyCode {
    return SUPPORTED_CURRENCIES.includes(currencyCode as CurrencyCode);
  }

  /**
   * Formatea un monto con su símbolo de moneda
   */
  format(amount: number, currencyCode: CurrencyCode): string {
    if (!this.isValidCurrency(currencyCode)) {
      logger.warn(`Invalid currency code: ${currencyCode}, using USD`);
      currencyCode = 'USD';
    }

    const symbol = CURRENCY_SYMBOLS[currencyCode];
    return currency(amount, { symbol, precision: 2 }).format();
  }

  /**
   * Convierte un string a número de moneda
   */
  parse(amount: string | number, _currencyCode: CurrencyCode = 'USD'): number {
    if (typeof amount === 'number') {
      return amount;
    }

    const parsed = currency(amount).value;
    return parsed || 0;
  }

  /**
   * Valida que dos monedas sean compatibles
   */
  areCompatible(currency1: string, currency2: string): boolean {
    return currency1 === currency2;
  }

  /**
   * Obtiene el símbolo de una moneda
   */
  getSymbol(currencyCode: CurrencyCode): string {
    return CURRENCY_SYMBOLS[currencyCode] || '$';
  }
}

export const currencyService = new CurrencyService();
