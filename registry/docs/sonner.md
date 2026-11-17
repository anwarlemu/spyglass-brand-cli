---
name: sonner
title: Sonner
type: registry:ui
group: ui
description: "The corner where notes from toast() show: the newest in front, two more peeking out above. Pointing at the stack spreads it out and holds their time. A note rises in from below and leaves faster."
use_for: "Saying something just happened, for a moment: saved to a board, a brand added, a link copied. Mount one Toaster per app and call toast(title, { description, action }) from anywhere."
never:
  - "Errors that need an answer: keep them where they happened"
  - "What the page already shows"
  - "Notes that leave while someone is reading them: the time holds while the stack is pointed at"
source: "Derived from the brand guidelines (no toast in the brand assets): the Toast note, stacked in the corner of Black"
files:
  - react/components/ui/Sonner.tsx
  - lib/sonner.ts
examples:
  - "Board | Save to a board"
---
