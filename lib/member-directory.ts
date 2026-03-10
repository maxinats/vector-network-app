import type { MemberProfile } from "@/lib/supabase/member-profiles";

type ConnectAction = {
  href: string;
  label: string;
};

const STOP_WORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "into",
  "that",
  "this",
  "your",
  "their",
  "what",
  "about",
  "are",
  "you",
  "our",
  "they",
  "have",
  "will",
  "can",
  "not",
  "but",
]);

export function normalizeLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("@")) {
    return `https://x.com/${trimmed.slice(1)}`;
  }

  return `https://${trimmed}`;
}

export function buildConnectAction(contact: string, fullName: string): ConnectAction | null {
  const trimmed = contact.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("www.")) {
    return {
      href: normalizeLink(trimmed),
      label: "Open contact",
    };
  }

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    return {
      href: `mailto:${trimmed}`,
      label: "Email",
    };
  }

  if (trimmed.startsWith("@") && trimmed.length > 1) {
    const username = trimmed.slice(1);
    return {
      href: `https://t.me/${username}`,
      label: "Telegram",
    };
  }

  const subject = encodeURIComponent(`Connect from Vector Network`);
  const body = encodeURIComponent(
    `Hi ${fullName}, I found your profile on Vector Network: ${trimmed}`,
  );
  return {
    href: `mailto:?subject=${subject}&body=${body}`,
    label: "Connect",
  };
}

export function buildMemberTags(profile: MemberProfile) {
  const chunks = [
    profile.role_title ?? "",
    profile.building ?? "",
    profile.looking_for ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9+#]+/g)
    .filter(Boolean);

  const uniqueTags: string[] = [];
  for (const word of chunks) {
    if (word.length < 3 || STOP_WORDS.has(word) || uniqueTags.includes(word)) {
      continue;
    }

    uniqueTags.push(capitalize(word));
    if (uniqueTags.length === 3) {
      break;
    }
  }

  if (uniqueTags.length === 0 && profile.country) {
    uniqueTags.push(profile.country);
  }

  return uniqueTags;
}

export function buildProfileLinkMap(profile: MemberProfile) {
  return [
    profile.website
      ? {
          key: "website",
          label: "Website",
          href: normalizeLink(profile.website),
        }
      : null,
    profile.twitter
      ? {
          key: "twitter",
          label: "X / Twitter",
          href: normalizeLink(profile.twitter),
        }
      : null,
    profile.linkedin
      ? {
          key: "linkedin",
          label: "LinkedIn",
          href: normalizeLink(profile.linkedin),
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; href: string }>;
}

export function getInitials(name: string) {
  const cleaned = name.trim();
  if (!cleaned) {
    return "?";
  }

  const parts = cleaned.split(/\s+/g).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function buildMemberSearchIndex(profile: MemberProfile) {
  return [
    profile.full_name,
    profile.role_title,
    profile.country,
    profile.about,
    profile.building,
    profile.looking_for,
    profile.contact,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
