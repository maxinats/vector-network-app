import Image from "next/image";
import Link from "next/link";
import { MagicLinkForm } from "@/components/forms/magic-link-form";

type FeatureIconType = "user-plus" | "link" | "globe" | "tool";

const features = [
  {
    icon: "user-plus" as const,
    title: "Discover builders",
    text: "Browse profiles of people working on startups, products, and side projects.",
  },
  {
    icon: "link" as const,
    title: "Connect directly",
    text: "Reach out to members for ideas, feedback, and collaborations.",
  },
  {
    icon: "globe" as const,
    title: "Find opportunities",
    text: "Discover talents, partnerships, and early-stage teams.",
  },
  {
    icon: "tool" as const,
    title: "Show what you're building",
    text: "Create your profile and share your ideas with the network.",
  },
];

function FeatureIcon({ type }: { type: FeatureIconType }) {
  if (type === "user-plus") {
    return (
      <svg viewBox="0 0 20 17" aria-hidden="true">
        <path
          d="M13.25 15.75V14.0833C13.25 13.1993 12.8988 12.3514 12.2737 11.7263C11.6486 11.1012 10.8007 10.75 9.91667 10.75H4.08333C3.19928 10.75 2.35143 11.1012 1.72631 11.7263C1.10119 12.3514 0.75 13.1993 0.75 14.0833V15.75M16.5833 4.91667V9.91667M19.0833 7.41667H14.0833M10.3333 4.08333C10.3333 5.92428 8.84095 7.41667 7 7.41667C5.15905 7.41667 3.66667 5.92428 3.66667 4.08333C3.66667 2.24238 5.15905 0.75 7 0.75C8.84095 0.75 10.3333 2.24238 10.3333 4.08333Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "link") {
    return (
      <svg viewBox="0 0 19 19" aria-hidden="true">
        <path
          d="M7.36963 9.8613C7.72751 10.3397 8.1841 10.7356 8.70842 11.0221C9.23275 11.3085 9.81255 11.4789 10.4085 11.5216C11.0045 11.5643 11.6026 11.4783 12.1624 11.2695C12.7222 11.0606 13.2306 10.7339 13.653 10.3113L16.153 7.8113C16.912 7.02546 17.3319 5.97295 17.3224 4.88046C17.3129 3.78797 16.8747 2.74292 16.1022 1.97039C15.3297 1.19785 14.2846 0.759651 13.1921 0.750158C12.0996 0.740664 11.0471 1.16064 10.2613 1.91963L8.82797 3.34463M10.703 8.19463C10.3451 7.71619 9.8885 7.32031 9.36417 7.03385C8.83985 6.74739 8.26004 6.57704 7.66409 6.53435C7.06814 6.49167 6.46998 6.57766 5.91018 6.78648C5.35038 6.9953 4.84204 7.32207 4.41963 7.74463L1.91963 10.2446C1.16064 11.0305 0.740664 12.083 0.750158 13.1755C0.759651 14.268 1.19785 15.313 1.97039 16.0855C2.74292 16.8581 3.78797 17.2963 4.88046 17.3058C5.97295 17.3153 7.02546 16.8953 7.8113 16.1363L9.2363 14.7113"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "globe") {
    return (
      <svg viewBox="0 0 19 19" aria-hidden="true">
        <path
          d="M17.4167 9.08333C17.4167 13.6857 13.6857 17.4167 9.08333 17.4167M17.4167 9.08333C17.4167 4.48096 13.6857 0.75 9.08333 0.75M17.4167 9.08333H0.75M9.08333 17.4167C4.48096 17.4167 0.75 13.6857 0.75 9.08333M9.08333 17.4167C11.1677 15.1347 12.3523 12.1733 12.4167 9.08333C12.3523 5.99336 11.1677 3.03196 9.08333 0.75M9.08333 17.4167C6.99893 15.1347 5.81437 12.1733 5.75 9.08333C5.81437 5.99336 6.99893 3.03196 9.08333 0.75M0.75 9.08333C0.75 4.48096 4.48096 0.75 9.08333 0.75"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M12.25 5.25C12.0973 5.40577 12.0118 5.61521 12.0118 5.83333C12.0118 6.05146 12.0973 6.26089 12.25 6.41667L13.5833 7.75C13.7391 7.90269 13.9485 7.98821 14.1667 7.98821C14.3848 7.98821 14.5942 7.90269 14.75 7.75L17.8917 4.60833C18.3107 5.53432 18.4376 6.56603 18.2554 7.56595C18.0732 8.56588 17.5906 9.48654 16.8719 10.2052C16.1532 10.9239 15.2325 11.4065 14.2326 11.5887C13.2327 11.7709 12.201 11.644 11.275 11.225L5.51667 16.9833C5.18515 17.3149 4.73551 17.5011 4.26667 17.5011C3.79783 17.5011 3.34819 17.3149 3.01667 16.9833C2.68515 16.6518 2.4989 16.2022 2.4989 15.7333C2.4989 15.2645 2.68515 14.8149 3.01667 14.4833L8.775 8.725C8.35597 7.79901 8.2291 6.76731 8.41129 5.76738C8.59347 4.76745 9.07607 3.8468 9.79477 3.1281C10.5135 2.40941 11.4341 1.92681 12.434 1.74462C13.434 1.56243 14.4657 1.6893 15.3917 2.10833L12.2583 5.24167L12.25 5.25Z"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomePageSection() {
  return (
    <div className="page-shell">
      <div className="page-gradient" aria-hidden="true" />
      <div className="page-inner">
        <header className="top-nav">
          <div className="top-nav-inner">
            <span className="brand">Vector Network</span>
            <a href="#access" className="join-pill">
              Join the network
            </a>
          </div>
        </header>

        <main className="main-content">
          <section className="hero-card">
            <p className="hero-badge">Free - Builders and enthusiasts</p>
            <h1 className="hero-title">Connect With Builders</h1>
            <p className="hero-subtitle">Discover relevant people</p>
            <p className="hero-description">
              Join a curated network of builders and early adopters.
            </p>

            <div className="member-chip">
              <Image
                src="/images/member-avatar.png"
                alt="Vector Network member"
                width={40}
                height={40}
                className="member-avatar"
              />
              <div className="member-copy">
                <strong>Vector Network</strong>
                <span>Where ambitions meet initiatives</span>
              </div>
            </div>
          </section>

          <section id="access" className="access-section">
            <MagicLinkForm mode="signup" />
          </section>

          <section className="features-section">
            <h2>What You Can Do Inside</h2>
            <div className="feature-grid">
              {features.map((feature) => (
                <article key={feature.title} className="feature-card">
                  <div className="feature-icon">
                    <FeatureIcon type={feature.icon} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </section>

          <p className="afterword">
            A curated network of builders and ambitious people.
            <br />
            Profiles are reviewed to keep the network high-signal.
          </p>
        </main>

        <footer className="footer">
          <p>We respect your privacy. No spam, ever.</p>
          <p>
            <Link href="/privacy" className="inline-link">
              Privacy Policy
            </Link>{" "}
            -{" "}
            <Link href="/terms" className="inline-link">
              Terms of Service
            </Link>
          </p>
          <p className="copyright">Vector Network (c) 2026</p>
        </footer>
      </div>
    </div>
  );
}
