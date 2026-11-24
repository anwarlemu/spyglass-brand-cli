---
name: use-case-hero
title: Use case hero
type: registry:ui
group: site
description: "The site's use case hero: the page's name as the head, the line in the soft gray, the actions and who it is for, beside a raised panel edged with the ASCII texture holding a live visual: a chat session answering questions in turn, or a team's own ad library re-sorting itself."
use_for: "The top of a use case page. `visual=\"chat\"` with `chat` (the session's turns: question, tool call, lead, table rows, pictures) or `visual=\"build\"` with `build` (the library's tiles and sorts); `control` puts a connect menu in the White button's place, which on phones steps aside and turns the quiet button White."
never:
  - "Another brand's ads or logos in the pictures: pass your own images, or keep the neutral placeholders"
  - "More than one White button: with a control, the White button is left out"
  - "Motion that keeps running with reduced motion: the chat shows an answer and the library holds still"
  - "Icons moving on hover: the chips change color only"
source: "Site pages/UseCasesPage (UseCaseHero, UseCaseChat and chatClock, BuildHero, their CSS modules) with V2HowItWorks/Session and sessionClock, HeroVideo/reference, humanTyping and loopPacing: the hero at least a screen tall less the header, 64/80px padding (96 at 768, 12 at 1024); 5fr and 7fr columns 48px apart from 1024; the panel 16px in (48 from 1024), 448px wide inside (528 from 1280) on --surface with the texture at 0.5 clearing an ellipse 46% by 50%; the chat's frames at 60 a second, typing at a seeded human rhythm, the first answer held 3.8s and later ones 2.8s; the library's sort every 2.8s after 3.8s, tiles gliding 700ms on --ease-loop, text swapping 500ms"
files:
  - react/components/site/UseCaseHero.tsx
  - lib/use-case-hero.ts
examples:
  - "Chat | A chat answering in turn | bleed"
  - "Build | A library re-sorting itself | bleed"
  - "Control | With the connect menu | bleed"
---
The chat's first question shows already answered; then the next one types, sends and is answered, and so on in a loop
while it is on screen. A chip picks a question at once; a pointer over the chat, or focus in it, holds the current
answer. Pictures in the answer are neutral placeholders until you pass `src` (your own creatives); with them the
thumbnails show in the rows, and on phones a strip of them sits under the table.
