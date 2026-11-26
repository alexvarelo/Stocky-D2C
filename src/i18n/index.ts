import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from './languages';

// Every src/locales/<lang>/<namespace>.json is bundled; namespaces are the file names.
const files = import.meta.glob<{ default: Record<string, unknown> }>('../locales/*/*.json', {
  eager: true,
});

const resources: Record<string, Record<string, Record<string, unknown>>> = {};
for (const [path, mod] of Object.entries(files)) {
  const match = path.match(/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, lng, ns] = match;
  resources[lng] ??= {};
  resources[lng][ns] = mod.default;
}

export const NAMESPACES = Object.keys(resources[DEFAULT_LANGUAGE] ?? {});

const syncHtmlLang = (lng: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng.split('-')[0];
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: NAMESPACES,
    defaultNS: 'common',
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    nonExplicitSupportedLngs: true, // es-MX, es-419… → es
    load: 'languageOnly',
    detection: {
      // A saved choice wins; otherwise the browser's languages; otherwise English.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      // Only an explicit choice is stored (see useLanguage), so a detected
      // language never hides the one saved on the user's account.
      caches: [],
    },
    interpolation: { escapeValue: false }, // React escapes already
    returnNull: false,
  });

syncHtmlLang(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
