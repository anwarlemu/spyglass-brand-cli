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
   The asset engine (images, recipes and compose blocks, deck slides, merch, video, icons, the photo split) draws in
   the site's materials: heads on its steps with four pixels of leading, text and labels in #D4D4D4, the large button
   (56px, 20px label, 32px padding, 8px corner), the hero prompt (#1A1A1A, #666666 ring, 20px corner, White send key),
   the ASCII texture tile with the drift's radial fade (public/brand/textures/ascii-texture-alpha@2x), and the site's own
   light images (public/brand/light/*, public/og/pitch-light.png, re-encoded in brand/assets/art) where a light runs.
   Removed because the site has nothing like them: the light close-up banner and video loop, and the colored grounds
   (Blue, Red, Magenta, Yellow, Green) of the logo background and compose themes.
4. Docs site: fonts, theme, type.

## The newer site (sign-up and sign-in, received 2026-11-24)

| What | Value | Site source |
| --- | --- | --- |
| Auth column | 400px (`--ds-layout-auth`), proof row 560px wide and 76px tall (`--ds-layout-auth-proof`, `-proof-h`) | tokens.css `--auth-w`, `--auth-proof-w`, `--auth-proof-h` |
| Corner lights | min(29vw, 520px) from 768, 144px on phones, bobbing 12px with a 0.05deg tilt, the left one 40px off the bottom (`--ds-auth-light-*`) | tokens.css `--auth-light-*` |
| Light bob | 14s, `cubic-bezier(0.37, 0, 0.63, 1)` (`--ds-easing-drift`), alternate, none with reduced motion | tokens.css `--hero-band-bob-time`, `--ease-drift` |
| Spinner | a 2px ring turning every 800ms | tokens.css `--dur-spin` |
| Form controls | 48px (`--ds-size-control-form`, the button's `form` size), labels 16/24 | tokens.css `--control-m` |
| Page title | 32/36, 40/44 from 768, at 450 (`type-title`) | Auth.module.css `.title` (h4, h3) |
| ASCII drift | the texture tile at 1080px, fading from 24% (56% on a hero) (`--ds-ascii-tile`, `--ds-ascii-core`, `--ds-ascii-hero-core`) | tokens.css `--ascii-tile`, `--ascii-core`, `--ascii-hero-core`; ui/AsciiDrift |
| Header | the Products menu's "live soon" panel groups its platforms under a label (14/20, --text-2, 16px under it, 24px between marks) and centers them; the home link no longer prefetches | Header.module.css `.liveSoon`, `.liveGroup`, `.liveGroupLabel`; HomeLink.tsx. The library's header has no Products menu panel yet: it lands with the header's menus. |


## The site parts (the newer site, components and pages)

Every token added for the site's sections, pages and effects, by group, with the site token it comes from. The full comment for each is in `brand/tokens.css` under its group line.

| Group | Token | Value | Site source |
| --- | --- | --- | --- |
| effects | `--ds-light-grain-reach` | `64px` | --light-grain-reach |
| effects | `--ds-light-grain-lens` | `192px` | --light-grain-lens |
| effects | `--ds-ascii-trail-radius` | `72px` | --ascii-trail-radius |
| effects | `--ds-ascii-trail-fade` | `700ms` | --ascii-trail-fade |
| effects | `--ds-footer-crest-width` | `0.07` |  |
| effects | `--ds-footer-crest-low` | `0.1` |  |
| effects | `--ds-footer-crest-high` | `0.36` |  |
| effects | `--ds-footer-crest-idle` | `0.5` |  |
| effects | `--ds-footer-wave-hollow` | `0.25` |  |
| effects | `--ds-footer-wave-spread` | `2` |  |
| effects | `--ds-footer-wave-tint` | `1` |  |
| effects | `--ds-dur-footer-crest-in` | `800ms` |  |
| effects | `--ds-dur-footer-crest-out` | `1200ms` |  |
| effects | `--ds-dur-footer-crest-follow` | `300ms` |  |
| effects | `--ds-dur-footer-wave-pass` | `7800ms` |  |
| effects | `--ds-hero-light-tilt` | `0.14` |  |
| effects | `--ds-hero-light-cross` | `0.72` |  |
| effects | `--ds-hero-light-tilt-lg` | `0.04` | --hero-light-tilt (1024) |
| effects | `--ds-hero-light-cross-lg` | `0.5` | --hero-light-cross (1024) |
| effects | `--ds-ent-run-depth` | `0.36` | --ent-run-depth |
| effects | `--ds-ent-run-depth-md` | `0.2` | --ent-run-depth (768) |
| effects | `--ds-fan-card` | `72px` |  |
| effects | `--ds-fan-card-md` | `96px` |  |
| effects | `--ds-fan-card-lg` | `128px` |  |
| effects | `--ds-fan-perspective` | `640px` |  |
| effects | `--ds-fan-turn-0` | `18deg` |  |
| effects | `--ds-fan-turn-1` | `15deg` |  |
| effects | `--ds-fan-turn` | `12deg` |  |
| effects | `--ds-fan-enter-scale` | `0.85` |  |
| effects | `--ds-fan-card-scale` | `0.875` |  |
| effects | `--ds-fan-cta-top` | `-12px` |  |
| effects | `--ds-footer-glow-radius` | `260px` |  |
| effects | `--ds-glow-centre` | `0.375` |  |
| effects | `--ds-glow-strength` | `0.8` |  |
| effects | `--ds-glow-dot-pitch` | `20px` |  |
| effects | `--ds-glow-dot-offset` | `4px` |  |
| effects | `--ds-glow-dot-fade` | `128px` |  |
| effects | `--ds-glow-dot-color` | `color-mix(in srgb, var(--ds-color-white) 10%, transparent)` | --footer-dot-color |
| effects | `--ds-easing-glow` | `cubic-bezier(0.33, 1, 0.68, 1)` | --ease-footer-glow |
| effects | `--ds-abstract-line` | `267ms` |  |
| effects | `--ds-abstract-line-step` | `433ms` |  |
| effects | `--ds-abstract-glide` | `400ms` |  |
| effects | `--ds-abstract-gather` | `400ms` |  |
| effects | `--ds-abstract-decode` | `600ms` |  |
| effects | `--ds-abstract-tag-step` | `2000ms` |  |
| effects | `--ds-abstract-loop-step` | `2600ms` |  |
| effects | `--ds-abstract-stagger` | `70ms` |  |
| effects | `--ds-abstract-swap` | `600ms` |  |
| effects | `--ds-abstract-ease` | `cubic-bezier(0, 0, 0.58, 1)` |  |
| effects | `--ds-abstract-drift` | `8px` |  |
| effects | `--ds-fan-below-gap` | `40px` | --cities-below-gap |
| effects | `--ds-easing-fan-pop` | `cubic-bezier(0.45, 0, 0.55, 1)` | --ease-cities-pop |
| effects | `--ds-easing-fan-lift` | `cubic-bezier(0.33, 1, 0.68, 1)` | --ease-cities-lift |
| effects | `--ds-easing-fan-cta-out` | `cubic-bezier(0.5, 1, 0.89, 1)` | --ease-cities-cta-out |
| effects | `--ds-easing-fan-travel` | `linear(0, 0.1325, 0.2537, 0.3641, 0.4642, 0.5544, 0.6352, 0.7071, 0.7705, 0.8261, 0.8741, 0.9151, 0.9496, 0.9781, 1.0009, 1.0187, 1.0319, 1.041, 1.0464, 1.0486, 1.0481, 1.0454, 1.041, 1.0353, 1.0288, 1.022, 1.0153, 1.0093, 1.0045, 1.0012, 1)` | --ease-cities-travel |
| chrome | `--ds-page-head-drift-clear` | `320px` | --space-320 |
| chrome | `--ds-menu-from-scale` | `0.96` | --menu-from-scale |
| chrome | `--ds-page-close-drift-w` | `480px` | --space-480 |
| chrome | `--ds-page-close-drift-high-w` | `320px` | --space-320 |
| chrome | `--ds-stroke` | `2px` | --stroke |
| chrome | `--ds-header-menu-gap` | `24px` | a header menu panel's distance under the bar's links (site .panel top) |
| chrome | `--ds-header-menu-rise` | `8px` | --menu-rise |
| chrome | `--ds-header-menu-products-w` | `874px` | the products menu: a 320px list, a 540px live card, 4px gaps (site .panelProduct |
| chrome | `--ds-header-menu-cases-w` | `944px` | the use cases menu: two 320px columns and a 288px card (site .panelCases) |
| chrome | `--ds-header-menu-resources-w` | `556px` | the resources menu: a 256px list and a 288px card (site .panelResources) |
| chrome | `--ds-header-live-card-w` | `540px` | --live-card-w |
| chrome | `--ds-header-band-slide` | `22s` | --hero-band-slide-time |
| chrome | `--ds-header-band-bob` | `14s` | --hero-band-bob-time |
| chrome | `--ds-header-bar-phone` | `64px` | --header-h |
| home | `--ds-seq-set` | `3800ms` | --dur-seq-set |
| home | `--ds-seq-in` | `900ms` | --dur-seq-in |
| home | `--ds-seq-out` | `540ms` | --dur-seq-out |
| home | `--ds-seq-stagger` | `180ms` | --dur-seq-stagger |
| home | `--ds-seq-from-scale` | `0.85` | --seq-from-scale |
| home | `--ds-seq-light-low` | `0.88` | --seq-light-low |
| home | `--ds-easing-seq-settle` | `linear(0, 0.119 1.6%, 0.224 3.1%, 0.317 4.7%, 0.398 6.3%, 0.47 7.9%, 0.562 10.2%, 0.638 12.6%, 0.719 15.7%, 0.782 18.9%, 0.842 22.8%, 0.892 27.6%, 0.931 33.1%, 0.958 39.4%, 0.978 47.2%, 0.99 57.1%, 0.996 68.9%, 0.999 82.7%, 1)` | --ease-seq-settle |
| home | `--ds-easing-seq-settle-fallback` | `cubic-bezier(0.14, 1, 0.22, 1)` | --ease-seq-settle-fallback |
| home | `--ds-loop-step` | `2600ms` |  |
| home | `--ds-loop-change` | `700ms` |  |
| home | `--ds-loop-flick` | `1400ms` |  |
| home | `--ds-loop-badge` | `500ms` |  |
| home | `--ds-loop-pill` | `150ms` |  |
| home | `--ds-loop-glide` | `400ms` | --dur-abstract-glide |
| home | `--ds-read-first` | `3800ms` | --dur-read-first |
| home | `--ds-read-hold` | `2800ms` | --dur-read-hold |
| home | `--ds-stories-lead-min-h` | `560px` | --stories-lead-min-h |
| home | `--ds-stories-panel-w` | `480px` | --stories-panel-w |
| home | `--ds-session-min-h` | `480px` | --session-min-h |
| home | `--ds-hero-min-h` | `640px` |  |
| home | `--ds-hero-light-lift` | `240px` | --hero-light-lift |
| home | `--ds-hero-light-lift-md` | `96px` |  |
| home | `--ds-hero-band-w` | `2800` |  |
| home | `--ds-hero-band-h` | `696` |  |
| home | `--ds-hero-band-x` | `440` |  |
| home | `--ds-hero-band-y` | `28` |  |
| home | `--ds-hero-band-centre` | `960` |  |
| home | `--ds-hero-band-cross` | `184` |  |
| home | `--ds-hero-band-tilt` | `4deg` |  |
| home | `--ds-hero-band-slide` | `60` |  |
| home | `--ds-hero-band-bob` | `16` |  |
| home | `--ds-hero-band-drop` | `160px` | the band lowered behind the frame (site hero option a) |
| home | `--ds-close-min-h` | `640px` |  |
| home | `--ds-close-field` | `880` |  |
| home | `--ds-close-phone-field` | `720` |  |
| home | `--ds-close-lift-phone-a` | `208px` |  |
| home | `--ds-close-lift-phone-b` | `218` |  |
| home | `--ds-close-lift-tablet-a` | `168px` |  |
| home | `--ds-close-lift-tablet-b` | `176` |  |
| home | `--ds-close-lift-laptop-a` | `196px` |  |
| home | `--ds-close-lift-laptop-b` | `190` |  |
| home | `--ds-close-lift-desktop-a` | `252px` |  |
| home | `--ds-close-lift-desktop-b` | `220` |  |
| home | `--ds-close-ascii` | `0.8` |  |
| home | `--ds-close-rest-bright` | `0.32` |  |
| home | `--ds-close-rest-grey` | `1` |  |
| home | `--ds-close-sweep-alpha` | `0.16` | --close-sweep-ice |
| home | `--ds-close-sweep-w` | `640px` |  |
| home | `--ds-close-sweep-tilt` | `16deg` |  |
| home | `--ds-close-light-fade` | `32%` | --light-fade |
| home | `--ds-close-reach` | `400px` |  |
| home | `--ds-close-lean` | `4px` |  |
| home | `--ds-close-tag-travel` | `4px` |  |
| home | `--ds-close-tag-blur` | `4px` |  |
| home | `--ds-close-tag-intent` | `80ms` | --dur-close-tag-intent |
| home | `--ds-price-card-w` | `144px` |  |
| home | `--ds-price-card-h` | `240px` |  |
| home | `--ds-price-card-w-xl` | `192px` |  |
| home | `--ds-price-card-h-xl` | `320px` |  |
| home | `--ds-price-step-z` | `156px` |  |
| home | `--ds-price-step-z-xl` | `208px` |  |
| home | `--ds-price-step-y` | `8px` |  |
| home | `--ds-price-turn` | `-24deg` |  |
| home | `--ds-price-perspective` | `1800px` |  |
| home | `--ds-price-perspective-xl` | `2400px` |  |
| home | `--ds-price-eye-y` | `-140%` |  |
| home | `--ds-price-run-x-xl` | `16%` |  |
| home | `--ds-price-stage-h` | `360px` |  |
| home | `--ds-price-stage-h-xl` | `480px` |  |
| home | `--ds-price-light-w` | `2640px` |  |
| home | `--ds-price-light-h` | `1400px` |  |
| home | `--ds-price-light-anchor-x` | `1400px` |  |
| home | `--ds-price-light-anchor-y` | `680px` |  |
| home | `--ds-price-light-fade-from` | `960px` |  |
| home | `--ds-price-light-fade-to` | `1280px` |  |
| home | `--ds-price-phone-light-w` | `1320px` |  |
| home | `--ds-price-phone-light-h` | `700px` |  |
| home | `--ds-price-phone-band-h` | `560px` |  |
| pricing-products-enterprise | `--ds-compare-tip-w` | `288px` | the compare table's tip, at most (site .compareTip: --space-320 - --space-32) |
| pricing-products-enterprise | `--ds-compare-tip-delay` | `80ms` | --dur-menu-intent |
| pricing-products-enterprise | `--ds-plan-tier-min-h` | `208px` | a plan's tier at least (site .tier: 2 * --space-80 + --space-48) |
| pricing-products-enterprise | `--ds-plan-copy-w` | `55%` | --plan-copy-w |
| pricing-products-enterprise | `--ds-plan-rim-w` | `2px` | --plan-rim-w |
| pricing-products-enterprise | `--ds-plan-rim-edge` | `24px` | --plan-rim-edge |
| pricing-products-enterprise | `--ds-plan-ascii-drift-x` | `16px` | --plan-ascii-drift-x |
| pricing-products-enterprise | `--ds-plan-ascii-drift-y` | `-16px` |  |
| pricing-products-enterprise | `--ds-plan-light-drift` | `14s` | --dur-pro-light-drift |
| pricing-products-enterprise | `--ds-plan-rim-glide` | `10.4s` | --dur-plan-rim-glide |
| pricing-products-enterprise | `--ds-plan-rim-cycle` | `7.8s` | --dur-plan-rim-cycle |
| pricing-products-enterprise | `--ds-plan-ascii-drift` | `15.6s` | --dur-plan-ascii-drift |
| pricing-products-enterprise | `--ds-coming-ascii-at-2` | `-320px -160px` | where each card's cover takes the ASCII tile (site .card:nth-child(n) --ascii-at |
| pricing-products-enterprise | `--ds-coming-ascii-at-3` | `-480px -320px` |  |
| pricing-products-enterprise | `--ds-coming-ascii-at-4` | `-160px -480px` |  |
| pricing-products-enterprise | `--ds-coming-ascii-at-5` | `-240px -96px` |  |
| pricing-products-enterprise | `--ds-ent-run-stage-h` | `480px` | --ent-run-stage-h |
| pricing-products-enterprise | `--ds-ent-run-stage-h-md` | `640px` |  |
| pricing-products-enterprise | `--ds-ent-run-stage-h-xl` | `800px` |  |
| pricing-products-enterprise | `--ds-ent-run-overlap` | `0px` | --ent-run-overlap |
| pricing-products-enterprise | `--ds-ent-run-overlap-md` | `96px` |  |
| pricing-products-enterprise | `--ds-ent-run-overlap-xl` | `128px` |  |
| pricing-products-enterprise | `--ds-ent-run-head-w` | `320px` | --ent-run-head-w |
| pricing-products-enterprise | `--ds-ent-run-head-w-md` | `704px` |  |
| pricing-products-enterprise | `--ds-ent-run-head-w-lg` | `960px` |  |
| pricing-products-enterprise | `--ds-ent-run-card` | `0.322` | --ent-run-card |
| pricing-products-enterprise | `--ds-ent-run-card-md` | `0.161` |  |
| pricing-products-enterprise | `--ds-ent-run-step-x` | `0.13` | --ent-run-step-x |
| pricing-products-enterprise | `--ds-ent-run-step-x-md` | `0.065` |  |
| pricing-products-enterprise | `--ds-ent-run-rise` | `0.585` | --ent-run-rise |
| pricing-products-enterprise | `--ds-ent-run-rise-md` | `0.356` |  |
| pricing-products-enterprise | `--ds-ent-run-enter` | `0.3` | --ent-run-enter |
| pricing-products-enterprise | `--ds-ent-run-offset-y` | `0.08` | --ent-run-offset-y |
| pricing-products-enterprise | `--ds-ent-run-offset-y-md` | `0` |  |
| pricing-products-enterprise | `--ds-ent-run-lift` | `112px` | --ent-run-lift |
| pricing-products-enterprise | `--ds-ent-run-lift-md` | `140px` |  |
| pricing-products-enterprise | `--ds-ent-run-lift-xl` | `180px` |  |
| pricing-products-enterprise | `--ds-ent-run-skew` | `14.8deg` | --ent-run-skew |
| pricing-products-enterprise | `--ds-ent-run-tilt` | `12deg` | --ent-run-tilt |
| pricing-products-enterprise | `--ds-ent-run-wave` | `16px` | --ent-run-wave |
| pricing-products-enterprise | `--ds-ent-run-wave-slots` | `20` | --ent-run-wave-slots |
| pricing-products-enterprise | `--ds-ent-run-push` | `1.8` | --ent-run-push |
| pricing-products-enterprise | `--ds-ent-run-push-reach` | `3` | --ent-run-push-reach |
| pricing-products-enterprise | `--ds-ent-run-drift` | `15` | --ent-run-drift |
| pricing-products-enterprise | `--ds-ent-run-note-w` | `288px` | --ent-run-note-w |
| pricing-products-enterprise | `--ds-ent-run-note-gap` | `16px` | --ent-run-note-gap |
| pricing-products-enterprise | `--ds-ent-run-deliver` | `700ms` | --dur-ent-run-deliver |
| pricing-products-enterprise | `--ds-ent-run-calm` | `700ms` | --dur-ent-run-calm |
| pricing-products-enterprise | `--ds-ent-run-glide` | `400ms` | --dur-ent-run-lift |
| pricing-products-enterprise | `--ds-ent-run-intent` | `80ms` | --dur-ent-run-note-intent |
| pricing-products-enterprise | `--ds-ent-run-big-tracking` | `-0.02em` | the note's big number (site .noteBig letter-spacing) |
| pricing-products-enterprise | `--ds-feature-ascii-tile` | `1080px` | --features-ascii-tile |
| pricing-products-enterprise | `--ds-feature-ascii-opacity` | `0.5` | --features-ascii-opacity |
| pricing-products-enterprise | `--ds-feature-ascii-clear-w` | `46%` | --features-ascii-clear-w |
| pricing-products-enterprise | `--ds-feature-ascii-clear-h` | `50%` | --features-ascii-clear-h |
| pricing-products-enterprise | `--ds-ph-min-h` | `640px` | --hero-min-h |
| pricing-products-enterprise | `--ds-ph-head-w` | `800px` | --space-80 |
| pricing-products-enterprise | `--ds-ph-card-w` | `192px` | --ph-card-w |
| pricing-products-enterprise | `--ds-ph-card-w-phone` | `144px` | --ph-card-w |
| pricing-products-enterprise | `--ds-ph-card-turn` | `-24deg` | --ph-card-turn |
| pricing-products-enterprise | `--ds-ph-card-depth` | `800px` | --ph-card-depth |
| pricing-products-enterprise | `--ds-ph-card-forward` | `32px` | --ph-card-forward |
| pricing-products-enterprise | `--ds-ph-ascii-h` | `560px` | --ph-ascii-h |
| pricing-products-enterprise | `--ds-ph-ascii-top` | `160px` | --space-160 |
| pricing-products-enterprise | `--ds-ph-ascii-foot` | `240px` | --space-240 |
| pricing-products-enterprise | `--ds-ph-light-foot` | `160px` | --ph-light-foot |
| pricing-products-enterprise | `--ds-ph-stat-size` | `28px` | --body-xl-size |
| pricing-products-enterprise | `--ds-ph-stat-leading` | `1.2857` |  |
| pricing-products-enterprise | `--ds-ph-scrim` | `color-mix(in srgb, var(--ds-color-black) 92%, transparent)` | --ph-scrim |
| pricing-products-enterprise | `--ds-ph-scrim-top` | `color-mix(in srgb, var(--ds-color-black) 72%, transparent)` | --ph-scrim-top |
| pricing-products-enterprise | `--ds-ph-detail-intent` | `80ms` | --dur-ph-detail-intent |
| pricing-products-enterprise | `--ds-ph-caret-blink` | `1060ms` | --dur-caret-blink |
| pricing-products-enterprise | `--ds-pv-ascii-clear-w` | `46%` | --features-ascii-clear-w |
| pricing-products-enterprise | `--ds-pv-ascii-clear-h` | `50%` | --features-ascii-clear-h |
| pricing-products-enterprise | `--ds-ent-hero-min-h` | `640px` | --hero-min-h |
| pricing-products-enterprise | `--ds-ent-hero-ascii-tile` | `1080px` | --ascii-tile |
| pricing-products-enterprise | `--ds-ent-hero-ascii-opacity` | `0.5` | --ascii-quiet |
| pricing-products-enterprise | `--ds-ent-hero-ascii-clear` | `464px` | site .heroAscii --words-clear (5 x 80 + 64): the texture keeps off the words |
| pricing-products-enterprise | `--ds-ent-hero-ascii-feather` | `96px` | --words-feather |
| pricing-products-enterprise | `--ds-ent-hero-head-w` | `800px` | site .heroHead max-width (10 x 80) |
| pricing-products-enterprise | `--ds-ent-hero-title-w` | `720px` | site .heroHead > h1 max-width (9 x 80) |
| pricing-products-enterprise | `--ds-ent-ring-card` | `240px` | --ent-ring-card |
| pricing-products-enterprise | `--ds-ent-ring-card-min` | `136px` | --ent-ring-card-min |
| pricing-products-enterprise | `--ds-ent-ring-card-phone` | `128px` | --ent-ring-card-phone |
| pricing-products-enterprise | `--ds-ent-ring-words` | `216px` | --ent-ring-words |
| pricing-products-enterprise | `--ds-ent-ring-edge` | `24px` | --ent-ring-edge |
| pricing-products-enterprise | `--ds-ent-ring-enter-y` | `40px` | --ent-ring-enter-y |
| pricing-products-enterprise | `--ds-ent-ring-enter-scale` | `0.8` | --ent-ring-enter-scale |
| pricing-products-enterprise | `--ds-ent-ring-enter-turn` | `-5deg` | --ent-ring-enter-turn |
| pricing-products-enterprise | `--ds-ent-ring-ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | --ease-ent-ring-enter |
| pricing-products-enterprise | `--ds-ent-ring-float` | `8px` | --ent-ring-float |
| pricing-products-enterprise | `--ds-ent-ring-forward` | `1.1` | --ent-ring-forward |
| pricing-products-enterprise | `--ds-ent-ring-press` | `0.95` | --ent-ring-press |
| pricing-products-enterprise | `--ds-ent-ring-ease-hover` | `cubic-bezier(0.25, 0.25, 0, 1)` | --ease-ent-ring-hover |
| pricing-products-enterprise | `--ds-ent-ring-swap-from` | `1.1` | --ent-ring-swap-from |
| pricing-products-enterprise | `--ds-ent-ring-tag-gap` | `8px` | --ent-ring-tag-gap |
| pricing-products-enterprise | `--ds-ent-ring-tag-clear` | `16px` | --ent-ring-tag-clear |
| pricing-products-enterprise | `--ds-ent-ring-intent` | `80ms` | --dur-menu-intent |
| pricing-products-enterprise | `--ds-ent-ring-hint-every` | `6000ms` | --dur-ent-ring-hint-every |
| pricing-products-enterprise | `--ds-ent-ring-hint-hold` | `2000ms` | --dur-ent-ring-hint-hold |
| pricing-products-enterprise | `--ds-ent-feat-gap` | `16px` | --ent-feat-gap |
| pricing-products-enterprise | `--ds-ent-feat-pad` | `24px` | --ent-feat-pad |
| pricing-products-enterprise | `--ds-ent-feat-visual-h` | `288px` | --ent-feat-visual-h |
| pricing-products-enterprise | `--ds-ent-feat-visual-h-lg` | `320px` | from 1024 |
| pricing-products-enterprise | `--ds-ent-feat-tile` | `48px` | --ent-feat-tile |
| pricing-products-enterprise | `--ds-ent-feat-glyph` | `24px` | --ent-feat-glyph |
| pricing-products-enterprise | `--ds-ent-feat-hub` | `64px` | --ent-feat-hub |
| pricing-products-enterprise | `--ds-ent-feat-hub-glyph` | `40px` | --ent-feat-hub-glyph |
| pricing-products-enterprise | `--ds-ent-feat-thumb-w` | `40px` | --ent-feat-thumb-w |
| pricing-products-enterprise | `--ds-ent-feat-thumb-h` | `48px` | --ent-feat-thumb-h |
| pricing-products-enterprise | `--ds-ent-feat-cursor` | `16px` | --ent-feat-cursor |
| pricing-products-enterprise | `--ds-ent-feat-report-fade` | `64px` | --ent-feat-report-fade |
| pricing-products-enterprise | `--ds-ent-feat-report-travel` | `1.6805` | --ent-feat-report-travel |
| pricing-products-enterprise | `--ds-ent-feat-report-grey` | `0.2` | --ent-feat-report-grey |
| pricing-products-enterprise | `--ds-ent-feat-report-bright` | `0.8` | --ent-feat-report-bright |
| pricing-products-enterprise | `--ds-ent-feat-ascii-tile` | `1080px` | --features-ascii-tile |
| pricing-products-enterprise | `--ds-ent-feat-ascii-opacity` | `0.5` | --features-ascii-opacity |
| pricing-products-enterprise | `--ds-ent-feat-step` | `2600ms` | --dur-ent-feat-step |
| pricing-products-enterprise | `--ds-ent-feat-change` | `700ms` | --dur-ent-feat-change |
| pricing-products-enterprise | `--ds-ent-feat-fade` | `500ms` | --dur-ent-feat-fade |
| pricing-products-enterprise | `--ds-ent-feat-switch` | `150ms` | --dur-ent-feat-switch |
| pricing-products-enterprise | `--ds-ent-feat-glide` | `400ms` | --dur-ent-feat-glide |
| pricing-products-enterprise | `--ds-ent-feat-stagger` | `180ms` | --dur-seq-stagger |
| pricing-products-enterprise | `--ds-ent-logos-above` | `24px` | --ent-logos-above |
| pricing-products-enterprise | `--ds-ent-logos-above-md` | `16px` | from 768 (40 less the ring's 24px edge) |
| use-cases-resources-templates | `--ds-story-len-1` | `0.02` | --story-len-1 |
| use-cases-resources-templates | `--ds-story-len-2` | `0.98` | --story-len-2 |
| use-cases-resources-templates | `--ds-story-len-3` | `1.15` | --story-len-3 |
| use-cases-resources-templates | `--ds-story-len-4` | `0.98` | --story-len-4 |
| use-cases-resources-templates | `--ds-story-len-5` | `0.89` | --story-len-5 |
| use-cases-resources-templates | `--ds-story-tail` | `0.3` | --story-tail |
| use-cases-resources-templates | `--ds-story-frame-w` | `1512` | --story-frame-w |
| use-cases-resources-templates | `--ds-story-frame-h` | `982` | --story-frame-h |
| use-cases-resources-templates | `--ds-story-frame-content` | `1280` | --story-frame-content |
| use-cases-resources-templates | `--ds-story-text-rise` | `152px` | --story-text-rise |
| use-cases-resources-templates | `--ds-story-exit-rate` | `0.81` | --story-exit-rate |
| use-cases-resources-templates | `--ds-story-text-rate` | `1` | --story-text-rate |
| use-cases-resources-templates | `--ds-story-follow` | `0` | --story-follow |
| use-cases-resources-templates | `--ds-story-settle` | `0` | --story-settle |
| use-cases-resources-templates | `--ds-story-text-w` | `41.6%` | --story-text-w |
| use-cases-resources-templates | `--ds-story-search-w` | `560px` | site .search width: calc(var(--space-480) + var(--space-80)) |
| use-cases-resources-templates | `--ds-story-profile-w` | `400px` | site still profile: calc(var(--space-320) + var(--space-80)) |
| use-cases-resources-templates | `--ds-wheel-ease` | `cubic-bezier(0.85, 0, 0.15, 1)` | --ease-skills |
| use-cases-resources-templates | `--ds-wheel-every` | `2400ms` | --dur-skills-step |
| use-cases-resources-templates | `--ds-wheel-move` | `600ms` | --dur-skills-move |
| use-cases-resources-templates | `--ds-wheel-fade` | `500ms` | --dur-skills-fade |
| use-cases-resources-templates | `--ds-wheel-stagger` | `50ms` | --dur-skills-stagger |
| use-cases-resources-templates | `--ds-wheel-fade-lead` | `100ms` | --dur-skills-fade-lead |
| use-cases-resources-templates | `--ds-wheel-crossfade` | `360ms` | --dur-skills-crossfade |
| use-cases-resources-templates | `--ds-wheel-light-spring` | `720ms` | --dur-light-spring |
| use-cases-resources-templates | `--ds-wheel-step` | `52px` | --skills-step |
| use-cases-resources-templates | `--ds-wheel-pill-w` | `312px` | --skills-pill-w |
| use-cases-resources-templates | `--ds-wheel-send` | `36px` | --skills-send |
| use-cases-resources-templates | `--ds-wheel-rx` | `152px` | --ring-rx |
| use-cases-resources-templates | `--ds-wheel-rx-md` | `300px` |  |
| use-cases-resources-templates | `--ds-wheel-rx-lg` | `384px` |  |
| use-cases-resources-templates | `--ds-wheel-rx-xl` | `440px` |  |
| use-cases-resources-templates | `--ds-wheel-ry` | `216px` | --ring-ry |
| use-cases-resources-templates | `--ds-wheel-ry-phone` | `140px` |  |
| use-cases-resources-templates | `--ds-wheel-ry-md` | `240px` |  |
| use-cases-resources-templates | `--ds-wheel-ry-lg` | `292px` |  |
| use-cases-resources-templates | `--ds-wheel-ry-xl` | `332px` |  |
| use-cases-resources-templates | `--ds-wheel-card-w` | `48px` | --ring-card-w |
| use-cases-resources-templates | `--ds-wheel-card-w-md` | `80px` |  |
| use-cases-resources-templates | `--ds-wheel-card-w-lg` | `96px` |  |
| use-cases-resources-templates | `--ds-wheel-card-w-xl` | `108px` |  |
| use-cases-resources-templates | `--ds-wheel-card-h` | `64px` | --ring-card-h |
| use-cases-resources-templates | `--ds-wheel-card-h-md` | `108px` |  |
| use-cases-resources-templates | `--ds-wheel-card-h-lg` | `128px` |  |
| use-cases-resources-templates | `--ds-wheel-card-h-xl` | `144px` |  |
| use-cases-resources-templates | `--ds-wheel-slots` | `3` | --ring-slots |
| use-cases-resources-templates | `--ds-wheel-slots-md` | `4` |  |
| use-cases-resources-templates | `--ds-wheel-slots-lg` | `5` |  |
| use-cases-resources-templates | `--ds-wheel-head-w` | `240px` | --ring-head-w |
| use-cases-resources-templates | `--ds-wheel-head-w-md` | `384px` |  |
| use-cases-resources-templates | `--ds-wheel-head-w-lg` | `400px` |  |
| use-cases-resources-templates | `--ds-wheel-head-w-xl` | `480px` |  |
| use-cases-resources-templates | `--ds-wheel-below` | `96px` | --ring-below |
| use-cases-resources-templates | `--ds-wheel-clear` | `16px` | --ring-clear |
| use-cases-resources-templates | `--ds-wheel-perspective` | `1600px` | --ring-perspective |
| use-cases-resources-templates | `--ds-wheel-turn` | `32deg` | --ring-turn |
| use-cases-resources-templates | `--ds-wheel-depth` | `120px` | --ring-depth |
| use-cases-resources-templates | `--ds-wheel-pop-scale` | `0.4` | --ring-pop-scale |
| use-cases-resources-templates | `--ds-wheel-exit-z` | `-2400px` | --ring-exit-z |
| use-cases-resources-templates | `--ds-wheel-exit-turn` | `96deg` | --ring-exit-turn |
| use-cases-resources-templates | `--ds-uc-chat-w` | `448px` | --chat-w |
| use-cases-resources-templates | `--ds-uc-chat-w-l` | `528px` | --chat-w-l |
| use-cases-resources-templates | `--ds-uc-chat-thumb` | `36px` | --chat-thumb |
| use-cases-resources-templates | `--ds-uc-chat-strip-h` | `80px` | --chat-strip-h |
| use-cases-resources-templates | `--ds-uc-chat-thread-fade` | `24px` | --chat-thread-fade |
| use-cases-resources-templates | `--ds-uc-ascii-opacity` | `0.5` | --features-ascii-opacity |
| use-cases-resources-templates | `--ds-uc-ascii-clear-w` | `46%` | --features-ascii-clear-w |
| use-cases-resources-templates | `--ds-uc-ascii-clear-h` | `50%` | --features-ascii-clear-h |
| use-cases-resources-templates | `--ds-uc-loop-change` | `700ms` | --dur-loop-change |
| use-cases-resources-templates | `--ds-uc-loop-badge` | `500ms` | --dur-loop-badge |
| use-cases-resources-templates | `--ds-templates-design-w` | `500` | --templates-design-w |
| use-cases-resources-templates | `--ds-templates-design-w-md` | `1960` |  |
| use-cases-resources-templates | `--ds-templates-design-h` | `1084` | --templates-design-h |
| use-cases-resources-templates | `--ds-templates-design-h-md` | `982` |  |
| use-cases-resources-templates | `--ds-templates-count` | `74` | --templates-count |
| use-cases-resources-templates | `--ds-templates-count-md` | `128` |  |
| use-cases-resources-templates | `--ds-templates-near` | `832px` | --templates-near |
| use-cases-resources-templates | `--ds-templates-near-md` | `132px` |  |
| use-cases-resources-templates | `--ds-templates-tile-w` | `176px` | --templates-tile-w |
| use-cases-resources-templates | `--ds-templates-tile-h` | `220px` | --templates-tile-h |
| use-cases-resources-templates | `--ds-templates-tile-gap` | `20px` | --templates-tile-gap |
| use-cases-resources-templates | `--ds-templates-per-turn` | `18.5` | --templates-per-turn |
| use-cases-resources-templates | `--ds-templates-perspective` | `520px` | --templates-perspective |
| use-cases-resources-templates | `--ds-templates-drift` | `24px` | --templates-drift |
| use-cases-resources-templates | `--ds-templates-turn` | `1.5` | --templates-turn |
| use-cases-resources-templates | `--ds-templates-near-dim` | `0.6` | --templates-near-dim |
| use-cases-resources-templates | `--ds-templates-bright-from` | `560px` | --templates-bright-from |
| use-cases-resources-templates | `--ds-templates-bright-until` | `880px` | --templates-bright-until |
| use-cases-resources-templates | `--ds-templates-clear` | `32px` | --templates-clear |
| use-cases-resources-templates | `--ds-templates-edge` | `16px` | --templates-edge |
| use-cases-resources-templates | `--ds-templates-appear` | `600ms` | --dur-templates-appear |
| use-cases-resources-templates | `--ds-templates-appear-scale` | `0.92` | --templates-appear-scale |
| use-cases-resources-templates | `--ds-templates-gather` | `1000ms` | --dur-templates-gather |
| use-cases-resources-templates | `--ds-templates-chip-opacity` | `0.72` | --templates-chip-opacity |
| use-cases-resources-templates | `--ds-templates-name-step` | `2400ms` | --dur-skills-step |
| use-cases-resources-templates | `--ds-templates-name-move` | `600ms` | --dur-skills-move |
| use-cases-resources-templates | `--ds-easing-templates-name` | `cubic-bezier(0.85, 0, 0.15, 1)` | --ease-skills |
