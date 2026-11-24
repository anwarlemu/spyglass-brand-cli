import { PromptCard } from '@/react/components/product/PromptCard'
// The prompt with a hint and the places it works, for Acme's search.

export default function Ask() {
  return <PromptCard placeholder="Show me the longest-running ads in running shoes." worksLabel="Works where you work" works={['Chat apps', 'Code editors', 'Any MCP client', 'REST']} />
}
