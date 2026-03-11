"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/language-provider";

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <main className="auth-shell">
      <h1>{t("terms.title", "Terms of Service")}</h1>
      <p className="auth-description">
        {t("terms.description", "This page is a placeholder for your service terms.")}
      </p>
      <Link href="/" className="primary-button auth-button-link">
        {t("common.nav.back_to_main", "Back to main")}
      </Link>
    </main>
  );
}
