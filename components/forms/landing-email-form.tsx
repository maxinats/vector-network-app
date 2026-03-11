"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useI18n } from "@/components/providers/language-provider";

type FormStatus = {
  type: "error";
  message: string;
} | null;

export function LandingEmailForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [agreedLegal, setAgreedLegal] = useState(false);
  const [agreedNewsletters, setAgreedNewsletters] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setStatus({
        type: "error",
        message: t("landing_form.errors.email_required", "Enter your email address."),
      });
      return;
    }

    if (!agreedLegal) {
      setStatus({
        type: "error",
        message: t(
          "landing_form.errors.legal_required",
          "Please accept Privacy Policy and Terms of Service before continuing.",
        ),
      });
      return;
    }

    if (!agreedNewsletters) {
      setStatus({
        type: "error",
        message: t(
          "landing_form.errors.newsletters_required",
          "Please agree to receive informational newsletters before continuing.",
        ),
      });
      return;
    }

    const query = new URLSearchParams({
      mode: "signup",
      email: normalizedEmail,
    });
    router.push(`/auth?${query.toString()}`);
  }

  return (
    <form className="magic-form" onSubmit={handleSubmit}>
      <div className="safe-row">
        {t("landing_form.safe_note", "Your data is safe. No spam, ever.")}
      </div>

      <label className="sr-only" htmlFor="landing-email">
        {t("landing_form.email_label", "Email address")}
      </label>
      <input
        id="landing-email"
        className="magic-input"
        type="email"
        placeholder={t("landing_form.email_placeholder", "Email address")}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />

      <label className="policy-row" htmlFor="landing-legal-consent">
        <input
          id="landing-legal-consent"
          className="policy-checkbox"
          type="checkbox"
          checked={agreedLegal}
          onChange={(event) => setAgreedLegal(event.target.checked)}
        />
        <span>
          {t("landing_form.legal_agree_prefix", "I agree with")}{" "}
          <Link href="/privacy" className="inline-link">
            {t("footer.privacy_policy", "Privacy Policy")}
          </Link>{" "}
          {t("landing_form.and", "and")}{" "}
          <Link href="/terms" className="inline-link">
            {t("footer.terms", "Terms of Service")}
          </Link>
        </span>
      </label>

      <label className="policy-row" htmlFor="landing-newsletters-consent">
        <input
          id="landing-newsletters-consent"
          className="policy-checkbox"
          type="checkbox"
          checked={agreedNewsletters}
          onChange={(event) => setAgreedNewsletters(event.target.checked)}
        />
        <span>
          {t(
            "landing_form.newsletters_agree",
            "I agree to receive informational newsletters from the service.",
          )}
        </span>
      </label>

      <button className="primary-button" type="submit">
        {t("landing_form.get_access", "Get Access ->")}
      </button>

      <p className="switch-copy">
        {t("landing_form.already_joined", "Already joined?")}{" "}
        <Link href="/auth?mode=login" className="inline-link strong-link">
          {t("landing_form.log_in", "Log in")}
        </Link>
      </p>

      {status ? (
        <p className="form-message form-message--error">{status.message}</p>
      ) : null}
    </form>
  );
}
