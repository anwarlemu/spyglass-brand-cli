---
name: aspect-ratio
title: Aspect ratio
type: registry:ui
group: ui
description: "A box that keeps its shape as it grows: a 1:1 post, a 4:5 ad, a 16:9 slide. It draws nothing itself; the brand corner and a #171717 ground are classes on it."
use_for: "Creatives in a grid, previews of posts and ads, a video or a slide that must not reflow while it loads."
never:
  - "Stretching or cropping a logo to fit the box"
  - "Grading or filtering the creative inside: show it as posted"
source: "Derived from the brand assets' canvases (posts 1080x1080, ads 1080x1350, decks 1920x1080). shadcn's aspect ratio for anatomy."
files:
  - react/components/ui/AspectRatio.tsx
examples:
  - "Formats | The brand's canvases | center"
---
