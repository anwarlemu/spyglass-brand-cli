import { ProductPage } from '@/react/components/pages/ProductPage'
import { productPages } from '@/lib/pages/product'
// The product page for Comments, with Acme results and the site's own features, rates and questions.

export default function Comments() {
  return <ProductPage product={productPages['comments']} />
}
