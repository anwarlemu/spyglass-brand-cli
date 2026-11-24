import { CodeBlock } from '@/react/components/site/CodeBlock'
// One tab: setup commands, with comments muted.

export default function Single() {
  return <CodeBlock label="Setup" tabs={[{ id: 'shell', label: 'Terminal', language: 'shell', code: '# The CLI\nnpm install -g @acme/cli\n# The MCP server\nhttps://mcp.acme.com/mcp' }]} className="w-full max-w-160" />
}
