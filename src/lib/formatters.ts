import { getLocale } from './locale';

/**
 * Format a number as a currency string in the UI locale (1.234,56 € in Spanish).
 */
export const formatCurrency = (value: number, currency?: string): string => {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: currency ?? 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number (already in percent units, e.g. 12.5) as a percentage string
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat(getLocale(), {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Format a plain number in the UI locale.
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(getLocale(), options).format(value);

/**
 * Format a large amount compactly ($1.2B / 1,2 mil M US$), in the given currency.
 */
export const formatLargeNumber = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency,
    notation: Math.abs(value) >= 1_000 ? 'compact' : 'standard',
    minimumFractionDigits: Math.abs(value) >= 1_000 ? 0 : 2,
    maximumFractionDigits: Math.abs(value) >= 1_000 ? 1 : 2,
  }).format(value);
};

/**
 * Format a date string as a short readable date in the UI locale (Mar 4, 2026 / 4 mar 2026).
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Fixed-decimals number in the UI locale (12.34 / 12,34). Locale-aware toFixed.
 */
export const formatDecimal = (value: number, digits = 2): string =>
  new Intl.NumberFormat(getLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
