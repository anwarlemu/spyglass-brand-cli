---
name: alert-dialog
title: Alert dialog
type: registry:ui
group: ui
description: "A question that needs an answer before anything else, on the #262626 overlay surface over a Black scrim: a Funnel Display title, one line saying what happens, Cancel and the action (red for what removes something)."
use_for: "Confirming what can't be undone: deleting a board, removing a teammate, canceling a plan. Say exactly what goes away."
never:
  - "Confirming what can be undone: do it and offer undo"
  - "A scrim that closes it: only a choice does"
  - "A vague action label (\"OK\", \"Yes\"): name the action (\"Delete board\")"
  - "A shadow around the window"
source: "Derived from the guidelines: the #262626 card fill on Black, neutral hairlines, the 10px canvas corner (8px here), Funnel Display titles, DM Sans lines, the White primary and #262626 secondary buttons. shadcn's alert dialog for anatomy, focus and keys."
files:
  - react/components/ui/AlertDialog.tsx
examples:
  - "Delete | Delete a board | center"
---
