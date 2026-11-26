/**
 * date-fns helpers that follow the UI language. Import `format` /
 * `formatDistanceToNow` from here instead of 'date-fns' for anything shown to
 * the user. Numeric patterns such as 'yyyy-MM-dd' are unaffected by the locale.
 */
import {
  format as dfFormat,
  formatDistanceToNow as dfFormatDistanceToNow,
  formatRelative as dfFormatRelative,
} from 'date-fns';
import { getDateFnsLocale } from './locale';

type FormatOptions = Parameters<typeof dfFormat>[2];
type DistanceOptions = Parameters<typeof dfFormatDistanceToNow>[1];
type RelativeOptions = Parameters<typeof dfFormatRelative>[2];

export const format = (date: Date | number | string, pattern: string, options?: FormatOptions) =>
  dfFormat(date, pattern, { locale: getDateFnsLocale(), ...options });

export const formatDistanceToNow = (date: Date | number | string, options?: DistanceOptions) =>
  dfFormatDistanceToNow(date, { locale: getDateFnsLocale(), ...options });

export const formatRelative = (date: Date | number | string, base: Date | number, options?: RelativeOptions) =>
  dfFormatRelative(date, base, { locale: getDateFnsLocale(), ...options });
