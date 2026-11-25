---
name: close-block
title: Close block
type: registry:block
group: blocks
description: "The home's close: a screen-tall section with the headline, the connect menu and the quiet button in its middle, square creatives scattered around them that the light wakes from grey once, lit and leaning toward the pointer under a mouse, with a tag naming the one under it."
use_for: "The last section of a home page: one line and the two ways to start, among the material the product indexes."
never:
  - "Third-party creatives you may not show: the defaults are Acme placeholders"
  - "Creatives over the words: the scatter keeps them clear"
  - "The sweep or the lean with reduced motion: the creatives stay in color and still"
source: "Site v3/V3Close (V3Close.tsx and .module.css, scatter.ts, CloseLight.tsx, CloseTags.tsx; content/v3/close): the seeded scatter (seed 6 wide on an 880 field, 8 on phones on 720), the field's unit the section's height (at least 640px, one screen), the words lifted by width, creatives at rest grayscale 1 and brightness 0.32, the sweep 640px wide at 16deg crossing once over 1400ms on the loop ease, the pointer's 400px reach and 4px lean, the tag 8px off the creative and 16px clear of the words; the menu opening downward; the tag leaving over 120ms; on phones the connect menu hidden and the quiet button White (globals.css [data-mcp-pair])"
files:
  - react/components/blocks/CloseBlock.tsx
  - lib/home/close.ts
examples:
  - "Close | Acme placeholders | bleed"
---
Each picture is an image slot (`src`, `alt`, `fit`, `position`); without `src` it keeps its placeholder, which carries
`data-ds-placeholder`.
