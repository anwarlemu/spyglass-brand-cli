---
name: coming-soon-page
title: Coming soon page
type: registry:block
group: pages
description: "The site's coming soon page, built from library items: the page head with two buttons, the sources coming next as cards (a Black cover with the source's mark over clearing ASCII glyphs, the name, a line and the APIs it feeds as chips), the side drifts from 1440, the smaller cards also on the list, the closing section and the footer."
use_for: "What a product adds next: sources, integrations or features that are planned, each with what it will feed. Edit lib/pages/coming-soon.ts or pass `content`."
never:
  - "Dates you cannot keep: say soon, not a day"
  - "Other companies' marks without their permission: pass your own through `mark`"
  - "Colored marks: they take the faint gray"
source: "Site app/products/coming-soon and pages/ComingSoon (ComingSoon.tsx, ComingSoon.module.css): cards on --surface, 8px in, covers 128, 160 from 768 and 240 for the first two from 1024 with the alpha texture at each card's --ascii-at and the radial clear, names h5 24/28, chips on --surface-inset; the also row four across from 768; PageHead, SideDrifts, PageClose; the platforms and their marks left out (named by kind here)"
files:
  - react/components/pages/ComingSoonPage.tsx
  - lib/pages/coming-soon.ts
examples:
  - "Page | Coming soon page | bleed"
---
A source is `{ name, line, apis: [{ name, href }], mark? }`; `mark` is an image URL (an SVG works best), shown through a
mask in the faint gray. Without one, a neutral rounded square stands in.
