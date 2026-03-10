"use client";

import { useMemo, useState } from "react";

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
  moreLabel = "more",
  lessLabel = "less",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
          {isExpanded ? ` ${lessLabel}` : `... ${moreLabel}`}
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
