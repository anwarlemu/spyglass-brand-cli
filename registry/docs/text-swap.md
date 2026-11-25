---
name: text-swap
title: Text swap
type: registry:ui
group: visuals
description: "A value that changes in place: the old one rises 12px and fades out while the new one rises in from below, in one clipped grid cell, with an optional muted unit and a small badge. Sentences, its companion, keeps each sentence of a line whole on a phone."
use_for: "A price that follows the billing period, a plan name an estimator picks, a sort label; a hero line that should break between sentences on a phone (Sentences)."
never:
  - "For text people are reading: only short values that change on a choice"
  - "Swapping on a timer: it answers a choice"
  - "Moving with reduced motion: the value changes at once"
source: "Site pages/Pricing/Swap (Pricing.module.css .swap, .swapItem, .swapUnit; the tag in the plan badge's look, .badge: White, Black caption 4px by 8px, the small corner): inline-grid, clip margin 4px, 12px rise over --dur-loop-badge on --ease-loop (480ms, the brand's slow step); ui/Sentences (inline-block sentences below 768)"
files:
  - react/components/ui/TextSwap.tsx
  - react/components/ui/Sentences.tsx
  - lib/text-swap.ts
examples:
  - "Price | A price and its unit | center"
  - "Lines | Sentences"
---
