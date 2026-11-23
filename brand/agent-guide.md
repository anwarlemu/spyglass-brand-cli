# {{brand}} design system: instructions for agents

Use this system to build {{brand}} interfaces, web pages and brand assets in any web stack: React (Next.js, Vite, React
Router), Vue and Nuxt, Svelte and SvelteKit, Astro, Angular, Solid, plain HTML and server templates (Rails, Laravel,
Django, PHP, Liquid, Twig, Handlebars, EJS), with Tailwind 4, Tailwind 3 or plain CSS. These instructions work with any
agent that can read text and edit project files.

## Start here

1. Run `{{cli}} manifest --json`. That document lists every command, template, size, component, token and rule.
   `describe` is the same command. If a name is not in it, the command exits 1. Do not invent a substitute.
2. Read the project's instructions, then run `{{cli}} info`: it names the stack, the library flavor (React or web
   components), the package manager, Tailwind's version (or none), the main stylesheet and the layouts.
3. Query the brand with `{{cli}} brand --json` and the rules with `{{cli}} principles --json` (`--surface product` for
   interfaces, `--surface website` for pages and assets). The library is at {{registry}}; each item is also at
   {{registryHost}}/r/<name>.json with its files, its examples, what it requires and its packages.
4. Reuse the library's components. `{{cli}} component list --json`, `{{cli}} component inspect <item> --json` and
   `{{cli}} view <item> --json` return the real parts, props and states in the app's flavor. Do not recreate a
   component from a screenshot.

## Install and prepare a project

Requires Node.js 20 or later. Run commands from the app's root (an app with no package.json, such as Rails, Django or
a plain site, runs them with `--cwd <app>`).

```sh
bun add -d {{source}}      # or npm install --save-dev {{source}}
{{cli}} init
{{cli}} add button card search-bar
```

`init` writes `brand.css` (fonts, tokens, and base styles scoped to the library's components; a whole-app `apply`
makes them page-wide) where the app loads its styles. With Tailwind 4 it adds `theme.css` (the utilities); with
Tailwind 3 a preset wired into the config; with no Tailwind `kinds.css` (the library's look as `ds-*` classes). It
copies the fonts to `<static folder>/{{bin}}/` and writes this guide and the contract in AGENTS.md. `add` copies each
item in the app's flavor: React files into the source folder with their library imports made to resolve there (and
their packages installed, such as `lucide-react`), web components as prebuilt modules into
`<static folder>/{{bin}}/elements/` with the `<script type="module">` line to put on the pages that use them. Existing
files that differ are kept unless `--overwrite` is passed.

To restyle what the app already has, `{{cli}} apply` converts style values to the tokens and gives buttons, fields,
cards and the rest the library's look, without changing copy, markup, template code or behavior. Name a selection to
limit it: `{{cli}} apply button card`, `{{cli}} apply /settings`; `--dry-run --json` lists every change first.

## Library flavors

React is the source of every component; the web components are ported from it and render the same (checked pixel by
pixel). `{{cli}} add` writes React in React apps with Tailwind, and web components everywhere else.
`--framework react|elements` picks one by name.

| | React | Web components |
| --- | --- | --- |
| Use it | `import { Button } from '@/components/ui/Button'` | `<script type="module" src="/{{bin}}/elements/button.js">` once per page, then `<{{elementPrefix}}-button>` |
| Data in | props | attributes, or properties for lists and objects (`el.items = [...]`) |
| Two-way value | `value` + `onValueChange` (`defaultValue` alone uncontrolled) | the `value` property with `input` and `change` events |
| Events | `onSearch` | `addEventListener('search', ...)`; details in `event.detail` |
| Children | `children` or a prop (`actions={...}`) | `slot="actions"` on a child |
| `title` | `title` | `heading` (`title` is HTML's tooltip) |

React files start with `'use client'` where they need it, so a Next server component can import and render them.
Angular needs `schemas: [CUSTOM_ELEMENTS_SCHEMA]` for the elements; Vue and Nuxt need `isCustomElement` for the
`{{elementPrefix}}-` prefix (add sets it where the config allows).

## Compose

- Black is the ground and White the type. Surfaces: `bg-surface` (Black), `bg-surface-raised` (the #171717 card),
  `bg-surface-subtle`; text: `text-fg`, `text-fg-soft`, `text-fg-muted`; lines: `border-edge`, `border-edge-strong`.
- One primary action per view (`Button variant="primary"`: White fill, Black label); `secondary` for the rest, `ghost`
  for tools in rows. Sizes `sm`, `md` (the default) and `lg`.
- Type utilities: `type-display`, `type-hero`, `type-heading-1` to `type-heading-4` (Funnel Display), `type-body-lg`,
  `type-body`, `type-ui`, `type-ui-strong`, `type-caption` (DM Sans), `type-label` (DM Sans Medium capitals, 6%),
  `type-code` (Geist Mono).
- The light and the ASCII texture come from the `brand-light` and `ascii-texture` components (seeded, so the same seed
  draws the same picture). Put the light at an edge or a corner of a section, behind content, never boxed in; keep the
  texture clear of text and photos (its `clear` areas).
- Data comes through props; components call no API and read no session.

## Assets

`{{cli}} light` and `{{cli}} ascii` write the brand light and the ASCII texture as SVG at any size (`--variant`,
`--seed`, `--width`, `--height`). `{{cli}} image` (posts, ads, banners, avatar, logo backgrounds, Open Graph and story cards, at
every shared size: og, square, portrait, story, landscape, linkedin, linkedin-square, x-banner, linkedin-banner,
linkedin-page, youtube, youtube-thumbnail, email, or `--size custom`; carousels with `--input`), `{{cli}} deck`, `{{cli}} video` and `{{cli}} merch` render from the brand assets layouts, the tokens, the
fonts and the logo files; `--list` on each names every template, size and slot. `{{cli}} brand --section logos` lists
every lockup in Black and White; use those files as they are.

## Revising a design

When a person wants a graphic they can react to (a banner, a post, a slide), make it as a design file and change it until
they are happy:

1. `{{cli}} design new <template> --headline "..." [--size x-banner] [--image picture=photo.jpg] -o banner.design.json`
   writes the file and its PNG. Only the copy you pass is drawn; `--sample` fills sample copy to look at a layout.
2. Look at the PNG, show it to the person, and ask what to change.
3. Change it: `{{cli}} design edit banner.design.json --set headline="..." --layer logo.anchor=top-right
   --layer headline.scale=1.2 --hide body --theme ... --size ...` (exact, best for an agent), or
   `{{cli}} design revise banner.design.json "bigger headline, logo top right"` (plain words; a part it does not
   understand fails the whole command, changes nothing and lists what it can do).
4. Every write runs the check and prints it. An error (words that do not fit, an overlap, contrast, a safe area, the
   logo's clear space or size, an off-brand value) blocks the write and leaves the file as it was. Composition rules can
   be accepted with `--allow <rule>`; brand rules never can.
5. Repeat until the person is happy. `design undo`, `redo` and `history` step through it; `design variants --by
   theme|seed|template` and `design sizes --to og,square,story,x-banner` make alternatives with one labeled sheet;
   `design compare a b` shows two side by side with what differs; `design render --format jpg,webp` draws the finals.

Never edit the PNG or SVG by hand: change the design file through the CLI, so the brand rules keep holding. `design show
<file> --json` lists every layer as drawn, what each can do and the phrases the design understands.

## Illustrations

`{{cli}} illustrate <style> [subject]` writes the brand's own imagery as PNG and SVG: `pattern` (the light flowing in
with the texture behind it), `light` (any variant), `texture`, `split` (a picture split into its color channels,
`--image` required) and `shader` (the lockup, logomark, orb or wave, or `--image`, turned into spectral light; presets
`--preset`, any setting with `--set key=value`). The rules and their sources are `brand/illustration.md`; follow them:
the light flows in from the edges on Black, the texture is an accent and never the subject, photos keep their own
color, the subject stays White on top. `{{cli}} illustrate --list` names every style, subject, preset, look and setting.

## Work in Figma

The CLI never calls Figma; it writes files and prints the Figma MCP calls to make, in order.

1. `{{cli}} figma tokens`: the tokens as variables (modes Dark and Light). Run the printed `use_figma` scripts.
2. `{{cli}} figma push <illustration|asset|slide|component|page> [target]`: an illustration (as `illustrate` takes it),
   any SVG or picture the CLI wrote (small SVGs as a script that imports editable layers and loads the brand fonts,
   bigger files through `upload_assets`), a library preview or a page as HTML for `html_to_figma`.
3. `{{cli}} figma pull <frame url>`: the reads to make (`get_variable_defs`, `get_design_context`) and where to save them.
4. `{{cli}} figma check <saved files>`: every off-brand color, font, size, radius or spacing with the nearest token
   (exit 1). Build from library items and tokens, never the raw values.

Load the figma-use skill before any `use_figma` call and figma-design-to-code before `get_design_context`; start every
file with `create_session`.

## Motion

- Hover and color: 150ms on `ease-standard`. Press: scale 0.97 over 160ms on `ease-out`. Menus and popovers in: 200ms
  on `ease-out`, out: 150ms. Dialogs and drawers: 300ms. Never ease-in, never `transition-all`.
- Keyboard-opened surfaces do not animate. Hover effects only where hover exists. Reduced motion keeps opacity and
  color. Icons never move on hover.

## Verify

1. Run the app's type check, tests and build.
2. Run `{{cli}} check --json`. Exit 0 means no token violations. Fix every finding and rerun. Register `{{cli}} hook`
   as your edit hook to check every edit as you make it.
3. Test every interaction with mouse and keyboard, at desktop and phone widths, with reduced motion on.
4. Compare with the library's previews at {{registry}}.
