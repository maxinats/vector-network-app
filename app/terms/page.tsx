import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="auth-shell">
      <h1>Terms of Service</h1>
      <p className="auth-description">
        This page is a placeholder for your service terms.
      </p>
      <Link href="/" className="primary-button auth-button-link">
        Back to main page
      </Link>
    </main>
  );
}
