# What the site changed (site vs the Figma-derived brand/)

Source of truth for how Spyglass looks is now the marketing site (the owner's `spyglass.zip`, Next 16, received
2026-11-24; `src/app/tokens.css`, `globals.css`, `controls.css`, `layout.tsx`, the CSS modules). Values were read from
the files and confirmed as computed styles in a browser at 1440 and 390. Where the site is silent (logo clear space and
minimums, merch, deck, the 1080 canvas `--ds-asset-*`), the Figma values stay.

Line numbers are the site's files. "Old" is `brand/` before this change.

## Unchanged (checked)

- Neutral spectrum, Black and White, the seven spectrum bases (tokens.css:2-15, 457-463): identical.
- Families: Funnel Display, DM Sans, Geist Mono (layout.tsx:2, next/font). Logos: the site's lockup, stacked, mark,
  3D mark and wordmark SVGs render identically to `logo/svg` (same paths and proportions).
- The light: same shape, colors (#DF0000, #00FF29, #1B1DFF), opacities (0.85, 0.782, 0.782), plus-lighter blend; the
  blur is 8.85 of 3337 (0.00265) against 0.00268 here, within rounding (public/brand/textures/dispersion-light-*.svg).
- The ASCII ramp " .:-=+*#" in Geist Mono (components/instrument/ascii.ts:5).
- Focus ring 2px White, offset 2px (globals.css:98). Label tracking 0.06em (tokens.css:77).
- Primary button: White fill, Black DM Sans Medium 14/20, 40px, 16px padding, 8px corner (globals.css:334, controls.css).

## Changed

| What | Old | New (site) | Site source |
| --- | --- | --- | --- |
| Font files | static 400/500 instances | variable: Funnel Display wght 300-800, DM Sans opsz 9-40 + wght 100-1000 (latin, the files next/font serves) | layout.tsx:12-31 |
| DM Sans optical size | auto | `"opsz" 14` on all body text | globals.css:30 |
| Heading weight | 400 | 450 for page and section heads (Funnel Display); 400 stays for card titles and subheads | tokens.css:80, globals.css:135, 210 |
| Code font | Geist Mono | system mono (`ui-monospace, SFMono-Regular, Menlo, monospace`); Geist Mono only for the ASCII texture | tokens.css:41, layout.tsx:25 |
| Fallback stack | ui-sans-serif, system-ui | "Helvetica Neue", Arial, sans-serif | tokens.css:39-40 |
| Line heights | ratios (1.07 heads, 1.33 body, 1.3 small) | fixed px per step: size + 4 for heads (56/60, 44/48, 32/36, 24/28, 20/24), body 16/24, small 14/20, caption 12/16, lead 20/28 | tokens.css:43-76 |
| Body lead | 18px | 20/28 (`body-m`, `.t-lead`, color neutral-11) | tokens.css:69, globals.css:171 |
| Heading sizes | h4 20, h3 24, h2 28, h1 36, hero 48, display 64 | h4 20/24, h3 24/28, h2 32/36, h1 44/48, hero 56/60 (the section head at 1024+), display 96/100; display-xl 112/116, display-m 72/76, display-s 64/68 added | tokens.css:43-64, globals.css:207-241 |
| Section head | none | responsive: 32/36, 44/48 at 768, 56/60 at 1024 (`.t-head`) | globals.css:207-241 |
| Raised surface (cards) | #171717 (Figma card fill) | #262626 neutral-4 (`--surface`: cards, tiles, menu cards, plan tiers) | tokens.css:23 |
| Subtle surface | #1A1A1A | #1A1A1A (`--raised`: quiet buttons, segmented tray) | tokens.css:24 |
| Inset surface | none | #363636 neutral-5 (`--surface-inset`: badges, chips, the selected segment) | tokens.css:26 |
| Hairline on Black | #262626 neutral-4 | #363636 neutral-5 (`--line`) | tokens.css:29 |
| Hairline on a surface | none | #4D4D4D neutral-6 (`--line-surface`, drawn as an inset ring) | tokens.css:31 |
| Strong hairline | #363636 | #666666 neutral-7 (`--line-strong`) | tokens.css:30 |
| Faint text | #666666 neutral-7 | #858585 neutral-8 (`--text-off`) | tokens.css:22 |
| Secondary button | #262626 fill, hover #363636 | "quiet": #1A1A1A fill, inset 1px #363636 ring, hover #262626 | controls.css:14-16 |
| Button hover | fill change | fill change plus a White glow (14%, 80px circle) following the pointer, 240ms | tokens.css:34-35, globals.css:369-396 |
| Button press | scale 0.97 | none (`--btn-press: 1`) | controls.css:13 |
| Large button | 48px, 16px label | 56px, 32px padding, 20/24 label | globals.css:398 |
| Header-size control | none | 36px (`--control-xs`, the header's buttons and nav links) | controls.css:2 |
| Container corner | 8px | 4px (`--radius-s`: cards, tiles, badges, menu cards); 8px stays for controls, fields, the segmented tray and plan tiers; 20px large panel added | tokens.css:148-150 |
| Badge | (library) | 24px, 8px padding, 4px corner, #363636 fill, neutral-11 12/16 Medium, not capitals | globals.css:251 |
| Selection | White on Black | #4D4D4D behind White | globals.css:103 |
| Scrim | Black 64% | Black 72% | tokens.css:37 |
| Easing out | cubic-bezier(0.23, 1, 0.32, 1) | cubic-bezier(0.22, 1, 0.36, 1) | tokens.css:163 |
| Easing in-out | cubic-bezier(0.77, 0, 0.175, 1) | cubic-bezier(0.65, 0, 0.35, 1) | tokens.css:164 |
| Hover color easing | ease (0.25, 0.1, 0.25, 1) | the ease-out above | globals.css:347 |
| Durations | micro 150, press 160, exit 150, enter 200, glide 250, entrance 300 | hover 160, press 120, exit 160, enter 240, glide 320, entrance 360 (open), close 280, slow 480 | tokens.css:165-172 |
| ASCII field opacity | 0.35 | 0.5 for a field, 0.32 faint, 0.35 for the pointer trail (the canvas keeps Figma's 0.35) | tokens.css:137-141 |
| Layout | page 960, wide 1200 | content 1280, gutter 16 / 32 (768) / 48 (1024) / 64 (1280) / 96 (1600), section padding 56 / 72 / 80 / 96, header 64 / 72 (1024), measure 640 | tokens.css:101-106, 585-640 |
| Header | (library) | 72px, nav links 14/20 neutral-11, 36px tall, 16px padding, 8px corner; CTA a 36px primary | Header.module.css |
| Footer | (library) | column titles Funnel Display 20/24, links 16/24 neutral-11 32px rows; the wordmark in #373737 | Footer.module.css, tokens.css:16, 434 |
| New colors | none | wordmark gray #373737, plan ice #E1EEF8, window dots #FF5F57 / #FEBC2E / #28C840, the spectrum light set (#1618D1, #00D122, #C70000, #C7D122, #DD18D1, #16E9F3) for the plan rim | tokens.css:16, 27, 157-159, 463-468 |

## Scope that follows from the list

1. `brand/`: tokens.css (values above, old names kept, new names added), base.css (opsz 14, heading 450, selection),
   brand.json (variable web faces plus static render instances), elements.json, principles notes; fonts/ (new files).
2. Library: every item picks up the token values; items with their own recipes (button, badge, card, header, footer,
   plan card, FAQ, segmented controls, search bar) are restyled to the site's recipes; the site's sections and page
   layouts the library lacks are added.
3. Assets: the renderers draw headings at 450 and body at opsz 14 (static instances), cards in #262626 with 4px corners.
4. Docs site: fonts, theme, type.
