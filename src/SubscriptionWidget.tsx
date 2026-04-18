import React, { useEffect, useState } from 'react';
import type { Subscription } from './types';
import styles from './SubscriptionWidget.module.css';

export interface SubscriptionWidgetProps {
  apiKey: string;
  apiBaseUrl?: string;
  containerClassName?: string;
  cardClassName?: string;
  buttonText?: string;
  onSubscribe?: (subscription: Subscription) => void;
  onError?: (error: Error) => void;
  onLoaded?: (subscriptions: Subscription[]) => void;
}

export const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({
  apiKey,
  apiBaseUrl = 'https://api.isubscribe.com/api/v1/public/subscriptions',
  containerClassName,
  cardClassName,
  buttonText = 'Subscribe',
  onSubscribe,
  onError,
  onLoaded,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/data`, {
          headers: { 'X-API-KEY': apiKey },
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setSubscriptions(data);
        onLoaded?.(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSubscriptions();
  }, [apiKey, apiBaseUrl, onLoaded, onError]);

  const handleSubscribe = (sub: Subscription) => {
    onSubscribe?.(sub);
  };

  if (loading) {
    return <div className={styles.loader}>Loading subscriptions...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        Failed to load subscriptions: {error.message}
      </div>
    );
  }

  if (!subscriptions.length) {
    return <div className={styles.empty}>No subscription plans available.</div>;
  }

  return (
    <div className={`${styles.grid} ${containerClassName || ''}`}>
      {subscriptions.map((sub) => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          cardClassName={cardClassName}
          buttonText={buttonText}
          onSubscribe={handleSubscribe}
        />
      ))}
    </div>
  );
};

interface CardProps {
  subscription: Subscription;
  cardClassName?: string;
  buttonText: string;
  onSubscribe: (sub: Subscription) => void;
}

const SubscriptionCard: React.FC<CardProps> = ({
  subscription: sub,
  cardClassName,
  buttonText,
  onSubscribe,
}) => {
  const originalPrice = sub.price.originalPrice;
  const effectivePrice = sub.effectivePrice ?? originalPrice;
  const currency = sub.effectiveCurrency ?? sub.price.currency;
  const duration = `${sub.price.duration.period} ${sub.price.duration.type.toLowerCase()}`;
  const isOnSale = sub.isOnSale && effectivePrice !== originalPrice;

  return (
    <div className={`${styles.card} ${cardClassName || ''}`}>
      {isOnSale && <div className={styles.saleBadge}>SALE</div>}
      <h3 className={styles.title}>{sub.title}</h3>
      {sub.description && (
        <p className={styles.description}>{sub.description}</p>
      )}
      <div className={styles.price}>
        {effectivePrice} {currency}
        {isOnSale && (
          <span className={styles.originalPrice}>
            {originalPrice} {currency}
          </span>
        )}
      </div>
      <div className={styles.duration}>per {duration}</div>
      {sub.features && sub.features.length > 0 && (
        <ul className={styles.features}>
          {sub.features.map((feature, idx) => (
            <li key={idx}>
              ✅ {feature.title}
              {feature.hasTrial && (
                <span className={styles.trialBadge}>Trial</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {sub.features?.some((f) => f.hasTrial) && (
        <div className={styles.trialNote}>
          ✨ Free trials available on selected features
        </div>
      )}
      <button className={styles.button} onClick={() => onSubscribe(sub)}>
        {buttonText}
      </button>
    </div>
  );
};
