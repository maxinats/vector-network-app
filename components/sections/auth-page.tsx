"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmailPasswordAuthForm } from "@/components/forms/email-password-auth-form";
import {
  buildProfileTableHint,
  fetchCurrentMemberProfile,
  resolveRouteByProfile,
} from "@/lib/supabase/member-profiles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthPageSection() {
  const router = useRouter();
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
          buildProfileTableHint(error) ?? "Failed to resolve your access route.",
        );
        setShowLoginForm(true);
        setIsCheckingSession(false);
        return;
      }

      router.replace(resolveRouteByProfile(profile));
    },
    [router, supabase],
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
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      setIsCheckingSession(false);
      return;
    }

    let isActive = true;

    const resolveSession = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!isActive) {
        return;
      }

      if (authError) {
        setErrorMessage(authError.message);
        setIsCheckingSession(false);
        return;
      }

      const user = authData.user;
      if (!user) {
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
  }, [resolveUserAccess, supabase]);

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
        <h1>Account access</h1>
        <p className="auth-description">
          Sign up with email and password, confirm by code, then log in with
          password.
        </p>

        {errorMessage ? (
          <div className="auth-panel">
            <p className="form-message form-message--error">{errorMessage}</p>
          </div>
        ) : null}

        {isCheckingSession ? (
          <div className="auth-panel">
            <p>Checking session and resolving your access...</p>
          </div>
        ) : null}

        {!isCheckingSession && !showLoginForm && !errorMessage ? (
          <div className="auth-panel">
            <p>Redirecting...</p>
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
