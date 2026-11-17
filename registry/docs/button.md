---
name: button
title: Button
type: registry:ui
group: ui
description: "The brand's button: a White fill with a Black DM Sans Medium label for the one main action, a #262626 secondary for the rest, and a ghost for tools in rows. Three sizes and a square icon button."
use_for: "Any action: search, start a plan, explore the product, save. One primary button per view or asset; the rest secondary or ghost. 40px tall by default (56px on the 1080 canvas)."
never:
  - "Two primary buttons in one view"
  - "A spectrum color as a button fill"
  - "A faded button for \"not yet\": disabled is a #1A1A1A fill with a #4D4D4D label"
  - "An icon that moves on hover, or a size change on hover"
source: "Brand assets (Figma page 8): Button, Get 50% off (258x56, radius 10, White fill, Black DM Sans Medium 20px label); Button, Search (136x56); Button, Start Creator for 50% off (504x56)"
files:
  - react/components/ui/Button.tsx
examples:
  - "Variants | Variants | center"
  - "Sizes | Sizes | center"
  - "States | States and links | center"
---
