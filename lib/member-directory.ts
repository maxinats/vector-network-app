import type { MemberProfile } from "@/lib/supabase/member-profiles";

export type ContactMethod = "telegram" | "email" | "link" | "unknown";
export type ContactInputMethod = "telegram" | "email";

type ConnectAction = {
  href: string;
  label: string;
  method: ContactMethod;
  value: string;
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
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TELEGRAM_USERNAME_REGEX = /^[a-zA-Z0-9_]{5,32}$/;

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
  const parsedContact = parseStoredContact(contact);
  if (!parsedContact.value) {
    return null;
  }

  if (parsedContact.method === "link") {
    return {
      href: normalizeLink(parsedContact.value),
      label: "Open contact",
      method: "link",
      value: parsedContact.value,
    };
  }

  if (parsedContact.method === "email") {
    return {
      href: `mailto:${parsedContact.value}`,
      label: "Email",
      method: "email",
      value: parsedContact.value,
    };
  }

  if (parsedContact.method === "telegram") {
    const username = parsedContact.value.slice(1);
    return {
      href: `https://t.me/${username}`,
      label: "Telegram",
      method: "telegram",
      value: parsedContact.value,
    };
  }

  const subject = encodeURIComponent(`Connect from Vector Network`);
  const body = encodeURIComponent(
    `Hi ${fullName}, I found your profile on Vector Network: ${parsedContact.value}`,
  );
  return {
    href: `mailto:?subject=${subject}&body=${body}`,
    label: "Connect",
    method: "unknown",
    value: parsedContact.value,
  };
}

export function parseStoredContact(contact: string): {
  method: ContactMethod;
  value: string;
} {
  const trimmed = contact.trim();
  if (!trimmed) {
    return { method: "unknown", value: "" };
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("telegram:")) {
    const handle = normalizeTelegramHandle(trimmed.slice("telegram:".length));
    return handle
      ? {
          method: "telegram",
          value: handle,
        }
      : { method: "unknown", value: "" };
  }

  if (lower.startsWith("email:")) {
    const emailValue = trimmed.slice("email:".length).trim().toLowerCase();
    return EMAIL_REGEX.test(emailValue)
      ? {
          method: "email",
          value: emailValue,
        }
      : { method: "unknown", value: trimmed.slice("email:".length).trim() };
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("www.")) {
    const telegramFromLink = normalizeTelegramHandle(trimmed);
    if (telegramFromLink) {
      return {
        method: "telegram",
        value: telegramFromLink,
      };
    }

    return {
      method: "link",
      value: trimmed,
    };
  }

  if (EMAIL_REGEX.test(trimmed)) {
    return {
      method: "email",
      value: trimmed.toLowerCase(),
    };
  }

  const telegramHandle = normalizeTelegramHandle(trimmed);
  if (telegramHandle) {
    return {
      method: "telegram",
      value: telegramHandle,
    };
  }

  return {
    method: "unknown",
    value: trimmed,
  };
}

export function parseContactForInput(contact: string): {
  method: ContactInputMethod;
  value: string;
} {
  const parsedContact = parseStoredContact(contact);
  if (parsedContact.method === "telegram") {
    return {
      method: "telegram",
      value: parsedContact.value,
    };
  }

  if (parsedContact.method === "email") {
    return {
      method: "email",
      value: parsedContact.value,
    };
  }

  if (contact.trim().startsWith("@")) {
    return {
      method: "telegram",
      value: contact.trim(),
    };
  }

  return {
    method: "email",
    value: parsedContact.value || contact.trim(),
  };
}

export function validateContactInput(
  method: ContactInputMethod,
  value: string,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Contact is required.";
  }

  if (method === "email") {
    if (!EMAIL_REGEX.test(trimmed)) {
      return "Enter a valid email address.";
    }
    return null;
  }

  const handle = normalizeTelegramHandle(trimmed);
  if (!handle) {
    return "Enter Telegram username like @yourname.";
  }

  if (!TELEGRAM_USERNAME_REGEX.test(handle.slice(1))) {
    return "Telegram username must be 5-32 characters and contain letters, numbers or underscore.";
  }

  return null;
}

export function formatContactForStorage(
  method: ContactInputMethod,
  value: string,
) {
  if (method === "email") {
    return `email:${value.trim().toLowerCase()}`;
  }

  const normalizedHandle = normalizeTelegramHandle(value.trim());
  return `telegram:${normalizedHandle}`;
}

export function isLikelyHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(normalized);
    return Boolean(url.hostname && url.hostname.includes("."));
  } catch {
    return false;
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

function normalizeTelegramHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("@")) {
    const username = trimmed.slice(1);
    return TELEGRAM_USERNAME_REGEX.test(username) ? `@${username}` : "";
  }

  const linkMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]{5,32})(?:[/?#].*)?$/i,
  );
  if (linkMatch?.[1]) {
    return `@${linkMatch[1]}`;
  }

  return TELEGRAM_USERNAME_REGEX.test(trimmed) ? `@${trimmed}` : "";
}
