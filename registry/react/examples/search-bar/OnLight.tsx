import { BrandLight } from '@/react/components/visuals/BrandLight'
import { SearchBar } from '@/react/components/product/SearchBar'
// As the ad sets it: the search bar across a band of the light.

export default function OnLight() {
  return (
    <div className="relative overflow-hidden rounded-container">
      <BrandLight variant="band" seed={2} cover className="absolute inset-0 size-full" />
      <div className="relative px-6 py-14 max-sm:px-4 max-sm:py-10">
        <SearchBar placeholder="Show me UGC ads for skincare brands using before/after hooks" label="Search creatives" />
      </div>
    </div>
  )
}
