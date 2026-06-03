---
"@idevconn/isubscribe-widget-react": minor
---

Add `feature.description` display and align types with API

- Renders optional `feature.description` as muted secondary text below the feature title
- Adds `featureDescription` slot for host class overrides via `classNames` prop
- Fixes `Feature.trialDetails` shape: `duration` and `price` are plain numbers, not nested objects; value can be `null`
- Extracts `Duration` and `Price` interfaces; marks `isDiscounted` required; removes unused `discount` field to match API `IPrice`
- Narrows `Duration.type` to the actual API enum keys (`'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'FOREVER'`)
