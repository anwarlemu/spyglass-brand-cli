---
name: scroll-area
title: Scroll Area
type: registry:ui
group: ui
description: "A region that scrolls on its own with thin scrollbars: a #363636 thumb on a clear track. Native scrolling, so wheel, touch and keyboard all work; overscroll stays inside. An edge with more past it fades (fade-y, fade-x) instead of cutting rows off."
use_for: "A long list in a short box (boards in a side panel) or a row of creatives that scrolls across. Give it a label so a keyboard can reach it."
never:
  - "Custom drawn scrollbars that break native scrolling"
  - "A scroll box a keyboard can't reach: give it a label"
  - "Hiding the scrollbar on content people need to find"
  - "A scroll box inside a scroll box going the same way"
source: "Derived from the brand guidelines (no scrolling region in the brand assets): the base layer's thin scrollbar in the neutral steps"
files:
  - react/components/ui/ScrollArea.tsx
examples:
  - "Lists | Down and across | center"
---
