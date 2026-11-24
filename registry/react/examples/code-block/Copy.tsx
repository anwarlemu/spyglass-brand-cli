import { CopyButton } from '@/react/components/site/CopyButton'
// The copy button on its own, beside a URL on a #262626 field.

export default function Copy() {
  return (
    <div className="flex min-h-control-lg w-full max-w-120 items-center gap-2 rounded-control bg-surface-raised p-1 ps-4">
      <code id="mcp-url" className="min-w-0 flex-1 truncate type-code text-fg">https://mcp.acme.com/mcp</code>
      <CopyButton text="https://mcp.acme.com/mcp" name="Copy the URL" selectId="mcp-url" />
    </div>
  )
}
