---
name: menubar
title: Menubar
type: registry:ui
group: ui
description: "Menu triggers in a row: a Black strip in a hairline with the brand corner, triggers in DM Sans Medium, each opening a panel of rows in the card's #171717 fill. Arrow keys move along the bar and through the rows."
use_for: "A tool's commands grouped under a few words, as in an editor: a board's actions, its view, its sharing. Three to five menus."
never:
  - "Site or app navigation: use the Sidebar or Navigation Menu"
  - "One menu alone: use Dropdown Menu"
  - "A spectrum color for the open trigger: it takes the #262626 fill"
source: "Derived from the brand guidelines (no menubar in the brand assets): Black ground, the neutral steps for fills and hairlines, DM Sans Medium for triggers, the plan card's #171717 fill for panels"
files:
  - react/components/ui/Menubar.tsx
  - react/components/ui/MenubarMenu.tsx
  - react/components/ui/MenubarItem.tsx
  - react/components/ui/MenubarLabel.tsx
  - react/components/ui/MenubarSeparator.tsx
examples:
  - "Board | A board's tools"
---
