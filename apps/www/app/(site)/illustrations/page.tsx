import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { Command, InlineCode, PageBody, PageHead, Section } from "@www/components/chrome";
import { CLI } from "@www/lib/registry";

export const metadata = { title: "Illustrations" };

type Shot = { name: string; title: string; detail: string; style: string; src: string; width: number; height: number; canvas: string };
type Doc = {
  illustrations?: Shot[];
  illustrate?: {
    styles: Record<string, { name: string; from: string; description: string }>;
  };
};

const file = path.join(process.cwd(), "lib/assets.generated.json");
const doc: Doc | undefined = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined;

function Tile({ shot }: { shot: Shot }) {
  return (
    <figure className="m-0 grid min-w-0 content-start gap-2">
      <img src={shot.src} alt={`${shot.title}: ${shot.detail}`} width={shot.width} height={shot.height} loading="lazy" className="h-auto max-h-80 w-full rounded-control border border-edge bg-surface object-contain" />
      <figcaption className="min-w-0">
        <p className="truncate type-code text-fg">{shot.detail}</p>
        <p className="truncate type-caption text-fg-muted">{shot.title}, {shot.canvas}</p>
      </figcaption>
    </figure>
  );
}

export default function IllustrationsPage() {
  const shots = doc?.illustrations;
  const ill = doc?.illustrate;
  if (!shots || !ill) {
    return (
      <>
        <PageHead eyebrow="Brand" title="Illustrations" description="Run the registry build to render this page's previews." />
        <PageBody><Command command="bun run registry" /></PageBody>
      </>
    );
  }
  const of = (style: string) => shots.filter((s) => s.style === style);
  return (
    <>
      <PageHead eyebrow="Brand" title="Illustrations" description="The brand's own imagery as code: the pattern, the light in every variant, the ASCII texture and the photo light split. PNG and SVG from illustrate; the same inputs write the same bytes. The previews below are its output at seed 0." />
      <PageBody className="max-w-250">
        <Section id="commands" title="Make them" description={<>One style per call, with <InlineCode>--image</InlineCode> where the style takes one. <InlineCode>--list</InlineCode> names every style and light variant; unknown names exit 1 with the closest match. The rules and their sources are in <InlineCode>brand/illustration.md</InlineCode>.</>}>
          <div className="grid gap-2">
            <Command command={`${CLI} illustrate pattern --variant corner --seed 2`} />
            <Command command={`${CLI} illustrate light --variant strip-left --source generated --seed 7`} />
            <Command command={`${CLI} illustrate split --image photo.jpg`} />
          </div>
        </Section>

        <Section id="pattern" title="Pattern and texture" description={ill.styles.pattern?.description}>
          <div className="grid gap-4 sm:grid-cols-2">{[...of("pattern"), ...of("texture")].map((s) => <Tile key={s.name} shot={s} />)}</div>
        </Section>

        <Section id="light" title="The light" description="One shape in Blue, Green and Red, shifted, blurred and added on Black, flowing in from an edge. Each variant is a window the brand assets cut from the brand's heat map, at the size they cut it.">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{of("light").map((s) => <Tile key={s.name} shot={s} />)}</div>
        </Section>

        <Section id="split" title="Photo light split" description={ill.styles.split?.description}>
          <div className="grid gap-4 sm:grid-cols-2">{of("split").map((s) => <Tile key={s.name} shot={s} />)}</div>
        </Section>

        <Section id="sources" title="Where each part comes from" description="Each style and the source it follows (brand/assets/illustrate.json).">
          <div className="divide-y divide-edge rounded-control border border-edge px-5">
            {Object.entries(ill.styles).map(([id, s]) => (
              <div key={id} className="grid gap-1 py-4 md:grid-cols-[10rem_1fr]">
                <p className="type-code text-fg">{id}</p>
                <p className="min-w-0 type-ui text-fg-soft">{s.from}</p>
              </div>
            ))}
          </div>
        </Section>
      </PageBody>
    </>
  );
}
