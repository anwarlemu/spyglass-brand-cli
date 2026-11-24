import { ProductPage } from '@/react/components/pages/ProductPage'
import { productPages } from '@/lib/pages/product'
// The product page for Creator search, with Acme results and the site's own features, rates and questions.

export default function CreatorSearch() {
  return <ProductPage product={productPages['creator-search']} />
}
