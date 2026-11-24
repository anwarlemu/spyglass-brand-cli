import { ConnectMenu } from '@/react/components/site/ConnectMenu'
import { PageHead } from '@/react/components/site/PageHead'
// A use case's head with the connect menu in the White button's place; on phones it steps aside for a White button.

export default function Control() {
  return <PageHead id="agents" lines={['Acme for agents']} lead="Give any agent live answers from Acme in one step." control={<ConnectMenu />} secondary={{ label: 'Get a free API key', href: '#' }} />
}
