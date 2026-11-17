import Link from "next/link";

import { PageBody, PageHead, Section } from "@www/components/chrome";
import { grouped, items } from "@www/lib/registry";

export const metadata = { title: "Components" };

export default function ComponentsPage() {
  return (
    <>
      <PageHead eyebrow="Library" title="All components" description={`${items.length} components, each in React and as a web component, with examples, usage rules and source.`} />
      <PageBody>
        {grouped.map((g) => (
          <Section key={g.id} title={g.label}>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
              {g.items.map((i) => (
                <li key={i.name}>
                  <Link href={`/components/${i.name}`} className="grid h-full content-start gap-2 rounded-container bg-surface-raised p-5 transition-[background-color] duration-150 ease-standard hover:bg-surface-subtle">
                    <span className="type-heading-4">{i.title}</span>
                    <span className="type-ui text-fg-muted">{i.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ))}
      </PageBody>
    </>
  );
}
