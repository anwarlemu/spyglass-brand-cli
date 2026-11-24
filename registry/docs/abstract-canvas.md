---
name: abstract-canvas
title: Abstract canvas
type: registry:ui
group: visuals
description: "An ASCII drawing in a 14:13 panel on the raised surface: archive rows of a brand's records packing toward the foot, a field of characters resolving into tags, or a brand graph linking clusters of records. It loops while on screen; settled with reduced motion."
use_for: "The illustration beside a reason on a features or why page: remembering, pre-analysis, one graph."
never:
  - "Real brands' names or records: pass Acme's or your own"
  - "As a chart people read for numbers: it is an illustration"
  - "Moving with reduced motion"
source: "Site abstract/Abstract (ArchiveRows, TagField, BrandGraph), archive.ts, tags.ts, graph.ts, useAbstractCanvas.ts and Abstract.module.css (14:13, --radius-m, --surface); timings --dur-abstract-*, the loop and proof steps; the graph and tags curves from v2/motion"
files:
  - react/components/visuals/AbstractCanvas.tsx
  - lib/effects/abstract.ts
  - lib/effects/abstract-kinds.ts
  - lib/effects/abstract-archive.ts
  - lib/effects/abstract-tags.ts
  - lib/effects/abstract-graph.ts
  - lib/effects/abstract-motion.ts
examples:
  - "Panels | The three drawings"
---
