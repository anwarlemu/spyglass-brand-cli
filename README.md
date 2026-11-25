# spyglass-ds

The Spyglass brand system in one CLI: design tokens, every logo lockup, the self-hosted fonts, the brand light and the
ASCII texture as seeded generators, a component library in React and as web components, and checks that keep pages,
interfaces and assets on brand. How it looks traces to the Spyglass site (the owner's site source, received 2026-11-24;
`brand/site-changes.md` lists every value it changed); the logo rules, merch, decks and the 1080 canvas still trace to the
brand guidelines and the Figma brand assets. Anything else is an error, never a guess.

Library site: https://spyglass-ds.vercel.app (the `apps/www` Next.js app in this repository).

## Use it in an app

Requires Node.js 20 or later. It works in any web stack, read from the app's own files:

| Stack | Library flavor |
| --- | --- |
| Next.js, Vite + React, React Router (with Tailwind 4 or 3) | React |
| React without Tailwind, Vue and Nuxt, SvelteKit, Astro, Angular, Solid, plain HTML, Rails, Laravel, Django, PHP | web components (`<spyglass-*>`, styles inside, one `<script>` each) |

```sh
npm install -D github:anwarlemu/spyglass-brand-cli#release   # or bun add -d / pnpm add -D
npx spyglass-ds init                                          # brand.css, the Tailwind theme, fonts, agent contract
npx spyglass-ds add button card search-bar                    # components, in the app's flavor
npx spyglass-ds view search-bar                               # props, events, slots, examples, source
npx spyglass-ds apply --dry-run                               # what restyling the app would change
```

`init` writes `brand.css` (fonts, tokens and the base layer scoped to the library's components) where the app loads
its styles, with `theme.css` (Tailwind 4), a Tailwind 3 preset, or `kinds.css` (no Tailwind), and copies the fonts and
logos to `<static folder>/spyglass-ds/`. `add` copies React files (imports rewritten to the app's alias, `lucide-react`
installed) or the prebuilt web component modules and prints the `<script type="module">` lines. `apply` restyles an
existing app (whole, or the kinds, pages or components you name) to the tokens without changing copy, markup or
behavior, in every file type the stack uses.

## Commands

| Command | What it does |
| --- | --- |
| `add <item...>` | Copies items and what they require, in the app's flavor (`--framework react\|elements`, `--dry-run`, `--overwrite`, `--update`). |
| `view <item...>` | What an item is for and never for, the install line, its API and its examples (`--source` for everything). |
| `search <words>`, `list` | Items by what they do; every item with its flavors. |
| `diff <item...>` | Your copy against the library's (exit 1 when one differs). |
| `info`, `init` | The app's setup and what to run next; the stylesheet, theme, fonts and contract only. |
| `apply [targets...]` | Restyle the app, or the named kinds, pages and components. |
| `check [paths...]`, `hook` | The value check (raw colors, off-scale sizes, durations, ease-in, transition-all, shadows, bold, other icon packs); an agent's edit hook. |
| `tokens [term...]`, `brand`, `principles` | Tokens by name or value; color, type, spacing, radii, motion, fonts, logos and voice; the product and website rules. |
| `component list\|inspect\|emit` | The real components, their props and states; `emit` writes React for one state. |
| `light`, `ascii` | The brand light (`--variant band\|field\|corner\|strip-left\|strip-right\|tile\|close-up\|curved-strip`, `--seed`, `--source brand\|generated`) and the ASCII texture as SVG or PNG. |
| `image`, `deck`, `video`, `merch` | Posts, ads, banners, logo backgrounds, Open Graph and story images from the brand assets layouts, re-flowed to every shared size (or `--size custom`), carousels from one file, PNG, SVG, JPEG and WebP; only the copy you pass is drawn, whole; pitch deck slides (PNG and PDF); seamless loops of the light; merch print files at physical size with bleed. `--list` on each. |
| `design new\|revise\|edit\|undo\|redo\|history\|show\|variants\|sizes\|compare\|render\|check` | A design as a small JSON file: make it from any template, change it in plain words (`revise "bigger headline, logo top right"`) or exact edits, undo, alternatives, other sizes, side by side. Every write is checked against the brand and errors change nothing. |
| `design new compose`, `design compose add\|move\|remove\|order\|span\|grid`, `design page compose outline.json` | Your own layout from the brand's 19 blocks on a grid of any canvas (every template can be rebuilt this way), and whole pages from 11 sections as React, web components or plain HTML. |
| `recipe <name>` | 32 ready compose layouts for what no template covers: the seven IAB display ads, a Meta feed ad, quote, stat, launch, feature, comparison, pricing, event, hiring, screenshot, before and after, chart, flow and customer story cards, business card, letterhead, one-pager, report cover, certificate, badge, email header and signature, meeting and wallpaper backgrounds. |
| `icons` | The favicon set (svg, ico, 16, 32), app icons (180, 192, 512, maskable), avatars and the web manifest. |
| `illustrate <style>` | The brand's own imagery as PNG and SVG: `pattern`, `light`, `texture` and `split` (`--image`). Rules with sources in `brand/illustration.md`. |
| `figma tokens\|push\|pull\|check` | Figma through its MCP tools, which the CLI never calls: variables and `use_figma` scripts, push files as editable layers or HTML, the read steps for a frame, and off-brand values with the nearest token (exit 1). |
| `manifest` (`describe`) | Every command, template, size, component, token and rule, for an agent (`--json`). |

All commands take `--cwd <dir>` and `--json`; an unknown option or name is an error.

## The brand, as code

- `brand/tokens.css`: Black and White, the 15-step neutral spectrum, the seven spectrum colors with 15 tints each
  (base step 8), the light's layers, Funnel Display, DM Sans and Geist Mono, the type, space, size, radius and motion
  scales, and the 1080 canvas values as measured (`--ds-asset-*`). The product scale is the canvas times 2/3, snapped
  to the 4px grid (the header of the file says how each value was derived).
- `brand/logo/svg/`: mark, wordmark, horizontal, vertical, mark-3d, horizontal-3d and vertical-3d in Black and White,
  split from the Figma exports (never redrawn), plus the favicon and avatars.
- `registry/lib/light.ts`: the brand light. Every light in the brand assets is a window onto one heat map; seeds 0 to
  n-1 of a variant are those exact windows, higher seeds move them, and `source: 'generated'` builds a new heat map the
  same way. `registry/lib/ascii.ts`: the texture, from a soft heat map. Both are deterministic and drive the
  components, the CLI and the docs.

## Revising a design

Make a graphic, look at it, change it, check it, repeat until it is right:

```sh
npx spyglass-ds design new banner-tagline --headline "Search every ad your competitors run." --size x-banner -o banner.design.json
npx spyglass-ds design revise banner.design.json "bigger headline"
npx spyglass-ds design edit banner.design.json --size linkedin-banner
npx spyglass-ds design undo banner.design.json
```

The design file holds only what you asked for; the PNG is drawn from it. Never edit the PNG or SVG by hand.

## Work on it

```sh
bun install
bun run build        # tsc and scripts/build-brand.mjs (brand -> build)
bun run registry     # validate registry/, write apps/www/public/r, value check, tsc for React and elements
bun run ci           # build, limits, registry, vitest
bun run parity       # every example as React and as web components, compared in a browser
bun run --cwd apps/www build && bun run --cwd apps/www start   # the docs site on port 3700
```

`CLAUDE.md` says where everything is. `PORTING.md` is the recipe for adding an item in React and porting it to a web
component.
