export interface Feature {
  title: string;
  hasTrial?: boolean;
  trialDetails?: {
    duration: number;
    durationType: string;
    price: number;
    currency: string;
  };
}

export interface Subscription {
  id: string;
  title: string;
  description?: string;
  price: {
    originalPrice: number;
    currency: string;
    duration: {
      period: number;
      type: string;
    };
  };
  effectivePrice?: number;
  effectiveCurrency?: string;
  isOnSale?: boolean;
  saleEndDate?: string | null;
  features?: Feature[];
}
