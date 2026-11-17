import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { CLI } from "@www/lib/registry";

export const metadata = { title: "Assets" };

type Shot = { name: string; title: string; src: string; width: number; height: number };
type Image = Shot & { template: string; group: string; size: string; variant?: string; canvas: string };
type Merch = Shot & { item: string; variant: string };
type MerchInfo = { id: string; name: string; trim: { width: number; height: number }; bleed: number; safe: number; method: string; variants: string[]; source: string; pixels: { width: number; height: number } };
type Doc = {
  images: Image[];
  slides: (Shot & { group: string })[];
  merch: Merch[];
  catalog: { video: { templates: { id: string; description: string }[]; sizes: { id: string; width: number; height: number }[]; fps: number; seconds: number }; merch: MerchInfo[] };
};

const file = path.join(process.cwd(), "lib/assets.generated.json");
const doc: Doc | undefined = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined;

const GROUPS = [
  ["post", "Social posts", "1080 by 1080. Every post on the brand assets page, with its own light window and type measured from the reference."],
  ["ad", "Social ads", "1080 by 1350, including the plan offer and the search bar ad. Pictures come from --image; without one a slot is the card fill."],
  ["banner", "Banners", "X (1500 by 500), LinkedIn (1584 by 396) and LinkedIn company (1128 by 191) for each banner layout."],
  ["logo", "Avatar and logo backgrounds", "The logomark on the approved backgrounds only, the 3D logomark, the avatar and the primary 1920 by 1080."],
  ["derived", "Open Graph and story", "1200 by 630 and 1080 by 1920, derived from the same rules (stories keep 250px clear at the top and bottom)."],
] as const;

function Tile({ shot, caption, detail }: { shot: Shot; caption: string; detail?: string }) {
  return (
    <figure className="m-0 grid min-w-0 content-start gap-2">
      <img src={shot.src} alt={`${shot.title}${detail ? `, ${detail}` : ""}`} width={shot.width} height={shot.height} loading="lazy" className="h-auto w-full rounded-control border border-edge bg-surface" />
      <figcaption className="min-w-0">
        <p className="truncate type-code text-fg">{caption}</p>
        {detail && <p className="truncate type-caption text-fg-muted">{detail}</p>}
      </figcaption>
    </figure>
  );
}

export default function AssetsPage() {
  if (!doc) {
    return (
      <>
        <PageHead eyebrow="Brand" title="Assets" description="Run the registry build to render this page's previews." />
        <PageBody><Command command="bun run registry" /></PageBody>
      </>
    );
  }
  return (
    <>
      <PageHead eyebrow="Brand" title="Assets" description="Posts, ads, banners, decks, light loops and merch print files, drawn by the CLI from the layouts on the brand assets page. The previews below are its output with the default copy and seed 0." />
      <PageBody className="max-w-250">
        <Section id="commands" title="Make them" description="Text goes in by slot, pictures by --image, and --seed moves the texture (and a generated light with --light generated). Unknown names exit 1 with the closest match; manifest --json lists everything.">
          <div className="grid gap-2">
            <Command command={`${CLI} image --template ad-creator-plan --headline "Stop screenshotting at midnight."`} />
            <Command command={`${CLI} image --template post-agents --image photo.jpg --seed 3`} />
            <Command command={`${CLI} deck --input deck.json --out deck`} />
            <Command command={`${CLI} video --template light-band --size vertical`} />
            <Command command={`${CLI} merch --item tee-front --variant full-color`} />
          </div>
        </Section>

        {GROUPS.map(([group, title, description]) => {
          const shots = doc.images.filter((i) => i.group === group);
          return (
            <Section key={group} id={group} title={title} description={description}>
              <div className={group === "banner" ? "grid gap-4 sm:grid-cols-2" : "grid grid-cols-2 gap-4 lg:grid-cols-3"}>
                {shots.map((s) => <Tile key={s.name} shot={s} caption={s.name} detail={`${s.title}, ${s.canvas}`} />)}
              </div>
            </Section>
          );
        })}

        <Section id="deck" title="Pitch deck" description="1920 by 1080 slides: the three covers from the brand assets and seven content slides derived from their rules. One PNG per slide and one PDF.">
          <div className="grid gap-4 sm:grid-cols-2">
            {doc.slides.map((s) => <Tile key={s.name} shot={s} caption={s.name} detail={s.title} />)}
          </div>
        </Section>

        <Section id="video" title="Light loops" description={`${doc.catalog.video.seconds} seconds at ${doc.catalog.video.fps} fps, seamless: the light drifts at a constant rate around a closed path while everything else holds still. MP4 and WebM through ffmpeg, else PNG frames and a Motion JPEG MP4; --still writes one frame for reduced motion.`}>
          <div className="divide-y divide-edge rounded-control border border-edge px-5">
            {doc.catalog.video.templates.map((t) => (
              <div key={t.id} className="grid gap-1 py-4 md:grid-cols-[12rem_1fr]">
                <p className="type-code text-fg">{t.id}</p>
                <p className="type-ui text-fg-soft">{t.description}</p>
              </div>
            ))}
          </div>
          <p className="type-ui text-fg-muted">Sizes: {doc.catalog.video.sizes.map((s) => `${s.id} ${s.width}x${s.height}`).join(", ")}.</p>
        </Section>

        <Section id="merch" title="Merch print files" description="Print files only, no mockups: SVG at physical size and PNG at 300 dpi with the bleed. Full color uses the light and the texture on Black; one-color files are an approved lockup in White or Black on a transparent ground (shown on a checker).">
          <div className="overflow-x-auto rounded-control border border-edge">
            <table className="w-full border-collapse type-ui">
              <thead>
                <tr className="text-left text-fg-muted">
                  {["Item", "Trim", "Bleed", "Safe", "Variants", "Source or convention"].map((h) => <th key={h} className="border-b border-edge px-4 py-2.5 type-label font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {doc.catalog.merch.map((m) => (
                  <tr key={m.id} className="align-top">
                    <td className="border-b border-edge px-4 py-2.5 whitespace-nowrap type-code text-fg">{m.id}</td>
                    <td className="border-b border-edge px-4 py-2.5 whitespace-nowrap text-fg-soft">{m.trim.width} x {m.trim.height} in</td>
                    <td className="border-b border-edge px-4 py-2.5 whitespace-nowrap text-fg-soft">{m.bleed} in</td>
                    <td className="border-b border-edge px-4 py-2.5 whitespace-nowrap text-fg-soft">{m.safe} in</td>
                    <td className="border-b border-edge px-4 py-2.5 whitespace-nowrap text-fg-soft">{m.variants.join(", ")}</td>
                    <td className="min-w-80 border-b border-edge px-4 py-2.5 type-caption text-fg-muted">{m.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {doc.merch.map((m) => (
              <figure key={m.name} className="m-0 grid min-w-0 content-start gap-2">
                <div className="grid place-items-center rounded-control border border-edge bg-[repeating-conic-gradient(var(--ds-color-neutral-8)_0_25%,var(--ds-color-neutral-7)_0_50%)] bg-[length:16px_16px] p-3">
                  <img src={m.src} alt={`${m.title}, ${m.variant}`} width={m.width} height={m.height} loading="lazy" className="h-auto max-h-64 w-auto max-w-full" />
                </div>
                <figcaption className="min-w-0"><p className="truncate type-code text-fg">{m.item}</p><p className="truncate type-caption text-fg-muted">{m.variant}</p></figcaption>
              </figure>
            ))}
          </div>
        </Section>
      </PageBody>
    </>
  );
}
