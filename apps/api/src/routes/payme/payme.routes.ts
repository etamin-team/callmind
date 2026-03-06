import { FastifyPluginAsync } from "fastify";
import crypto from "crypto";
import { config } from "../../config/environment.js";
import {
  PRICING_CONFIG,
  PRICE_PER_PLAN_MONTHLY,
  PRICE_PER_PLAN_YEARLY,
  getCreditsForPlan,
} from "@repo/types";

const PRICE_IDS = {
  starter_monthly:
    parseInt(process.env.PAYME_STARTER_MONTHLY || "") ||
    PRICE_PER_PLAN_MONTHLY.starter,
  starter_yearly:
    parseInt(process.env.PAYME_STARTER_YEARLY || "") ||
    PRICE_PER_PLAN_YEARLY.starter,
  pro_monthly:
    parseInt(process.env.PAYME_PRO_MONTHLY || "") ||
    PRICE_PER_PLAN_MONTHLY.professional,
  pro_yearly:
    parseInt(process.env.PAYME_PRO_YEARLY || "") ||
    PRICE_PER_PLAN_YEARLY.professional,
  business_monthly:
    parseInt(process.env.PAYME_BUSINESS_MONTHLY || "") ||
    PRICE_PER_PLAN_MONTHLY.business,
  business_yearly:
    parseInt(process.env.PAYME_BUSINESS_YEARLY || "") ||
    PRICE_PER_PLAN_YEARLY.business,
};

const PLAN_PRODUCT_IDS: Record<string, string | undefined> = {
  starter: config.PAYME_STARTER_PRODUCT_ID,
  pro: config.PAYME_PRO_PRODUCT_ID,
  professional: config.PAYME_PRO_PRODUCT_ID,
  business: config.PAYME_BUSINESS_PRODUCT_ID,
};

const paymeRoutes: FastifyPluginAsync = async (fastify) => {
  const isTestMode = config.NODE_ENV !== "production";

  fastify.post("/checkout/:plan", async (request, reply) => {
    try {
      const { plan } = request.params as { plan: string };
      const {
        yearly = false,
        userId,
        phone,
        lang = "ru",
      } = request.body as {
        yearly?: boolean;
        userId?: string;
        phone?: string;
        lang?: string;
      };

      if (!config.PAYME_MERCHANT_ID) {
        return reply.status(500).send({ error: "Payme not configured" });
      }

      const priceKey =
        `${plan}_${yearly ? "yearly" : "monthly"}` as keyof typeof PRICE_IDS;
      const amount = PRICE_IDS[priceKey];

      if (!amount) {
        return reply.status(400).send({ error: `Invalid plan: ${plan}` });
      }

      const orderId = `${userId || "guest"}_${plan}_${yearly ? "yearly" : "monthly"}_${Date.now()}`;

      fastify.log.info(
        {
          plan,
          yearly,
          amount,
          orderId,
          userId,
        },
        "Payme checkout initiated",
      );

      // Generate Payme checkout link
      // Format: m={merchant_id};l={lang};ac.user_id={user_id};ac.product_id={product_id};a={amount_in_tiyins};c={callback_url}
      const amountInTiyins = amount * 100;
      const callbackUrl =
        config.PAYME_CALLBACK_URL ||
        "https://your-domain.com/api/payme/callback";

      // Build account params
      let accountParams = `ac.user_id=${userId || "guest"}`;

      // Add product_id based on the plan (required if configured in Payme dashboard)
      const productId = PLAN_PRODUCT_IDS[plan];
      if (productId) {
        accountParams += `;ac.product_id=${productId}`;
      }

      const data = `m=${config.PAYME_MERCHANT_ID};l=${lang};${accountParams};a=${amountInTiyins};c=${callbackUrl}`;
      const encoded = Buffer.from(data).toString("base64");
      const paymeLink = `https://checkout.paycom.uz/${encoded}`;

      const returnUrl = `${callbackUrl.replace("/callback", "/success")}?order_id=${orderId}&plan=${plan}&yearly=${yearly}`;

      return reply.send({
        paymeLink,
        checkoutUrl: paymeLink, // Alias for compatibility
        orderId,
        amount: amountInTiyins,
        currency: "UZS",
        plan,
        yearly,
        lang,
        return_url: returnUrl,
      });
    } catch (error) {
      fastify.log.error(error, "Failed to create Payme checkout");
      return reply.status(500).send({ error: "Failed to create checkout" });
    }
  });

  fastify.get("/prices", async (request, reply) => {
    const starterYearly =
      PRICE_IDS.starter_yearly ?? (PRICE_PER_PLAN_YEARLY.starter || 0);
    const proYearly =
      PRICE_IDS.pro_yearly ?? (PRICE_PER_PLAN_YEARLY.professional || 0);
    const businessYearly =
      PRICE_IDS.business_yearly ?? (PRICE_PER_PLAN_YEARLY.business || 0);

    return reply.send({
      prices: {
        starter_monthly: {
          amount: PRICE_IDS.starter_monthly ?? PRICING_CONFIG.starter.priceUzs,
          amountTiyins:
            (PRICE_IDS.starter_monthly ?? PRICING_CONFIG.starter.priceUzs) *
            100,
          credits: getCreditsForPlan("starter"),
        },
        starter_yearly: {
          amount: starterYearly,
          amountTiyins: starterYearly * 100,
          credits: getCreditsForPlan("starter") * 12,
        },
        pro_monthly: {
          amount: PRICE_IDS.pro_monthly ?? PRICING_CONFIG.professional.priceUzs,
          amountTiyins:
            (PRICE_IDS.pro_monthly ?? PRICING_CONFIG.professional.priceUzs) *
            100,
          credits: getCreditsForPlan("professional"),
        },
        pro_yearly: {
          amount: proYearly,
          amountTiyins: proYearly * 100,
          credits: getCreditsForPlan("professional") * 12,
        },
        business_monthly: {
          amount:
            PRICE_IDS.business_monthly ?? PRICING_CONFIG.business.priceUzs,
          amountTiyins:
            (PRICE_IDS.business_monthly ?? PRICING_CONFIG.business.priceUzs) *
            100,
          credits: getCreditsForPlan("business"),
        },
        business_yearly: {
          amount: businessYearly,
          amountTiyins: businessYearly * 100,
          credits: getCreditsForPlan("business") * 12,
        },
      },
    });
  });
};

export default paymeRoutes;
