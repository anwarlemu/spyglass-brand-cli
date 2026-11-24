import { ProductHero } from '@/react/components/site/ProductHero'
// An unlit hero: the ASCII texture in the margins from 1024 instead of the light.

const sets = [
  {
    "question": "Find fitness creators in Texas with 50K to 500K followers.",
    "resultsLabel": "Fitness creators in Texas",
    "results": [
      {
        "id": "acmefit",
        "stat": {
          "value": "367K",
          "caption": "followers on Instagram"
        },
        "label": "@acmefit",
        "meta": "367K followers, Austin",
        "detail": {
          "title": "Acme Fit",
          "facts": [
            {
              "term": "Instagram",
              "value": "367K followers"
            },
            {
              "term": "Location",
              "value": "Austin, Texas"
            },
            {
              "term": "Focus",
              "value": "Functional workouts and recovery"
            },
            {
              "term": "Age",
              "value": "25 to 34"
            }
          ]
        }
      },
      {
        "id": "acmerun",
        "stat": {
          "value": "457K",
          "caption": "followers on Instagram"
        },
        "label": "@acmerun",
        "meta": "457K followers, Austin",
        "detail": {
          "title": "Acme Run",
          "facts": [
            {
              "term": "Instagram",
              "value": "457K followers"
            },
            {
              "term": "Location",
              "value": "Austin, Texas"
            },
            {
              "term": "Focus",
              "value": "Beginner strength and running"
            },
            {
              "term": "Age",
              "value": "25 to 34"
            }
          ]
        }
      },
      {
        "id": "acmegym",
        "stat": {
          "value": "194K",
          "caption": "followers on Instagram"
        },
        "label": "@acmegym",
        "meta": "194K followers, Amarillo",
        "detail": {
          "title": "Acme Gym",
          "facts": [
            {
              "term": "Instagram",
              "value": "194K followers"
            },
            {
              "term": "Location",
              "value": "Amarillo, Texas"
            },
            {
              "term": "Focus",
              "value": "Home-gym workouts and nutrition"
            },
            {
              "term": "Age",
              "value": "25 to 34"
            }
          ]
        }
      },
      {
        "id": "acmeyoga",
        "stat": {
          "value": "212K",
          "caption": "followers on TikTok"
        },
        "label": "@acmeyoga",
        "meta": "212K followers, Houston",
        "detail": {
          "title": "Acme Yoga",
          "facts": [
            {
              "term": "TikTok",
              "value": "212K followers"
            },
            {
              "term": "Location",
              "value": "Houston, Texas"
            },
            {
              "term": "Focus",
              "value": "Yoga and mobility"
            },
            {
              "term": "Age",
              "value": "18 to 24"
            }
          ]
        }
      },
      {
        "id": "acmelift",
        "stat": {
          "value": "88K",
          "caption": "followers on Instagram"
        },
        "label": "@acmelift",
        "meta": "88K followers, Dallas",
        "detail": {
          "title": "Acme Lift",
          "facts": [
            {
              "term": "Instagram",
              "value": "88K followers"
            },
            {
              "term": "Location",
              "value": "Dallas, Texas"
            },
            {
              "term": "Focus",
              "value": "Strength training"
            },
            {
              "term": "Age",
              "value": "25 to 34"
            }
          ]
        }
      }
    ]
  }
]

export default function Unlit() {
  return <ProductHero id="creator-search-unlit" name="Creator search" line="Find creators by name, handle or description. Filter by location, language, gender, age and followers." sets={sets} lit={false} />
}
