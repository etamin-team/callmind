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

      const amountInTiyins = amount * 100;
      const orderId = `${userId || "guest"}_${plan}_${yearly ? "yearly" : "monthly"}_${Date.now()}`;

      // Generate merchant transaction ID
      const merchantTransactionId = crypto.randomUUID();

      fastify.log.info(
        {
          plan,
          yearly,
          amount: amountInTiyins,
          orderId,
          merchantTransactionId,
          userId,
        },
        "Payme checkout initiated",
      );

      // Return payment parameters for frontend to create Payme checkout
      return reply.send({
        merchantId: config.PAYME_MERCHANT_ID,
        orderId,
        merchantTransactionId,
        amount: amountInTiyins,
        amountDisplay: amount,
        currency: "UZS",
        plan,
        yearly,
        lang,
        // Return URL for redirect after payment
        return_url: `${config.PAYME_CALLBACK_URL || ""}/payments/success`,
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
