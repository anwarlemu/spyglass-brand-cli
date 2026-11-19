---
name: logo-strip-block
title: Logo strip block
type: registry:block
group: blocks
description: "A row of customer names under a label in capitals, each set as a Funnel Display wordmark in the muted gray, so no third-party logo is drawn; their own marks go in the slot when you have permission."
use_for: "Showing who uses the product, on a home or pricing page, with names you are allowed to show."
never:
  - "Third-party logos without permission, or recolored marks"
  - "Names of customers who have not agreed to be named"
  - "Motion or color on hover"
source: "Derived from the guidelines (Funnel Display, neutrals for muted text, labels in capitals with 6% tracking); no customer logos are in the brand assets, so the names are Acme placeholders"
files:
  - react/components/blocks/LogoStripBlock.tsx
examples:
  - "Names | Acme placeholders under a label"
---
