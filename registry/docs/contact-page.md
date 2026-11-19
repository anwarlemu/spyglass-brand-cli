---
name: contact-page
title: Contact page
type: registry:block
group: pages
description: "The contact page template, built only from library items: the heading and a line beside a form on the #171717 fill (name, work email, message, one White button), the header and the footer row."
use_for: "A website's contact page. Edit lib/pages/contact.ts or pass `content`; the form posts to `content.form.action`, or `onSubmit` (the element's `send` event) takes the values."
never:
  - "An address, phone number or reply time you cannot keep"
  - "More fields than you need, or a second White button"
  - "New colors, shadows or type sizes added to a section: use the items' props"
source: "Built from the library (site header, field, input, textarea, button, footer row); the brand assets have no contact layout, so it follows the page templates and the plan card's fill"
files:
  - react/components/pages/ContactPage.tsx
  - lib/pages/contact.ts
examples:
  - "Page | Contact page | bleed"
---
