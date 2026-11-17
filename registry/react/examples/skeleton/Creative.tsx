import { Skeleton } from '@/react/components/ui/Skeleton'
// A creative card while it loads: the thumbnail, the brand's logo and two lines, in the shapes they will take.

export default function Creative() {
  return (
    <div className="flex w-72 max-w-full flex-col gap-4 rounded-container bg-surface-raised p-4" aria-busy="true" aria-label="Loading creative">
      <Skeleton className="aspect-square w-full" />
      <div className="flex items-center gap-3">
        <Skeleton circle className="size-10 shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}
