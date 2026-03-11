import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

const TERMS_OF_SERVICE_PATH = path.join(
  process.cwd(),
  "content",
  "terms-of-service.html",
);

export default function TermsPage() {
  const termsHtml = readTermsHtml();

  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />
      <main className="flow-shell policy-shell">
        <article
          className="flow-card policy-content"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />
        <Link href="/" className="secondary-button auth-button-link">
          Back to main
        </Link>
      </main>
    </div>
  );
}

function readTermsHtml() {
  try {
    return fs.readFileSync(TERMS_OF_SERVICE_PATH, "utf8");
  } catch {
    return "<h1>Terms of Service</h1><p>Terms of Service are temporarily unavailable.</p>";
  }
}
