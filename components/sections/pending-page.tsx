"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildProfileTableHint,
  fetchCurrentMemberProfile,
  type MemberProfile,
} from "@/lib/supabase/member-profiles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PendingState = {
  profile: MemberProfile | null;
  isLoading: boolean;
  error: string | null;
};

export function PendingPageSection() {
  const router = useRouter();
  const [state, setState] = useState<PendingState>({
    profile: null,
    isLoading: true,
    error: null,
  });

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setState({
        profile: null,
        isLoading: false,
        error:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      });
      return;
    }

    let isActive = true;

    const loadStatus = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!isActive) {
        return;
      }

      const user = authData.user;
      if (!user) {
        router.replace("/auth");
        return;
      }

      const { profile, error } = await fetchCurrentMemberProfile(supabase, user.id);
      if (!isActive) {
        return;
      }

      if (error) {
        setState({
          profile: null,
          isLoading: false,
          error:
            buildProfileTableHint(error) ??
            "Failed to load your application status.",
        });
        return;
      }

      if (!profile) {
        router.replace("/onboarding");
        return;
      }

      if (profile.review_status === "approved") {
        router.replace("/members");
        return;
      }

      setState({
        profile,
        isLoading: false,
        error: null,
      });
    };

    loadStatus();
    const intervalId = window.setInterval(loadStatus, 15000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [router, supabase]);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.replace("/auth");
  }

  if (state.isLoading) {
    return (
      <div className="page-shell">
        <div className="page-gradient" aria-hidden="true" />
        <main className="flow-shell">
          <p className="auth-description">Checking your application status...</p>
        </main>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="page-shell">
        <div className="page-gradient" aria-hidden="true" />
        <main className="flow-shell flow-shell--narrow">
          <section className="flow-card">
            <p className="form-message form-message--error">{state.error}</p>
            <Link href="/onboarding" className="primary-button auth-button-link">
              Open onboarding
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const isRejected = state.profile?.review_status === "rejected";

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />
      <main className="flow-shell flow-shell--narrow">
        <h1 className="flow-title">
          {isRejected ? "Application rejected" : "Application in review"}
        </h1>
        <p className="flow-description">
          {isRejected
            ? "Update your profile and submit it again."
            : "Our team is reviewing your profile. This page updates automatically."}
        </p>

        <section className="flow-card pending-card">
          <p className={isRejected ? "pending-badge rejected" : "pending-badge pending"}>
            Status: {state.profile?.review_status}
          </p>

          <div className="pending-actions">
            {isRejected ? (
              <Link href="/onboarding" className="primary-button auth-button-link">
                Edit application
              </Link>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={() => window.location.reload()}
              >
                Refresh status now
              </button>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
