# Adding an item: React first, then its web component

Every item is written in React (`registry/react`, the source of truth) and ported to a web component
(`registry/elements`, Lit) that renders identically. The seed items show every pattern; copy the nearest:

| Pattern | Item | What to copy |
| --- | --- | --- |
| A control with variants and sizes, form-associated, a link form | button | `VARIANTS`/`SIZES`/`PADDING` maps, one padding class per state, `HostLayoutController` |
| A native field with a value | input | `DsFormElement`, `delegatesFocus`, `live(this.value)`, `setFormValue`, Enter submits |
| Slots and a title | card | `heading` for `title`, `hasSlot('actions')`, layout classes on the host |
| A composite that uses another element | search-bar | `import '@/elements/components/ui/button'`, `<spyglass-button>` in the template, an event with detail |
| A generated graphic whose host is the box | brand-light, ascii-texture | `:host` in a sibling `.css`, `cover`, inline aspect ratio, `svg` templates for SVG children |
| Inline SVG markup from a lib file | logo | `dangerouslySetInnerHTML` / `unsafeSVG` with the same markup |

## What an item is

```
registry/docs/<item>.md                               frontmatter: name, title, type, group, description, use_for,
                                                      never, source (where in the brand assets), files, examples
registry/react/components/<group>/<Name>.tsx          the React component(s), listed in files
registry/lib/<name>.ts                                framework-free code the item owns (optional, listed in files)
registry/react/examples/<item>/<Example>.tsx          one per example, default export named after the file
registry/elements/components/<group>/<name>.ts        kebab-case of each React file (+ <name>.css), define('<name>', X)
registry/elements/examples/<item>/<Example>.html      the same example as markup
apps/parity/interactions/<item>.mjs                   the steps a person takes (optional, recommended)
```

`files` lists React files (`react/components/...`, `react/hooks/...`) and lib files (`lib/...`). The element files are
found by name; list others with `elements_files:`. The build fails on a half port, a file no item owns, a missing
`data-ds`, a React file with hooks and no `'use client'`, Next or app-only imports, a relative import, a class glued to
an interpolation, value check findings and type errors.

## The loop

```sh
bun install && bun run build                          # once
bun run registry                                      # builds both flavors, checks values, type-checks
node scripts/check-parity.mjs <item> --parity-port <yours>   # compares every example, React vs elements
open apps/parity/report/report.html                   # screenshots, diffs and differences
bun run ci                                            # must pass before you commit
```

Pass means: `bun run registry` clean, and every example `ok` at 1440 and 390 with your interaction steps. Look at the
screenshots yourself (a blank example passes against a blank example) and compare them with the brand assets PNGs.
Several agents run parity at once: give each its own `--parity-port` and `--out <absolute dir>` in your port range.

## Writing the React file

- Classes are the theme's utilities: `bg-surface`, `bg-surface-raised` (the #171717 card), `text-fg`, `text-fg-muted`,
  `border-edge-strong`, `bg-action-primary`, `rounded-control`, `h-control-md`, `type-ui-strong`, `type-heading-2`.
  No raw colors, no Tailwind palette (`bg-white` is flagged; use `bg-action-primary` or `bg-surface-inverse`), no
  shadows, no bold. `brand/tokens.css` holds every token; add one there only when the brand assets measure it.
- One class per property per state. `cn` does not merge: `px-0` and `px-4` together lose to the stylesheet's order
  (the square button once had an 8px wide icon). Build the list so each property appears once.
- Props: an exported `<Name>Props` interface with JSDoc on each prop, defaults in the destructuring (the API reader and
  the docs props table use both). Value: `value`, `defaultValue`, `onValueChange` through `useControllable`. Events:
  `onX` callbacks. `className` is appended last.
- `'use client'` when it calls a hook other than `useId`. No Next.js, router, fetch or auth; data through props.
- Motion (load the `emil-design-eng` and `improve-animations` skills first): `transition-[background-color,color]` or
  the exact properties, `duration-150` (color), `duration-160` (press), `duration-200` (enter), `duration-150` (exit),
  `ease-standard` for color, `ease-out` for press and entrances. Press: `active:not-disabled:scale-97` with
  `motion-reduce:active:not-disabled:scale-100`. `hover:` only applies where hover exists (Tailwind 4). Icons never
  move on hover. Nothing animates on keyboard-opened surfaces.
- The root element carries `data-ds="<item or file name>"`.

## Porting to the web component

Lit, shadow DOM, one module per React component file, tag `spyglass-<name>`:

```ts
import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

/**
 * @summary One line for the manifest and the docs.
 * @slot - The body.
 * @slot actions - Buttons at the foot.
 * @fires search - detail.query is the text.
 */
export class Card extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="card"]'))
	static properties = { heading: {}, description: {} }
	/** The card title (React's `title`). */
	heading?: string
	description?: string
	render() {
		return html`<div data-ds="card" class="flex flex-col gap-6 rounded-container bg-surface-raised p-8">...<slot></slot></div>`
	}
}

define('card', Card)
```

- Same DOM, same class strings as the React file, in the same order. `virtual:tw` compiles the classes in the file;
  a sibling `<name>.css` lands unlayered (`:host` rules, `@apply`).
- The host is `display: contents` by default and the shadow root's first element is the box; `HostLayoutController`
  copies the page's layout classes (width, margins, flex) onto it. When React's root is sized and placed by the page
  (`absolute inset-0`), the host is the box instead: write the root's styles as `:host { ... }` in the `.css` and put
  no `data-ds` inside (the host gets `data-ds` itself) (brand-light, ascii-texture).
- Properties: `static properties` plus typed fields with defaults. Never name one after an `HTMLElement` member (`id`,
  `title`, `hidden`...): `title` is `heading`, a private `id` is `lightId`. Booleans that default to true take a
  converter (`fromAttribute: (v) => v !== 'false'`). Lists are JSON attributes or properties.
- Values: extend `DsFormElement`, set the inner control with `live(this.value)`, `this.internals.setFormValue`, and
  fire only `change` yourself (the inner `input` event crosses the shadow root). Events: `this.emit('name', detail)`.
- SVG children built in a loop or a nested template use Lit's `svg` tag, not `html` (an `html` fragment of `<use>` or
  `<text>` lands in the HTML namespace and draws nothing).
- Spaces in SVG text collapse in some renderers: draw them as no-break spaces (`asciiText`).
- An element that renders another (`<spyglass-button>` in the search bar) imports its module; that element's own form
  association finds the shadow form, so do not submit twice.
- Examples: the React example's markup with the elements, the same layout classes and data, and an inline
  `<script type="module">` with no imports for behavior. `<i data-lucide="search" data-size="16"
  data-stroke-width="1.5">` expands to the same svg lucide-react renders.

## Generated graphics

`registry/lib/light.ts` and `ascii.ts` are the only way to draw the brand light and the texture. Use
`lightGeometry({ width, height, variant, seed, source })` (one evenodd path in frame px, the layers' offset and blur)
in components, `lightSvg` for files (`blend: 'filter'` for rasterizers without CSS blend modes), `drawLight` on a
canvas; `asciiLines`, `asciiSvg`, `drawAscii` likewise. Seeds below the number of brand windows for a variant are the
exact windows the brand assets cut from the brand's heat map. The CLI draws with the same code (`build/generators`).

## Docs and data

- `description` and `use_for` say what it is and when to use it in the brand's voice (short declarative sentences);
  `never` lists the misuses the guidelines name; `source` names the frame in the brand assets it comes from (or says it
  is derived from the guidelines).
- Example data is Acme or the brand's own copy ("The only creative search engine.", "$10 for your first month, then
  $20/month"). Never another brand's name or photo, never a real person's name.
