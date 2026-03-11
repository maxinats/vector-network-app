"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/providers/language-provider";

type ExpandableTextProps = {
  text: string;
  className?: string;
  collapseAt?: number;
  moreLabel?: string;
  lessLabel?: string;
};

export function ExpandableText({
  text,
  className,
  collapseAt = 220,
  moreLabel,
  lessLabel,
}: ExpandableTextProps) {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const resolvedMoreLabel = moreLabel ?? t("expandable.more", "more");
  const resolvedLessLabel = lessLabel ?? t("expandable.less", "less");
  const normalizedText = useMemo(() => text.replace(/\r\n/g, "\n").trimEnd(), [text]);
  const isLong = normalizedText.length > collapseAt;
  const collapsedText = useMemo(
    () => truncateText(normalizedText, collapseAt),
    [collapseAt, normalizedText],
  );

  const visibleText = isExpanded || !isLong ? normalizedText : collapsedText;

  return (
    <p className={className ? `${className} expandable-text` : "expandable-text"}>
      <span className="expandable-text-content">{visibleText}</span>
      {isLong ? (
        <button
          type="button"
          className="expandable-inline-toggle"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? ` ${resolvedLessLabel}` : `... ${resolvedMoreLabel}`}
        </button>
      ) : null}
    </p>
  );
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength);
  const lastSpaceIndex = sliced.lastIndexOf(" ");
  if (lastSpaceIndex > maxLength * 0.6) {
    return sliced.slice(0, lastSpaceIndex);
  }

  return sliced;
}
