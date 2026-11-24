import { ProductFeatures } from '@/react/components/site/ProductFeatures'
// Two feature rows with a plain Acme list on each stage, the second row flipped.

function Panel({ rows }: { rows: string[] }) {
  return (
    <div className="absolute inset-x-[14%] top-[18%] bottom-0 flex flex-col rounded-t-panel border border-b-0 border-edge-strong bg-surface p-4">
      {rows.map((r) => <p key={r} className="border-b border-edge py-3 type-ui text-fg">{r}</p>)}
    </div>
  )
}

export default function Rows() {
  return (
    <ProductFeatures
      id="creator-search"
      features={[
        { headline: 'Search creators by name or by description', text: 'Use a name, a handle or a plain brief, like fitness creators in Texas. Filter by location, language, gender, age range and followers.', visual: <Panel rows={['Acme Fit, Austin', 'Acme Run, Dallas', 'Acme Yoga, Houston']} /> },
        { headline: 'See who already works with your competitors', text: 'Look up a brand to see the creators it has posted with, how often and since when. Start your shortlist there.', link: { label: 'See Creator collabs', href: '#' }, visual: <Panel rows={['Acme Studio, 12 posts', 'Acme Goods, 7 posts', 'Acme Air, 5 posts']} /> },
      ]}
    />
  )
}
