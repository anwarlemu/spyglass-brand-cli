import { StepsBlock } from '@/react/components/blocks/StepsBlock'
// Acme's setup in three steps.

const steps = [
  {
    "title": "Connect",
    "body": "Add the brands and creators you track."
  },
  {
    "title": "Ask",
    "body": "Search in words, the way you would ask a teammate."
  },
  {
    "title": "Share",
    "body": "Save what you find to a board and send the link."
  }
]

export default function Setup() {
  return <StepsBlock title="Set up in under a minute" steps={steps} />
}
