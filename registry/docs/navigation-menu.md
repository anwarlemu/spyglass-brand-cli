---
name: navigation-menu
title: Navigation Menu
type: registry:ui
group: ui
description: "A site's top navigation: triggers and links in DM Sans Medium, each trigger opening a panel of links in the card's #262626 fill. It opens under a resting pointer, switches at once between triggers, and opens at once from the keyboard."
use_for: "The website's header: the product's parts, resources, pricing. A few entries, each panel a handful of links with a line each."
never:
  - "App navigation: use the Sidebar"
  - "Actions: use Dropdown Menu or Menubar"
  - "A chevron that turns or moves on hover"
source: "Derived from the brand guidelines (no navigation menu in the brand assets): Black ground, DM Sans Medium for entries, the plan card's #262626 fill for panels, the neutral steps for fills"
files:
  - react/components/ui/NavigationMenu.tsx
  - react/components/ui/NavigationMenuItem.tsx
  - react/components/ui/NavigationMenuLink.tsx
examples:
  - "Site | The site's header"
---
