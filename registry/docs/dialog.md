---
name: dialog
title: Dialog
type: registry:ui
group: ui
description: "A modal window on the #262626 overlay surface over a Black scrim: a Funnel Display title, a line under it, a ghost close button, a short form or an offer, and buttons at the foot."
use_for: "A short task that needs the whole attention for a moment: naming a new board, an offer, a setting with a few fields. Escape, the close button and the scrim close it."
never:
  - "A long flow or a whole page in a window"
  - "Two primary buttons in the foot"
  - "A shadow or a glow around the window"
  - "Opening one with the page"
source: "Derived from the guidelines: the #262626 card fill on Black, neutral hairlines, the 10px canvas corner (8px here), Funnel Display titles, DM Sans text, the White primary button; the offer copy from the plan card. shadcn's dialog for anatomy, focus and keys."
files:
  - react/components/ui/Dialog.tsx
examples:
  - "NewBoard | A short form | center"
  - "Plan | Buttons at the foot | center"
---
