import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";
import {
  PRICING_CONFIG,
  PRICE_PER_PLAN_MONTHLY,
  PRICE_PER_PLAN_YEARLY,
  getCreditsForPlan,
} from "@repo/types";

const PRICE_IDS = {
  starter_monthly: PRICE_PER_PLAN_MONTHLY.starter,
  starter_yearly: PRICE_PER_PLAN_YEARLY.starter,
  pro_monthly: PRICE_PER_PLAN_MONTHLY.professional,
  pro_yearly: PRICE_PER_PLAN_YEARLY.professional,
  business_monthly: PRICE_PER_PLAN_MONTHLY.business,
  business_yearly: PRICE_PER_PLAN_YEARLY.business,
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

      const callbackUrlBase =
        config.PAYME_CALLBACK_URL || "https://your-domain.com";
      const returnUrl = `${callbackUrlBase}/payments/success?order_id=${orderId}&plan=${plan}&yearly=${yearly}`;

      // Amount must be in tiyins (1 UZS = 100 tiyin)
      const amountTiyins = amount * 100;

      // Get the product_id from the Payme merchant dashboard mapping
      const productId = PLAN_PRODUCT_IDS[plan] || "1";

      // Build the Payme checkout URL using the official base64-encoded format:
      // https://checkout.paycom.uz/BASE64(m=MERCHANT_ID;ac.KEY=VALUE;a=AMOUNT;c=CALLBACK;l=LANG)
      // Account fields must match what's configured in the Payme dashboard: user_id + product_id
      const paramParts = [
        `m=${config.PAYME_MERCHANT_ID}`,
        `ac.user_id=${userId || "guest"}`,
        `ac.product_id=${productId}`,
        `ac.order_id=${orderId}`,
        `a=${amountTiyins}`,
        `c=${returnUrl}`,
        `l=${lang || "ru"}`,
        `ct=15000`,
      ];

      const paramString = paramParts.join(";");
      const encoded = Buffer.from(paramString).toString("base64");
      // Use checkout.paycom.uz for production mode
      const paymeLink = `https://checkout.paycom.uz/${encoded}`;

      fastify.log.info(
        {
          paymeLink,
          paramString,
          amountTiyins,
          orderId,
          productId,
        },
        "Payme checkout link generated",
      );

      return reply.send({
        paymeLink,
        checkoutUrl: paymeLink,
        orderId,
        amount: amountTiyins,
        currency: "UZS",
        plan,
        yearly,
        lang,
        return_url: returnUrl,
        merchant_id: config.PAYME_MERCHANT_ID,
        account: {
          user_id: userId || "guest",
          product_id: productId,
        },
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
