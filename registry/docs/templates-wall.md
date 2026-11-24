---
name: templates-wall
title: Templates wall
type: registry:block
group: blocks
description: "The site's templates wall: a helix of tiles drifting toward the viewer and turning slowly around the words, the headline over a chip that rolls through the template names on a raised surface stretching to each name, the lead and a quiet status line."
use_for: "Introducing a set of templates or playbooks: the templates page's first section (`hero`) or a section on the home page. `pictures` fills the tiles with your own creatives; without them the tiles take four neutral tones."
never:
  - "Another brand's ads or photos in the tiles: pass your own creatives or keep the neutral tones"
  - "A filter, a tint or a glow over the pictures: color as posted"
  - "More than one rolling chip in a view"
  - "Tiles that keep moving with reduced motion: it holds one still frame"
source: "Site v2/V2Templates (V2Templates, TemplatesWall, TemplatesBoot, templatesMotion.ts, field.ts, V2Templates.module.css) and tokens.css 355-357, 395-414, 605-608: 80 tiles, 74 in the tunnel on phones and 128 from 768, 176x220 at 4px radius, 18.5 a turn, drifting 24px and turning 1.5 degrees a second, fading in over 600ms from 0.92; the head at the section size, the chip padded 12px (16px from 768) on the 72% raised surface, a name every 2400ms rolling 600ms on cubic-bezier(0.85, 0, 0.15, 1); the lead 24/32 medium, the status 14/20; the hero fills the window under the header"
files:
  - react/components/blocks/TemplatesWall.tsx
  - lib/templates-wall.ts
  - lib/pages/templates.ts
examples:
  - "Section | Home page section | bleed"
  - "Hero | Templates page hero, held still | bleed"
---
The tiles keep clear of the words: the engine measures the headline, the chip, the lead and the status and fades any
tile whose edge comes within 32px of them, and lets none reach the section's top or bottom edge. It runs only while
the wall is on screen and the tab is visible. `at` draws the frame at a given time and holds it, for a still.
