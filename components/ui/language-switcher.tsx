"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/language-provider";
import type { AppLocale } from "@/lib/i18n";

type SwitcherOption = {
  id: string;
  labelKey: string;
  locale?: AppLocale;
  disabled?: boolean;
};

const OPTIONS: SwitcherOption[] = [
  { id: "en", labelKey: "common.language.options.en", locale: "en" },
  { id: "ru", labelKey: "common.language.options.ru", locale: "ru" },
  { id: "de", labelKey: "common.language.options.de_soon", disabled: true },
  { id: "es", labelKey: "common.language.options.es_soon", disabled: true },
  { id: "fr", labelKey: "common.language.options.fr_soon", disabled: true },
];

export function LanguageSwitcher() {
  const { locale, setLocale, showRussianHint, dismissRussianHint, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLocaleSelect(nextLocale: AppLocale) {
    setLocale(nextLocale);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className="language-switcher">
      <button
        type="button"
        className="language-icon-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t("common.language.label", "Language")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <LanguageIcon />
      </button>

      {isOpen ? (
        <div
          className="language-menu"
          role="menu"
          aria-label={t("common.language.label", "Language")}
        >
          <p className="language-menu-title">
            {t("common.language.label", "Language")}
          </p>

          {OPTIONS.map((option) => {
            const isSelected = option.locale === locale;
            const optionLabel = t(option.labelKey, option.id);

            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                disabled={option.disabled}
                className={`language-option ${isSelected ? "language-option--selected" : ""}`}
                onClick={() => option.locale && handleLocaleSelect(option.locale)}
              >
                <span className="language-option-mark">
                  {isSelected ? "\u2713" : ""}
                </span>
                <span>{optionLabel}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {showRussianHint && locale === "en" ? (
        <div className="language-hint" role="status">
          <p>
            {t(
              "common.language.ru_hint",
              "Your browser is set to Russian. Switch language?",
            )}
          </p>
          <div className="language-hint-actions">
            <button
              type="button"
              className="language-hint-link"
              onClick={() => handleLocaleSelect("ru")}
            >
              {t("common.language.ru_hint_action", "Switch to Russian")}
            </button>
            <button
              type="button"
              className="language-hint-link language-hint-link--muted"
              onClick={dismissRussianHint}
            >
              {t("common.language.keep_en_action", "Keep English")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LanguageIcon() {
  return (
    <svg
      className="language-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5h8M8 5v1m0 0c0 2.6-1.3 5.1-3.5 6.8M8 6c.8 2.6 2.3 5 4.4 6.8M14.5 5l3.8 10m-6.1 0h6.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="17" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M17 11.8c1 1.2 1.5 2.7 1.5 4.2s-.6 3-1.5 4.2M17 11.8c-1 1.2-1.5 2.7-1.5 4.2s.6 3 1.5 4.2M12 17h10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
