import type { Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import i18n from '@/i18n';
import { DEFAULT_LANGUAGE, INTL_LOCALES, isAppLanguage, type AppLanguage } from '@/i18n/languages';

/** The active UI language, narrowed to one we ship. */
export const getLanguage = (): AppLanguage => {
  const lng = i18n.resolvedLanguage ?? i18n.language;
  return isAppLanguage(lng) ? lng : DEFAULT_LANGUAGE;
};

/** BCP 47 locale for Intl.NumberFormat / Intl.DateTimeFormat / toLocale*String. */
export const getLocale = (): string => INTL_LOCALES[getLanguage()];

const DATE_FNS_LOCALES: Record<AppLanguage, Locale> = { en: enUS, es };

/** date-fns locale for the active UI language. */
export const getDateFnsLocale = (): Locale => DATE_FNS_LOCALES[getLanguage()];
