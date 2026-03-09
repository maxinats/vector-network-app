"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  buildProfileTableHint,
  fetchCurrentMemberProfile,
  type MemberProfile,
  type MemberProfileInput,
  upsertMemberProfile,
} from "@/lib/supabase/member-profiles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type FormState = {
  fullName: string;
  contact: string;
  country: string;
  roleTitle: string;
  about: string;
  building: string;
  lookingFor: string;
  website: string;
  twitter: string;
  linkedin: string;
};

type StatusState = {
  type: "error" | "success";
  message: string;
} | null;

const EMPTY_FORM: FormState = {
  fullName: "",
  contact: "",
  country: "",
  roleTitle: "",
  about: "",
  building: "",
  lookingFor: "",
  website: "",
  twitter: "",
  linkedin: "",
};

export function OnboardingPageSection() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);
  const [hasRejectedState, setHasRejectedState] = useState(false);

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      if (!supabase) {
        if (isActive) {
          setStatus({
            type: "error",
            message:
              "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          });
          setIsLoading(false);
        }
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!isActive) {
        return;
      }

      if (authError) {
        setStatus({ type: "error", message: authError.message });
        setIsLoading(false);
        return;
      }

      const user = authData.user;
      if (!user) {
        router.replace("/auth");
        return;
      }

      setUserId(user.id);
      const { profile, error } = await fetchCurrentMemberProfile(supabase, user.id);
      if (!isActive) {
        return;
      }

      if (error) {
        setStatus({
          type: "error",
          message:
            buildProfileTableHint(error) ??
            "Failed to load profile data from Supabase.",
        });
        setIsLoading(false);
        return;
      }

      if (profile?.review_status === "approved") {
        router.replace("/members");
        return;
      }

      if (profile?.review_status === "pending") {
        router.replace("/pending");
        return;
      }

      setHasRejectedState(profile?.review_status === "rejected");
      setForm(buildFormState(profile));
      setIsLoading(false);
    };

    initialize();

    return () => {
      isActive = false;
    };
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !userId) {
      return;
    }

    if (!form.fullName.trim() || !form.contact.trim() || !form.country.trim()) {
      setStatus({
        type: "error",
        message: "Full name, contact, and country are required.",
      });
      return;
    }

    if (!form.about.trim()) {
      setStatus({
        type: "error",
        message: "Please describe what you do.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const payload: MemberProfileInput = {
      full_name: form.fullName,
      contact: form.contact,
      country: form.country,
      role_title: form.roleTitle,
      about: form.about,
      building: form.building,
      looking_for: form.lookingFor,
      website: form.website,
      twitter: form.twitter,
      linkedin: form.linkedin,
    };

    const { error } = await upsertMemberProfile(supabase, userId, payload);
    if (error) {
      setStatus({
        type: "error",
        message:
          buildProfileTableHint(error) ?? "Failed to submit onboarding profile.",
      });
      setIsSubmitting(false);
      return;
    }

    router.replace("/pending");
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-gradient" aria-hidden="true" />
        <main className="flow-shell">
          <p className="auth-description">Loading onboarding...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />

      <div className="page-inner">
        <header className="top-nav">
          <div className="top-nav-inner">
            <span className="brand">Vector Network</span>
            <Link href="/" className="join-pill">
              Back on main
            </Link>
          </div>
        </header>

        <main className="flow-shell flow-shell--narrow">
          <h1 className="flow-title">Create your profile</h1>
          <p className="flow-description">
            Join a curated network of builders and early adopters.
          </p>

          <section className="flow-card">
            <form className="onboarding-form" onSubmit={handleSubmit}>
              <p className="flow-muted">"*" = Required information</p>

              {hasRejectedState ? (
                <p className="form-message form-message--error">
                  Previous application was rejected. Update profile and submit
                  again.
                </p>
              ) : null}

              <label className="onboarding-field">
                <span className="onboarding-label">Full name *</span>
                <input
                  className="magic-input"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">Contact *</span>
                <input
                  className="magic-input"
                  value={form.contact}
                  onChange={(event) => updateField("contact", event.target.value)}
                  placeholder="Contact: @telegram or email"
                  required
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">Where are you from? *</span>
                <input
                  className="magic-input"
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  placeholder="Country"
                  required
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">Role / Title</span>
                <input
                  className="magic-input"
                  value={form.roleTitle}
                  onChange={(event) => updateField("roleTitle", event.target.value)}
                  placeholder="e.g. Product Designer, Founder"
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">What do you do? *</span>
                <textarea
                  className="magic-input onboarding-textarea"
                  value={form.about}
                  onChange={(event) => updateField("about", event.target.value)}
                  placeholder="Tell us about your role, expertise, or what you're passionate about"
                  required
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">What are you building?</span>
                <textarea
                  className="magic-input onboarding-textarea"
                  value={form.building}
                  onChange={(event) => updateField("building", event.target.value)}
                  placeholder="Share what you're currently working on"
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">What are you looking for?</span>
                <textarea
                  className="magic-input onboarding-textarea"
                  value={form.lookingFor}
                  onChange={(event) =>
                    updateField("lookingFor", event.target.value)
                  }
                  placeholder="e.g. collaborators, feedback, early users, opportunities"
                />
              </label>

              <div className="onboarding-group-title">Links</div>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  Website / portfolio
                </span>
                <input
                  className="magic-input"
                  value={form.website}
                  onChange={(event) => updateField("website", event.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  X / Twitter
                </span>
                <input
                  className="magic-input"
                  value={form.twitter}
                  onChange={(event) => updateField("twitter", event.target.value)}
                  placeholder="@username"
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  LinkedIn
                </span>
                <input
                  className="magic-input"
                  value={form.linkedin}
                  onChange={(event) => updateField("linkedin", event.target.value)}
                  placeholder="LinkedIn profile URL"
                />
              </label>

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Create profile"}
              </button>

              <p className="flow-muted flow-muted--center">
                Your profile will be reviewed before becoming visible to the
                community.
              </p>

              {status ? (
                <p
                  className={`form-message ${status.type === "error" ? "form-message--error" : "form-message--success"}`}
                >
                  {status.message}
                </p>
              ) : null}
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

function buildFormState(profile: MemberProfile | null): FormState {
  const fallbackCountry = detectCountryFromLocale();

  if (!profile) {
    return {
      ...EMPTY_FORM,
      country: fallbackCountry,
    };
  }

  return {
    fullName: profile.full_name ?? "",
    contact: profile.contact ?? "",
    country: profile.country || fallbackCountry,
    roleTitle: profile.role_title ?? "",
    about: profile.about ?? "",
    building: profile.building ?? "",
    lookingFor: profile.looking_for ?? "",
    website: profile.website ?? "",
    twitter: profile.twitter ?? "",
    linkedin: profile.linkedin ?? "",
  };
}

function detectCountryFromLocale() {
  if (typeof navigator === "undefined") {
    return "";
  }

  const locale = navigator.language || "en-US";
  const region = locale.split("-")[1];
  if (!region) {
    return "";
  }

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    return displayNames.of(region) ?? "";
  } catch {
    return "";
  }
}
