---
name: proof-block
title: Proof block
type: registry:ui
group: site
description: "The site's proof section: a White lead line centered over the proof marquee of marks, 40px apart, with the section's padding under it; it follows a hero or a page head."
use_for: "Under a hero or a page head, to show who uses the product, with marks you are allowed to show."
never:
  - "Third-party logos without permission: the default marks are Acme wordmarks"
  - "A section head in place of the lead line"
source: "Site v3/V3Proof (V3Proof.tsx, V3Proof.module.css): .section with no top padding, a 40px gap, .t-lead at the regular weight in --text, the ProofStrip under it"
files:
  - react/components/site/ProofBlock.tsx
examples:
  - "Default | Acme placeholders | center"
---
