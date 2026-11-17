---
name: field
title: Field
type: registry:ui
group: ui
description: "A label over one control, with a description or an error under it. The label speaks in capitals; the help is muted; an error takes the help's place in red."
use_for: "Every labeled control in a form: an email, a board name, a note, a pick from a list. One Field per control."
never:
  - "A placeholder in place of the label"
  - "A red hairline before anything is wrong: errors show once a field is left or the form is sent"
  - "Fields under 16px on phones (the input switches to 16px there)"
source: "Derived from the brand guidelines (no form in the brand assets): the label voice from the type page, the neutral steps for help text, the red tints for errors"
files:
  - react/components/ui/Field.tsx
examples:
  - "Fields | Help and errors | center"
---
