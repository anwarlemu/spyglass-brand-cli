---
name: date-picker
title: Date picker
type: registry:ui
group: ui
description: "A date in a field: a button drawn as the text field that opens the calendar on the #171717 overlay panel under it. Opening puts focus on the picked day, picking closes it and returns focus, Escape closes it unchanged."
use_for: "A single date in a form: when a report starts, when a campaign ends. The field reads the day in words."
never:
  - "A shadow under the panel: the hairline and the #171717 fill set it apart"
  - "Typing a date into the button: it is picked from the calendar"
  - "A red edge for anything but an error"
source: "Derived from the guidelines: the input's field (40px, the 8px corner, a #363636 hairline that turns White on focus), the #171717 card fill for the overlay. shadcn's date picker (a popover holding a calendar) for anatomy and keys."
files:
  - react/components/ui/DatePicker.tsx
examples:
  - "Field | In a form"
  - "Picked | A picked day, later days blocked"
---

The web component is form-associated: give it a `name` and the form sends the day as an ISO date (2026-11-03).
