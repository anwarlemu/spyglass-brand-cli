---
name: sidebar
title: Sidebar
type: registry:ui
group: ui
description: "The app's rail: Black with a hairline at its edge, the logo at the top, groups named in capitals, the page you are on in White, the account at the foot. It folds to icons with one button. Its body scrolls with fading edges, so no row is cut off."
use_for: "The main navigation of the product: search, boards, brands, creators and settings. One per app, at the left."
never:
  - "A second level of rows: a page's own sections go in Tabs"
  - "A spectrum color for the page you are on: it is White, as the primary button"
  - "Animating the fold: it is pressed many times a day"
source: "Derived from the brand guidelines (no app rail in the brand assets): Black ground, DM Sans labels in capitals at 6%, the White primary fill for the current page, the brand corner"
files:
  - react/components/ui/Sidebar.tsx
  - react/components/ui/SidebarLabel.tsx
  - react/components/ui/SidebarLink.tsx
examples:
  - "App | The app's rail"
---
