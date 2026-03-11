"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultLocale,
  getDictionary,
  isAppLocale,
  t,
  type AppLocale,
  type Dictionary,
} from "@/lib/i18n";

const LANGUAGE_STORAGE_KEY = "vector-network-language";

type LanguageContextValue = {
  locale: AppLocale;
  dictionary: Dictionary;
  setLocale: (locale: AppLocale) => void;
  showRussianHint: boolean;
  dismissRussianHint: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(defaultLocale);
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  const [showRussianHint, setShowRussianHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLocale && isAppLocale(savedLocale)) {
      setLocaleState(savedLocale);
      setShowRussianHint(false);
      setIsLocaleReady(true);
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, defaultLocale);
    setLocaleState(defaultLocale);

    const browserLocale = (window.navigator.language || "").toLowerCase();
    if (browserLocale.startsWith("ru")) {
      setShowRussianHint(true);
    }

    setIsLocaleReady(true);
  }, []);

  useEffect(() => {
    if (!isLocaleReady) {
      return;
    }

    document.documentElement.lang = locale;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  }, [isLocaleReady, locale]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    setShowRussianHint(false);
  }, []);

  const dismissRussianHint = useCallback(() => {
    setShowRussianHint(false);
  }, []);

  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dictionary,
      setLocale,
      showRussianHint,
      dismissRussianHint,
    }),
    [dictionary, dismissRussianHint, locale, setLocale, showRussianHint],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}

export function useI18n() {
  const context = useLanguage();
  const translate = useCallback(
    (key: string, fallback?: string) => t(context.dictionary, key, fallback),
    [context.dictionary],
  );

  return {
    ...context,
    t: translate,
  };
}
