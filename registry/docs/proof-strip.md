---
name: proof-strip
title: Proof strip
type: registry:ui
group: site
description: "The site's proof marquee: marks in the muted gray moving left at a slow constant speed, fading out at both ends; under a mouse it stops and the mark under the pointer turns White; still with reduced motion."
use_for: "Showing who uses the product under a hero or a sign-in form, with marks you are allowed to show."
never:
  - "Third-party logos without permission: the default marks are Acme wordmarks"
  - "Marks in their own colors: they are drawn in the muted gray"
  - "Marks that move or grow on hover"
source: "Site v3/V3Proof ProofStrip (V3Proof.module.css): three copies of the row moving one copy every 68s, linear; a 14% fade at each end; 32px slots 64px apart (48 on the sign-in page); --text-3 marks turning White on hover; paused on hover; none with reduced motion"
files:
  - react/components/site/ProofStrip.tsx
examples:
  - "Marks | Acme placeholders | center"
---
