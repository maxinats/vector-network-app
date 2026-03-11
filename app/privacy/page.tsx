"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/language-provider";

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <main className="auth-shell">
      <h1>{t("privacy.title", "Privacy Policy")}</h1>
      <p className="auth-description">
        {t(
          "privacy.description",
          "This page is a placeholder for your full privacy policy.",
        )}
      </p>
      <Link href="/" className="primary-button auth-button-link">
        {t("common.nav.back_to_main", "Back to main")}
      </Link>
    </main>
  );
}
