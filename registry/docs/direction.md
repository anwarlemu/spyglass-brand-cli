---
name: direction
title: Direction
type: registry:ui
group: ui
description: "Sets the reading direction for what is inside it, so logical spacing and the components follow right-to-left text. Code stays left to right."
use_for: "An interface in Arabic or Hebrew, or one block of right-to-left text inside a left-to-right page."
never:
  - "Mirroring the logo or the brand light"
  - "Flipping code, IDs or numbers"
source: "shadcn's direction provider; nothing visual of its own."
files:
  - react/components/ui/Direction.tsx
examples:
  - "Rtl | Left to right and right to left | center"
---
