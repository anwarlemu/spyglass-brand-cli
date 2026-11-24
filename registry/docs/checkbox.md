---
name: checkbox
title: Checkbox
type: registry:ui
group: ui
description: "A yes or no that is part of a form: a 16px box in a #666666 hairline on Black that fills White with a Black check, a bar for a group partly on, and a DM Sans label beside it. Form-associated."
use_for: "Filters a person combines, consent in a form, picking rows. A setting that takes effect at once is a switch."
never:
  - "A spectrum color for the checked box"
  - "A checkbox that acts at once without a form or an apply step"
  - "Faded labels for disabled: they go to the faint neutral"
source: "Derived from the guidelines: White on Black for what is on, neutral hairlines, the 4px small corner, DM Sans labels. shadcn's checkbox for anatomy and the indeterminate state."
files:
  - react/components/ui/Checkbox.tsx
examples:
  - "States | States | center"
  - "Group | A filter group | center"
---
