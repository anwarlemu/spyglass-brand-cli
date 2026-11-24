---
name: enterprise-hero
title: Enterprise hero
type: registry:block
group: site
description: "The site's enterprise hero: the headline, lead and two buttons centered in a hero at least the window's height, inside a ring of twelve creatives that rise in, bob while seen, come forward with a tag naming the hook, and step through their set on a press."
use_for: "The head of an enterprise or sales page whose proof is the creatives themselves. One per page."
never:
  - "Third-party creatives you may not show: pass your own through `cards` (placeholders are neutral gradients)"
  - "More than one White button"
  - "Cards that keep moving with reduced motion"
  - "A ring around a long headline: the words keep a 216px room in the middle"
source: "Site pages/Enterprise (EnterprisePage .hero, Enterprise.module.css, HeroRing.tsx, HeroRing.module.css) and content/pages/enterprise.ts: min height max(640px, 100svh less the header); --ent-ring-* (cards 136 to 240px from the room, 128 on phones, 24px edge; forward 1.1 after 80ms; float 8px over 6s; a hint every 6s held 2s); the ASCII tiles from 1024 cleared 464px around the words; the entrance 480ms with a 40ms stagger and no blur (site 1500ms, 24ms, a 16px blur), the hover 320ms (site 300ms), the tag 160ms (site 150ms) and no shadow under a forward card"
files:
  - react/components/site/EnterpriseHero.tsx
  - lib/enterprise-ring.ts
examples:
  - "Hero | Ring of creatives | bleed"
---
`cards` takes up to twelve sets, clockwise from the top left (the two side places show from 1280, the six corner and
middle places on phones). Each card: `brand`, `title`, `ratio` (3:4, 4:5 or 1:1), `hook`, `meta` (the tag's lines) and
`src`; without `src` it is a neutral gradient with the brand. The tag finds room below, above or inside its card, off the
headline and inside the hero.
