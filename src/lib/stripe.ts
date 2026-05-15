import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "3 product checks per day",
      "Basic analysis",
      "2 alternatives shown",
    ],
  },
  pro: {
    name: "Pro",
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited product checks",
      "Deep analysis with more detail",
      "Up to 5 alternatives",
      "PDF export",
      "Full history",
      "Priority processing",
    ],
  },
} as const;
