/**
 * Tipos relacionados con currency
 */

export type CurrencyCode = 'USD' | 'EUR' | 'MXN' | 'GTQ' | 'CRC' | 'PAB';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface CurrencyConversion {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  convertedAmount: number;
}
