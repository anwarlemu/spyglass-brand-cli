---
name: playground-hero
title: Playground hero
type: registry:block
group: blocks
description: "The home hero: the headline, the lead, the connect menu beside the quiet button, a prompt card typing example questions with the clients it works in, the note, and a 16/9 frame playing the MCP session with the light band crossing behind it."
use_for: "The top of a home page for a product agents use: one line, the two ways to start and the product answering below."
never:
  - "Other products' marks in the clients row without permission: the defaults are plain names with a code glyph"
  - "More than one White button in view"
  - "The band or the typing moving with reduced motion"
source: "Site v3/V3Playground in its hero form (V3Playground.tsx and .module.css, HeroPrompt.tsx and .module.css, content/home heroBrief, content/v3/hero-ask): the head 800px wide, at least one screen tall, 120px above and 128px plus the light's lift under; the prompt 800px with a 20px corner, typing at the hero reference's rhythm and holding 2.5s; the frame 1152px at 16/9 with a 20px corner; the hero-band light scaled to the width, tilted 4deg, lowered 160px, sliding over 22s and bobbing over 14s on the drift ease. The site's index sphere and recorded hero video are preview tooling and are left out: the frame plays the MCP session instead"
files:
  - react/components/blocks/PlaygroundHero.tsx
  - lib/home/hero.ts
examples:
  - "Hero | Acme questions | bleed"
---
