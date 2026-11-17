# conare-ds (working on the harness itself)

This repo is the CLI and component library that apply the Conare design system to any web app (Vue and Nuxt, React and
Next.js, Svelte, Astro, Angular, Solid, plain HTML, server templates; Tailwind 4, 3 or none). The library comes in three
flavors that must render identically: Vue (the source of truth), React and web components (Lit). `README.md` says
how it is used. Apps that install it get a different contract, written from `brand/contract.md`. The stack is the
same as conare-web's: Nuxt 4.6, Vue 3.5 (`<script setup lang="ts">`), Tailwind 4 via `@tailwindcss/vite`,
`lucide-vue-next` icons, bun.

## Loop

```sh
bun install          # also runs nuxt prepare for apps/www
bun run build        # tsc, then scripts/build-brand.mjs (brand/ -> build/, assets into apps/www/public/conare-ds)
bun run registry     # scripts/build-registry.ts: validate, write apps/www/public/r, value check, vue-tsc
bun run ci           # build, limits, registry, tests; must pass before you push
```

The docs site: `bun run --cwd apps/www build`, then `PORT=3201 node apps/www/.output/server/index.mjs` (3000 is the
owner's). It needs `build/` and the registry outputs first (`bun run ci`).

## Where things are

- `brand/`: the only brand-specific content. `tokens.css` is the single source of values (`--ds-*`, light at `:root`,
  dark under `[data-theme="dark"]`); `base.css` the base layer (page-wide only after a whole-app apply; build/brand-scoped.css scopes it to `[data-ds]` roots and `.ds-scope`); `brand.json` names, fonts, icons, groups;
  `principles.md`, `principles.json` (the product and website rules the CLI serves; the website entry records the gap),
  `agent-guide.md`, `contract.md`; `logo/`, `fonts/` (the vendored woff2 files conare-web serves:
  Faculty Glyphic, Geist, Geist Mono, Inter) and `textures/`.
- `scripts/build-brand.mjs`: `build/brand.css` (fonts + tokens + base), `theme.css` (Tailwind 4 `@theme inline`:
  `bg-surface`, `text-fg-muted`, `border-edge`, `h-control-sm`, `ease-standard`, `type-ui`...), `tokens.json`.
- `registry/`: `components/<group>/*.vue` (groups in brand.json: ui, product, site, visuals), `composables/*.ts`,
  `docs/<item>.md` (frontmatter: name, title, type, group, description, use_for, never, source, files, examples as
  `Name | Label | center half`), `examples/<item>/<Example>.vue`. Library files import each other as `@/...`.
  `scripts/build-registry.ts` validates every item, derives files, requires and packages from imports, writes one JSON
  per item plus `index.json` into `apps/www/public/r` and `apps/www/app/registry.generated.json`, runs the value check
  over everything and type-checks with vue-tsc (`tsconfig.registry.json`).
- `apps/www/`: the docs site (Nuxt 4). `@` points at `registry/`, so pages and `/preview/<item>/<example>` render the
  real files. One rail (filter, Introduction, All components, Theme, groups A to Z), component pages (install line,
  framed previews with Desktop and Phone widths, usage, example source, component source, previous and next).
- `src/`: the CLI (`bin.js` -> `dist/cli.js`). `check/` (rules.ts, source.ts, engine.ts: the value check, ported from
  inkbox-brand-cli), `convert/` (apply's restyle: classes.ts, css.ts, kinds.ts for the library look by kind, file.ts
  for Vue SFCs with @vue/compiler-sfc and the structure check), `project/graph.ts` (files, imports, Nuxt pages and Vue
  Router routes), `commands/` (apply, add, init, library: view, search, info, diff; small: list, tokens; image, video,
  brand, principles, component, manifest), `image/` (Open Graph and social cards: SVG from the tokens, fonts and mark,
  rasterized to PNG), `video/` (the same frames, 18 at 12 fps, muxed to a Motion JPEG MP4), `brand/` (tokens, fonts,
  logos, voice, principles), `component/` (list, inspect, emit), `library/`
  (registry and project detection), `lib/brand.ts`, `lib/names.ts`. `brand/elements.json` holds apply's roles and the
  per-kind recipes (the library components' own classes).
- `registry/react/`: the React flavor (`components/<group>/<Name>.tsx`, `hooks/`, `lib/`, `examples/<item>/`), the same
  token classes as the Vue file. `registry/elements/`: the web components (Lit, shadow DOM, `<elementPrefix>-<item>`,
  styles compiled from the same classes at build time; prebuilt modules land in `apps/www/public/elements/`).
  `PORTING.md` is the recipe; `scripts/port-order.mjs` the order; `apps/parity/` and `scripts/check-parity.mjs` compare
  every example in all three flavors (pixels, computed styles, keyboard trail). Release requires every item in every
  flavor (`bun run registry:release`) and a clean parity run.
- `test/`: vitest for the check, the build outputs, the registry and the CLI on temporary apps.
- `PLAN.md`: how the Vue items were built (historical); `PORTING.md` for the other flavors.

## Source of truth

conare-web, branch `agencidev/console` (read-only, private, under NDA; never write to it or copy it anywhere public).
`app/design-system/registry.ts` and `examples/` map the items; `app/assets/css/console2.css` holds the console's
values (main.css and code-window.css the rest); `tokens/*.tokens.json` the roles. For browser comparisons use a scratch
copy (`git archive HEAD | tar -x -C <scratch>`), `bun install --ignore-scripts`, then its `review:api` and
`review:console` (ports 5195 and 5194) and compare `/design-system/preview/<item>/<example>` with ours.

## Rules

- No brand strings in `src/` (read `brand/brand.json`); `scripts/ci-limits.mjs` enforces it, and no em dashes in
  prose. American spelling, sentence case.
- Library items use only brand tokens (utilities from the theme or `var(--ds-*)`), follow the animation rules (no
  ease-in, no `transition-all`, durations from the `--ds-duration-*` steps, hover behind `(hover: hover)`, reduced
  motion handled), take data through props and slots (no Nuxt imports, API calls or auth), and have a docs entry and an
  example. Match conare-web's rendered values exactly; where its value has no token, add the token to `tokens.css`.
- Every component's root element carries `data-ds="<file-name>"`: apps that only add components or apply a selection
  get the base layer scoped to those roots (build/brand-scoped.css). The registry build fails without it.
- Examples use sample data only: Acme, no customer or real people's names, no secrets.
- Apps install the `release` branch, a compiled tree (`scripts/make-release.mjs`); `bun run release` runs CI, builds
  it and force-pushes it. Nothing reaches apps until then.

## Do not

- Kill processes by pattern; stop only PIDs you started. Port 3000 is the owner's.
- Modify conare-web or inkbox-brand-cli. Commit `build`, `dist`, `node_modules` or generated registry output.

## Public registry

The library site is behind Vercel login, so the registry files (`/r/`) are also published to a public project, the
`registryHost` in `brand/brand.json`. The CLI, components.json, shadcn, MCP and the agent guide read `/r/` from there;
page links stay on `registryUrl`. After every registry change: `sh scripts/deploy-registry.sh` (after `registry`).
