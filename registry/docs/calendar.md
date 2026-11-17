---
name: calendar
title: Calendar
type: registry:ui
group: ui
description: "A month to pick a day from: 40px day cells with the 4px corner, the picked day a White fill with a Black figure, today in a neutral hairline ring, the months either side faint. Arrows, Home, End and Page Up and Down move; Enter picks."
use_for: "Picking a launch day, a flight start or a report's range on a page with room for the month. In a field, use the date picker."
never:
  - "A spectrum color for the picked day or today"
  - "Animating the change of month: it is pressed many times in a row"
  - "A calendar where a typed date would do (a birthday)"
source: "Derived from the guidelines: White on Black for the one choice, neutral hairlines, DM Sans for figures and labels, the 10px canvas corner scaled to the product (4px inside small cells). shadcn's calendar for anatomy, keys and ARIA (a grid with a roving day)."
files:
  - react/components/ui/Calendar.tsx
examples:
  - "Single | A launch day | center"
  - "Window | Bounds, Monday start and blocked days | center"
---
