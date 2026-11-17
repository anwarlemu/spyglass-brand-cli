---
name: select
title: Select
type: registry:ui
group: ui
description: "One choice from a short list, drawn as the field is: a Black field, a hairline that turns White while open, a chevron. The list opens in the card's #171717 panel, the chosen row checked."
use_for: "Picking one of a few known values in a form or a filter: a platform, an order, a plan. Label it as any field."
never:
  - "A list that needs a filter: use Combobox"
  - "Options that do something at once: use Dropdown Menu"
  - "A colored or glowing focus ring: the hairline turns White"
source: "Derived from the brand guidelines (no select in the brand assets): the Input's Black field and hairline, the plan card's #171717 fill for the list"
files:
  - react/components/ui/Select.tsx
examples:
  - "Filters | Two filters"
---
