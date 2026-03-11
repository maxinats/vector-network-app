import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

const PRIVACY_POLICY_PATH = path.join(
  process.cwd(),
  "content",
  "privacy-policy.html",
);

export default function PrivacyPage() {
  const policyHtml = readPrivacyPolicyHtml();

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />
      <main className="flow-shell policy-shell">
        <article
          className="flow-card policy-content"
          dangerouslySetInnerHTML={{ __html: policyHtml }}
        />
        <Link href="/" className="secondary-button auth-button-link">
          Back to main
        </Link>
      </main>
    </div>
  );
}

function readPrivacyPolicyHtml() {
  try {
    return fs.readFileSync(PRIVACY_POLICY_PATH, "utf8");
  } catch {
    return "<h1>Privacy Policy</h1><p>Privacy Policy is temporarily unavailable.</p>";
  }
}
