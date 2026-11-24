import { BentoBlock } from '@/react/components/blocks/BentoBlock'
// Acme's features as a bento grid, wide and tall cards among them.

const items = [
  {
    "title": "Search every network",
    "body": "Meta, TikTok, Instagram and YouTube in one index.",
    "span": "wide"
  },
  {
    "title": "Alerts",
    "body": "Know the day a brand launches.",
    "span": "tall"
  },
  {
    "title": "Boards",
    "body": "Save and share with one link."
  },
  {
    "title": "API and MCP",
    "body": "Your agents read the same index."
  },
  {
    "title": "History",
    "body": "Every ad since the day it ran.",
    "span": "wide"
  }
] as const

export default function Features() {
  return <BentoBlock title="What you get" body="One index for every creative your team needs." items={[...items]} />
}
