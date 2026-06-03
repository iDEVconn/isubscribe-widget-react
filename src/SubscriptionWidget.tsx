import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from 'react';
import type { Subscription, Feature, ISubscribeErrorReason } from './types';
import { classifyError } from './classifyError';
import styles from './SubscriptionWidget.module.css';

/**
 * Slot keys the host can target via the `classNames` prop.
 */
export type SubscriptionWidgetSlot =
  | 'container'
  | 'card'
  | 'title'
  | 'description'
  | 'price'
  | 'originalPrice'
  | 'duration'
  | 'features'
  | 'feature'
  | 'featureIcon'
  | 'featureDescription'
  | 'saleBadge'
  | 'highlightBadge'
  | 'trialBadge'
  | 'trialNote'
  | 'button'
  | 'loader'
  | 'error'
  | 'empty';

/**
 * Per-subscription visual overrides, keyed by subscription id.
 * Lets the host highlight a specific plan ("Most popular") or
 * tweak its CTA without touching the API response.
 */
export interface SubscriptionOverride {
  className?: string;
  style?: React.CSSProperties;
  badge?: string;
  badgeClassName?: string;
  badgeStyle?: React.CSSProperties;
  buttonText?: string;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
}

export interface SubscriptionWidgetLabels {
  loading?: string;
  error?: string;
  empty?: string;
  subscribe?: string;
  sale?: string;
  trial?: string;
  trialNote?: string;
  /**
   * Receives the duration string (e.g. `1 month`) and returns the full
   * localised "per X" label. Default: `per ${duration}`.
   */
  perPeriod?: (duration: string) => string;
  /**
   * Friendly per-reason error messages. Used by the built-in error notification
   * when `fallbackNotification` is enabled. Missing reasons fall back to `error`.
   */
  errorMessages?: Partial<Record<ISubscribeErrorReason, string>>;
}

export interface SubscriptionWidgetHandle {
  refetch: () => void;
}

export interface SubscriptionWidgetProps {
  apiKey: string;
  apiBaseUrl?: string;

  /** BCP-47 locale for currency / number formatting. Default: browser. */
  locale?: string;

  /** Per-slot class overrides. Each entry is concatenated to the slot's default class. */
  classNames?: Partial<Record<SubscriptionWidgetSlot, string>>;

  /** Localised labels. Defaults are English; supply any subset to override. */
  labels?: SubscriptionWidgetLabels;

  /**
   * Custom node or factory for the per-feature icon. Defaults to a
   * simple unicode check character so v1.0 looks unchanged. Pass `null`
   * to render no icon.
   */
  featureIcon?: React.ReactNode | ((feature: Feature) => React.ReactNode) | null;

  /** Optional inline style for the root grid (e.g. to inject CSS variables). */
  style?: React.CSSProperties;

  buttonText?: string;
  containerClassName?: string;
  cardClassName?: string;

  /** Per-subscription visual overrides keyed by `Subscription.id`. */
  subscriptionOverrides?: Record<string, SubscriptionOverride>;

  /**
   * Render a built-in friendly error notification when the API call fails.
   * Set `false` to suppress the UI and handle errors yourself via `onError`.
   * Default: `true`.
   */
  fallbackNotification?: boolean;

  onSubscribe?: (subscription: Subscription) => void;
  onError?: (error: Error, reason: ISubscribeErrorReason) => void;
  onLoaded?: (subscriptions: Subscription[]) => void;
}

const DEFAULT_ERROR_MESSAGES: Required<Record<ISubscribeErrorReason, string>> = {
  invalid_key: 'Invalid API key. Check your iSubscribe credentials.',
  unavailable: 'Subscription service is temporarily unavailable. Please try again later.',
  network: 'Network problem. Check your connection and try again.',
  unknown: 'Failed to load subscription plans.',
};

const DEFAULT_LABELS: Required<SubscriptionWidgetLabels> = {
  loading: 'Loading subscriptions...',
  error: 'Failed to load subscriptions',
  empty: 'No subscription plans available.',
  subscribe: 'Subscribe',
  sale: 'SALE',
  trial: 'Trial',
  trialNote: 'Free trials available on selected features',
  perPeriod: (duration) => `per ${duration}`,
  errorMessages: DEFAULT_ERROR_MESSAGES,
};

function cx(...names: Array<string | undefined | false>): string {
  return names.filter(Boolean).join(' ');
}

function formatMoney(
  amount: number,
  currency: string,
  locale?: string,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Unknown currency code or locale — fall back to the v1.0 format.
    return `${amount} ${currency}`;
  }
}

export const SubscriptionWidget = forwardRef<
  SubscriptionWidgetHandle,
  SubscriptionWidgetProps
>(function SubscriptionWidget(
  {
    apiKey,
    apiBaseUrl = 'https://api.isubscribe.com/api/v1/public/subscriptions',
    locale,
    classNames,
    labels,
    featureIcon,
    style,
    buttonText,
    containerClassName,
    cardClassName,
    subscriptionOverrides,
    fallbackNotification = true,
    onSubscribe,
    onError,
    onLoaded,
  },
  ref,
) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ err: Error; reason: ISubscribeErrorReason } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Stable refs so callback identity changes never trigger a re-fetch.
  const onLoadedRef = useRef(onLoaded);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
    onErrorRef.current = onError;
  }, [onLoaded, onError]);

  useImperativeHandle(
    ref,
    () => ({
      refetch: () => setReloadKey((k) => k + 1),
    }),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const run = async () => {
      let status: number | null = null;
      try {
        const response = await fetch(`${apiBaseUrl}/data`, {
          headers: { 'X-API-KEY': apiKey },
          signal: controller.signal,
        });
        status = response.status;
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data: Subscription[] = await response.json();
        if (controller.signal.aborted) return;
        setSubscriptions(data);
        onLoadedRef.current?.(data);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const e = err instanceof Error ? err : new Error('Unknown error');
        const reason = classifyError(status, e);
        setError({ err: e, reason });
        onErrorRef.current?.(e, reason);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [apiKey, apiBaseUrl, reloadKey]);

  const merged: Required<SubscriptionWidgetLabels> = {
    ...DEFAULT_LABELS,
    ...labels,
  };
  const buttonLabel = buttonText ?? merged.subscribe;

  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        className={cx(styles.loader, classNames?.loader)}
      >
        {merged.loading}
      </div>
    );
  }

  if (error) {
    if (!fallbackNotification) return null;
    const friendly =
      merged.errorMessages?.[error.reason] ??
      DEFAULT_ERROR_MESSAGES[error.reason] ??
      merged.error;
    return (
      <div role="alert" className={cx(styles.error, classNames?.error)}>
        {friendly}
      </div>
    );
  }

  if (!subscriptions.length) {
    return (
      <div className={cx(styles.empty, classNames?.empty)}>{merged.empty}</div>
    );
  }

  return (
    <div
      className={cx(
        styles.grid,
        containerClassName,
        classNames?.container,
      )}
      style={style}
    >
      {subscriptions.map((sub) => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          locale={locale}
          classNames={classNames}
          cardClassName={cardClassName}
          buttonLabel={buttonLabel}
          labels={merged}
          featureIcon={featureIcon}
          override={subscriptionOverrides?.[sub.id]}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  );
});

interface CardProps {
  subscription: Subscription;
  locale?: string;
  classNames?: Partial<Record<SubscriptionWidgetSlot, string>>;
  cardClassName?: string;
  buttonLabel: string;
  labels: Required<SubscriptionWidgetLabels>;
  featureIcon?: React.ReactNode | ((feature: Feature) => React.ReactNode) | null;
  override?: SubscriptionOverride;
  onSubscribe?: (sub: Subscription) => void;
}

const SubscriptionCard: React.FC<CardProps> = ({
  subscription: sub,
  locale,
  classNames,
  cardClassName,
  buttonLabel,
  labels,
  featureIcon,
  override,
  onSubscribe,
}) => {
  const originalPrice = sub.price.originalPrice;
  const effectivePrice = sub.effectivePrice ?? originalPrice;
  const currency = sub.effectiveCurrency ?? sub.price.currency;
  const duration = `${sub.price.duration.period} ${sub.price.duration.type.toLowerCase()}`;
  const isOnSale = sub.isOnSale && effectivePrice !== originalPrice;
  const titleId = `isw-title-${sub.id}`;

  const renderFeatureIcon = (feature: Feature): React.ReactNode => {
    if (featureIcon === null) return null;
    if (typeof featureIcon === 'function') return featureIcon(feature);
    if (featureIcon !== undefined) return featureIcon;
    return (
      <span
        aria-hidden="true"
        className={cx(styles.featureIcon, classNames?.featureIcon)}
      >
        ✓
      </span>
    );
  };

  return (
    <article
      aria-labelledby={titleId}
      className={cx(
        styles.card,
        cardClassName,
        classNames?.card,
        override?.className,
      )}
      style={override?.style}
    >
      {isOnSale && (
        <div className={cx(styles.saleBadge, classNames?.saleBadge)}>
          {labels.sale}
        </div>
      )}
      {override?.badge && (
        <div
          className={cx(
            styles.highlightBadge,
            classNames?.highlightBadge,
            override.badgeClassName,
          )}
          style={override.badgeStyle}
        >
          {override.badge}
        </div>
      )}
      <h3 id={titleId} className={cx(styles.title, classNames?.title)}>
        {sub.title}
      </h3>
      {sub.description && (
        <p className={cx(styles.description, classNames?.description)}>
          {sub.description}
        </p>
      )}
      <div className={cx(styles.price, classNames?.price)}>
        {formatMoney(effectivePrice, currency, locale)}
        {isOnSale && (
          <span
            className={cx(styles.originalPrice, classNames?.originalPrice)}
          >
            {formatMoney(originalPrice, currency, locale)}
          </span>
        )}
      </div>
      <div className={cx(styles.duration, classNames?.duration)}>
        {labels.perPeriod(duration)}
      </div>
      {sub.features && sub.features.length > 0 && (
        <ul className={cx(styles.features, classNames?.features)}>
          {sub.features.map((feature, idx) => (
            <li key={idx} className={classNames?.feature}>
              {renderFeatureIcon(feature)}
              <span className={styles.featureContent}>
                <span>
                  {feature.title}
                  {feature.hasTrial && (
                    <span
                      className={cx(styles.trialBadge, classNames?.trialBadge)}
                    >
                      {labels.trial}
                    </span>
                  )}
                </span>
                {feature.description && (
                  <span
                    className={cx(
                      styles.featureDescription,
                      classNames?.featureDescription,
                    )}
                  >
                    {feature.description}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {sub.features?.some((f) => f.hasTrial) && (
        <div className={cx(styles.trialNote, classNames?.trialNote)}>
          {labels.trialNote}
        </div>
      )}
      <button
        type="button"
        className={cx(
          styles.button,
          classNames?.button,
          override?.buttonClassName,
        )}
        style={override?.buttonStyle}
        onClick={() => onSubscribe?.(sub)}
      >
        {override?.buttonText ?? buttonLabel}
      </button>
    </article>
  );
};
