import { ProductCards } from '@/react/components/site/ProductCards'
// Three related products, as the site lists them under a product.

export default function Related() {
  return (
    <div className="w-full max-w-320 px-4 md:px-12">
      <ProductCards
        products={[
          { name: 'Creator search', line: 'Find creators by name, handle or description. Filter by location, language, gender, age and followers.', endpoint: 'POST /creators', href: '/products/creator-search' },
          { name: 'Media search', line: 'Search ads and organic posts by what is in them, across Meta, Instagram and TikTok.', endpoint: 'POST /media', href: '/products/media-search' },
          { name: 'Creator collabs', line: 'See which creators a brand has posted with, how often and since when.', endpoint: 'GET /collabs', href: '/products/creator-collabs' },
        ]}
      />
    </div>
  )
}
