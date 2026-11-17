import type { ComponentType } from "react";
import { ExternalLink } from "lucide-react";

import { cn } from "@/react/lib/cn";

/** An example rendered in place on Black, framed by a hairline, with a link to it alone (Phone width there too). */
export function Preview({ example: Example, label, href, center, bleed }: { example: ComponentType; label: string; href: string; center: boolean; bleed?: boolean }) {
  return (
    <figure className="m-0 grid min-w-0 gap-3">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <figcaption className="type-ui-strong text-fg">{label}</figcaption>
        <a href={href} target="_blank" rel="noreferrer" aria-label={`Open ${label} alone`} className="inline-flex size-8 items-center justify-center rounded-control text-fg-muted transition-[color,background-color] duration-150 ease-standard hover:bg-surface-subtle hover:text-fg">
          <ExternalLink size={16} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
      <div className="overflow-hidden rounded-container border border-edge">
        <div className={cn("bg-surface", bleed ? "" : center ? "flex min-h-48 items-center justify-center px-8 py-10 max-sm:px-4" : "p-8 max-sm:p-4")}>
          <div className={center ? "min-w-0 max-w-full" : "min-w-0 max-w-full w-full"}>
            <Example />
          </div>
        </div>
      </div>
    </figure>
  );
}
