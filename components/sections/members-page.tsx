"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ContactMethodIcon } from "@/components/ui/contact-method-icon";
import { ExpandableText } from "@/components/ui/expandable-text";
import {
  buildConnectAction,
  buildMemberSearchIndex,
  buildProfileLinkMap,
  getInitials,
} from "@/lib/member-directory";
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

type MembersFilters = {
  query: string;
  location: string;
};

const EMPTY_FILTERS: MembersFilters = {
  query: "",
  location: "",
};

export function MembersPageSection() {
  const router = useRouter();
  const [state, setState] = useState<MembersState>({
    isLoading: true,
    error: null,
    currentUser: null,
    members: [],
  });
  const [filters, setFilters] = useState<MembersFilters>(EMPTY_FILTERS);

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
            buildProfileTableHint(profileError) ?? "Failed to load your profile.",
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

  const directoryMembers = useMemo(
    () => state.members.filter((member) => member.id !== state.currentUser?.id),
    [state.members, state.currentUser],
  );

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          directoryMembers
            .map((member) => member.country?.trim())
            .filter(Boolean) as string[],
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [directoryMembers],
  );

  const filteredMembers = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const location = filters.location.trim().toLowerCase();

    return directoryMembers.filter((member) => {
      const searchIndex = buildMemberSearchIndex(member);
      const memberLocation = member.country.toLowerCase();

      if (query && !searchIndex.includes(query)) {
        return false;
      }

      if (location && memberLocation !== location) {
        return false;
      }

      return true;
    });
  }, [directoryMembers, filters]);

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

      <div className="members-layout">
        <header className="top-nav">
          <div className="top-nav-inner">
            <span className="brand">Vector Network</span>
            <div className="members-nav-actions">
              <Link href="/" className="join-pill">
                Home
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

        <main className="members-main">
          <section className="members-hero">
            <h1 className="flow-title">Members</h1>
            <p className="flow-description">
              Discover people building interesting things and connect with them.
            </p>
          </section>

          <section className="flow-card members-toolbar">
            <label htmlFor="members-search" className="sr-only">
              Search members
            </label>
            <input
              id="members-search"
              className="magic-input members-search"
              placeholder="Search by name, role, location, or what people are building"
              value={filters.query}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, query: event.target.value }))
              }
            />

            <div className="members-filters">
              <label className="members-filter">
                <span>Location</span>
                <select
                  className="magic-input members-select"
                  value={filters.location}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                >
                  <option value="">All locations</option>
                  {locationOptions.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <p className="flow-muted">
            Showing {filteredMembers.length} of {directoryMembers.length} member profiles.
          </p>

          <section className="members-grid">
            {filteredMembers.length === 0 ? (
              <article className="flow-card members-empty-state">
                <h3>No members found</h3>
                <p className="flow-muted">
                  Try changing filters or clear them to see all approved members.
                </p>
              </article>
            ) : (
              filteredMembers.map((member) => (
                <MemberDirectoryCard key={member.id} member={member} />
              ))
            )}
          </section>

          {state.currentUser ? (
            <section className="flow-card my-profile-section">
              <div className="my-profile-header">
                <h2>My profile</h2>
                <p className="flow-description">
                  View and update your profile anytime.
                </p>
              </div>
              <MemberDirectoryCard member={state.currentUser} isCurrentUser />
            </section>
          ) : null}

          <footer className="footer members-footer">
            <p>We respect your privacy. No spam, ever.</p>
            <p>
              <Link href="/privacy" className="inline-link">
                Privacy Policy
              </Link>{" "}
              -{" "}
              <Link href="/terms" className="inline-link">
                Terms of Service
              </Link>
            </p>
            <p className="copyright">Vector Network © 2026</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

type MemberDirectoryCardProps = {
  member: MemberProfile;
  isCurrentUser?: boolean;
};

function MemberDirectoryCard({
  member,
  isCurrentUser = false,
}: MemberDirectoryCardProps) {
  const links = buildProfileLinkMap(member);
  const connect = buildConnectAction(member.contact, member.full_name);
  const meta = [member.role_title, member.country].filter(Boolean).join(" | ");

  return (
    <article
      className={`member-directory-card ${isCurrentUser ? "member-directory-card--featured" : ""}`}
    >
      <div className="member-directory-head">
        <div className="member-avatar-badge">{getInitials(member.full_name)}</div>
        <div className="member-directory-identity">
          <h3>{member.full_name}</h3>
          {meta ? <p className="member-meta">{meta}</p> : null}
        </div>
      </div>

      <div className="member-sections">
        <div>
          <span className="member-section-title">What they do</span>
          <ExpandableText text={member.about} collapseAt={190} />
        </div>

        {member.building ? (
          <div>
            <span className="member-section-title">Building</span>
            <ExpandableText text={member.building} collapseAt={170} />
          </div>
        ) : null}

        {member.looking_for ? (
          <div>
            <span className="member-section-title">Looking for</span>
            <ExpandableText text={member.looking_for} collapseAt={170} />
          </div>
        ) : null}
      </div>

      <div className="member-contact-card">
        <span className="member-contact-title">Contact</span>
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
          <p className="member-contact member-contact--empty">Not provided</p>
        )}
      </div>

      {links.length > 0 ? (
        <div className="member-links">
          {links.map((link) => (
            <a key={link.key} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      ) : null}

      <div className="member-actions">
        <Link href={`/profile/${member.id}`} className="primary-button member-action">
          {isCurrentUser ? "View my profile" : "View profile"}
        </Link>

        {isCurrentUser ? (
          <Link href="/onboarding?edit=1" className="secondary-button member-action">
            Edit my profile
          </Link>
        ) : connect ? (
          <a
            href={connect.href}
            target="_blank"
            rel="noreferrer"
            className="secondary-button member-action member-action--contact"
          >
            <ContactMethodIcon
              method={connect.method}
              className="contact-icon contact-icon--tiny"
            />
            {connect.label}
          </a>
        ) : (
          <button
            type="button"
            className="secondary-button member-action member-action--disabled"
            disabled
          >
            Connect
          </button>
        )}
      </div>
    </article>
  );
}

