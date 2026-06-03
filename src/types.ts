interface Duration {
  period: number;
  type: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'FOREVER';
}

interface Price {
  originalPrice: number;
  currency: string;
  isDiscounted: boolean;
  duration: Duration;
}

export interface Feature {
  title: string;
  description?: string;
  tags?: string[];
  hasTrial?: boolean;
  trialDetails?: {
    duration: number;
    durationType: string;
    price: number;
    currency: string;
  } | null;
}

export type ISubscribeErrorReason =
  | "invalid_key"
  | "unavailable"
  | "network"
  | "unknown";

export interface Subscription {
  id: string;
  title: string;
  description?: string;
  price: Price;
  effectivePrice?: number;
  effectiveCurrency?: string;
  isOnSale?: boolean;
  saleEndDate?: string | null;
  features?: Feature[];
}
