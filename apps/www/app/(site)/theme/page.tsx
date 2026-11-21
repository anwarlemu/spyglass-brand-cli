import { readFileSync } from "node:fs";
import path from "node:path";

import { AsciiTexture } from "@/react/components/visuals/AsciiTexture";
import { BrandLight } from "@/react/components/visuals/BrandLight";
import { Logo } from "@/react/components/visuals/Logo";
import { Code, Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { CLI, assetBase } from "@www/lib/registry";

export const metadata = { title: "Theme" };

type Token = { value: string; light: string; dark: string };
const tokens = (JSON.parse(readFileSync(path.join(process.cwd(), "../../build/tokens.json"), "utf8")) as { tokens: Record<string, Token> }).tokens;
const all = Object.entries(tokens);
const value = (name: string) => tokens[name]?.light ?? "";

const SPECTRUM = ["magenta", "red", "orange", "yellow", "green", "cyan", "blue"];
const steps = (name: string) => Array.from({ length: 15 }, (_, i) => `--ds-color-${name}-${i + 1}`);
const ROLES = all.filter(([k, v]) => k.startsWith("--ds-color-") && v.value.startsWith("var(") && !/^--ds-color-(magenta|red|orange|yellow|green|cyan|blue|light-[rgb])$/.test(k));

const TYPE = [
  ["type-display", "Funnel Display 64 at 1.07"],
  ["type-hero", "Funnel Display 48 at 1.07"],
  ["type-heading-1", "Funnel Display 36 at 1.07"],
  ["type-heading-2", "Funnel Display 28 at 1.0, card titles"],
  ["type-heading-3", "Funnel Display 24 at 1.07"],
  ["type-heading-4", "Funnel Display 20 at 1.07"],
  ["type-body-lg", "DM Sans 18 at 1.33"],
  ["type-body", "DM Sans 16 at 1.33"],
  ["type-ui", "DM Sans 14 at 1.3"],
  ["type-ui-strong", "DM Sans Medium 14, buttons"],
  ["type-caption", "DM Sans 12 at 1.3"],
  ["type-label", "DM Sans Medium 12, capitals, 6%"],
  ["type-code", "Geist Mono 14"],
] as const;

const LOCKUPS = [
  ["horizontal", 36],
  ["vertical", 80],
  ["mark", 36],
  ["wordmark", 30],
  ["horizontal-3d", 40],
  ["vertical-3d", 80],
  ["mark-3d", 44],
] as const;

const LIGHTS = ["band", "field", "corner", "tile", "close-up", "curved-strip"] as const;

function Swatch({ name, big }: { name: string; big?: boolean }) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className={big ? "h-24 rounded-control border border-edge" : "h-14 rounded-control border border-edge"} style={{ background: `var(${name})` }} />
      <div className="min-w-0">
        <p className="truncate type-code text-fg">{name.replace("--ds-color-", "")}</p>
        <p className="truncate type-code text-fg-muted">{value(name)}</p>
      </div>
    </div>
  );
}

function Table({ rows }: { rows: [string, string, string?][] }) {
  return (
    <div className="overflow-hidden rounded-control border border-edge">
      <div className="overflow-x-auto fade-x">
        <table className="w-full border-collapse type-ui">
          <tbody>
            {rows.map(([name, v, note]) => (
              <tr key={name}>
                <td className="border-b border-edge px-4 py-2.5 type-code text-fg">{name}</td>
                <td className="border-b border-edge px-4 py-2.5 type-code text-fg-soft">{v}</td>
                <td className="border-b border-edge px-4 py-2.5 type-caption text-fg-muted">{note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ThemePage() {
  const pick = (prefix: string) => all.filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k, v.value] as [string, string]);
  return (
    <>
      <PageHead eyebrow="Brand" title="Theme" description="Every token, the logo set and the two generated graphics. Components already use these; use the same names for anything new." />
      <PageBody className="max-w-250">
        <Section id="logo" title="Logo" description="Every lockup, split from the brand's own SVGs (never redrawn), in White on Black and Black on White. No other colors, no stretching, outlines, rotation or effects.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid content-start gap-8 rounded-container border border-edge bg-surface p-8 max-sm:p-5">
              {LOCKUPS.map(([v, h]) => <Logo key={v} variant={v} height={h} label={`Spyglass ${v}`} />)}
            </div>
            <div data-theme="light" className="grid content-start gap-8 rounded-container bg-surface p-8 max-sm:p-5">
              {LOCKUPS.map(([v, h]) => <Logo key={v} variant={v} height={h} label={`Spyglass ${v}, black`} />)}
            </div>
          </div>
          <p className="type-ui text-fg-muted">Files: <span className="type-code text-fg-soft">{assetBase}/logo/&lt;lockup&gt;-black.svg</span> and <span className="type-code text-fg-soft">-white.svg</span> for mark, wordmark, horizontal, vertical, mark-3d, horizontal-3d and vertical-3d, plus favicon.svg and the avatars. <span className="type-code text-fg-soft">{CLI} brand --section logos</span> lists them.</p>
        </Section>

        <Section id="color" title="Color" description="Black is the ground and White the type; most layouts use only these two. The spectrum comes from the light and small accents, always in this order.">
          <div className="grid grid-cols-2 gap-3 sm:w-1/2"><Swatch name="--ds-color-black" big /><Swatch name="--ds-color-white" big /></div>
          <div className="grid gap-2">
            <p className="type-label text-fg-muted">Neutral spectrum, 15 steps</p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-15">{steps("neutral").map((n) => <Swatch key={n} name={n} />)}</div>
          </div>
          {SPECTRUM.map((c) => (
            <div key={c} className="grid gap-2">
              <p className="type-label text-fg-muted">{c}, base step 8 ({value(`--ds-color-${c}-8`)})</p>
              <div className="grid grid-cols-15 overflow-hidden rounded-control border border-edge">
                {steps(c).map((n, i) => <div key={n} title={`${n} ${value(n)}`} className={i === 7 ? "h-12 ring-2 ring-fg ring-inset" : "h-12"} style={{ background: `var(${n})` }} />)}
              </div>
            </div>
          ))}
          <div className="grid gap-2">
            <p className="type-label text-fg-muted">Roles (dark, the default)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{ROLES.map(([n]) => <Swatch key={n} name={n} />)}</div>
          </div>
        </Section>

        <Section id="type" title="Type" description="Funnel Display Regular for headlines and titles, DM Sans for everything else (Medium for labels and buttons), Geist Mono for code and the texture. Self-hosted, OFL.">
          <div className="divide-y divide-edge rounded-control border border-edge px-5">
            {TYPE.map(([cls, note]) => (
              <div key={cls} className="grid items-baseline gap-2 py-5 md:grid-cols-[14rem_1fr]">
                <div><p className="type-code text-fg">{cls}</p><p className="type-caption text-fg-muted">{note}</p></div>
                <p className={`${cls} min-w-0 text-fg`}>The only creative search engine.</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="light" title="The brand light" description="One shape drawn three times in Blue, Green and Red, shifted, blurred and blended plus-lighter on Black. Generated from a seed in every variant the brand assets use.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LIGHTS.map((v) => (
              <figure key={v} className="m-0 grid gap-2">
                <BrandLight variant={v} cover className="aspect-[4/3] w-full rounded-container" />
                <figcaption className="type-label text-fg-muted">{v}</figcaption>
              </figure>
            ))}
          </div>
          <Table rows={[["--ds-color-light-r", value("--ds-color-light-r"), "Light R, at 0.85"], ["--ds-color-light-g", value("--ds-color-light-g"), "Light G, at 0.782"], ["--ds-color-light-b", value("--ds-color-light-b"), "Light B, at 0.782"], ["--ds-light-offset", value("--ds-light-offset"), "each layer's shift, of the heat map's width"], ["--ds-light-blur", value("--ds-light-blur"), "blur, of the heat map's width"], ["--ds-color-light-overlap", value("--ds-color-light-overlap"), "where all three overlap"]]} />
        </Section>

        <Section id="ascii" title="The ASCII texture" description="Geist Mono characters from &quot; .:-=+*#&quot; off a soft heat map, White at 0.35. Behind the light, clear of text, the logo and photos.">
          <AsciiTexture seed={4} width={1080} height={360} className="w-full rounded-container border border-edge bg-surface" />
        </Section>

        <Section id="shape" title="Space, size, corners and borders" description="A 4px base. One corner for buttons, fields, cards and the search bar: 10px on the canvas, 8px in the product. No shadows.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {pick("--ds-radius-").map(([n, v]) => (
              <div key={n} className="grid gap-2"><div className="h-16 border border-edge-strong bg-surface-raised" style={{ borderRadius: `var(${n})` }} /><p className="type-code text-fg">{n.replace("--ds-radius-", "radius-")} <span className="text-fg-muted">{v}</span></p></div>
            ))}
          </div>
          <Table rows={[...pick("--ds-space-"), ...pick("--ds-size-"), ...pick("--ds-layout-"), ...pick("--ds-border-")]} />
        </Section>

        <Section id="motion" title="Motion" description="Quick and quiet: color 150ms, press 160ms, entrances 200ms, exits faster, nothing over 300ms. Never ease-in; hover only where it exists; reduced motion keeps opacity and color; icons never move on hover.">
          <Table rows={[...pick("--ds-duration-"), ...pick("--ds-easing-")]} />
        </Section>

        <Section id="canvas" title="The 1080 canvas" description="The values measured on the brand assets (posts 1080x1080, ads 1080x1350, decks 1920x1080). The product scale above is derived from these: canvas x 2/3, snapped to the 4px grid.">
          <Table rows={pick("--ds-asset-")} />
        </Section>

        <Section id="import" title="Import the theme" description="init writes the brand stylesheet and the Tailwind theme beside the app's main stylesheet and imports them.">
          <Command command={`${CLI} init`} />
          <Code title="app/globals.css" code={`@import "tailwindcss";\n@import "./spyglass-ds/brand.css";\n@import "./spyglass-ds/theme.css";`} />
        </Section>
      </PageBody>
    </>
  );
}
