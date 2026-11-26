import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { useAuth } from '@/lib/auth';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isAppLanguage,
  type AppLanguage,
} from '@/i18n/languages';

const readStoredLanguage = (): AppLanguage | null => {
  try {
    const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isAppLanguage(value) ? value : null;
  } catch {
    return null;
  }
};

const storeLanguage = (lng: AppLanguage) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // Private mode or blocked storage: the choice still applies to this tab.
  }
};

/**
 * Saves the choice on the account too. `user_settings.language` comes from
 * databases/…/20261128120000_user_settings_language.sql; until that migration
 * is applied the write fails and is ignored, so localStorage alone keeps it.
 */
const saveRemoteLanguage = async (userId: string, lng: AppLanguage) => {
  const row = { user_id: userId, language: lng } as TablesInsert<'user_settings'>;
  const { error } = await supabase.from('user_settings').upsert(row, { onConflict: 'user_id' });
  if (error && import.meta.env.DEV) {
    console.info('[i18n] language not saved to user_settings:', error.message);
  }
};

/** Current UI language and a setter that persists it. */
export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const language: AppLanguage = isAppLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;

  const setLanguage = useCallback(
    (lng: AppLanguage) => {
      storeLanguage(lng);
      void i18n.changeLanguage(lng);
      if (user?.id) void saveRemoteLanguage(user.id, lng);
    },
    [i18n, user?.id],
  );

  return { language, setLanguage };
};

/**
 * On sign-in, adopts the language saved on the account when this browser has
 * no explicit choice yet (e.g. a new device). Renders nothing.
 */
export const LanguageSync = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id || readStoredLanguage()) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled || error || !data) return;
      const remote = (data as { language?: unknown }).language;
      if (isAppLanguage(remote)) {
        storeLanguage(remote);
        if (remote !== i18n.resolvedLanguage) void i18n.changeLanguage(remote);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, i18n]);

  return null;
};
