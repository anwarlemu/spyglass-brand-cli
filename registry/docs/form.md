---
name: form
title: Form
type: registry:ui
group: ui
description: "Fields stacked 24px apart, a failure from the server in a dark red box, and the actions at the end, the main one last. Errors wait until a field is left or the form is sent."
use_for: "Any form with more than one field: tracking a brand, inviting a teammate, account settings. useForm holds the values, the rules and the send."
never:
  - "Errors while the first value is still being typed"
  - "The browser's own error bubbles"
  - "A red hairline at rest"
  - "Two primary buttons: one White action, the rest secondary or ghost"
source: "Derived from the brand guidelines (no form in the brand assets): Field, Input and Button, the red tints for the failure, one White primary"
files:
  - react/components/ui/Form.tsx
  - react/hooks/useForm.ts
examples:
  - "Track | Track a brand | center"
---
