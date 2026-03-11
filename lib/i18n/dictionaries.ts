import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import { defaultLocale, isAppLocale, type AppLocale } from "./config";

const dictionaries = {
  en,
  ru,
} satisfies Record<AppLocale, typeof en>;

export type Dictionary = typeof en;

export function resolveLocale(input?: string | null): AppLocale {
  if (!input) {
    return defaultLocale;
  }

  const normalized = input.toLowerCase();
  return isAppLocale(normalized) ? normalized : defaultLocale;
}

export function getDictionary(locale?: string | null): Dictionary {
  const resolvedLocale = resolveLocale(locale);
  return dictionaries[resolvedLocale];
}
