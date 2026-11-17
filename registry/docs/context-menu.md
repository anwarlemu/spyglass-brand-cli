---
name: context-menu
title: Context menu
type: registry:ui
group: ui
description: "The dropdown menu's rows on the #171717 overlay panel, opened where the pointer right-clicks, or under the focused row with Shift+F10 or the menu key. Arrows, Home, End and Escape are handled; focus returns to what was clicked."
use_for: "Shortcuts for a row in a dense list (open, copy a link, save, remove), alongside a visible way to do the same."
never:
  - "The only way to an action: right-clicks are hidden; keep a dropdown menu or a button in the row"
  - "Destructive actions that don't confirm: confirm with an alert dialog"
  - "A shadow under the panel"
source: "Derived from the guidelines: the #171717 card fill on Black, neutral hairlines, the 10px canvas corner (8px here). shadcn's context menu for anatomy and keys."
files:
  - react/components/ui/ContextMenu.tsx
  - react/components/ui/PopoverPanel.tsx
examples:
  - "Board | A board's saved creatives"
---

Put `data-context="<id>"` on each row; `onOpen` (React) or the `open` event (web component) gets the id of the row
that was clicked, so one menu serves the list. `PopoverPanel` is the floating panel every overlay here draws (the
context menu, the combobox, the date picker): portalled, placed beside its anchor or the pointer, flipped to the side
with room.
