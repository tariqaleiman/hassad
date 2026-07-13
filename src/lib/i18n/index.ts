import { useLocale } from "@/lib/providers/locale-provider";
import ar, { type Translations } from "./ar";
import en from "./en";

const translations: Record<string, Translations> = { ar, en };

/** hook لاسترجاع النصوص حسب اللغة الحالية */
export function useTranslation(): Translations {
  const { locale } = useLocale();
  return translations[locale] ?? ar;
}

export type { Translations };
