---
name: tabs
title: Tabs
type: registry:ui
group: ui
description: "Views of one thing, one at a time. The default is a segmented control: a #262626 track, the current view a White block with a Black label. Line tabs sit over a hairline with a 2px White line under the current one."
use_for: "Two to six views of the same thing: kinds of creative in a search, a board's sections. Arrow keys move between tabs; the panel follows."
never:
  - "Actions: use Button"
  - "More than six views: use a Select or a menu"
  - "Bold or a color on the current tab: the White block or the White line marks it"
  - "A sliding or bouncing indicator"
source: "Derived from the brand guidelines (no tabs in the brand assets): the primary button's White fill and Black label for the current view, the plan card's fill for the track, the neutral steps for the hairline"
files:
  - react/components/ui/Tabs.tsx
examples:
  - "Segmented | Segmented control | center"
  - "Line | Line tabs | center"
---
