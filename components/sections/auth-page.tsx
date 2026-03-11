"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EmailPasswordAuthForm } from "@/components/forms/email-password-auth-form";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/language-provider";
import { resolveRouteByProfile } from "@/lib/supabase/member-profiles";

export function AuthPageSection() {
  const router = useRouter();
  const { t } = useI18n();
  const { status, profile, error, refreshAuthState } = useAuth();
  const [initialMode, setInitialMode] = useState<"login" | "signup">("login");
  const [initialEmail, setInitialEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setInitialMode(params.get("mode") === "signup" ? "signup" : "login");
    setInitialEmail(params.get("email") ?? "");
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    router.replace(resolveRouteByProfile(profile));
  }, [profile, router, status]);

  const handleAuthenticated = useCallback(
    async (_userId: string) => {
      await refreshAuthState();
    },
    [refreshAuthState],
  );

  const isCheckingSession = status === "loading";
  const showLoginForm = status === "unauthenticated" || status === "error";
  const errorMessage =
    status === "error"
      ? error ??
        t("auth_page.errors.resolve_access", "Failed to resolve your access route.")
      : null;

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />
      <main className="auth-shell">
        <h1>{t("auth_page.title", "Account access")}</h1>
        <p className="auth-description">
          {t(
            "auth_page.description",
            "Sign up with email and password, confirm by code, then log in with password.",
          )}
        </p>

        {errorMessage ? (
          <div className="auth-panel">
            <p className="form-message form-message--error">{errorMessage}</p>
          </div>
        ) : null}

        {isCheckingSession ? (
          <div className="auth-panel">
            <p>{t("auth_page.checking", "Checking session and resolving your access...")}</p>
          </div>
        ) : null}

        {!isCheckingSession && !showLoginForm && !errorMessage ? (
          <div className="auth-panel">
            <p>{t("auth_page.redirecting", "Redirecting...")}</p>
          </div>
        ) : null}

        {!isCheckingSession && showLoginForm ? (
          <div className="auth-panel">
            <EmailPasswordAuthForm
              onAuthenticated={handleAuthenticated}
              initialMode={initialMode}
              initialEmail={initialEmail}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
