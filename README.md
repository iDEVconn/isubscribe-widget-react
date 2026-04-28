# isubscribe-widget-react

A React component library that renders subscription plan cards fetched from the iSubscribe API. Drop it into any React app and get a fully themed, accessible subscription selection UI with a single component.

[![npm](https://img.shields.io/npm/v/@teamco/isubscribe-widget-react)](https://www.npmjs.com/package/@teamco/isubscribe-widget-react)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE.md)

---

## Installation

```bash
npm install @teamco/isubscribe-widget-react
# or
yarn add @teamco/isubscribe-widget-react
```

React 18+ is a peer dependency — it must already be installed in your project.

---

## Quick Start

```tsx
import { SubscriptionWidget } from '@teamco/isubscribe-widget-react';

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
| `onSubscribe` | `(plan: Subscription) => void` | No | Called when the subscribe button is clicked |
| `onError` | `(error: Error) => void` | No | Called on fetch failure |
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
| `--isw-accent` | `#2563eb` | Button and highlight color |
| `--isw-success` | `#16a34a` | Positive/feature indicators |
| `--isw-error` | `#dc2626` | Error state |
| `--isw-sale` | `#ea580c` | Sale badge |
| `--isw-trial` | `#7c3aed` | Trial badge |
| `--isw-gap` | `1.5rem` | Grid spacing |
| `--isw-padding` | `1.5rem` | Card padding |
| `--isw-radius` | `12px` | Card border radius |
| `--isw-radius-pill` | `9999px` | Badge border radius |
| `--isw-card-shadow` | `0 2px 8px …` | Card resting shadow |
| `--isw-card-hover` | `0 8px 24px …` | Card hover shadow |
| `--isw-font` | `inherit` | Font family |

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

Available slots: `container`, `card`, `title`, `description`, `price`, `originalPrice`, `duration`, `features`, `feature`, `featureIcon`, `saleBadge`, `trialBadge`, `trialNote`, `button`, `loader`, `error`, `empty`.

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
  Subscription,
  Feature,
} from '@teamco/isubscribe-widget-react';
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

## License

Apache 2.0 — see [LICENSE.md](LICENSE.md).
