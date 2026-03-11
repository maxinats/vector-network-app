"use client";

import { FormEvent, useMemo, useState } from "react";
import { useI18n } from "@/components/providers/language-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthView = "login" | "signup" | "verify";

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

type EmailPasswordAuthFormProps = {
  onAuthenticated: (userId: string) => Promise<void>;
  initialMode?: "login" | "signup";
  initialEmail?: string;
};

export function EmailPasswordAuthForm({
  onAuthenticated,
  initialMode = "login",
  initialEmail = "",
}: EmailPasswordAuthFormProps) {
  const { t } = useI18n();
  const [view, setView] = useState<AuthView>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setStatus({
        type: "error",
        message: t(
          "auth_form.errors.supabase_not_configured",
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        ),
      });
      return;
    }

    if (!email.trim() || !password) {
      setStatus({
        type: "error",
        message: t("auth_form.errors.enter_email_password", "Enter email and password."),
      });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setStatus({
        type: "error",
        message: t(
          "auth_form.errors.resolve_user_after_signin",
          "Failed to resolve user after sign in.",
        ),
      });
      setIsLoading(false);
      return;
    }

    await onAuthenticated(data.user.id);
    setIsLoading(false);
  }

  async function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setStatus({
        type: "error",
        message: t(
          "auth_form.errors.supabase_not_configured",
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        ),
      });
      return;
    }

    if (!email.trim() || !password) {
      setStatus({
        type: "error",
        message: t("auth_form.errors.enter_email_password", "Enter email and password."),
      });
      return;
    }

    if (password.length < 6) {
      setStatus({
        type: "error",
        message: t(
          "auth_form.errors.password_min_length",
          "Password must be at least 6 characters.",
        ),
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        type: "error",
        message: t("auth_form.errors.passwords_mismatch", "Passwords do not match."),
      });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsLoading(false);
      return;
    }

    if (data.user && data.session) {
      await onAuthenticated(data.user.id);
      setIsLoading(false);
      return;
    }

    setVerificationEmail(email.trim());
    setView("verify");
    setStatus({
      type: "success",
      message: t(
        "auth_form.status.account_created_verify",
        "Account created. Enter the verification code sent to your email.",
      ),
    });
    setIsLoading(false);
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    if (!verificationEmail || !verificationCode.trim()) {
      setStatus({
        type: "error",
        message: t(
          "auth_form.errors.enter_verification_code",
          "Enter verification code from your email.",
        ),
      });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email: verificationEmail,
      token: verificationCode.trim(),
      type: "signup",
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setStatus({
        type: "error",
        message: t(
          "auth_form.errors.verification_failed",
          "Verification failed. Try requesting code again.",
        ),
      });
      setIsLoading(false);
      return;
    }

    await onAuthenticated(data.user.id);
    setIsLoading(false);
  }

  async function handleResendCode() {
    if (!supabase || !verificationEmail) {
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: verificationEmail,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsLoading(false);
      return;
    }

    setStatus({
      type: "success",
      message: t("auth_form.status.code_resent", "Verification code was sent again."),
    });
    setIsLoading(false);
  }

  return (
    <div className="auth-form-stack">
      <div className="auth-mode-switch">
        <button
          type="button"
          className={`auth-mode-button ${view === "login" ? "active" : ""}`}
          onClick={() => {
            setView("login");
            setStatus(null);
          }}
        >
          {t("auth_form.tabs.log_in", "Log in")}
        </button>
        <button
          type="button"
          className={`auth-mode-button ${view === "signup" || view === "verify" ? "active" : ""}`}
          onClick={() => {
            setView("signup");
            setStatus(null);
          }}
        >
          {t("auth_form.tabs.sign_up", "Sign up")}
        </button>
      </div>

      {view === "login" ? (
        <form className="magic-form" onSubmit={handleLoginSubmit}>
          <input
            className="magic-input"
            type="email"
            placeholder={t("auth_form.placeholders.email", "Email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="magic-input"
            type="password"
            placeholder={t("auth_form.placeholders.password", "Password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading
              ? t("auth_form.buttons.signing_in", "Signing in...")
              : t("auth_form.buttons.log_in", "Log in")}
          </button>
        </form>
      ) : null}

      {view === "signup" ? (
        <form className="magic-form" onSubmit={handleSignupSubmit}>
          <input
            className="magic-input"
            type="email"
            placeholder={t("auth_form.placeholders.email", "Email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="magic-input"
            type="password"
            placeholder={t(
              "auth_form.placeholders.password_min",
              "Password (min 6 chars)",
            )}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <input
            className="magic-input"
            type="password"
            placeholder={t("auth_form.placeholders.confirm_password", "Confirm password")}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading
              ? t("auth_form.buttons.creating_account", "Creating account...")
              : t("auth_form.buttons.create_account", "Create account")}
          </button>
        </form>
      ) : null}

      {view === "verify" ? (
        <form className="magic-form" onSubmit={handleVerifySubmit}>
          <p className="safe-row">
            {t("auth_form.verification_email_label", "Verification email:")}{" "}
            {verificationEmail}
          </p>
          <input
            className="magic-input"
            type="text"
            placeholder={t(
              "auth_form.placeholders.verification_code",
              "Email verification code",
            )}
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            required
          />
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading
              ? t("auth_form.buttons.verifying", "Verifying...")
              : t("auth_form.buttons.verify_code", "Verify code")}
          </button>
          <button
            type="button"
            className="auth-inline-button"
            onClick={handleResendCode}
            disabled={isLoading}
          >
            {t("auth_form.buttons.resend_code", "Resend code")}
          </button>
        </form>
      ) : null}

      {status ? (
        <p
          role="status"
          className={`form-message ${status.type === "error" ? "form-message--error" : "form-message--success"}`}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
