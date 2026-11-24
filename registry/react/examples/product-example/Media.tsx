import { ProductExample } from '@/react/components/site/ProductExample'
// A media search request in three tabs beside its response and the creatives it returned (Acme).

const tabs = [
  {
    "id": "mcp",
    "label": "MCP",
    "language": "bash",
    "code": "# Ask your agent\nFind running shoe ads that ran for more than 30 days.\n\n# It calls searchMedia\nsearchMedia({\n  \"query\": \"running shoe ads\",\n  \"minDaysLive\": 30,\n  \"limit\": 3\n})"
  },
  {
    "id": "rest",
    "label": "REST",
    "language": "bash",
    "code": "curl -X POST https://api.acme.com/v1/media \\\n  -H \"Authorization: Bearer $ACME_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"query\": \"running shoe ads\",\n    \"minDaysLive\": 30,\n    \"limit\": 3\n  }'"
  },
  {
    "id": "python",
    "label": "Python",
    "language": "python",
    "code": "import os\nfrom acme import Acme\n\nclient = Acme(token=os.environ[\"ACME_API_KEY\"])\n\nresult = client.search_media(\n    query=\"running shoe ads\",\n    min_days_live=30,\n    limit=3,\n)"
  }
]

const response = "{\n  \"count\": 3,\n  \"media\": [\n    {\n      \"id\": \"1001\",\n      \"brand\": \"Acme Run\",\n      \"platform\": \"Instagram\",\n      \"daysLive\": 74\n    },\n    {\n      \"id\": \"1002\",\n      \"brand\": \"Acme Trail\",\n      \"platform\": \"TikTok\",\n      \"daysLive\": 61\n    },\n    {\n      \"id\": \"1003\",\n      \"brand\": \"Acme Fit\",\n      \"platform\": \"Meta\",\n      \"daysLive\": 48\n    }\n  ]\n}"

export default function Media() {
  return (
    <ProductExample
      id="media-search"
      question="Find running shoe ads that ran for more than 30 days."
      tabs={tabs}
      response={response}
      specs={[{"label": "Endpoint", "value": "POST /media"}, {"label": "MCP tool", "value": "searchMedia"}, {"label": "Rate limit", "value": "120 requests a minute"}]}
      media={{"label": "Returned creatives", "items": [{"brand": "Acme Run", "tone": 3, "caption": "Built for miles.", "meta": "Acme Run, 74 days live"}, {"brand": "Acme Trail", "tone": 2, "caption": "Off the road.", "meta": "Acme Trail, 61 days live"}, {"brand": "Acme Fit", "tone": 4, "caption": "First 5K.", "meta": "Acme Fit, 48 days live"}]}}
    />
  )
}
