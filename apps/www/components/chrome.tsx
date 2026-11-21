import { CopyButton } from "@www/components/copy";
import { cn } from "@/react/lib/cn";

/** A page's head: an eyebrow label, the Funnel Display title and a line of DM Sans under it, over a hairline. */
export function PageHead({ title, description, eyebrow, children }: { title: React.ReactNode; description?: React.ReactNode; eyebrow?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="border-b border-edge px-6 pt-12 pb-8 max-sm:px-4 max-sm:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-180">
          {eyebrow && <p className="mb-3 type-label text-fg-muted">{eyebrow}</p>}
          <h1 className="type-heading-1 max-sm:type-heading-3">{title}</h1>
          {description && <p className="mt-3 type-body text-fg-soft">{description}</p>}
        </div>
        {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}

/** The page's body. */
export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-14 px-6 py-10 max-sm:px-4", className)}>{children}</div>;
}

/** A titled section of a page. */
export function Section({ id, title, description, children }: { id?: string; title: string; description?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="grid min-w-0 scroll-mt-6 gap-5">
      <div className="grid gap-1.5">
        <h2 className="type-heading-3">{title}</h2>
        {description && <p className="max-w-180 type-ui text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** A shell command to copy, in Geist Mono on the card fill. */
export function Command({ command }: { command: string }) {
  return (
    <div className="flex h-12 min-w-0 items-center gap-3 rounded-control bg-surface-raised pr-2 pl-4">
      <span aria-hidden="true" className="type-code text-fg-faint">$</span>
      <code className="min-w-0 flex-1 truncate type-code text-fg">{command}</code>
      <CopyButton value={command} label="Copy command" />
    </div>
  );
}

/** Source code with its file name and a copy button. */
export function Code({ code, title, tall = false }: { code: string; title: string; tall?: boolean }) {
  const text = code.trim();
  return (
    <figure className="m-0 min-w-0 overflow-hidden rounded-control bg-surface-sunken">
      <figcaption className="flex h-11 items-center justify-between gap-3 border-b border-edge pr-2 pl-4">
        <span className="min-w-0 truncate type-code text-fg-muted">{title}</span>
        <CopyButton value={text} label={`Copy ${title}`} />
      </figcaption>
      <pre className={cn("overflow-auto p-4 type-code text-fg-soft fade-y fade-x [scrollbar-width:thin]", tall ? "max-h-140" : "max-h-96")}>
        <code>{text}</code>
      </pre>
    </figure>
  );
}

/** Inline code in docs text, kept whole. */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded-ds-sm bg-surface-raised px-1.5 py-0.5 type-code text-fg [overflow-wrap:anywhere]">{children}</code>;
}

/** Docs text from the registry: `backticked` names become inline code. */
export function Prose({ text }: { text: string }) {
  return <>{Array.from(text.matchAll(/`([^`]+)`|([^`]+|`)/g), (m) => (m[1] !== undefined ? <InlineCode key={m.index}>{m[1]}</InlineCode> : m[0]))}</>;
}
