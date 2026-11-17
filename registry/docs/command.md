---
name: command
title: Command
type: registry:ui
group: ui
description: "A box to type in over a list of actions and places, on the #171717 overlay surface: the field on top over a hairline, groups with a capital label, the menus' rows with an icon and a shortcut. On the page, or in a window opened with Cmd+K."
use_for: "Jumping anywhere and running anything from the keyboard: searches, boards, brands, settings. CommandDialog for the app-wide Cmd+K menu."
never:
  - "Motion on opening or closing: it opens many times a day"
  - "Tab between rows: the field keeps focus and the arrows move"
  - "A spectrum color on the highlighted row"
  - "The only way to an action: keep it in the interface too"
source: "Derived from the guidelines: the #171717 card fill on Black, neutral hairlines, the 10px canvas corner (8px here), DM Sans 14px rows, capital labels at 6%. shadcn's command (cmdk) for anatomy, filtering and keys."
files:
  - react/components/ui/Command.tsx
  - react/components/ui/CommandDialog.tsx
examples:
  - "Menu | On the page | center"
  - "Palette | In a window with Cmd+K | center"
---

Rows are data: `groups` of `{ heading, items: [{ id, label, keywords, shortcut, icon, disabled }] }`. In the web
component, a row's icon is page content with `slot="icon-<id>"`.
