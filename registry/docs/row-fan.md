---
name: row-fan
title: Row fan
type: registry:block
group: site
description: "Big names, each a link, whose pictures fan out in perspective beside the name (from 1024) or below it when it is pointed at, focused, tapped or scrolled to the middle, travelling from row to row on a soft spring; a card opens with its title and meta."
use_for: "A list of a few templates, products or use cases, each with a handful of example pictures, as the templates page sets its rows."
never:
  - "More than a few rows, or long names that wrap"
  - "Pictures of real people or other brands' ads in examples: pass your own"
  - "Travel and scaling with reduced motion: it fades"
source: "Site ui/RowFan and rowFanMotion, set as pages/TemplatesPage/TemplateCities (TemplateCities.module.css, --cities-* tokens): cards 72, 96, 128; names h4, h2, display-s; turns 18, 15, 12 degrees at 640px perspective; the travel curve --ease-cities-travel"
files:
  - react/components/site/RowFan.tsx
  - lib/effects/row-fan.ts
  - lib/effects/row-fan-css.ts
examples:
  - "Templates | The templates rows"
---
Each card is an image slot (`src`, `alt`, `fit`, `position`); a card without `src`, or with a generated blank, carries
`data-ds-placeholder`.
