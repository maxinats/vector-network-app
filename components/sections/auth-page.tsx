"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MagicLinkForm } from "@/components/forms/magic-link-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthPageSection() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsCheckingSession(false);
      return;
    }

    const syncSession = async () => {
      const { data } = await supabase.auth.getUser();
      setSessionEmail(data.user?.email ?? null);
      setIsCheckingSession(false);
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      syncSession();
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setSignOutError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSignOutError(error.message);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />
      <main className="auth-shell">
        <h1>Log In via Magic Link</h1>
        <p className="auth-description">
          Use the same email from Vector Network to continue.
        </p>

        {isCheckingSession ? (
          <div className="auth-panel">
            <p>Checking current session...</p>
          </div>
        ) : null}

        {!isCheckingSession && sessionEmail ? (
          <div className="auth-panel">
            <p className="auth-success">Logged in as {sessionEmail}</p>
            <div className="auth-actions">
              <Link href="/" className="primary-button auth-button-link">
                Back to main page
              </Link>
              <button
                type="button"
                className="secondary-button"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
            {signOutError ? (
              <p className="form-message form-message--error">{signOutError}</p>
            ) : null}
          </div>
        ) : null}

        {!isCheckingSession && !sessionEmail ? (
          <div className="auth-panel">
            <MagicLinkForm mode="login" />
          </div>
        ) : null}
      </main>
    </div>
  );
}
