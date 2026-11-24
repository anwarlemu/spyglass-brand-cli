"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Images, LayoutGrid, Menu, Palette, PenTool, Search, Sparkles, X } from "lucide-react";

import { Input } from "@/react/components/ui/Input";
import { Logo } from "@/react/components/visuals/Logo";
import { cn } from "@/react/lib/cn";

type Entry = { name: string; title: string };
type Group = { id: string; label: string; items: Entry[] };

// A rail row: 36px, DM Sans 14px, muted until hovered; the current page sits on the card fill. Color changes only.
const ROW =
  "flex h-9 items-center gap-2.5 rounded-control px-3 type-ui text-fg-muted outline-none transition-[color,background-color] duration-160 ease-standard hover:bg-surface-subtle hover:text-fg aria-[current=page]:bg-surface-raised aria-[current=page]:text-fg";

const PAGES = [
  { href: "/", label: "Introduction", icon: BookOpen },
  { href: "/components", label: "All components", icon: LayoutGrid },
  { href: "/theme", label: "Theme", icon: Palette },
  { href: "/assets", label: "Assets", icon: Images },
  { href: "/illustrations", label: "Illustrations", icon: Sparkles },
  { href: "/figma", label: "Figma", icon: PenTool },
];

function Rows({ groups, query, onNavigate }: { groups: Group[]; query: string; onNavigate: () => void }) {
  const pathname = usePathname();
  const q = query.trim().toLowerCase();
  const shown = groups.map((g) => ({ ...g, items: q ? g.items.filter((e) => e.title.toLowerCase().includes(q) || e.name.includes(q)) : g.items })).filter((g) => g.items.length);
  return (
    <>
      {!q && (
        <ul className="grid gap-0.5">
          {PAGES.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} onClick={onNavigate} aria-current={pathname === href ? "page" : undefined} className={ROW}>
                <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {shown.length ? (
        shown.map((g) => (
          <div key={g.id}>
            <p className="mb-2 px-3 type-label text-fg-faint">{g.label}</p>
            <ul className="grid gap-0.5">
              {g.items.map((e) => {
                const href = `/components/${e.name}`;
                return (
                  <li key={e.name}>
                    <Link href={href} onClick={onNavigate} aria-current={pathname === href ? "page" : undefined} className={ROW}>
                      {e.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      ) : (
        <p className="px-3 type-ui text-fg-muted">Nothing matches.</p>
      )}
    </>
  );
}

/** The docs' rail: the lockup, a filter, the pages and every component by group. Below 1024px it folds into a bar. */
export function DocsRail({ groups }: { groups: Group[] }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-edge bg-surface px-4 lg:hidden">
        <Link href="/" aria-label="Spyglass design system" className="rounded-control">
          <Logo height={22} />
        </Link>
        <button type="button" aria-expanded={open} aria-controls="docs-rail" onClick={() => setOpen((o) => !o)} className="inline-flex size-10 items-center justify-center rounded-control text-fg transition-[background-color] duration-160 ease-standard hover:bg-surface-subtle">
          {open ? <X size={20} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.5} aria-hidden="true" />}
          <span className="sr-only">{open ? "Close the library" : "Open the library"}</span>
        </button>
      </div>
      <nav
        id="docs-rail"
        aria-label="Library"
        className={cn("z-20 flex-col border-r border-edge bg-surface max-lg:fixed max-lg:inset-x-0 max-lg:top-14 max-lg:bottom-0 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-(--ds-layout-rail) lg:shrink-0", open ? "flex" : "hidden")}
      >
        <Link href="/" aria-label="Spyglass design system" className="mx-6 mt-6 mb-5 hidden w-fit rounded-control lg:block">
          <Logo height={24} />
        </Link>
        <div className="relative mx-3 mt-3 mb-4 lg:mt-0">
          <Search size={16} strokeWidth={1.5} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter components" aria-label="Filter components" size="sm" className="pl-9" />
        </div>
        <div className="grid min-h-0 flex-1 content-start gap-6 overflow-y-auto overscroll-contain px-3 pb-8 fade-y [scrollbar-width:thin]">
          <Rows groups={groups} query={query} onNavigate={close} />
        </div>
      </nav>
    </>
  );
}
