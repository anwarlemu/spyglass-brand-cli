import { RowFan, type FanRow } from '@/react/components/site/RowFan'
// The templates page's rows: each template's name with what it brings back (Acme placeholder pictures; pass your own).

const SHADES = ['#262626', '#1A1A1A', '#363636', '#4D4D4D']
const picture = (n: number) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="${SHADES[n % 4]}"/><text x="64" y="70" fill="#A3A3A3" font-family="sans-serif" font-size="14" text-anchor="middle">Acme ${n + 1}</text></svg>`)}`
const items = (row: number, what: string) => Array.from({ length: 6 }, (_, i) => ({ key: `${row}-${i}`, src: picture(row * 6 + i), title: `Acme ${['Skin', 'Drinks', 'Fit', 'Studio', 'Motors', 'Home'][i]}`, meta: what }))

const rows: FanRow[] = [
  { key: 'ads', name: 'Ad library', href: '#ads', cta: 'Every ad a brand is running, and how long it ran.', items: items(0, 'Meta ad') },
  { key: 'creators', name: 'Creators', href: '#creators', cta: 'The creators a brand works with, and their posts.', items: items(1, 'Instagram') },
  { key: 'pages', name: 'Landing pages', href: '#pages', cta: 'Where the ads send people.', items: items(2, 'Landing page') },
]

export default function Templates() {
  return <RowFan rows={rows} />
}
