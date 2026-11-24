---
name: instrument-marks
title: Instrument marks
type: registry:ui
group: visuals
description: "Four hairline corner brackets in the text colour around a target, a few pixels outside its edges, like a viewfinder locking on: the site's instrument mark for the item a figure is reading."
use_for: "Marking the tile, figure or row a diagram is pointing at, in the site's instrument figures."
never:
  - "Around controls or text people read, as a focus or selection state"
  - "In a color: they are the text colour, hairline"
source: "Site instrument/marks (Brackets) and instrument.module.css (.brackets): inset -4px (--b-off), 8px arms (--b-arm), 1px hairline in --text, z 2"
files:
  - react/components/visuals/Brackets.tsx
examples:
  - "Target | Around a target | center"
---
