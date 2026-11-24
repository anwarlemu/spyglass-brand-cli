---
name: side-drifts
title: Side drifts
type: registry:ui
group: visuals
description: "ASCII drifts at a wide section's sides: from 1440 wide a column crop fades in from the left edge and a mass crop from the right, each 40% of the section's height and as wide as the margin beside the content."
use_for: "Full-width sections on wide screens, where the content column leaves empty margins; inside a positioned section, behind the content."
never:
  - "Inside a card or a narrow column"
  - "Over the content: they live in the margins"
source: "Site ui/SideDrifts (SideDrifts.module.css): hidden below 1440; width calc((100vw - --content-max) / 2 - 16px), height 40%, top 8%, 30% or 52%"
files:
  - react/components/visuals/SideDrifts.tsx
examples:
  - "Section | A wide section | bleed"
---
