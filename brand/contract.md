# {{brand}} design system
- Read `.ds/agent-guide.md` before changing UI, pages or assets. It covers setup, component discovery, composition and
  verification.
- Start from `{{cli}} manifest --json` (`describe` is the same command). It lists every command, template, size,
  component, token and rule. If a name is not in that document, the command exits 1. Do not invent a substitute.
- Follow the user's brief. When only restyling, preserve existing content, links, order and behavior.
- Find components with `{{cli}} search <words>`, `{{cli}} list --json` or `{{cli}} component list --json`, and add them
  with `{{cli}} add <names...>` (`--dry-run` first). React apps get the React components; every other stack (and React
  apps without Tailwind) gets the web components, `<spyglass-*>` tags that carry their own styles
  (`--framework react|elements` to choose). Read `{{cli}} view <name> --json` for props, events, slots and examples in
  that flavor; do not guess them. Web components take properties for lists, fire DOM events and name `title` as
  `heading`.
{{appNote}}
- To restyle existing screens, run `{{cli}} apply` with what the user named (`apply button card`, `apply /settings`,
  `apply <page file>`), `--dry-run --json` first. It changes style values only, in any file type; `.ds/state.json`
  records the scope and `{{cli}} check` checks it.
- Style with brand tokens only: with Tailwind, the utilities from the installed theme (bg-surface, bg-surface-raised,
  text-fg, text-fg-muted, border-edge, bg-action-primary, text-action-primary-fg, rounded-control, type-body,
  type-label...); without Tailwind, `var(--ds-*)` in CSS and the `ds-*` classes from kinds.css. `{{cli}} brand --json`
  lists color, type, spacing, radii, motion, fonts, logos and voice; `{{cli}} principles --json` is the guidance.
- Black is the ground and White the type. The spectrum colors come only from the brand light and small accents. No
  shadows, no bold weights, no ease-in, no transition-all, icons never move on hover.
- The brand light and the ASCII texture are generated, never drawn by hand or pasted as images: use the `brand-light`
  and `ascii-texture` components, or `{{cli}} light` and `{{cli}} ascii` for SVG files. Brand imagery (the pattern,
  the photo light split, the shader) comes from `{{cli}} illustrate`, following `brand/illustration.md`; social posts,
  decks, video and merch from `image`, `deck`, `video` and `merch`. Figma work goes through `{{cli}} figma` (tokens,
  push, pull, check): it writes files and prints the Figma MCP calls. Use the logo files from
  `{{cli}} brand --section logos` (or the `logo` component); never redraw, recolor, stretch or outline them.
- To make a graphic the user will react to, use `{{cli}} design new`, show the PNG, and change it with `design edit` or
  `design revise` until they are happy; never edit the PNG or SVG by hand. Only copy the user wrote is drawn.
- Nothing is cut off by a hard edge: a box that scrolls takes `fade-y` (down), `fade-x` (across) or `fade-xy` (both
  ways) from brand.css, so its edges fade while there is more past them.
- Icons are Lucide at a 1.5 stroke.
- Example and sample data use Acme. Never use another brand's photos or a real person's name.
- Run the project's checks and build, then `{{cli}} check --json`, and fix what it reports.
