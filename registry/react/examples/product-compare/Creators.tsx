import { ProductCompare } from '@/react/components/site/ProductCompare'
// Creator search against ad libraries and scrapers.

export default function Creators() {
  return (
    <ProductCompare
      id="creator-search"
      rows={[
        { label: 'Find creators by niche, place and followers', cells: ['no', 'no', 'yes'] },
        { label: 'One record across Instagram and TikTok', cells: ['no', 'You match them', 'yes'] },
        { label: 'The brands they have worked with', cells: ['no', 'no', 'yes'] },
        { label: 'Ready for your agents over MCP', cells: ['no', 'You build it', 'yes'] },
      ]}
    />
  )
}
