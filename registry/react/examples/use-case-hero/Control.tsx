import { ConnectMenu } from '@/react/components/site/ConnectMenu'
import { UseCaseHero } from '@/react/components/site/UseCaseHero'
// The connect menu in the White button's place and the quiet button after it; on phones the menu steps aside for a White button.

export default function Control() {
  return <UseCaseHero content={{ id: 'research', name: 'Creative research', line: 'The hooks, angles and formats that win for any brand, worked out before you ask.', forWho: 'For creative strategists, designers and performance teams', primary: { label: 'Connect to MCP', href: '#' }, secondary: { label: 'Get a free API key', href: '#' } }} control={<ConnectMenu />} />
}
