"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthView = "login" | "signup" | "verify";

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

type EmailPasswordAuthFormProps = {
  onAuthenticated: (userId: string) => Promise<void>;
};

export function EmailPasswordAuthForm({
  onAuthenticated,
}: EmailPasswordAuthFormProps) {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
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
        message:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      });
      return;
    }

    if (!email.trim() || !password) {
      setStatus({ type: "error", message: "Enter email and password." });
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
        message: "Failed to resolve user after sign in.",
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
        message:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      });
      return;
    }

    if (!email.trim() || !password) {
      setStatus({ type: "error", message: "Enter email and password." });
      return;
    }

    if (password.length < 6) {
      setStatus({
        type: "error",
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
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
      message:
        "Account created. Enter the verification code sent to your email.",
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
        message: "Enter verification code from your email.",
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
        message: "Verification failed. Try requesting code again.",
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
      message: "Verification code was sent again.",
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
          Log in
        </button>
        <button
          type="button"
          className={`auth-mode-button ${view === "signup" || view === "verify" ? "active" : ""}`}
          onClick={() => {
            setView("signup");
            setStatus(null);
          }}
        >
          Sign up
        </button>
      </div>

      {view === "login" ? (
        <form className="magic-form" onSubmit={handleLoginSubmit}>
          <input
            className="magic-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="magic-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Log in"}
          </button>
        </form>
      ) : null}

      {view === "signup" ? (
        <form className="magic-form" onSubmit={handleSignupSubmit}>
          <input
            className="magic-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="magic-input"
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <input
            className="magic-input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
      ) : null}

      {view === "verify" ? (
        <form className="magic-form" onSubmit={handleVerifySubmit}>
          <p className="safe-row">Verification email: {verificationEmail}</p>
          <input
            className="magic-input"
            type="text"
            placeholder="Email verification code"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            required
          />
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify code"}
          </button>
          <button
            type="button"
            className="auth-inline-button"
            onClick={handleResendCode}
            disabled={isLoading}
          >
            Resend code
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
