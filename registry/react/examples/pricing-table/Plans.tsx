import { PricingTable } from '@/react/components/site/PricingTable'
// Acme's four plans: the switch for yearly prices, Pro lit as the most popular, Enterprise with the rim light.

const plans = [
  {
    "name": "Free",
    "description": "Try the API and MCP server.",
    "price": "$0",
    "unit": "/mo",
    "cta": "Get a free API key",
    "href": "#free",
    "features": [
      "500 credits a month",
      "No card needed",
      "API and MCP access"
    ]
  },
  {
    "name": "Creator",
    "description": "For individuals.",
    "price": "$10",
    "unit": "/mo",
    "yearly": {
      "price": "$8",
      "unit": "/mo, billed yearly"
    },
    "cta": "Start with Creator",
    "href": "#creator",
    "ladder": "Everything in Free, plus:",
    "features": [
      "5,000 credits ($2/1K)",
      "$2 per 1K additional credits"
    ]
  },
  {
    "name": "Pro",
    "description": "For teams and builders.",
    "price": "$20",
    "unit": "/mo",
    "yearly": {
      "price": "$16",
      "unit": "/mo, billed yearly"
    },
    "tag": "Save 25%",
    "badge": "Most popular",
    "featured": true,
    "cta": "Start with Pro",
    "href": "#pro",
    "ladder": "Everything in Creator, plus:",
    "features": [
      "13,334 credits ($1.5/1K)",
      "$1.5 per 1K additional credits",
      "Beta-access to new features"
    ]
  },
  {
    "name": "Enterprise",
    "description": "For brands and agencies.",
    "price": "Custom",
    "rim": true,
    "cta": "Book a demo",
    "href": "#demo",
    "ladder": "Everything in Pro, plus:",
    "features": [
      "Volume pricing",
      "Annual contract",
      "90-day pilot",
      "Hands-on support"
    ]
  }
]

export default function Plans() {
  return (
    <div className="px-4 py-12 md:px-12">
      <PricingTable plans={plans} note={{ lead: 'Save 20%', rest: ' on a yearly subscription' }} />
    </div>
  )
}
