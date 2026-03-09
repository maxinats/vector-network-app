"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MagicLinkForm } from "@/components/forms/magic-link-form";
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

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
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

      const { profile, error } = await fetchCurrentMemberProfile(supabase, user.id);
      if (!isActive) {
        return;
      }

      if (error) {
        setErrorMessage(
          buildProfileTableHint(error) ?? "Failed to resolve your access route.",
        );
        setIsCheckingSession(false);
        return;
      }

      router.replace(resolveRouteByProfile(profile));
    };

    resolveSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      resolveSession();
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />
      <main className="auth-shell">
        <h1>Log In via Magic Link</h1>
        <p className="auth-description">
          Use the same email from Vector Network to continue.
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
            <MagicLinkForm mode="login" />
          </div>
        ) : null}
      </main>
    </div>
  );
}
