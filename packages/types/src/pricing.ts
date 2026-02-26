export const PRICING_CONFIG = {
  free: {
    name: "Free",
    credits: 2,
    priceUzs: 0,
    priceUsd: 0,
    features: ["2 calls/month", "1 AI agent", "Basic analytics"],
    maxAgents: 1,
    superRealisticCalls: 0,
  },
  starter: {
    name: "Starter",
    credits: 200,
    priceUzs: 108000,
    priceUsd: 9,
    features: [
      "200 calls/month",
      "3 AI agents",
      "All languages",
      "Call transcripts",
      "Email support",
    ],
    maxAgents: 3,
    superRealisticCalls: 0,
  },
  professional: {
    name: "Professional",
    credits: 1000,
    priceUzs: 348000,
    priceUsd: 29,
    features: [
      "1000 calls/month",
      "40 super realistic calls",
      "10 AI agents",
      "Premium voices",
      "CRM integrations",
    ],
    maxAgents: 10,
    superRealisticCalls: 40,
  },
  business: {
    name: "Business",
    credits: 2000,
    priceUzs: 948000,
    priceUsd: 79,
    features: [
      "2000 calls/month",
      "90 super realistic calls",
      "25 AI agents",
      "Custom integrations",
      "Dedicated support",
    ],
    maxAgents: 25,
    superRealisticCalls: 90,
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
  starter: Math.floor(PRICING_CONFIG.starter.priceUzs * 12 * 0.8),
  professional: Math.floor(PRICING_CONFIG.professional.priceUzs * 12 * 0.8),
  business: Math.floor(PRICING_CONFIG.business.priceUzs * 12 * 0.8),
};

export const CREDIT_COST = {
  callMinute: 1,
  superRealisticCall: 5,
};

export const PREMIUM_VOICES = [
  "rachel",
  "drew",
  "clyde",
  "mimi",
  "josh",
  "fin",
  "nova-2",
  "eleven-monolingual",
] as const;

export function isPremiumVoice(voice?: string): boolean {
  if (!voice) return false;
  return PREMIUM_VOICES.some((v) =>
    voice.toLowerCase().includes(v.toLowerCase()),
  );
}

export function calculateCallCost(
  duration: number,
  isPremium: boolean = false,
): number {
  const minutes = Math.ceil(duration / 60);
  return isPremium
    ? minutes * CREDIT_COST.superRealisticCall
    : minutes * CREDIT_COST.callMinute;
}

export function getCreditsForPlan(plan: string): number {
  return CREDITS_PER_PLAN[plan] ?? 2;
}

export function getPriceForPlan(plan: string, yearly: boolean): number {
  if (yearly) {
    return PRICE_PER_PLAN_YEARLY[plan] ?? 0;
  }
  return PRICE_PER_PLAN_MONTHLY[plan] ?? 0;
}

export function getSuperRealisticCallsForPlan(plan: string): number {
  return (
    PRICING_CONFIG[plan as keyof typeof PRICING_CONFIG]?.superRealisticCalls ??
    0
  );
}

export type PlanType = keyof typeof PRICING_CONFIG;
export const PLAN_TYPES = Object.keys(PRICING_CONFIG) as PlanType[];
