---
name: creative-grid
title: Creative grid
type: registry:ui
group: site
description: "Creatives in a grid, every cell the same shape: the post's three by three of squares 8px apart with a light tile among them, or the ad's three up in 3/4."
use_for: "A board, the results of a search, or the proof under a hero: many creatives at once, read as a set."
never:
  - "Cells of different sizes in one grid: use the creative row or the ring"
  - "More than one light tile in nine"
  - "A grid on a card"
source: "Figma page 8: Post, Any brand or creator (200x200 creatives 8px apart, a Light tile in the middle); Ad, The only creative search engine (three creatives 296x400, 32px apart)"
files:
  - react/components/site/CreativeGrid.tsx
examples:
  - "Tiles | Three by three with a light tile | center"
  - "ThreeUp | Three up"
---
`items` takes the creative card's fields; `light: true` makes a cell a tile of the brand light (`seed` picks it).

Each picture is an image slot (`src`, `alt`, `fit`, `position`); without `src` it keeps its placeholder, which carries
`data-ds-placeholder`.
