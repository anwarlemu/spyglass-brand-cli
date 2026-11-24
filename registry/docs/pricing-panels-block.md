---
name: pricing-panels-block
title: Pricing panels block
type: registry:block
group: blocks
description: "The home's pricing strip: the headline in two lines, the terms, the White button and the quiet one, and from 1024 a run of five creatives turned away in perspective whose sets take turns, one creative after another settling in."
use_for: "The pricing moment on a home page: one offer in a line, a way to start and a way to see the plans, with the creatives showing what a credit buys."
never:
  - "More than one White button"
  - "Third-party creatives you may not show: the defaults are Acme placeholders"
  - "The run moving with reduced motion: it holds the first set"
source: "Site v2/V2Pricing (V2Pricing.tsx, Panels.tsx, PanelsMotion.tsx, V2Pricing.module.css): the t-head lines, the t-lead note with whole sentences on phones, the primary and quiet buttons 12px apart; the stage from 1024 (360px tall, 480 at 1280) with the run turned -24deg in 1800px perspective (2400 at 1280), cards 144x240 (192x320) stepping 156px back (208) and 8px up; sets every 3800ms, each creative 900ms in from 85% on the settle curve, 540ms out, 180ms apart in the order 2, 0, 4, 1, 3; the mass ASCII drift from the right"
files:
  - react/components/blocks/PricingPanelsBlock.tsx
  - lib/panels-motion.ts
  - lib/home/pricing.ts
examples:
  - "Strip | Acme placeholders | bleed"
---
