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
  const [agreed, setAgreed] = useState(false);
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

    if (!agreed) {
      setStatus({
        type: "error",
        message: t(
          "landing_form.errors.privacy_required",
          "Please accept Privacy Policy before continuing.",
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

      <label className="policy-row" htmlFor="landing-privacy-consent">
        <input
          id="landing-privacy-consent"
          className="policy-checkbox"
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        <span>
          {t("landing_form.agree_prefix", "I agree with")}{" "}
          <Link href="/privacy" className="inline-link">
            {t("footer.privacy_policy", "Privacy Policy")}
          </Link>
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
