const USD_TO_UZS_RATE = 12130.41;

const PLAN_PRICE_USD = {
  starter: 59,
  professional: 172,
  business: 345,
} as const;

const toUzs = (usd: number) => Math.round(usd * USD_TO_UZS_RATE);

export const PRICING_CONFIG = {
  free: {
    name: "Free",
    credits: 2,
    priceUzs: 0,
    priceUsd: 0,
    features: ["2 calls/month", "1 AI agent", "Basic analytics"],
    maxAgents: 1,
  },
  starter: {
    name: "Starter",
    credits: 200,
    priceUzs: toUzs(PLAN_PRICE_USD.starter),
    priceUsd: PLAN_PRICE_USD.starter,
    features: [
      "200 calls/month",
      "3 AI agents",
      "All languages",
      "Call transcripts",
      "Email support",
    ],
    maxAgents: 3,
  },
  professional: {
    name: "Professional",
    credits: 1000,
    priceUzs: toUzs(PLAN_PRICE_USD.professional),
    priceUsd: PLAN_PRICE_USD.professional,
    features: [
      "1000 calls/month",
      "40 super realistic calls",
      "10 AI agents",
      "Premium voices",
      "CRM integrations",
    ],
    maxAgents: 10,
  },
  business: {
    name: "Business",
    credits: 2000,
    priceUzs: toUzs(PLAN_PRICE_USD.business),
    priceUsd: PLAN_PRICE_USD.business,
    features: [
      "2000 calls/month",
      "90 super realistic calls",
      "25 AI agents",
      "Custom integrations",
      "Dedicated support",
    ],
    maxAgents: 25,
  },
} as const;

export const CREDITS_PER_PLAN: Record<string, number> = {
  free: PRICING_CONFIG.free.credits,
  starter: PRICING_CONFIG.starter.credits,
  professional: PRICING_CONFIG.professional.credits,
  business: PRICING_CONFIG.business.credits,
};

export const PRICE_PER_PLAN_MONTHLY: Record<string, number> = {
  starter: PRICING_CONFIG.starter.priceUzs,
  professional: PRICING_CONFIG.professional.priceUzs,
  business: PRICING_CONFIG.business.priceUzs,
};

export const PRICE_PER_PLAN_YEARLY: Record<string, number> = {
  starter: toUzs(PLAN_PRICE_USD.starter * 10),
  professional: toUzs(PLAN_PRICE_USD.professional * 10),
  business: toUzs(PLAN_PRICE_USD.business * 10),
};

export const CREDIT_COST = {
  callMinute: 1,
  superRealisticCall: 5,
};

export function getCreditsForPlan(plan: string): number {
  return CREDITS_PER_PLAN[plan] ?? 2;
}

export function getPriceForPlan(plan: string, yearly: boolean): number {
  if (yearly) {
    return PRICE_PER_PLAN_YEARLY[plan] ?? 0;
  }
  return PRICE_PER_PLAN_MONTHLY[plan] ?? 0;
}

export type PlanType = keyof typeof PRICING_CONFIG;
export const PLAN_TYPES = Object.keys(PRICING_CONFIG) as PlanType[];
