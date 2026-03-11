"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/language-provider";
import { ContactMethodIcon } from "@/components/ui/contact-method-icon";
import { ExpandableText } from "@/components/ui/expandable-text";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  buildConnectAction,
  buildProfileLinkMap,
  getInitials,
} from "@/lib/member-directory";
import {
  buildProfileTableHint,
  fetchMemberProfileById,
  type MemberProfile,
} from "@/lib/supabase/member-profiles";

type MemberProfilePageSectionProps = {
  memberId: string;
};

type ProfilePageState = {
  isLoading: boolean;
  error: string | null;
  targetMember: MemberProfile | null;
};

export function MemberProfilePageSection({
  memberId,
}: MemberProfilePageSectionProps) {
  const router = useRouter();
  const { t } = useI18n();
  const {
    status: authStatus,
    profile: currentUser,
    error: authError,
    supabase,
    signOut,
  } = useAuth();
  const [state, setState] = useState<ProfilePageState>({
    isLoading: true,
    error: null,
    targetMember: null,
  });

  useEffect(() => {
    if (authStatus === "loading") {
      setState((prev) => (prev.isLoading ? prev : { ...prev, isLoading: true }));
      return;
    }

    if (authStatus === "error") {
      setState({
        isLoading: false,
        error:
          authError ??
          t("member_profile.errors.load_your_profile", "Failed to load your profile."),
        targetMember: null,
      });
      return;
    }

    if (authStatus === "unauthenticated") {
      router.replace("/auth");
      return;
    }

    if (!currentUser) {
      router.replace("/onboarding");
      return;
    }

    if (currentUser.review_status !== "approved") {
      router.replace("/pending");
      return;
    }

    if (!supabase) {
      setState({
        isLoading: false,
        error: t(
          "member_profile.errors.supabase_not_configured",
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        ),
        targetMember: null,
      });
      return;
    }

    let isActive = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const loadProfile = async () => {
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
            t("member_profile.errors.load_member_profile", "Failed to load member profile."),
          targetMember: null,
        });
        return;
      }

      if (!targetMember) {
        setState({
          isLoading: false,
          error: t(
            "member_profile.errors.not_found_or_restricted",
            "Member profile not found or access is restricted.",
          ),
          targetMember: null,
        });
        return;
      }

      setState({
        isLoading: false,
        error: null,
        targetMember,
      });
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [authError, authStatus, currentUser, memberId, router, supabase, t]);

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  if (state.isLoading) {
    return (
      <div className="page-shell">
        <div className="page-gradient" aria-hidden="true" />
        <main className="flow-shell">
          <p className="auth-description">
            {t("member_profile.loading", "Loading profile...")}
          </p>
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
              {state.error ?? t("member_profile.errors.not_found", "Member profile not found.")}
            </p>
            <Link href="/members" className="secondary-button">
              {t("common.nav.back_to_members", "Back to members")}
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const member = state.targetMember;
  const isCurrentUser = currentUser?.id === member.id;
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
              <LanguageSwitcher />
              <Link href="/members" className="join-pill">
                {t("common.nav.members", "Members")}
              </Link>
              <button
                type="button"
                className="join-pill join-pill--ghost"
                onClick={handleSignOut}
              >
                {t("common.nav.sign_out", "Sign out")}
              </button>
            </div>
          </div>
        </header>

        <main className="members-main members-main--narrow">
          <section className="member-profile-head">
            <h1 className="flow-title">{member.full_name}</h1>
            <p className="flow-description">
              {t(
                "member_profile.description",
                "Full member card from the Vector Network directory.",
              )}
            </p>

            <div className="member-profile-head-actions">
              <Link href="/members" className="secondary-button">
                {t("common.nav.back_to_members", "Back to members")}
              </Link>
              {isCurrentUser ? (
                <Link href="/onboarding?edit=1" className="primary-button">
                  {t("member_profile.edit_my_profile", "Edit my profile")}
                </Link>
              ) : connect ? (
                <a
                  href={connect.href}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button member-action--contact"
                >
                  <ContactMethodIcon
                    method={connect.method}
                    className="contact-icon contact-icon--tiny"
                  />
                  {connect.method === "telegram"
                    ? t("members.card.connect_telegram", "Telegram")
                    : connect.method === "email"
                      ? t("members.card.connect_email", "Email")
                      : connect.method === "link"
                        ? t("members.card.connect_open", "Open contact")
                        : t("members.card.connect", "Connect")}
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
                <span className="member-section-title">
                  {t("members.card.what_they_do", "What they do")}
                </span>
                <ExpandableText text={member.about} collapseAt={520} />
              </div>

              {member.building ? (
                <div>
                  <span className="member-section-title">
                    {t("members.card.building", "Building")}
                  </span>
                  <ExpandableText text={member.building} collapseAt={380} />
                </div>
              ) : null}

              {member.looking_for ? (
                <div>
                  <span className="member-section-title">
                    {t("members.card.looking_for", "Looking for")}
                  </span>
                  <ExpandableText text={member.looking_for} collapseAt={380} />
                </div>
              ) : null}
            </div>

            <div className="member-contact-card">
              <span className="member-contact-title">
                {t("members.card.contact", "Contact")}
              </span>
              {connect ? (
                <a
                  href={connect.href}
                  target="_blank"
                  rel="noreferrer"
                  className="member-contact-link"
                >
                  <ContactMethodIcon
                    method={connect.method}
                    className="contact-icon contact-icon--small"
                  />
                  <span>{connect.value}</span>
                </a>
              ) : (
                <p className="member-contact member-contact--empty">
                  {t("members.card.not_provided", "Not provided")}
                </p>
              )}
            </div>

            {links.length > 0 ? (
              <div className="member-links">
                {links.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t(`members.links.${link.key}`, link.label)}
                  </a>
                ))}
              </div>
            ) : null}

            {isCurrentUser ? (
              <p className="flow-muted member-profile-note">
                {t(
                  "member_profile.review_note",
                  "Profile changes are submitted for review again.",
                )}
              </p>
            ) : null}
          </article>
        </main>
      </div>
    </div>
  );
}
