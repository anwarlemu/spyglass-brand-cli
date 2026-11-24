import { ConnectMenu } from '@/react/components/site/ConnectMenu'
// The connect menu with Acme's neutral rows: each client shows its first letter.

export default function Default() {
  return (
    <div className="flex min-h-96 w-full items-start justify-center px-4 pt-8">
      <ConnectMenu />
    </div>
  )
}
