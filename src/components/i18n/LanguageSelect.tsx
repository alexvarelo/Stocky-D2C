import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, isAppLanguage } from '@/i18n/languages';

/** Language picker for forms (Settings). */
export function LanguageSelect({ id, className }: { id?: string; className?: string }) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(v) => isAppLanguage(v) && setLanguage(v)}>
      <SelectTrigger id={id} className={className} aria-label={t('language.label')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((lng) => (
          <SelectItem key={lng} value={lng} lang={lng}>
            {LANGUAGE_NAMES[lng]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Language submenu for the user dropdown in the navbar. */
export function LanguageMenuSub() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages className="mr-2 h-4 w-4" />
        <span className="flex-1">{t('language.label')}</span>
        <span className="ml-2 text-xs text-muted-foreground uppercase">{language}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(v) => isAppLanguage(v) && setLanguage(v)}
        >
          {SUPPORTED_LANGUAGES.map((lng) => (
            <DropdownMenuRadioItem key={lng} value={lng} lang={lng}>
              {LANGUAGE_NAMES[lng]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
