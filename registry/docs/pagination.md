---
name: pagination
title: Pagination
type: registry:ui
group: ui
description: "Previous and Next around the page numbers: 32px ghost buttons that fill under the pointer, the current page in a #363636 hairline box in White. First and last always show, an ellipsis stands for the rest."
use_for: "Pages of a long list people come back to by place: a board's results, an archive of ads."
never:
  - "A filled White current page: one primary per view, and this is not it"
  - "Infinite scroll for a list people need to come back to"
  - "Pages for a short list that fits on one screen"
source: "Derived from the brand guidelines (no pagination in the brand assets): the ghost button, the neutral steps for the hairline and muted numbers"
files:
  - react/components/ui/Pagination.tsx
examples:
  - "Results | Pages | center"
---
