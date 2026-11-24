---
name: button
title: Button
type: registry:ui
group: ui
description: "The site's button: a White fill with a Black DM Sans Medium label for the one main action, the quiet secondary (#1A1A1A in a #363636 ring) for the rest, and a ghost for tools in rows; a White glow follows a mouse inside it. Three sizes and a square icon button."
use_for: "Any action: search, start a plan, explore the product, save. One primary button per view or asset; the rest secondary or ghost. 40px tall by default, 56px large (and 56px on the 1080 canvas)."
never:
  - "Two primary buttons in one view"
  - "A spectrum color as a button fill"
  - "A faded button for \"not yet\": disabled is a #1A1A1A fill with a #666666 label"
  - "A press that scales the button: the site's buttons hold still"
  - "An icon that moves on hover, or a size change on hover"
source: "Site globals.css .btn and controls.css (40px, 8px corner, quiet ring, glow); brand assets (Figma page 8): Button, Get 50% off (258x56, radius 10, White fill, Black DM Sans Medium 20px label); Button, Search (136x56); Button, Start Creator for 50% off (504x56)"
files:
  - react/components/ui/Button.tsx
  - lib/glow.ts
examples:
  - "Variants | Variants | center"
  - "Sizes | Sizes | center"
  - "States | States and links | center"
---
