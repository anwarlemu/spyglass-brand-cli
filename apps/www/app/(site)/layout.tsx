import { DocsRail } from "@www/components/nav";
import { grouped } from "@www/lib/registry";

// The docs pages: the rail at the left, the page beside it. Example previews (app/preview) render bare.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex">
      <DocsRail groups={grouped.map((g) => ({ id: g.id, label: g.label, items: g.items.map((i) => ({ name: i.name, title: i.title })) }))} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
