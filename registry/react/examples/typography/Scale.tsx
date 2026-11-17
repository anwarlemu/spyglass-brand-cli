import { Text } from '@/react/components/ui/Text'
// Every step of the brand's type scale, with the face, size and line height it takes from the tokens.

export default function Scale() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Display</Text><Text variant="caption">Funnel Display 64px at 1.07</Text></div>
        <Text variant="display">Find the ads that work.</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Hero</Text><Text variant="caption">Funnel Display 48px at 1.07</Text></div>
        <Text variant="hero">The only creative search engine.</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Heading 1</Text><Text variant="caption">Funnel Display 36px at 1.07</Text></div>
        <Text variant="h1">Search ads by what is in them.</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Heading 2</Text><Text variant="caption">Funnel Display 28px at 1.0</Text></div>
        <Text variant="h2">Creator plan</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Heading 3</Text><Text variant="caption">Funnel Display 24px at 1.07</Text></div>
        <Text variant="h3">Boards for every brand</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Heading 4</Text><Text variant="caption">Funnel Display 20px at 1.07</Text></div>
        <Text variant="h4">Track a competitor</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Lead</Text><Text variant="caption">DM Sans 18px at 1.33, muted</Text></div>
        <Text variant="lead">Type what you are looking for and find the creative that matches.</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Paragraph</Text><Text variant="caption">DM Sans 16px at 1.33</Text></div>
        <Text variant="p">Save the ads that work to a board, and come back to them when you brief the next one.</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Interface</Text><Text variant="caption">DM Sans 14px at 1.3</Text></div>
        <Text variant="ui">Saved to Acme hooks.</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Small</Text><Text variant="caption">DM Sans Medium 14px at 1.3</Text></div>
        <Text variant="small">12 new creatives</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Muted</Text><Text variant="caption">DM Sans 14px, muted</Text></div>
        <Text variant="muted">Updated 4 minutes ago.</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Caption</Text><Text variant="caption">DM Sans 12px at 1.3, muted</Text></div>
        <Text variant="caption">$10 for your first month, then $20/month.</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Label</Text><Text variant="caption">DM Sans Medium 12px, capitals, 6% tracking</Text></div>
        <Text variant="label">Most popular</Text>
      </div>
      <div className="flex flex-col gap-2 border-b border-edge py-6 md:flex-row md:items-baseline md:gap-8">
        <div className="flex shrink-0 flex-col gap-1 md:w-56"><Text variant="label">Code</Text><Text variant="caption">Geist Mono 14px at 1.3</Text></div>
        <Text variant="code">acme-hooks</Text>
      </div>
    </div>
  )
}
