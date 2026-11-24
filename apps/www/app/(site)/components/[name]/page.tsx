import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Code, Command, InlineCode, PageBody, PageHead, Prose, Section } from "@www/components/chrome";
import { Preview } from "@www/components/preview";
import { examples } from "@www/lib/examples.generated";
import { CLI, type Item, assetBase, findItem, groups, items, sourceOf } from "@www/lib/registry";

export function generateStaticParams() {
  return items.map((i) => ({ name: i.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  return item ? { title: item.title, description: item.description } : {};
}

const LINK = "inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 type-ui text-fg-muted transition-[color] duration-160 ease-standard hover:text-fg";

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  if (!item) notFound();
  const all = examples[item.name] ?? {};
  const at = items.findIndex((i) => i.name === item.name);
  const prev = at > 0 ? items[at - 1] : undefined;
  const next = at < items.length - 1 ? items[at + 1] : undefined;
  const el = item.flavors.elements;
  return (
    <>
      <PageHead eyebrow={groups[item.group] ?? item.group} title={item.title} description={<Prose text={item.description} />} />
      <PageBody className="max-w-250">
        <Section id="install" title="Install" description="React apps get the React files; every other stack gets the web component.">
          <div className="grid gap-2">
            <Command command={`${CLI} add ${item.name}`} />
            {el && <Command command={`<script type="module" src="${assetBase}/elements/${el.tag.replace(/^[a-z]+-/, "")}.js"></script>`} />}
          </div>
        </Section>

        <div id="preview" className="grid scroll-mt-6 gap-10">
          {item.examples.map((e) => {
            const Demo = all[e.name];
            return Demo ? <Preview key={e.name} example={Demo} label={e.label} center={e.center} bleed={e.bleed} href={`/preview/${item.name}/${e.name}`} /> : null;
          })}
        </div>

        <Usage item={item} />

        {item.api && item.api.components.length > 0 && (
          <Section id="props" title="Props" description={el ? `The web component takes the same as attributes or properties (<${el.tag}>); title is heading there.` : undefined}>
            {item.api.components.map((c) => (
              <div key={c.name} className="grid gap-3">
                <p className="type-code text-fg">{`<${c.name}>`}</p>
                <div className="overflow-hidden rounded-control border border-edge">
                  <div className="overflow-x-auto fade-x">
                    <table className="w-full border-collapse type-ui">
                      <thead>
                        <tr className="text-left">
                          <th className="h-10 border-b border-edge px-4 type-label text-fg-muted">Prop</th>
                          <th className="h-10 border-b border-edge px-4 type-label text-fg-muted">Type</th>
                          <th className="h-10 border-b border-edge px-4 type-label text-fg-muted">Default</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.props.map((p) => (
                          <tr key={p.name} className="align-top">
                            <td className="border-b border-edge px-4 py-3"><InlineCode>{p.name}</InlineCode></td>
                            <td className="border-b border-edge px-4 py-3 type-code text-fg-soft">{p.type}{p.description && <p className="mt-1 type-caption text-fg-muted">{p.description}</p>}</td>
                            <td className="border-b border-edge px-4 py-3 type-code text-fg-muted">{p.default ?? ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </Section>
        )}

        <Section id="example" title="Examples" description="The same example in React and as web components; both render identically.">
          <div className="grid gap-5">
            {item.examples.map((e) => (
              <div key={e.name} className="grid gap-3 lg:grid-cols-2">
                <Code title={`react/examples/${item.name}/${e.name}.tsx`} code={sourceOf(`react/examples/${item.name}/${e.name}.tsx`)} />
                {el && <Code title={`elements/examples/${item.name}/${e.name}.html`} code={sourceOf(`elements/examples/${item.name}/${e.name}.html`)} />}
              </div>
            ))}
          </div>
        </Section>

        <Section id="source" title="Source">
          <div className="grid gap-5">
            {item.files.map((p) => <Code key={p} title={p} code={sourceOf(p)} tall />)}
            {el?.files.map((p) => <Code key={p} title={p} code={sourceOf(p)} tall />)}
          </div>
          <p className="type-caption text-fg-muted">Reference: {item.source}.</p>
        </Section>

        <nav aria-label="More components" className="flex items-center justify-between gap-3 border-t border-edge pt-6">
          {prev ? <Link href={`/components/${prev.name}`} className={LINK}><ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" /> {prev.title}</Link> : <span />}
          {next && <Link href={`/components/${next.name}`} className={LINK}>{next.title} <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" /></Link>}
        </nav>
      </PageBody>
    </>
  );
}

function Usage({ item }: { item: Item }) {
  return (
    <Section id="usage" title="Usage">
      <div className="grid gap-5 rounded-container bg-surface-raised p-6 max-sm:p-5">
        <p className="type-body text-fg"><Prose text={item.use_for} /></p>
        {item.never.length > 0 && (
          <div className="grid gap-2">
            <p className="type-label text-fg-muted">Never</p>
            <ul className="grid gap-1.5 type-ui text-fg-soft">
              {item.never.map((n) => (
                <li key={n} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-fg-faint" />
                  <span><Prose text={n} /></span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {item.body && <p className="max-w-180 type-ui text-fg-soft"><Prose text={item.body.replace(/\n/g, " ")} /></p>}
      {(item.requires.length > 0 || item.dependencies.length > 0) && (
        <p className="type-ui text-fg-muted">
          Adds with it: {item.requires.map((d, i) => <span key={d}>{i > 0 && ", "}<Link href={`/components/${d}`} className="text-fg underline decoration-edge-strong underline-offset-4">{d}</Link></span>)}
          {item.dependencies.length > 0 && <> packages {item.dependencies.map((p) => <InlineCode key={p}>{p}</InlineCode>)}</>}
        </p>
      )}
    </Section>
  );
}
