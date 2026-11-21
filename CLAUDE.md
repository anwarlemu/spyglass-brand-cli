# spyglass-ds (working on the harness itself)

This repo is the CLI, the component library and the brand assets that apply the Spyglass brand to anything: web apps
in any stack (React and Next.js first, then Vue, Svelte, Astro, Angular, plain HTML and server templates), web pages,
social posts, ads, decks and merch. The library comes in two flavors that must render identically: React (the source
of truth) and web components (Lit), ported from React. `README.md` says how it is used. Apps that install it get a
different contract, written from `brand/contract.md`.

## Loop

```sh
bun install          # root and apps/www
bun run build        # tsc (src -> dist), then scripts/build-brand.mjs (brand -> build: css, theme, tokens.json,
                     # fonts, logos, icons, and build/generators: the light and ASCII generators bundled for node)
bun run registry     # scripts/build-registry.ts: validate, write apps/www/public/r, value check, tsc for both flavors
bun run ci           # build, limits, registry, tests; must pass before you commit
bun run parity       # every example as React and as web components, compared in a browser (port 3351)
```

The docs site: `bun run --cwd apps/www build`, then `bun run --cwd apps/www start` (port 3700; 3000 is the owner's).
It needs `build/` and the registry outputs first (`bun run ci`). `DOCS_URL=http://localhost:3700 bun run test:docs`
sweeps it.

## Where things are

- `brand/`: the only brand-specific content. `tokens.css` is the single source of values (`--ds-*`; dark, Black ground,
  at `:root`, the guidelines' white under `[data-theme="light"]`; the 1080 canvas as `--ds-asset-*`, and how the
  product scale is derived from it in the header); `base.css` the base layer; `fade.css` the scroll fade (`fade-y`, `fade-x`), shipped with every base and the
  elements' shadow base: every scroll box that can cut content off takes it; `brand.json` names, fonts, icons, groups,
  the light's layers and the texture's ramp; `principles.md` and `principles.json` (product and website rules, voice),
  `agent-guide.md`, `contract.md`, `elements.json` (apply's roles and per-kind recipes); `fonts/` (Funnel Display, DM
  Sans, Geist Mono woff2 with their OFL licenses); `logo/source/` (the SVGs Figma exports) and `logo/svg/` (every
  lockup in Black and White, split from the source paths by `scripts/make-logos.mjs`, never redrawn); `light/` (the
  brand heat map's Light R layer as exported).
- `registry/`: the library. `react/components/<group>/<Name>.tsx` (groups in brand.json: ui, product, site, visuals),
  `react/hooks/`, `react/lib/` (cn, transition), `react/examples/<item>/<Example>.tsx`; `lib/*.ts` framework-free code
  both flavors import (`light.ts` and `light-master.ts`: the brand light; `ascii.ts`: the texture; `logos.ts`:
  generated lockups); `elements/components/<group>/<name>.ts` (+ `<name>.css`), `elements/lib/` (the shared chunk),
  `elements/examples/<item>/<Example>.html`; `docs/<item>.md` (frontmatter: name, title, type, group, description,
  use_for, never, source, files, examples as `Name | Label | center half`). Library files import each other as
  `@/react/...` and `@/lib/...` (React) or `@/elements/...` and `@/lib/...` (elements).
- `scripts/build-registry.ts` validates every item, derives files, requires and packages from imports, writes one JSON
  per item plus `index.json` into `apps/www/public/r`, shadcn-style registries at `/r/react/` and `/r/elements/`,
  `apps/www/lib/registry.generated.json` and `examples.generated.tsx`, runs the value check over everything and
  type-checks both flavors. `scripts/registry-flavors.ts` and `scripts/build-elements.mjs` build the element modules
  (prebuilt into `apps/www/public/elements/`).
- `apps/www/`: the docs site (Next.js 16). `@` points at `registry/`, so pages and `/preview/<item>/<example>` render
  the real React files. One rail (filter, Introduction, All components, Theme, groups A to Z), component pages
  (install, previews, usage, props, React and element examples, source, previous and next), the theme page (every
  token, the logo set, the light and the texture).
- `apps/parity/`: React and element examples in the same frame; `scripts/check-parity.mjs` compares them (pixels under
  0.5% at 1440 and 390, computed styles of every `data-ds` element, the keyboard trail and the steps in
  `apps/parity/interactions/<item>.mjs`). `PORTING.md` is the recipe.
- `src/`: the CLI (`bin.js` -> `dist/cli.js`). `check/` (the value check), `convert/` (apply's restyle, in every file
  type including Vue SFCs), `project/graph.ts`, `commands/` (apply, add, init, library: view, search, info, diff; list,
  tokens; image, deck, video, merch, brand, principles, component, manifest; pattern: light and ascii), `assets/` (the
  asset engine: scenes drawn to SVG and rasterized by resvg, templates, merch, PNG and PDF writers; layouts live in
  `brand/assets/*.json`, written by `scripts/assets/gen-*.mjs`), `image/` (fonts and text measuring),
  `brand/`, `component/` (list, inspect, emit React), `library/` (registry and project detection), `lib/brand.ts`.
- `test/`: vitest for the check, the build outputs, the registry, the generators and the CLI on temporary apps.

## Source of truth

The brand guidelines and the Figma page "8. Brand assets" (file Qx2i6GhXZD1V4O7RE7hYQi), as the screenshots, the SVG
exports and the measured values in the spec. Every value traces to them; `tokens.css` comments say where. spyglass.so
is on the old brand: use it for nothing visual. Never ship third-party brands' photos or real people's names (the Figma
uses some): examples use Acme.

## Rules

- No brand strings in `src/` (read `brand/brand.json`); `scripts/ci-limits.mjs` enforces it, and no em dashes in
  prose. American spelling, sentence case.
- Library items use only brand tokens (theme utilities or `var(--ds-*)`), follow the animation rules (Emil Kowalski's:
  no ease-in, no transition-all, durations from the `--ds-duration-*` steps, hover behind `(hover: hover)`, reduced
  motion handled, icons never move on hover), take data through props and slots (no Next imports, API calls or auth),
  and have a docs entry, a React example and its element twin. Every component root carries `data-ds="<file-name>"`.
- The light and the texture are generated (`registry/lib/light.ts`, `ascii.ts`), never pasted as images.
- Apps install the `release` branch, a compiled tree (`scripts/make-release.mjs`); `bun run release` runs CI,
  `registry:release` (every item in React and web components) and parity, builds it and force-pushes it.

## Do not

- Kill processes by pattern; stop only PIDs you started. Port 3000 is the owner's.
- Modify conare-web, brand-dev-webapp, context-dashboard, console-agencidev or the other brand CLI repos. Commit
  `build`, `dist`, `node_modules` or generated registry output.
