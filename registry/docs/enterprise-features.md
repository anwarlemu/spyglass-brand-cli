---
name: enterprise-features
title: Enterprise features
type: registry:block
group: site
description: "The site's enterprise features: a section head over eight cards, each a looping product sketch over a crop of the ASCII texture with its title and line (data layer, archive, agents, engineers, three teams, a built tool, shared reports, private answers)."
use_for: "What an enterprise plan includes, shown as working sketches rather than icons. One per page, after the proof."
never:
  - "Third-party marks or people's photos you may not show: pass your own through `content` (placeholders are first letters and neutral gradients)"
  - "Sketches that keep moving with reduced motion"
  - "More or fewer than the eight cards: the grid's 2-2-2 / 3-3 rhythm is built for eight"
source: "Site pages/Enterprise (FeatureGrid.tsx, FeatureGrid.module.css, Feature*.tsx, FeatureVisuals.module.css, FeatureAlpha.module.css, featureMotion.ts, reportsScroll.data.ts), v2/V2Features (Demo, timeline) and content/pages/enterpriseFeatures.ts: --ent-feat-* (16px gaps, 24px in, sketches 288px, 320 from 1024; loops on --dur-loop-step 2600ms); hairline rings drawn as outlines, no drop shadow under the cursors"
files:
  - react/components/site/EnterpriseFeatures.tsx
  - lib/enterprise-features.ts
  - lib/enterprise-features-css.ts
  - lib/enterprise-features-html.ts
examples:
  - "Features | Eight cards | bleed"
---
Each sketch is markup built once in `lib/enterprise-features-html.ts` (both flavors render the same tree) and played by
`runFeature` in `lib/enterprise-features.ts`: infinite Web Animations from a time of its own, only while a quarter of the
card is on screen and the tab visible. `content` carries every card's copy and data; pictures take `src` (else `tone`),
marks take `mark` (an image drawn White through a mask, else the name's first letter).
