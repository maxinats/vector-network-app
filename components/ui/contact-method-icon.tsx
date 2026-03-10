import type { ContactMethod } from "@/lib/member-directory";

type ContactMethodIconProps = {
  method: ContactMethod;
  className?: string;
};

export function ContactMethodIcon({ method, className }: ContactMethodIconProps) {
  if (method === "telegram") {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="32" cy="32" r="32" fill="#2AABEE" />
        <path
          d="M47.7 18.5L13.8 31.9c-2.2.9-2.2 2.1-.4 2.7l8.7 2.7 3.3 10.4c.4 1.1.2 1.5 1.4 1.5.9 0 1.3-.4 1.8-.9l4.2-4.1 8.7 6.4c1.6.9 2.8.4 3.2-1.5l5.8-27.3c.6-2.4-.9-3.4-2.8-2.5zM24 36.6l19.3-12.2c.9-.5 1.7-.2 1.1.4L28 39.5l-.6 6.7-3.4-9.6z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (method === "email") {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="6" y="14" width="52" height="36" rx="8" fill="#F2F2F2" />
        <path
          d="M12 22l20 14 20-14M12 42V24m40 18V24"
          fill="none"
          stroke="#1C1C1C"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="32" fill="#EAEAEA" />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontSize="32"
        fill="#666666"
        fontFamily="Inter, sans-serif"
      >
        @
      </text>
    </svg>
  );
}
