---
name: popover
title: Popover
type: registry:ui
group: ui
description: "A panel for any content, opened from a button: the card's #171717 fill on Black, a hairline and the brand corner. It grows from its trigger and flips to the side with room."
use_for: "A short form or a few settings beside the button that opens them: save to a board, a filter with two fields. Focus moves into it; Escape closes it and returns focus."
never:
  - "A list of actions: use Dropdown Menu"
  - "Content someone must read to go on: put it on the page"
  - "A shadow or a glow: the fill and the hairline set it apart"
source: "Derived from the brand guidelines (no popover in the brand assets): the plan card's #171717 fill and corner, the neutral steps for the hairline"
files:
  - react/components/ui/Popover.tsx
  - react/components/ui/PopoverPanel.tsx
  - react/hooks/usePopover.ts
examples:
  - "Board | Save to a board | center"
---
