import { ResourceCards, type ResourceCard } from '@/react/components/site/ResourceCards'
// The use-cases hub: three columns from 1024, each use case with its creatives, its line and who it is for.

const tiles = (tone: 1 | 2 | 3 | 4) => ({ kind: 'creatives' as const, items: [{ brand: 'Acme Skin', tone }, { brand: 'Acme Drinks', tone: (tone % 4) + 1 as 1 | 2 | 3 | 4 }, { brand: 'Acme Fit', tone }] })
const cards: ResourceCard[] = [
  { title: 'Creative research', line: 'The hooks, angles and formats that win for any brand.', meta: 'For creative strategists.', href: '/use-cases/creative-research', cover: tiles(2) },
  { title: 'Paid ads', line: 'What competitors run, how long it runs and where it leads.', meta: 'For performance teams.', href: '/use-cases/paid-ads', cover: tiles(3) },
  { title: 'Creator sourcing', line: 'The creators behind a category’s best ads.', meta: 'For partnership teams.', href: '/use-cases/creator-sourcing', cover: tiles(1) },
]

export default function UseCases() {
  return (
    <div className="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter) py-12">
      <ResourceCards cards={cards} columns={3} />
    </div>
  )
}
