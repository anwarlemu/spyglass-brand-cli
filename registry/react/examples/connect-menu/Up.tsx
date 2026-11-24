import { ConnectMenu } from '@/react/components/site/ConnectMenu'
// Near the foot of a page the panel opens above the button.

export default function Up() {
  return (
    <div className="flex min-h-96 w-full items-end justify-center px-4 pb-8">
      <ConnectMenu up />
    </div>
  )
}
