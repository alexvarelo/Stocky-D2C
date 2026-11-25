export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'stocky-language';

/** BCP 47 locale used for Intl number, currency and date formatting. */
export const INTL_LOCALES: Record<AppLanguage, string> = {
  en: 'en-US',
  es: 'es-ES',
};

/** Each language's own name, so the selector reads the same in any UI language. */
export const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: 'English',
  es: 'Español',
};

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
