---
name: bento-block
title: Bento block
type: registry:block
group: blocks
description: "Features as a bento grid: #262626 cards with the 4px corner, a title and a line, some wide or tall, an optional picture."
use_for: "A features section with a few lead features and smaller ones around them."
never:
  - "More than one picture per card"
  - "Cards in a spectrum color"
source: "Built from the site's feature cards (V2Features: --surface cards, --radius-s, 24px in, h5 titles) on a six-column grid"
files:
  - react/components/blocks/BentoBlock.tsx
examples:
  - "Features | Wide and tall cards | bleed"
---
