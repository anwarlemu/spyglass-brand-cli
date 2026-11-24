---
name: plan-card
title: Plan card
type: registry:ui
group: site
description: "The Creator plan card from the ad: the plan's name in Funnel Display, the price as a sentence with concrete numbers, the lines it includes and one full-width White button, on the #262626 fill with the brand corner."
use_for: "A plan on a pricing page or under an offer headline. One plan card per plan, the button saying what it starts."
never:
  - "A border, a shadow or a glow"
  - "A colored or second button in the card"
  - "Check marks or icons before the lines: the ad sets them as plain lines"
  - "A price without numbers (\"Affordable\")"
source: "Figma page 8: Ad, Creator plan offer: Card, Creator plan (600x452, #262626, radius 10, 48px in; Creator at 48, the price at 112, the lines from 184, 24px apart; Button, Start Creator for 50% off 504x56 at 348)"
files:
  - react/components/site/PlanCard.tsx
examples:
  - "Creator | Creator plan | center"
---
The copy in the example is the ad's own. `onSelect` (React) and the `select` event (web component) fire when the button
is pressed; `href` makes the button a link.
