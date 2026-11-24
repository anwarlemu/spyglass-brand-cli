import { ResourceCards, type ResourceCard, type ResourceRow } from '@/react/components/site/ResourceCards'
// The resources hub with Acme's copy: templates and case studies with placeholder creatives, the docs with code, and
// three resources that are coming soon.

const cards: ResourceCard[] = [
  { title: 'Templates', line: 'Ready-made playbooks that run inside Claude or ChatGPT on Acme data.', href: '/templates', meta: '4 templates, coming soon', cover: { kind: 'creatives', items: [{ brand: 'Acme Skin', tone: 2 }, { brand: 'Acme Drinks', tone: 3 }, { brand: 'Acme Studio', tone: 1 }, { brand: 'Acme Fit', tone: 4 }] } },
  { title: 'Docs', line: 'Set up the MCP server, call the REST API and use the SDKs.', href: 'https://docs.acme.com', meta: 'docs.acme.com', cover: { kind: 'code', source: '# The CLI\nnpm install -g @acme/cli\n# The MCP server\nhttps://mcp.acme.com/mcp\n# The REST API\nhttps://api.acme.com/v2' } },
  { title: 'Case studies', line: 'How agencies and marketing teams put Acme to work.', href: '/resources/case-studies', meta: '2 case studies', cover: { kind: 'creatives', items: [{ brand: 'Acme Skin', tone: 3 }, { brand: 'Acme Beauty', tone: 2 }, { brand: 'Acme Skin', tone: 4 }] } },
]
const rows: ResourceRow[] = [
  { title: 'Blog', line: 'What the Acme team shipped, and what is next.', badge: 'Coming soon' },
  { title: 'Articles', line: 'Guides to creative research with agents.', badge: 'Coming soon' },
  { title: 'Demos', line: 'Acme at work in Claude, ChatGPT and Cursor.', badge: 'Coming soon' },
]

export default function Hub() {
  return (
    <div className="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter) py-12">
      <ResourceCards cards={cards} rows={rows} rowsLabel="More resources" />
    </div>
  )
}
