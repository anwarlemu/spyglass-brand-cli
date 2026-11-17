---
name: typography
title: Typography
type: registry:ui
group: ui
description: "The brand's type scale as one part. Funnel Display Regular for titles, DM Sans for text, Medium for small and labels, labels in capitals with 6% tracking, Geist Mono for code. Every variant is a type utility from the tokens."
use_for: "Any text: page and card titles, a lead under a hero, body copy, captions, the capital label over a field or a plan, inline code. Pick the step by role, not by look."
never:
  - "A size, weight or line height outside the scale: every step comes from tokens.css"
  - "Bold or semibold: Funnel Display and DM Sans run at Regular and Medium only"
  - "Capitals anywhere but labels, and labels without the 6% tracking"
  - "Funnel Display for body text, or DM Sans for titles"
  - "Spectrum colors on text: type is White on Black, muted in the neutral steps"
source: "The type pages of the brand guidelines (Funnel Display, DM Sans) and the sizes measured on the 1080 canvas, scaled to the product (tokens.css header); Geist Mono from the ASCII texture"
files:
  - react/components/ui/Text.tsx
examples:
  - "Scale | The scale"
  - "Article | An article"
---
