---
name: item
title: Item
type: registry:ui
group: ui
description: "A row: media, a title in DM Sans Medium with a muted line under it, and actions at the end. No fill, a hairline box or the card's #262626 fill. ItemGroup puts a hairline between rows."
use_for: "A board, a tracked brand, a setting or a notification as one row; a list of them in a card. With href the whole row is a link."
never:
  - "Buttons inside a row that is a link"
  - "A chevron or arrow that moves on hover"
  - "A row of rows for many columns: use Table"
  - "A shadow under an outlined row"
source: "Derived from the brand guidelines (no list row in the brand assets): the plan card's fill and corner, DM Sans Medium for titles, the neutral steps for the hairline and the muted line"
files:
  - react/components/ui/Item.tsx
  - react/components/ui/ItemGroup.tsx
examples:
  - "Variants | Variants | center"
  - "Boards | Rows in a card | center"
---
