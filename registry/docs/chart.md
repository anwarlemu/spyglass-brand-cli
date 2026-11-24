---
name: chart
title: Chart
type: registry:ui
group: ui
description: "How a number is drawn: White bars per day under a total, and lines over time in the brand's series order (White, #A3A3A3, #4D4D4D, then the spectrum from Magenta to Blue). Axes from 0 on #363636 hairlines; pointing reads a value."
use_for: "Searches per day, creatives found per category, spend over a flight. Every chart has a caption; every series is named in the legend."
never:
  - "Series colors out of order, or spectrum colors before the neutrals"
  - "Color alone to tell series apart: the third series is dashed and every series is in the legend"
  - "An axis that starts above 0"
  - "Bars that regrow on every hover: they rise once"
source: "Derived from the guidelines: Black ground, White primary, the neutral spectrum for the first series and the seven spectrum colors in their fixed order after them, DM Sans figures and capital labels at 6%, the #262626 card fill. shadcn's chart for the parts (caption, legend, tooltip)."
files:
  - react/components/ui/BarChart.tsx
  - react/components/ui/LineChart.tsx
  - lib/chart.ts
examples:
  - "Searches | Bars per day | center"
  - "Categories | Six series in order"
---

`lib/chart.ts` holds the series colors (`CHART_COLORS`, ten in order) and the axis helpers both flavors use; draw your
own charts with them so the order stays the brand's.
