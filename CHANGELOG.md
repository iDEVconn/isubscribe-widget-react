# @idevconn/isubscribe-widget-react

## 2.5.0

### Minor Changes

- Add `--isw-button-*` CSS tokens for outlined/ghost button styling

  New tokens: `--isw-button-bg`, `--isw-button-color`, `--isw-button-border`,
  `--isw-button-bg-hover`, `--isw-button-color-hover`, `--isw-button-border-hover`.

  Default values preserve the existing solid-accent button behaviour (no breaking change).
  Set `--isw-button-bg: transparent` and `--isw-button-border` on the grid root to switch
  all default plan buttons to outlined style. Restore solid fill per-plan via
  `subscriptionOverrides[id].buttonStyle`.

## 2.4.0

### Minor Changes

- 14e7fe9: Add `feature.description` display and align types with API
  - Renders optional `feature.description` as muted secondary text below the feature title
  - Adds `featureDescription` slot for host class overrides via `classNames` prop
  - Fixes `Feature.trialDetails` shape: `duration` and `price` are plain numbers, not nested objects; value can be `null`
  - Extracts `Duration` and `Price` interfaces; marks `isDiscounted` required; removes unused `discount` field to match API `IPrice`
  - Narrows `Duration.type` to the actual API enum keys (`'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'FOREVER'`)
