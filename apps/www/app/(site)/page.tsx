import Link from "next/link";

import { AsciiTexture } from "@/react/components/visuals/AsciiTexture";
import { BrandLight } from "@/react/components/visuals/BrandLight";
import { Button } from "@/react/components/ui/Button";
import { Command, PageBody, Section } from "@www/components/chrome";
import { CLI, INSTALL_COMMAND, REPO, grouped, items, registryName } from "@www/lib/registry";

export default function HomePage() {
  return (
    <>
      {/* The hero, as the brand's slides set one: the texture behind, the light flowing in along the foot. */}
      <header className="relative overflow-hidden border-b border-edge">
        <AsciiTexture seed={3} density={0.7} width={1440} height={560} cover clear={[{ x: 0, y: 140, w: 900, h: 260 }]} className="absolute inset-0 size-full" />
        <BrandLight variant="band" seed={1} width={1440} height={200} cover ground={false} className="absolute inset-x-0 bottom-0 h-[26%]" />
        <div className="relative px-6 pt-20 pb-[16%] max-sm:px-4 max-sm:pt-12 max-sm:pb-[34%]">
          <p className="mb-5 type-label text-fg-muted">{registryName} design system</p>
          <h1 className="max-w-210 type-display max-md:type-hero max-sm:type-heading-1">The brand, the library and the rules in one CLI.</h1>
          <p className="mt-6 max-w-160 type-body-lg text-fg-soft">Tokens, logos, fonts, the brand light and the ASCII texture, and {items.length} components in React and as web components. Every value traces to the brand guidelines.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/components">Browse components</Button>
            <Button href="/theme" variant="secondary">See the theme</Button>
          </div>
        </div>
      </header>
      <PageBody className="max-w-250">
        <Section title="Install the CLI" description="Run once from the project root. init adds the brand stylesheet, the Tailwind theme, the fonts and the agent instructions.">
          <div className="grid gap-2">
            <Command command={INSTALL_COMMAND} />
            <Command command={`${CLI} init`} />
          </div>
        </Section>
        <Section title="Add components" description="React apps get the React files; every other stack gets web components that carry their own styles. Names resolve however they are typed.">
          <div className="grid gap-2">
            <Command command={`${CLI} add button card search-bar`} />
            <Command command={`${CLI} view search-bar`} />
          </div>
        </Section>
        <Section title="Draw the brand graphics" description="The light and the texture are generated from a seed, never pasted as images: the same seed draws the same picture in a page, a component and a file.">
          <div className="grid gap-2">
            <Command command={`${CLI} light --variant band --seed 1 --out band.svg`} />
            <Command command={`${CLI} ascii --seed 4 --out texture.svg`} />
          </div>
        </Section>
        <Section title="For agents" description="manifest lists every command, template, size, component, token and rule. A name that is not in it is an error, never a guess.">
          <Command command={`${CLI} manifest --json`} />
        </Section>
        {grouped.map((g) => (
          <Section key={g.id} title={g.label}>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
              {g.items.map((i) => (
                <li key={i.name}>
                  <Link href={`/components/${i.name}`} className="grid h-full content-start gap-2 rounded-container bg-surface-raised p-5 transition-[background-color] duration-150 ease-standard hover:bg-surface-subtle">
                    <span className="type-heading-4">{i.title}</span>
                    <span className="line-clamp-3 type-ui text-fg-muted">{i.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ))}
        <p className="type-caption text-fg-faint">
          Source: <a href={REPO} className="underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-150 ease-standard hover:decoration-fg">{REPO.replace("https://", "")}</a>
        </p>
      </PageBody>
    </>
  );
}
