"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildConnectAction,
  buildMemberTags,
  buildProfileLinkMap,
  getInitials,
} from "@/lib/member-directory";
import {
  buildProfileTableHint,
  fetchCurrentMemberProfile,
  fetchMemberProfileById,
  type MemberProfile,
} from "@/lib/supabase/member-profiles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MemberProfilePageSectionProps = {
  memberId: string;
};

type ProfilePageState = {
  isLoading: boolean;
  error: string | null;
  currentUser: MemberProfile | null;
  targetMember: MemberProfile | null;
};

export function MemberProfilePageSection({
  memberId,
}: MemberProfilePageSectionProps) {
  const router = useRouter();
  const [state, setState] = useState<ProfilePageState>({
    isLoading: true,
    error: null,
    currentUser: null,
    targetMember: null,
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
        isLoading: false,
        error:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        currentUser: null,
        targetMember: null,
      });
      return;
    }

    let isActive = true;

    const loadProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!isActive) {
        return;
      }

      const user = authData.user;
      if (!user) {
        router.replace("/auth");
        return;
      }

      const { profile: currentProfile, error: currentProfileError } =
        await fetchCurrentMemberProfile(supabase, user.id);

      if (!isActive) {
        return;
      }

      if (currentProfileError) {
        setState({
          isLoading: false,
          error:
            buildProfileTableHint(currentProfileError) ??
            "Failed to load your profile.",
          currentUser: null,
          targetMember: null,
        });
        return;
      }

      if (!currentProfile) {
        router.replace("/onboarding");
        return;
      }

      if (currentProfile.review_status !== "approved") {
        router.replace("/pending");
        return;
      }

      const { profile: targetMember, error: targetMemberError } =
        await fetchMemberProfileById(supabase, memberId);
      if (!isActive) {
        return;
      }

      if (targetMemberError) {
        setState({
          isLoading: false,
          error:
            buildProfileTableHint(targetMemberError) ??
            "Failed to load member profile.",
          currentUser: currentProfile,
          targetMember: null,
        });
        return;
      }

      if (!targetMember) {
        setState({
          isLoading: false,
          error: "Member profile not found or access is restricted.",
          currentUser: currentProfile,
          targetMember: null,
        });
        return;
      }

      setState({
        isLoading: false,
        error: null,
        currentUser: currentProfile,
        targetMember,
      });
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [memberId, router, supabase]);

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
          <p className="auth-description">Loading profile...</p>
        </main>
      </div>
    );
  }

  if (state.error || !state.targetMember) {
    return (
      <div className="page-shell">
        <div className="page-gradient" aria-hidden="true" />
        <main className="flow-shell flow-shell--narrow">
          <section className="flow-card">
            <p className="form-message form-message--error">
              {state.error ?? "Member profile not found."}
            </p>
            <Link href="/members" className="secondary-button">
              Back to members
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const member = state.targetMember;
  const isCurrentUser = state.currentUser?.id === member.id;
  const tags = buildMemberTags(member);
  const links = buildProfileLinkMap(member);
  const connect = buildConnectAction(member.contact, member.full_name);
  const meta = [member.role_title, member.country].filter(Boolean).join(" | ");

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />

      <div className="members-layout">
        <header className="top-nav">
          <div className="top-nav-inner">
            <span className="brand">Vector Network</span>
            <div className="members-nav-actions">
              <Link href="/members" className="join-pill">
                Members
              </Link>
              <button
                type="button"
                className="join-pill join-pill--ghost"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="members-main members-main--narrow">
          <section className="member-profile-head">
            <h1 className="flow-title">{member.full_name}</h1>
            <p className="flow-description">
              Full member card from the Vector Network directory.
            </p>

            <div className="member-profile-head-actions">
              <Link href="/members" className="secondary-button">
                Back to members
              </Link>
              {isCurrentUser ? (
                <Link href="/onboarding?edit=1" className="primary-button">
                  Edit my profile
                </Link>
              ) : connect ? (
                <a
                  href={connect.href}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button"
                >
                  {connect.label}
                </a>
              ) : null}
            </div>
          </section>

          <article className="flow-card member-profile-card">
            <div className="member-profile-top">
              <div className="member-avatar-badge member-avatar-badge--large">
                {getInitials(member.full_name)}
              </div>
              <div>
                <h2>{member.full_name}</h2>
                {meta ? <p className="member-meta">{meta}</p> : null}
              </div>
            </div>

            <div className="member-sections">
              <div>
                <span>What they do</span>
                <p>{member.about}</p>
              </div>

              {member.building ? (
                <div>
                  <span>Building</span>
                  <p>{member.building}</p>
                </div>
              ) : null}

              {member.looking_for ? (
                <div>
                  <span>Looking for</span>
                  <p>{member.looking_for}</p>
                </div>
              ) : null}
            </div>

            {tags.length > 0 ? (
              <div className="member-tags">
                {tags.map((tag) => (
                  <span key={tag} className="member-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="member-contact">Contact: {member.contact}</p>

            {links.length > 0 ? (
              <div className="member-links">
                {links.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}

            {isCurrentUser ? (
              <p className="flow-muted member-profile-note">
                Profile changes are submitted for review again.
              </p>
            ) : null}
          </article>
        </main>
      </div>
    </div>
  );
}
