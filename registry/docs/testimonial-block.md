---
name: testimonial-block
title: Testimonial block
type: registry:block
group: blocks
description: "One customer as a section: an optional label in capitals over the testimonial, the headshot beside the words or above them, on Black or on the #262626 fill."
use_for: "A customer's own words on a home, product or pricing page."
never:
  - "A quote written for a customer, or a real person's name without permission"
  - "Several testimonials in one block"
  - "Stars, ratings or company logos beside the quote"
source: "Built from the library (testimonial); Figma page 8: Ad, Testimonial (the quote, name and role; the Figma's named person and photo are never shipped)"
files:
  - react/components/blocks/TestimonialBlock.tsx
examples:
  - "Side | Headshot beside the words"
  - "Card | Stacked, on the card fill"
---
`image` takes a src or an image slot (`src`, `alt`, `fit`, `position`).
