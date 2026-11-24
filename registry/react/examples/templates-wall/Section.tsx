import { TemplatesWall } from '@/react/components/blocks/TemplatesWall'
// The wall as a home page section, with Acme's copy.

export default function Section() {
  return <TemplatesWall id="home-templates" content={{ headline: 'Build your own', names: ['Brand monitor', 'Hook finder', 'Creator shortlist'], lead: 'Acme playbooks that run inside your agent, every morning.', status: 'Coming soon' }} />
}
