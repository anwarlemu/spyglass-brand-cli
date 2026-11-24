---
name: scroll-story
title: Scroll story
type: registry:block
group: blocks
description: "The site's scroll story: a story in chapters told while the reader scrolls. From 1024 the stage pins and the pieces (creatives, a board, chips, a page, a thread, a profile, a result card) move on keyframes in a 1512x982 frame scaled to the content width while each chapter's words rise in; below 1024 or with reduced motion the chapters stack over still arrangements."
use_for: "Showing how a use case works, step by step, on a use-case or product page. `story` takes the data (`storyFromShape` in lib/scroll-story.ts builds the site's five-chapter shape from its parts), or `preset` names an Acme story; `actions` are the last chapter's buttons."
never:
  - "Motion with reduced motion: the chapters stack and hold still"
  - "Another brand's ads, logos or channel marks shipped in the data: pass your own `src`, `mark` and logos, or keep the placeholders"
  - "More than one White button: the first action is White, the rest secondary"
  - "Easing or timers on top of the scroll: the scroll position is the clock"
source: "Site story/ScrollStory (ScrollStory.tsx, pieces.tsx, timeline.ts, types.ts, ScrollStory.module.css) and content/pages/useCaseStories (shape.ts and the stories): the --story-* tokens (tokens.css 820-836), pinned at (min-width: 1024px) and (prefers-reduced-motion: no-preference), the frame scaled to min(content / 1280, height / 982), chapter words at 41.6% wide, 24/32/40 Funnel Display 450 headings with the 20/28 lead"
files:
  - react/components/blocks/ScrollStory.tsx
  - lib/scroll-story.ts
  - lib/pages/scroll-stories.ts
examples:
  - "Research | A category's hooks | bleed"
  - "Sentiment | A brand's comments | bleed"
  - "Landing | The pages behind ads | bleed"
  - "Channels | One brand, every channel | bleed"
---
The story data is plain JSON: `chapters` (heading, text, side, mode, when they come in and leave, and the still
arrangement used when stacked) and `pieces` (a kind, a size in frame px and keyframes: `at` in chapters, x, y, scale,
opacity, badge and mark opacity, an ease). `storyFromShape` makes the site's shape from a board, a hero and five ranked
creatives, five chips, a focal piece (board, thread, page or profile), four creatives around it and a result card.
Creatives without `src` draw the neutral placeholder.
