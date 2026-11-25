---
name: testimonial
title: Testimonial
type: registry:ui
group: site
description: "The testimonial ad: a 4/5 headshot in the brand corner, the quote in Funnel Display in curly quotes, the name in DM Sans and the role and company in capitals."
use_for: "One customer's words on a page or in an ad, with their real name, role and photo. Stacked as the ad sets it, or side by side on a wide page."
never:
  - "A made-up quote presented as a real customer's"
  - "Stars, logos or a card around it"
  - "More than one testimonial in view at once"
source: "Figma page 8: Ad, Testimonial (Headshot 464x580 at 64,160; the quote 920 wide at 812; the name at 1010; the role in capitals at 1050)"
files:
  - react/components/site/Testimonial.tsx
examples:
  - "Stacked | Stacked"
  - "Side | Side by side"
---
The examples are Acme placeholders: put a real customer's quote, name, `position` and headshot (`image`) in their place.
`image={false}` (React) or `image="false"` leaves the headshot out.

`image` takes a src or an image slot (`src`, `alt`, `fit`, `position`); the placeholder headshot carries
`data-ds-placeholder`.
