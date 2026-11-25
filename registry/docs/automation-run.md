---
name: automation-run
title: Automation run
type: registry:ui
group: site
description: "The site's automation run: a quote in the section head over a batch of skewed ad cards that rush in along a rising conveyor and keep drifting; a card under the pointer, focus or a tap rises and turns, the cards ahead give way and a note opens with its numbers."
use_for: "Showing a batch of found ads or posts as the enterprise and templates pages do: what an automation delivered, each card opening its facts."
never:
  - "Third-party creatives you may not show: pass your own through `items` (placeholders are neutral gradients)"
  - "A customer quote that is not yours to publish"
  - "Cards that keep moving with reduced motion"
  - "More than about twenty items: the conveyor is sized for a batch"
source: "Site pages/Enterprise (AutomationRun.tsx, AutomationRun.module.css) and content/pages/enterpriseAutomation.ts: --ent-run-* (stage 480, 640 at 768, 800 at 1280; cards 32% then 16% of the width, 14.8deg skew; lift 112, 140, 180px with a 12deg turn on a 400ms spring; drift 15px/s; note 288px, 80ms intent); the note's fade 160ms (site 150ms)"
files:
  - react/components/site/AutomationRun.tsx
  - lib/automation-run.ts
examples:
  - "Run | Monday's batch | bleed"
---
`items` takes each ad or post: `brand`, `title`, `alt`, `src` (a still, or the poster of `video`), `video` (a short muted
loop, played only while the run is on screen and the tab visible; with reduced motion it rests on its poster), `tone` (the placeholder's gradient), `facts`, `start` and `end` (YYYY-MM-DD), `post` (`channel`, `views`), `source`
and `media`. The note counts days to `content.reportDay`. The engine (`lib/automation-run.ts`) writes transforms straight
to the cards, runs only while the run is on screen, and holds the batch at rest with reduced motion.

Each item's picture takes `src`, `fit` and `position` (its `alt` is read with the facts); a card or thumb without one
carries `data-ds-placeholder`.
