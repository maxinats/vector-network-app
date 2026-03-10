"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ContactMethodIcon } from "@/components/ui/contact-method-icon";
import {
  formatContactForStorage,
  isLikelyHttpUrl,
  parseContactForInput,
  type ContactInputMethod,
  validateContactInput,
} from "@/lib/member-directory";
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

type FormErrors = Partial<Record<keyof FormState, string>>;

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
  const [contactMethod, setContactMethod] = useState<ContactInputMethod>("telegram");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);
  const [hasRejectedState, setHasRejectedState] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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
      const editMode = isEditModeQueryEnabled();
      setIsEditMode(editMode);

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

      if (profile?.review_status === "approved" && !editMode) {
        router.replace("/members");
        return;
      }

      if (profile?.review_status === "pending") {
        router.replace("/pending");
        return;
      }

      const parsedContact = parseContactForInput(profile?.contact ?? "");
      setHasRejectedState(profile?.review_status === "rejected");
      setContactMethod(profile ? parsedContact.method : "telegram");
      setForm(buildFormState(profile, profile ? parsedContact.value : ""));
      setErrors({});
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

    const validationErrors = validateForm(form, contactMethod);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({
        type: "error",
        message: "Please fix highlighted fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    setErrors({});

    const payload: MemberProfileInput = {
      full_name: form.fullName,
      contact: formatContactForStorage(contactMethod, form.contact),
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
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }

      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function updateContactMethod(method: ContactInputMethod) {
    setContactMethod(method);
    setErrors((prev) => {
      if (!prev.contact) {
        return prev;
      }

      const next = { ...prev };
      delete next.contact;
      return next;
    });
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
            <Link href={isEditMode ? "/members" : "/"} className="join-pill">
              {isEditMode ? "Back to members" : "Back on main"}
            </Link>
          </div>
        </header>

        <main className="flow-shell flow-shell--narrow">
          <h1 className="flow-title">
            {isEditMode ? "Edit your profile" : "Create your profile"}
          </h1>
          <p className="flow-description">
            {isEditMode
              ? "Update your profile card. Changes will be reviewed again."
              : "Join a curated network of builders and early adopters."}
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
                  className={`magic-input ${errors.fullName ? "input-error" : ""}`}
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Your name"
                  required
                />
                {errors.fullName ? (
                  <span className="field-error">{errors.fullName}</span>
                ) : null}
              </label>

              <div className="onboarding-field">
                <span className="onboarding-label">Preferred contact *</span>
                <div className="contact-method-switch" role="radiogroup" aria-label="Preferred contact">
                  <button
                    type="button"
                    className={`contact-method-option ${contactMethod === "telegram" ? "active" : ""}`}
                    onClick={() => updateContactMethod("telegram")}
                  >
                    <ContactMethodIcon method="telegram" className="contact-option-icon" />
                    Telegram
                  </button>
                  <button
                    type="button"
                    className={`contact-method-option ${contactMethod === "email" ? "active" : ""}`}
                    onClick={() => updateContactMethod("email")}
                  >
                    <ContactMethodIcon method="email" className="contact-option-icon" />
                    Email
                  </button>
                </div>
                <input
                  className={`magic-input ${errors.contact ? "input-error" : ""}`}
                  value={form.contact}
                  onChange={(event) => updateField("contact", event.target.value)}
                  placeholder={
                    contactMethod === "telegram"
                      ? "@telegram_username"
                      : "your@email.com"
                  }
                  required
                />
                {errors.contact ? (
                  <span className="field-error">{errors.contact}</span>
                ) : (
                  <span className="flow-muted flow-muted--center">
                    This will be shown as the contact button in your profile.
                  </span>
                )}
              </div>

              <label className="onboarding-field">
                <span className="onboarding-label">Where are you from? *</span>
                <input
                  className={`magic-input ${errors.country ? "input-error" : ""}`}
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  placeholder="Country"
                  required
                />
                {errors.country ? (
                  <span className="field-error">{errors.country}</span>
                ) : null}
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">Role / Title</span>
                <input
                  className={`magic-input ${errors.roleTitle ? "input-error" : ""}`}
                  value={form.roleTitle}
                  onChange={(event) => updateField("roleTitle", event.target.value)}
                  placeholder="e.g. Product Designer, Founder"
                />
                {errors.roleTitle ? (
                  <span className="field-error">{errors.roleTitle}</span>
                ) : null}
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">What do you do? *</span>
                <textarea
                  className={`magic-input onboarding-textarea ${errors.about ? "input-error" : ""}`}
                  value={form.about}
                  onChange={(event) => updateField("about", event.target.value)}
                  placeholder="Tell us about your role, expertise, or what you're passionate about"
                  required
                />
                {errors.about ? <span className="field-error">{errors.about}</span> : null}
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">What are you building?</span>
                <textarea
                  className={`magic-input onboarding-textarea ${errors.building ? "input-error" : ""}`}
                  value={form.building}
                  onChange={(event) => updateField("building", event.target.value)}
                  placeholder="Share what you're currently working on"
                />
                {errors.building ? (
                  <span className="field-error">{errors.building}</span>
                ) : null}
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">What are you looking for?</span>
                <textarea
                  className={`magic-input onboarding-textarea ${errors.lookingFor ? "input-error" : ""}`}
                  value={form.lookingFor}
                  onChange={(event) =>
                    updateField("lookingFor", event.target.value)
                  }
                  placeholder="e.g. collaborators, feedback, early users, opportunities"
                />
                {errors.lookingFor ? (
                  <span className="field-error">{errors.lookingFor}</span>
                ) : null}
              </label>

              <div className="onboarding-group-title">Links</div>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  Website / portfolio
                </span>
                <input
                  className={`magic-input ${errors.website ? "input-error" : ""}`}
                  value={form.website}
                  onChange={(event) => updateField("website", event.target.value)}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website ? <span className="field-error">{errors.website}</span> : null}
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  X / Twitter
                </span>
                <input
                  className={`magic-input ${errors.twitter ? "input-error" : ""}`}
                  value={form.twitter}
                  onChange={(event) => updateField("twitter", event.target.value)}
                  placeholder="@username"
                />
                {errors.twitter ? <span className="field-error">{errors.twitter}</span> : null}
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  LinkedIn
                </span>
                <input
                  className={`magic-input ${errors.linkedin ? "input-error" : ""}`}
                  value={form.linkedin}
                  onChange={(event) => updateField("linkedin", event.target.value)}
                  placeholder="LinkedIn profile URL"
                />
                {errors.linkedin ? (
                  <span className="field-error">{errors.linkedin}</span>
                ) : null}
              </label>

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Submitting..."
                  : isEditMode
                    ? "Save changes"
                    : "Create profile"}
              </button>

              <p className="flow-muted flow-muted--center">
                {isEditMode
                  ? "After saving, your profile returns to pending review."
                  : "Your profile will be reviewed before becoming visible to the community."}
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

function buildFormState(
  profile: MemberProfile | null,
  contactValue: string,
): FormState {
  const fallbackCountry = detectCountryFromLocale();

  if (!profile) {
    return {
      ...EMPTY_FORM,
      contact: contactValue,
      country: fallbackCountry,
    };
  }

  return {
    fullName: profile.full_name ?? "",
    contact: contactValue,
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

function validateForm(
  form: FormState,
  contactMethod: ContactInputMethod,
): FormErrors {
  const nextErrors: FormErrors = {};

  if (form.fullName.trim().length < 2) {
    nextErrors.fullName = "Enter full name (at least 2 characters).";
  }

  const contactError = validateContactInput(contactMethod, form.contact);
  if (contactError) {
    nextErrors.contact = contactError;
  }

  if (form.country.trim().length < 2) {
    nextErrors.country = "Enter your country.";
  }

  if (form.roleTitle.trim().length > 80) {
    nextErrors.roleTitle = "Role/Title must be up to 80 characters.";
  }

  if (form.about.trim().length < 20) {
    nextErrors.about = "Describe what you do in at least 20 characters.";
  }

  if (form.building.trim().length > 500) {
    nextErrors.building = "Building text must be up to 500 characters.";
  }

  if (form.lookingFor.trim().length > 500) {
    nextErrors.lookingFor = "Looking for text must be up to 500 characters.";
  }

  if (form.website.trim() && !isLikelyHttpUrl(form.website)) {
    nextErrors.website = "Enter a valid website URL.";
  }

  if (form.linkedin.trim() && !isLikelyHttpUrl(form.linkedin)) {
    nextErrors.linkedin = "Enter a valid LinkedIn URL.";
  }

  if (form.twitter.trim()) {
    const normalized = form.twitter.trim();
    const isHandle = /^@?[A-Za-z0-9_]{1,15}$/.test(normalized);
    const isUrl = isLikelyHttpUrl(normalized);
    if (!isHandle && !isUrl) {
      nextErrors.twitter = "Use @username or a full profile URL.";
    }
  }

  return nextErrors;
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

function isEditModeQueryEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("edit") === "1";
}
