"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmailPasswordAuthForm } from "@/components/forms/email-password-auth-form";
import { useI18n } from "@/components/providers/language-provider";
import {
  buildProfileTableHint,
  fetchCurrentMemberProfile,
  resolveRouteByProfile,
} from "@/lib/supabase/member-profiles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthPageSection() {
  const router = useRouter();
  const { t } = useI18n();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialMode, setInitialMode] = useState<"login" | "signup">("login");
  const [initialEmail, setInitialEmail] = useState("");

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const resolveUserAccess = useCallback(
    async (userId: string) => {
      if (!supabase) {
        return;
      }

      const { profile, error } = await fetchCurrentMemberProfile(supabase, userId);
      if (error) {
        setErrorMessage(
          buildProfileTableHint(error) ??
            t("auth_page.errors.resolve_access", "Failed to resolve your access route."),
        );
        setShowLoginForm(true);
        setIsCheckingSession(false);
        return;
      }

      router.replace(resolveRouteByProfile(profile));
    },
    [router, supabase, t],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setInitialMode(params.get("mode") === "signup" ? "signup" : "login");
    setInitialEmail(params.get("email") ?? "");
  }, []);

  useEffect(() => {
    if (!supabase) {
      setErrorMessage(
        t(
          "auth_page.errors.supabase_not_configured",
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        ),
      );
      setIsCheckingSession(false);
      return;
    }

    let isActive = true;

    const resolveSession = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (!isActive) {
        return;
      }

      if (sessionError && !isSessionMissingError(sessionError.message)) {
        setErrorMessage(sessionError.message);
        setIsCheckingSession(false);
        return;
      }

      const user = sessionData.session?.user ?? null;
      if (!user) {
        setErrorMessage(null);
        setShowLoginForm(true);
        setIsCheckingSession(false);
        return;
      }

      await resolveUserAccess(user.id);
    };

    resolveSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      resolveSession();
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, [resolveUserAccess, supabase, t]);

  const handleAuthenticated = useCallback(
    async (userId: string) => {
      setErrorMessage(null);
      setShowLoginForm(false);
      setIsCheckingSession(true);
      await resolveUserAccess(userId);
    },
    [resolveUserAccess],
  );

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

function isSessionMissingError(message: string) {
  return message.toLowerCase().includes("auth session missing");
}
