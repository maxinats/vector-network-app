"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/language-provider";
import { ContactMethodIcon } from "@/components/ui/contact-method-icon";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  formatContactForStorage,
  isLikelyHttpUrl,
  parseContactForInput,
  type ContactInputMethod,
  validateContactInput,
} from "@/lib/member-directory";
import {
  buildProfileTableHint,
  type MemberProfile,
  type MemberProfileInput,
  upsertMemberProfile,
} from "@/lib/supabase/member-profiles";

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

const FIELD_LIMITS = {
  fullName: 80,
  contact: 80,
  country: 56,
  roleTitle: 80,
  about: 1000,
  building: 800,
  lookingFor: 800,
  website: 160,
  twitter: 160,
  linkedin: 160,
} as const;

export function OnboardingPageSection() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    status: authStatus,
    userId: authUserId,
    profile,
    error: authError,
    supabase,
    refreshProfile,
  } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [contactMethod, setContactMethod] = useState<ContactInputMethod>("telegram");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditModeResolved, setIsEditModeResolved] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);
  const [hasRejectedState, setHasRejectedState] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const aboutRef = useRef<HTMLTextAreaElement | null>(null);
  const buildingRef = useRef<HTMLTextAreaElement | null>(null);
  const lookingForRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setIsEditMode(isEditModeQueryEnabled());
    setIsEditModeResolved(true);
  }, []);

  useEffect(() => {
    if (!isEditModeResolved) {
      setIsLoading(true);
      return;
    }

    if (authStatus === "loading") {
      setIsLoading(true);
      return;
    }

    if (authStatus === "error") {
      setStatus({
        type: "error",
        message:
          authError ??
          t(
            "onboarding.errors.load_profile",
            "Failed to load profile data from Supabase.",
          ),
      });
      setIsLoading(false);
      return;
    }

    if (authStatus === "unauthenticated") {
      router.replace("/auth");
      return;
    }

    if (!authUserId) {
      router.replace("/auth");
      return;
    }

    setUserId(authUserId);

    if (!isEditMode && profile?.review_status === "approved") {
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
  }, [
    authError,
    authStatus,
    authUserId,
    isEditMode,
    isEditModeResolved,
    profile,
    router,
    t,
  ]);

  useEffect(() => {
    autoResizeTextarea(aboutRef.current);
  }, [form.about]);

  useEffect(() => {
    autoResizeTextarea(buildingRef.current);
  }, [form.building]);

  useEffect(() => {
    autoResizeTextarea(lookingForRef.current);
  }, [form.lookingFor]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !userId) {
      return;
    }

    const validationErrors = validateForm(form, contactMethod, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({
        type: "error",
        message: t("onboarding.status.fix_fields", "Please fix highlighted fields."),
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
          buildProfileTableHint(error) ??
            t("onboarding.errors.submit_profile", "Failed to submit onboarding profile."),
      });
      setIsSubmitting(false);
      return;
    }

    await refreshProfile();
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
          <p className="auth-description">
            {t("onboarding.loading", "Loading onboarding...")}
          </p>
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
            <div className="top-nav-actions">
              <LanguageSwitcher />
              <Link href={isEditMode ? "/members" : "/"} className="join-pill">
                {isEditMode
                  ? t("common.nav.back_to_members", "Back to members")
                  : t("common.nav.back_to_main", "Back to main")}
              </Link>
            </div>
          </div>
        </header>

        <main className="flow-shell flow-shell--narrow">
          <h1 className="flow-title">
            {isEditMode
              ? t("onboarding.title_edit", "Edit your profile")
              : t("onboarding.title_create", "Create your profile")}
          </h1>
          <p className="flow-description">
            {isEditMode
              ? t(
                  "onboarding.description_edit",
                  "Update your profile card. Changes will be reviewed again.",
                )
              : t(
                  "onboarding.description_create",
                  "Join a curated network of builders and early adopters.",
                )}
          </p>

          <section className="flow-card">
            <form className="onboarding-form" onSubmit={handleSubmit}>
              <p className="flow-muted">
                {t("onboarding.required_note", "\"*\" = Required information")}
              </p>

              {hasRejectedState ? (
                <p className="form-message form-message--error">
                  {t(
                    "onboarding.rejected_notice",
                    "Previous application was rejected. Update profile and submit again.",
                  )}
                </p>
              ) : null}

              <label className="onboarding-field">
                <span className="onboarding-label">
                  {t("onboarding.labels.full_name", "Full name *")}
                </span>
                <input
                  className={`magic-input ${errors.fullName ? "input-error" : ""}`}
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder={t("onboarding.placeholders.full_name", "Your name")}
                  maxLength={FIELD_LIMITS.fullName}
                  required
                />
                <FieldFooter
                  error={errors.fullName}
                  value={form.fullName}
                  limit={FIELD_LIMITS.fullName}
                />
              </label>

              <div className="onboarding-field">
                <span className="onboarding-label">
                  {t("onboarding.labels.preferred_contact", "Preferred contact *")}
                </span>
                <div
                  className="contact-method-switch"
                  role="radiogroup"
                  aria-label={t("onboarding.labels.preferred_contact", "Preferred contact *")}
                >
                  <button
                    type="button"
                    className={`contact-method-option ${contactMethod === "telegram" ? "active" : ""}`}
                    onClick={() => updateContactMethod("telegram")}
                  >
                    <ContactMethodIcon method="telegram" className="contact-option-icon" />
                    {t("onboarding.contact.telegram", "Telegram")}
                  </button>
                  <button
                    type="button"
                    className={`contact-method-option ${contactMethod === "email" ? "active" : ""}`}
                    onClick={() => updateContactMethod("email")}
                  >
                    <ContactMethodIcon method="email" className="contact-option-icon" />
                    {t("onboarding.contact.email", "Email")}
                  </button>
                </div>
                <input
                  className={`magic-input ${errors.contact ? "input-error" : ""}`}
                  value={form.contact}
                  onChange={(event) => updateField("contact", event.target.value)}
                  placeholder={
                    contactMethod === "telegram"
                      ? t("onboarding.placeholders.contact_telegram", "@telegram_username")
                      : t("onboarding.placeholders.contact_email", "your@email.com")
                  }
                  maxLength={FIELD_LIMITS.contact}
                  required
                />
                <FieldFooter
                  error={errors.contact}
                  helperText={t(
                    "onboarding.contact_helper",
                    "This will be shown as the contact button in your profile.",
                  )}
                  value={form.contact}
                  limit={FIELD_LIMITS.contact}
                />
              </div>

              <label className="onboarding-field">
                <span className="onboarding-label">
                  {t("onboarding.labels.country", "Where are you from? *")}
                </span>
                <input
                  className={`magic-input ${errors.country ? "input-error" : ""}`}
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  placeholder={t("onboarding.placeholders.country", "Country")}
                  maxLength={FIELD_LIMITS.country}
                  required
                />
                <FieldFooter
                  error={errors.country}
                  value={form.country}
                  limit={FIELD_LIMITS.country}
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">
                  {t("onboarding.labels.role_title", "Role / Title")}
                </span>
                <input
                  className={`magic-input ${errors.roleTitle ? "input-error" : ""}`}
                  value={form.roleTitle}
                  onChange={(event) => updateField("roleTitle", event.target.value)}
                  placeholder={t(
                    "onboarding.placeholders.role_title",
                    "e.g. Product Designer, Founder",
                  )}
                  maxLength={FIELD_LIMITS.roleTitle}
                />
                <FieldFooter
                  error={errors.roleTitle}
                  value={form.roleTitle}
                  limit={FIELD_LIMITS.roleTitle}
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">
                  {t("onboarding.labels.about", "What do you do? *")}
                </span>
                <textarea
                  ref={aboutRef}
                  className={`magic-input onboarding-textarea ${errors.about ? "input-error" : ""}`}
                  value={form.about}
                  onChange={(event) => updateField("about", event.target.value)}
                  placeholder={t(
                    "onboarding.placeholders.about",
                    "Tell us about your role, expertise, or what you're passionate about",
                  )}
                  maxLength={FIELD_LIMITS.about}
                  required
                />
                <FieldFooter
                  error={errors.about}
                  value={form.about}
                  limit={FIELD_LIMITS.about}
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">
                  {t("onboarding.labels.building", "What are you building?")}
                </span>
                <textarea
                  ref={buildingRef}
                  className={`magic-input onboarding-textarea ${errors.building ? "input-error" : ""}`}
                  value={form.building}
                  onChange={(event) => updateField("building", event.target.value)}
                  placeholder={t(
                    "onboarding.placeholders.building",
                    "Share what you're currently working on",
                  )}
                  maxLength={FIELD_LIMITS.building}
                />
                <FieldFooter
                  error={errors.building}
                  value={form.building}
                  limit={FIELD_LIMITS.building}
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label">
                  {t("onboarding.labels.looking_for", "What are you looking for?")}
                </span>
                <textarea
                  ref={lookingForRef}
                  className={`magic-input onboarding-textarea ${errors.lookingFor ? "input-error" : ""}`}
                  value={form.lookingFor}
                  onChange={(event) =>
                    updateField("lookingFor", event.target.value)
                  }
                  placeholder={t(
                    "onboarding.placeholders.looking_for",
                    "e.g. collaborators, feedback, early users, opportunities",
                  )}
                  maxLength={FIELD_LIMITS.lookingFor}
                />
                <FieldFooter
                  error={errors.lookingFor}
                  value={form.lookingFor}
                  limit={FIELD_LIMITS.lookingFor}
                />
              </label>

              <div className="onboarding-group-title">
                {t("onboarding.labels.links", "Links")}
              </div>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  {t("onboarding.labels.website", "Website / portfolio")}
                </span>
                <input
                  className={`magic-input ${errors.website ? "input-error" : ""}`}
                  value={form.website}
                  onChange={(event) => updateField("website", event.target.value)}
                  placeholder={t("onboarding.placeholders.website", "https://yourwebsite.com")}
                  maxLength={FIELD_LIMITS.website}
                />
                <FieldFooter
                  error={errors.website}
                  value={form.website}
                  limit={FIELD_LIMITS.website}
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  {t("onboarding.labels.twitter", "X / Twitter")}
                </span>
                <input
                  className={`magic-input ${errors.twitter ? "input-error" : ""}`}
                  value={form.twitter}
                  onChange={(event) => updateField("twitter", event.target.value)}
                  placeholder={t("onboarding.placeholders.twitter", "@username")}
                  maxLength={FIELD_LIMITS.twitter}
                />
                <FieldFooter
                  error={errors.twitter}
                  value={form.twitter}
                  limit={FIELD_LIMITS.twitter}
                />
              </label>

              <label className="onboarding-field">
                <span className="onboarding-label onboarding-label--light">
                  {t("onboarding.labels.linkedin", "LinkedIn")}
                </span>
                <input
                  className={`magic-input ${errors.linkedin ? "input-error" : ""}`}
                  value={form.linkedin}
                  onChange={(event) => updateField("linkedin", event.target.value)}
                  placeholder={t(
                    "onboarding.placeholders.linkedin",
                    "LinkedIn profile URL",
                  )}
                  maxLength={FIELD_LIMITS.linkedin}
                />
                <FieldFooter
                  error={errors.linkedin}
                  value={form.linkedin}
                  limit={FIELD_LIMITS.linkedin}
                />
              </label>

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? t("onboarding.buttons.saving", "Saving...")
                    : t("onboarding.buttons.submitting", "Submitting...")
                  : isEditMode
                    ? t("onboarding.buttons.save_changes", "Save changes")
                    : t("onboarding.buttons.create_profile", "Create profile")}
              </button>

              <p className="flow-muted flow-muted--center">
                {isEditMode
                  ? t(
                      "onboarding.review_note_edit",
                      "After saving, your profile returns to pending review.",
                    )
                  : t(
                      "onboarding.review_note_create",
                      "Your profile will be reviewed before becoming visible to the community.",
                    )}
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
  translate: (key: string, fallback: string) => string,
): FormErrors {
  const nextErrors: FormErrors = {};

  if (form.fullName.trim().length < 2) {
    nextErrors.fullName = translate(
      "onboarding.errors.full_name_short",
      "Enter full name (at least 2 characters).",
    );
  } else if (form.fullName.length > FIELD_LIMITS.fullName) {
    nextErrors.fullName = translate(
      "onboarding.errors.full_name_long",
      "Full name must be up to {limit} characters.",
    ).replace("{limit}", String(FIELD_LIMITS.fullName));
  }

  const contactError = validateContactInput(contactMethod, form.contact);
  if (contactError) {
    nextErrors.contact = mapContactError(contactError, translate);
  } else if (form.contact.length > FIELD_LIMITS.contact) {
    nextErrors.contact = translate(
      "onboarding.errors.contact_long",
      "Contact must be up to {limit} characters.",
    ).replace("{limit}", String(FIELD_LIMITS.contact));
  }

  if (form.country.trim().length < 2) {
    nextErrors.country = translate("onboarding.errors.country_short", "Enter your country.");
  } else if (form.country.length > FIELD_LIMITS.country) {
    nextErrors.country = translate(
      "onboarding.errors.country_long",
      "Country must be up to {limit} characters.",
    ).replace("{limit}", String(FIELD_LIMITS.country));
  }

  if (form.roleTitle.trim().length > FIELD_LIMITS.roleTitle) {
    nextErrors.roleTitle = translate(
      "onboarding.errors.role_title_long",
      "Role/Title must be up to {limit} characters.",
    ).replace("{limit}", String(FIELD_LIMITS.roleTitle));
  }

  if (form.about.trim().length < 20) {
    nextErrors.about = translate(
      "onboarding.errors.about_short",
      "Describe what you do in at least 20 characters.",
    );
  } else if (form.about.trim().length > FIELD_LIMITS.about) {
    nextErrors.about = translate(
      "onboarding.errors.about_long",
      "About text must be up to {limit} characters.",
    ).replace("{limit}", String(FIELD_LIMITS.about));
  }

  if (form.building.trim().length > FIELD_LIMITS.building) {
    nextErrors.building = translate(
      "onboarding.errors.building_long",
      "Building text must be up to {limit} characters.",
    ).replace("{limit}", String(FIELD_LIMITS.building));
  }

  if (form.lookingFor.trim().length > FIELD_LIMITS.lookingFor) {
    nextErrors.lookingFor = translate(
      "onboarding.errors.looking_for_long",
      "Looking for text must be up to {limit} characters.",
    ).replace("{limit}", String(FIELD_LIMITS.lookingFor));
  }

  if (form.website.trim()) {
    if (form.website.length > FIELD_LIMITS.website) {
      nextErrors.website = translate(
        "onboarding.errors.website_long",
        "Website must be up to {limit} characters.",
      ).replace("{limit}", String(FIELD_LIMITS.website));
    } else if (!isLikelyHttpUrl(form.website)) {
      nextErrors.website = translate(
        "onboarding.errors.website_invalid",
        "Enter a valid website URL.",
      );
    }
  }

  if (form.linkedin.trim()) {
    if (form.linkedin.length > FIELD_LIMITS.linkedin) {
      nextErrors.linkedin = translate(
        "onboarding.errors.linkedin_long",
        "LinkedIn must be up to {limit} characters.",
      ).replace("{limit}", String(FIELD_LIMITS.linkedin));
    } else if (!isLikelyHttpUrl(form.linkedin)) {
      nextErrors.linkedin = translate(
        "onboarding.errors.linkedin_invalid",
        "Enter a valid LinkedIn URL.",
      );
    }
  }

  if (form.twitter.trim()) {
    const normalized = form.twitter.trim();
    if (normalized.length > FIELD_LIMITS.twitter) {
      nextErrors.twitter = translate(
        "onboarding.errors.twitter_long",
        "Twitter must be up to {limit} characters.",
      ).replace("{limit}", String(FIELD_LIMITS.twitter));
      return nextErrors;
    }

    const isHandle = /^@?[A-Za-z0-9_]{1,15}$/.test(normalized);
    const isUrl = isLikelyHttpUrl(normalized);
    if (!isHandle && !isUrl) {
      nextErrors.twitter = translate(
        "onboarding.errors.twitter_invalid",
        "Use @username or a full profile URL.",
      );
    }
  }

  return nextErrors;
}

function mapContactError(
  error: string,
  translate: (key: string, fallback: string) => string,
) {
  if (error === "Contact is required.") {
    return translate("onboarding.errors.contact_required", "Contact is required.");
  }

  if (error === "Enter a valid email address.") {
    return translate(
      "onboarding.errors.contact_email_invalid",
      "Enter a valid email address.",
    );
  }

  if (error === "Enter Telegram username like @yourname.") {
    return translate(
      "onboarding.errors.contact_telegram_invalid",
      "Enter Telegram username like @yourname.",
    );
  }

  if (
    error ===
    "Telegram username must be 5-32 characters and contain letters, numbers or underscore."
  ) {
    return translate(
      "onboarding.errors.contact_telegram_length",
      "Telegram username must be 5-32 characters and contain letters, numbers or underscore.",
    );
  }

  return error;
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

type FieldFooterProps = {
  error?: string;
  helperText?: string;
  value: string;
  limit: number;
};

function FieldFooter({ error, helperText, value, limit }: FieldFooterProps) {
  const ratio = limit > 0 ? value.length / limit : 0;
  const counterClass =
    ratio >= 1 ? "char-counter char-counter--error" : ratio >= 0.9 ? "char-counter char-counter--warn" : "char-counter";

  return (
    <div className="field-footer">
      {error ? (
        <span className="field-error">{error}</span>
      ) : helperText ? (
        <span className="field-helper">{helperText}</span>
      ) : (
        <span className="field-helper" aria-hidden="true">
          {" "}
        </span>
      )}
      <span className={counterClass}>
        {value.length}/{limit}
      </span>
    </div>
  );
}

function autoResizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) {
    return;
  }

  const MAX_HEIGHT = 320;
  textarea.style.height = "0px";
  textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
  textarea.style.overflowY = textarea.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
}
