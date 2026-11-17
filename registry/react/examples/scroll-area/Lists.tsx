import { ScrollArea } from '@/react/components/ui/ScrollArea'
// A long list of boards in a short box, and a row of creatives that scrolls across.

const BOARDS = [
  'Acme hooks',
  'Acme summer launch',
  'UGC openers',
  'Price in the first line',
  'Product in hand',
  'Before and after',
  'Unboxing',
  'Founder story',
  'Testimonials',
  'Bundles',
  'Free shipping',
  'Launch week',
  'Holiday gifting',
  'Back to school',
  'New flavor',
  'Restock',
  'Behind the scenes',
  'Comparisons',
  'Tutorials',
  'Reviews',
]

const CREATIVES = ['Acme ad 1', 'Acme ad 2', 'Acme ad 3', 'Acme ad 4', 'Acme ad 5', 'Acme ad 6']

export default function Lists() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <ScrollArea label="Boards" className="h-72 rounded-container border border-edge">
        <div className="p-4">
          <p className="type-label text-fg-soft">Boards</p>
          <ul className="mt-3">
            {BOARDS.map((b) => <li key={b} className="border-t border-edge py-2 type-ui text-fg first:border-t-0">{b}</li>)}
          </ul>
        </div>
      </ScrollArea>
      <ScrollArea label="Creatives" axis="x" className="rounded-container border border-edge">
        <ul className="flex w-max gap-4 p-4">
          {CREATIVES.map((c) => (
            <li key={c} className="flex w-36 shrink-0 flex-col gap-2">
              <div className="aspect-square w-full rounded-control bg-surface-raised" />
              <p className="type-caption text-fg-muted">{c}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}
