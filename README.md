# isubscribe-widget-react

A React component library that renders subscription plan cards fetched from the iSubscribe API. Drop it into any React app and get a fully themed, accessible subscription selection UI with a single component.

[![npm](https://img.shields.io/npm/v/@idevconn/isubscribe-widget-react)](https://www.npmjs.com/package/@idevconn/isubscribe-widget-react)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE.md)

---

Architecture documented in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Installation

```bash
npm install @idevconn/isubscribe-widget-react
# or
yarn add @idevconn/isubscribe-widget-react
```

React 18+ is a peer dependency — it must already be installed in your project.

---

## Quick Start

```tsx
import { SubscriptionWidget } from '@idevconn/isubscribe-widget-react';

function App() {
  return (
    <SubscriptionWidget
      apiKey="your-api-key"
      onSubscribe={(plan) => console.log('Selected:', plan)}
    />
  );
}
```

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiKey` | `string` | Yes | API key for the iSubscribe service |
| `apiBaseUrl` | `string` | No | Override the default API base URL |
| `locale` | `string` | No | BCP-47 locale for number/currency formatting (e.g. `"en-US"`) |
| `classNames` | `Partial<Record<SubscriptionWidgetSlot, string>>` | No | Per-slot CSS class overrides |
| `labels` | `Partial<SubscriptionWidgetLabels>` | No | Override any UI label string |
| `featureIcon` | `ReactNode \| ((feature: Feature) => ReactNode) \| null` | No | Custom icon for feature list items |
| `style` | `CSSProperties` | No | Inline styles — primary way to inject CSS custom properties |
| `subscriptionOverrides` | `Record<string, SubscriptionOverride>` | No | Per-plan visual overrides keyed by `Subscription.id` (badge, card/button class & style, button text) |
| `fallbackNotification` | `boolean` | No | Render a built-in friendly error message when the API call fails. Set `false` to suppress the UI and handle errors yourself via `onError`. Default: `true` |
| `onSubscribe` | `(plan: Subscription) => void` | No | Called when the subscribe button is clicked |
| `onError` | `(error: Error, reason: ISubscribeErrorReason) => void` | No | Called on fetch failure. `reason` classifies the error (`invalid_key` \| `unavailable` \| `network` \| `unknown`) |
| `onLoaded` | `(plans: Subscription[]) => void` | No | Called after successful data fetch |

### Ref handle

The component exposes a `refetch()` method via `ref`:

```tsx
const widgetRef = useRef<SubscriptionWidgetHandle>(null);
// ...
widgetRef.current?.refetch(); // reload plans from API
```

---

## Theming

All visual tokens are CSS custom properties with an `--isw-` prefix. Set them via the `style` prop or a global stylesheet.

```tsx
<SubscriptionWidget
  apiKey="..."
  style={{
    '--isw-accent':        '#7c3aed',
    '--isw-surface':       '#ffffff',
    '--isw-text':          '#111827',
    '--isw-text-muted':    '#6b7280',
    '--isw-radius':        '12px',
    '--isw-radius-pill':   '9999px',
    '--isw-gap':           '24px',
    '--isw-card-shadow':   '0 2px 8px rgba(0,0,0,.08)',
  } as React.CSSProperties}
/>
```

### Full token reference

| Token | Default | Purpose |
|-------|---------|---------|
| `--isw-surface` | `#fff` | Card background |
| `--isw-text` | `#111` | Primary text |
| `--isw-text-muted` | `#666` | Secondary text |
| `--isw-accent` | `#2563eb` | Badge and featured-button fill color |
| `--isw-accent-hover` | `#1d4ed8` | Featured-button hover fill |
| `--isw-accent-text` | `#fff` | Featured-button label color |
| `--isw-accent-price-text` | `#2563eb` | Price value color |
| `--isw-success` | `#16a34a` | Feature check icon color |
| `--isw-error` | `#dc2626` | Error state text |
| `--isw-sale` | `#ea580c` | Sale badge background |
| `--isw-sale-text` | `#fff` | Sale badge label |
| `--isw-trial-bg` | `#e0f2fe` | Trial badge / note background |
| `--isw-trial-text` | `#0369a1` | Trial badge / note text |
| `--isw-button-bg` | `var(--isw-accent)` | Default button background — set to `transparent` for outlined style |
| `--isw-button-color` | `var(--isw-accent-text)` | Default button label color |
| `--isw-button-border` | `transparent` | Default button border color — set to your border token for outlined style |
| `--isw-button-bg-hover` | `var(--isw-accent-hover)` | Default button background on hover |
| `--isw-button-color-hover` | `var(--isw-button-color)` | Default button label on hover |
| `--isw-button-border-hover` | `var(--isw-button-border)` | Default button border on hover |
| `--isw-gap` | `1.5rem` | Grid spacing between cards |
| `--isw-padding` | `1.5rem` | Card inner padding |
| `--isw-radius` | `12px` | Card border radius |
| `--isw-radius-pill` | `9999px` | Badge border radius |
| `--isw-shadow-card` | `0 4px 12px …` | Card resting shadow |
| `--isw-shadow-card-hover` | `0 8px 22px …` | Card hover shadow |
| `--isw-border` | `rgba(0,0,0,.06)` | Card border color |
| `--isw-font` | `inherit` | Font family |

#### Outlined (ghost) buttons

Set three tokens on the grid root to switch all default plan buttons to an outlined style. Featured plans restore solid fill via `subscriptionOverrides[id].buttonStyle`.

```tsx
<SubscriptionWidget
  style={{
    '--isw-button-bg':           'transparent',
    '--isw-button-color':        '#1e293b',
    '--isw-button-border':       '#e2e8f0',
    '--isw-button-bg-hover':     '#f8fafc',
    '--isw-button-border-hover': '#94a3b8',
  }}
  subscriptionOverrides={{
    'featured-plan-id': {
      style: {
        '--isw-button-bg':    '#7c3aed',
        '--isw-button-color': '#fff',
        '--isw-button-border':'#7c3aed',
      },
    },
  }}
/>

---

## Slot class overrides

Every rendered region has a slot name. Pass a `classNames` map to attach your own CSS classes without losing the built-in styles.

```tsx
<SubscriptionWidget
  apiKey="..."
  classNames={{
    card:   'my-card',
    button: 'my-btn',
    title:  'my-title',
  }}
/>
```

Available slots: `container`, `card`, `title`, `description`, `price`, `originalPrice`, `duration`, `features`, `feature`, `featureIcon`, `saleBadge`, `highlightBadge`, `trialBadge`, `trialNote`, `button`, `loader`, `error`, `empty`.

---

## Per-subscription overrides

Highlight a specific plan ("Most popular"), tweak a single CTA, or restyle one card — without touching the API response or every plan.

Keys in the `subscriptionOverrides` map are `Subscription.id` values returned by the API. To discover them:

- Inspect the API response at `${apiBaseUrl}/data` (defaults to `https://api.isubscribe.com/api/v1/public/subscriptions/data`). Each plan object has an `id` field — that's the key.
- Or log them at runtime via `onLoaded`:
  ```tsx
  <SubscriptionWidget
    apiKey="..."
    onLoaded={(plans) => console.log(plans.map((p) => ({ id: p.id, title: p.title })))}
  />
  ```
- Or check the iSubscribe admin dashboard where plans are managed — each plan's id is shown there.

Unknown keys are ignored; if the matching plan disappears from the API, that override simply has no effect.

```tsx
<SubscriptionWidget
  apiKey="..."
  subscriptionOverrides={{
    'pro-plan-id': {
      badge: 'Most Popular',
      className: 'highlighted-card',
      style: { borderColor: 'gold' },
      buttonText: 'Start Pro',
      buttonClassName: 'gold-btn',
    },
    'enterprise-plan-id': {
      buttonText: 'Contact Sales',
    },
  }}
/>
```

Override shape (`SubscriptionOverride`):

| Field | Type | Purpose |
|-------|------|---------|
| `className` | `string` | Extra class on the card root |
| `style` | `CSSProperties` | Inline style on the card root |
| `badge` | `string` | Renders a pill badge (uses `highlightBadge` slot) |
| `badgeClassName` | `string` | Extra class on the badge |
| `badgeStyle` | `CSSProperties` | Inline style on the badge |
| `buttonText` | `string` | Overrides global `buttonText` / `labels.subscribe` for this card |
| `buttonClassName` | `string` | Extra class on the button |
| `buttonStyle` | `CSSProperties` | Inline style on the button |

Button text resolves in this order (first defined wins):

```
subscriptionOverrides[id].buttonText  →  buttonText prop  →  labels.subscribe  →  "Subscribe"
```

All three are plain strings — the widget does not translate them. Pass already-localized values from your i18n library. For multi-language apps, prefer `labels.subscribe` (canonical i18n surface) and pass translated per-card overrides explicitly.

The subscribe button is bottom-aligned via flex layout, so buttons stay aligned across cards regardless of feature list length.

---

## Error handling

The widget classifies fetch failures into four reasons and renders a friendly message by default. Override any of them via `labels.errorMessages`, or suppress the built-in UI entirely with `fallbackNotification={false}` and react in `onError`.

| Reason | Triggered by | Default message |
|--------|--------------|-----------------|
| `invalid_key` | HTTP `401` / `403` | "Invalid API key. Check your iSubscribe credentials." |
| `unavailable` | HTTP `5xx` | "Subscription service is temporarily unavailable. Please try again later." |
| `network` | `fetch` rejected (offline, DNS, CORS, timeout) | "Network problem. Check your connection and try again." |
| `unknown` | Any other failure | "Failed to load subscription plans." |

```tsx
<SubscriptionWidget
  apiKey="..."
  labels={{
    errorMessages: {
      invalid_key: 'Неверный API ключ. Проверьте настройки iSubscribe.',
      unavailable: 'Сервис подписок временно недоступен.',
      network: 'Проблема с сетью.',
    },
  }}
  onError={(err, reason) => {
    console.error('[isubscribe]', reason, err);
    sentry.captureException(err, { tags: { reason } });
  }}
/>
```

Suppress the built-in notification and render your own:

```tsx
<SubscriptionWidget
  apiKey="..."
  fallbackNotification={false}
  onError={(err, reason) => toast.error(myFriendlyMap[reason])}
/>
```

The raw `error.message` (e.g. `HTTP 401: Unauthorized`) is **not** shown in the default UI — it remains accessible via `onError` for logging.

---

## Internationalization

Override any UI string via the `labels` prop:

```tsx
<SubscriptionWidget
  apiKey="..."
  locale="fr-FR"
  labels={{
    subscribe:       "S'abonner",
    perMonth:        '/ mois',
    perYear:         '/ an',
    loading:         'Chargement…',
    error:           'Erreur lors du chargement',
    empty:           'Aucun abonnement disponible',
    trial:           'Essai',
    sale:            'Promo',
    trialNote:       (d, t, p, c) => `Essai ${d} ${t} pour ${p} ${c}`,
  }}
/>
```

---

## TypeScript

All types are bundled in `dist/index.d.ts`. Import as needed:

```ts
import type {
  SubscriptionWidgetProps,
  SubscriptionWidgetHandle,
  SubscriptionWidgetSlot,
  SubscriptionWidgetLabels,
  SubscriptionOverride,
  Subscription,
  Feature,
  ISubscribeErrorReason,
} from '@idevconn/isubscribe-widget-react';
```

---

## Building from source

```bash
git clone https://github.com/iDEVconn/isubscribe-widget-react.git
cd isubscribe-widget-react
npm install
npm run build   # outputs to dist/
```

---

## Testing

The widget is covered by Vitest (jsdom + React Testing Library):

```bash
npm test            # one-shot run
npm run test:watch  # watch mode
npm run test:ui     # interactive UI
```

Tests live in `src/__tests__/` and cover the pure `classifyError` helper plus widget render behavior for every error reason (`invalid_key`, `unavailable`, `network`, `unknown`), label overrides, `fallbackNotification={false}` suppression, and the successful fetch path.

---

## License

Apache 2.0 — see [LICENSE.md](LICENSE.md).
