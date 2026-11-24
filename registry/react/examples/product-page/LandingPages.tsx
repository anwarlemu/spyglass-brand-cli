import { ProductPage } from '@/react/components/pages/ProductPage'
import { productPages } from '@/lib/pages/product'
// The product page for Landing pages, with Acme results and the site's own features, rates and questions.

export default function LandingPages() {
  return <ProductPage product={productPages['landing-pages']} />
}
