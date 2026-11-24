"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

/** A copy button: the glyph turns into a check for two seconds. Icons swap in place; nothing moves. */
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true), () => undefined)}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-fg-muted transition-[color,background-color] duration-160 ease-standard hover:bg-surface-subtle hover:text-fg"
    >
      {copied ? <Check size={16} strokeWidth={1.5} aria-hidden="true" /> : <Copy size={16} strokeWidth={1.5} aria-hidden="true" />}
    </button>
  );
}
