"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MagicLinkMode = "signup" | "login";

type MagicLinkFormProps = {
  mode: MagicLinkMode;
};

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

export function MagicLinkForm({ mode }: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(mode === "login");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const submitLabel = mode === "signup" ? "Get Access ->" : "Send Magic Link";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setStatus({ type: "error", message: "Enter your email address." });
      return;
    }

    if (mode === "signup" && !agreed) {
      setStatus({
        type: "error",
        message: "Please accept Privacy Policy before continuing.",
      });
      return;
    }

    if (!supabase) {
      setStatus({
        type: "error",
        message:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const redirectTo = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: mode === "signup",
      },
    });

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      setLoading(false);
      return;
    }

    setStatus({
      type: "success",
      message: `Magic link sent to ${normalizedEmail}.`,
    });
    setLoading(false);
  }

  return (
    <form className="magic-form" onSubmit={handleSubmit}>
      <div className="safe-row">Your data is safe. No spam, ever.</div>

      <label className="sr-only" htmlFor={`${mode}-email`}>
        Email address
      </label>
      <input
        id={`${mode}-email`}
        className="magic-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />

      {mode === "signup" ? (
        <label className="policy-row" htmlFor="privacy-consent">
          <input
            id="privacy-consent"
            className="policy-checkbox"
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I agree with{" "}
            <Link href="/privacy" className="inline-link">
              Privacy Policy
            </Link>
          </span>
        </label>
      ) : null}

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Sending..." : submitLabel}
      </button>

      {mode === "signup" ? (
        <p className="switch-copy">
          Already joined?{" "}
          <Link href="/auth" className="inline-link strong-link">
            Log in
          </Link>
        </p>
      ) : (
        <p className="switch-copy">
          New here?{" "}
          <Link href="/" className="inline-link strong-link">
            Get access
          </Link>
        </p>
      )}

      {status ? (
        <p
          role="status"
          className={`form-message ${status.type === "error" ? "form-message--error" : "form-message--success"}`}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
