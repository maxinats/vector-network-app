"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildProfileTableHint,
  fetchApprovedMembers,
  fetchCurrentMemberProfile,
  type MemberProfile,
} from "@/lib/supabase/member-profiles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MembersState = {
  isLoading: boolean;
  error: string | null;
  currentUser: MemberProfile | null;
  members: MemberProfile[];
};

export function MembersPageSection() {
  const router = useRouter();
  const [state, setState] = useState<MembersState>({
    isLoading: true,
    error: null,
    currentUser: null,
    members: [],
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
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      }));
      return;
    }

    let isActive = true;

    const loadMembers = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!isActive) {
        return;
      }

      const user = authData.user;
      if (!user) {
        router.replace("/auth");
        return;
      }

      const { profile, error: profileError } = await fetchCurrentMemberProfile(
        supabase,
        user.id,
      );

      if (!isActive) {
        return;
      }

      if (profileError) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            buildProfileTableHint(profileError) ??
            "Failed to load your profile.",
        }));
        return;
      }

      if (!profile) {
        router.replace("/onboarding");
        return;
      }

      if (profile.review_status !== "approved") {
        router.replace("/pending");
        return;
      }

      const { members, error: membersError } = await fetchApprovedMembers(supabase);
      if (!isActive) {
        return;
      }

      if (membersError) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            buildProfileTableHint(membersError) ??
            "Failed to load members list.",
        }));
        return;
      }

      setState({
        isLoading: false,
        error: null,
        currentUser: profile,
        members,
      });
    };

    loadMembers();

    return () => {
      isActive = false;
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
          <p className="auth-description">Loading members...</p>
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
            <Link href="/pending" className="secondary-button">
              Back to pending
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />

      <main className="flow-shell">
        <div className="members-head">
          <div>
            <h1 className="flow-title">Members</h1>
            <p className="flow-description">
              Access granted. Browse approved profiles in the network.
            </p>
          </div>

          <div className="members-actions">
            <Link href="/" className="secondary-button">
              Main page
            </Link>
            <button
              type="button"
              className="secondary-button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>

        <section className="members-grid">
          {state.members.map((member) => (
            <article key={member.id} className="member-card">
              <h3>{member.full_name}</h3>

              <p className="member-meta">
                {[member.role_title, member.country].filter(Boolean).join(" · ")}
              </p>

              <p className="member-about">{member.about}</p>

              <div className="member-extra">
                {member.building ? (
                  <p>
                    <strong>Building:</strong> {member.building}
                  </p>
                ) : null}
                {member.looking_for ? (
                  <p>
                    <strong>Looking for:</strong> {member.looking_for}
                  </p>
                ) : null}
              </div>

              <div className="member-links">
                {member.website ? (
                  <a href={normalizeLink(member.website)} target="_blank" rel="noreferrer">
                    Website
                  </a>
                ) : null}
                {member.twitter ? (
                  <a href={normalizeLink(member.twitter)} target="_blank" rel="noreferrer">
                    X / Twitter
                  </a>
                ) : null}
                {member.linkedin ? (
                  <a href={normalizeLink(member.linkedin)} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function normalizeLink(linkValue: string) {
  if (linkValue.startsWith("http://") || linkValue.startsWith("https://")) {
    return linkValue;
  }

  if (linkValue.startsWith("@")) {
    return `https://x.com/${linkValue.slice(1)}`;
  }

  return `https://${linkValue}`;
}
