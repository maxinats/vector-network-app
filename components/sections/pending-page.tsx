"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/language-provider";

export function PendingPageSection() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    status: authStatus,
    profile,
    error,
    refreshProfile,
    signOut,
  } = useAuth();

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/auth");
      return;
    }

    if (authStatus !== "authenticated") {
      return;
    }

    if (!profile) {
      router.replace("/onboarding");
      return;
    }

    if (profile.review_status === "approved") {
      router.replace("/members");
    }
  }, [authStatus, profile, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshProfile();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authStatus, refreshProfile]);

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  if (authStatus === "loading") {
    return (
      <div className="page-shell">
        <div className="page-gradient" aria-hidden="true" />
        <main className="flow-shell">
          <p className="auth-description">
            {t("pending.loading", "Checking your application status...")}
          </p>
        </main>
      </div>
    );
  }

  if (authStatus === "error") {
    return (
      <div className="page-shell">
        <div className="page-gradient" aria-hidden="true" />
        <main className="flow-shell flow-shell--narrow">
          <section className="flow-card">
            <p className="form-message form-message--error">
              {error ??
                t("pending.errors.load_status", "Failed to load your application status.")}
            </p>
            <Link href="/onboarding" className="primary-button auth-button-link">
              {t("pending.open_onboarding", "Open onboarding")}
            </Link>
          </section>
        </main>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isRejected = profile.review_status === "rejected";

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />
      <main className="flow-shell flow-shell--narrow">
        <h1 className="flow-title">
          {isRejected
            ? t("pending.title_rejected", "Application rejected")
            : t("pending.title_pending", "Application in review")}
        </h1>
        <p className="flow-description">
          {isRejected
            ? t("pending.description_rejected", "Update your profile and submit it again.")
            : t(
                "pending.description_pending",
                "Our team is reviewing your profile. This page updates automatically.",
              )}
        </p>

        <section className="flow-card pending-card">
          <p className={isRejected ? "pending-badge rejected" : "pending-badge pending"}>
            {t("pending.status_label", "Status:")} {profile.review_status}
          </p>

          <div className="pending-actions">
            {isRejected ? (
              <Link href="/onboarding" className="primary-button auth-button-link">
                {t("pending.edit_application", "Edit application")}
              </Link>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={() => window.location.reload()}
              >
                {t("pending.refresh_now", "Refresh status now")}
              </button>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={handleSignOut}
            >
              {t("common.nav.sign_out", "Sign out")}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
