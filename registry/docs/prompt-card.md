---
name: prompt-card
title: Prompt card
type: registry:ui
group: product
description: "The site's prompt: a two-line field and a square White send button in a #1A1A1A card with the 20px corner and a #666666 ring, with an optional row naming where it works."
use_for: "Asking the product a question on a hero or in a product view, where the search bar is too small for a sentence."
never:
  - "Other companies' logos in the row: name the places in words"
  - "A typing animation that keeps running under the pointer or with reduced motion"
  - "A second button inside the card"
source: "Site v3/V3Playground/HeroPrompt (HeroPrompt.module.css): card --raised with --radius-l and an inset --line-strong ring, 12px in; the field 16/24 two lines tall; the send button --control-s square; the row under a --line hairline with a 14/20 --text-3 label"
files:
  - react/components/product/PromptCard.tsx
examples:
  - "Ask | A question and where it works | center"
---
