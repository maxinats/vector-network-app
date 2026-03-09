import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="auth-shell">
      <h1>Privacy Policy</h1>
      <p className="auth-description">
        This page is a placeholder for your full privacy policy.
      </p>
      <Link href="/" className="primary-button auth-button-link">
        Back to main page
      </Link>
    </main>
  );
}
