import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";

const PAYME_API_URL = "https://checkout.paycom.uz";
const PAYME_API_TEST_URL = "https://checkout.test.paycom.uz";

const DEFAULT_PRICES = {
  starter_monthly: 108000,
  starter_yearly: 1032000,
  pro_monthly: 348000,
  pro_yearly: 3336000,
  business_monthly: 948000,
  business_yearly: 9096000,
};

const PRICE_IDS = {
  starter_monthly:
    parseInt(process.env.PAYME_STARTER_MONTHLY || "") ||
    DEFAULT_PRICES.starter_monthly,
  starter_yearly:
    parseInt(process.env.PAYME_STARTER_YEARLY || "") ||
    DEFAULT_PRICES.starter_yearly,
  pro_monthly:
    parseInt(process.env.PAYME_PRO_MONTHLY || "") || DEFAULT_PRICES.pro_monthly,
  pro_yearly:
    parseInt(process.env.PAYME_PRO_YEARLY || "") || DEFAULT_PRICES.pro_yearly,
  business_monthly:
    parseInt(process.env.PAYME_BUSINESS_MONTHLY || "") ||
    DEFAULT_PRICES.business_monthly,
  business_yearly:
    parseInt(process.env.PAYME_BUSINESS_YEARLY || "") ||
    DEFAULT_PRICES.business_yearly,
};

const CREDITS_PER_PLAN: Record<string, number> = {
  starter: 200,
  professional: 1000,
  business: 2000,
};

const getCredits = (plan: string): number => {
  return CREDITS_PER_PLAN[plan] || 0;
};

const paymeRoutes: FastifyPluginAsync = async (fastify) => {
  const isTestMode = config.NODE_ENV !== "production";
  const paymeBaseUrl = isTestMode ? PAYME_API_TEST_URL : PAYME_API_URL;

  fastify.post("/checkout/:plan", async (request, reply) => {
    try {
      const { plan } = request.params as { plan: string };
      const {
        yearly = false,
        userId,
        phone,
        recurring = false,
      } = request.body as {
        yearly?: boolean;
        userId?: string;
        phone?: string;
        recurring?: boolean;
      };

      if (!config.PAYME_MERCHANT_ID) {
        return reply
          .status(500)
          .send({ error: "Payme merchant not configured" });
      }

      const priceKey =
        `${plan}_${yearly ? "yearly" : "monthly"}` as keyof typeof PRICE_IDS;
      const amount = PRICE_IDS[priceKey];

      if (!amount) {
        return reply.status(400).send({ error: `Invalid plan: ${plan}` });
      }

      const amountInTiyins = amount * 100;
      const orderId = `${userId || "guest"}_${plan}_${yearly ? "yearly" : "monthly"}_${Date.now()}`;

      const callbackUrl = config.PAYME_CALLBACK_URL
        ? `${config.PAYME_CALLBACK_URL}?order_id=${orderId}&plan=${plan}&yearly=${yearly}&userId=${userId || ""}`
        : undefined;

      const formData = new URLSearchParams();
      formData.append("merchant", config.PAYME_MERCHANT_ID);
      formData.append("amount", amountInTiyins.toString());
      formData.append("account[order_id]", orderId);
      formData.append("account[phone]", phone || "");
      formData.append("account[user_id]", userId || "");
      formData.append("account[plan]", plan);
      formData.append("account[yearly]", yearly.toString());
      formData.append("account[recurring]", recurring.toString());
      formData.append("lang", "en");

      if (callbackUrl) {
        formData.append("callback", callbackUrl);
      }

      const description = `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan ${yearly ? "yearly" : "monthly"} - Callmind`;
      formData.append("description", description);

      const checkoutUrl = `${paymeBaseUrl}?${formData.toString()}`;

      fastify.log.info(
        {
          plan,
          yearly,
          amount: amountInTiyins,
          orderId,
        },
        "Payme checkout initiated",
      );

      return reply.send({
        checkoutUrl,
        orderId,
        amount: amountInTiyins,
        amountDisplay: amount,
        currency: "UZS",
        plan,
        yearly,
      });
    } catch (error) {
      fastify.log.error(error, "Failed to create Payme checkout");
      return reply.status(500).send({ error: "Failed to create checkout" });
    }
  });

  fastify.get("/prices", async (request, reply) => {
    return reply.send({
      prices: {
        starter_monthly: {
          amount: PRICE_IDS.starter_monthly,
          amountTiyins: PRICE_IDS.starter_monthly * 100,
          credits: getCredits("starter"),
        },
        starter_yearly: {
          amount: PRICE_IDS.starter_yearly,
          amountTiyins: PRICE_IDS.starter_yearly * 100,
          credits: getCredits("starter") * 12,
        },
        pro_monthly: {
          amount: PRICE_IDS.pro_monthly,
          amountTiyins: PRICE_IDS.pro_monthly * 100,
          credits: getCredits("professional"),
        },
        pro_yearly: {
          amount: PRICE_IDS.pro_yearly,
          amountTiyins: PRICE_IDS.pro_yearly * 100,
          credits: getCredits("professional") * 12,
        },
        business_monthly: {
          amount: PRICE_IDS.business_monthly,
          amountTiyins: PRICE_IDS.business_monthly * 100,
          credits: getCredits("business"),
        },
        business_yearly: {
          amount: PRICE_IDS.business_yearly,
          amountTiyins: PRICE_IDS.business_yearly * 100,
          credits: getCredits("business") * 12,
        },
      },
    });
  });

  fastify.post("/create-card-token", async (request, reply) => {
    try {
      const { card_number, expiry_month, expiry_year, cardholder_name } =
        request.body as {
          card_number: string;
          expiry_month: number;
          expiry_year: number;
          cardholder_name?: string;
        };

      if (!config.PAYME_MERCHANT_ID || !config.PAYME_SECRET_KEY) {
        return reply.status(500).send({ error: "Payme not configured" });
      }

      const response = await fetch(`${paymeBaseUrl}/api/cards/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.PAYME_SECRET_KEY}`,
        },
        body: JSON.stringify({
          card_number,
          expiry_month,
          expiry_year,
          cardholder_name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        fastify.log.error({ error: data }, "Failed to create card token");
        return reply
          .status(response.status)
          .send({ error: data.error || "Failed to create card token" });
      }

      return reply.send(data);
    } catch (error) {
      fastify.log.error(error, "Failed to create card token");
      return reply.status(500).send({ error: "Failed to create card token" });
    }
  });

  fastify.post("/verify-card", async (request, reply) => {
    try {
      const { card_token, verification_code } = request.body as {
        card_token: string;
        verification_code: string;
      };

      if (!config.PAYME_MERCHANT_ID || !config.PAYME_SECRET_KEY) {
        return reply.status(500).send({ error: "Payme not configured" });
      }

      const response = await fetch(`${paymeBaseUrl}/api/cards/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.PAYME_SECRET_KEY}`,
        },
        body: JSON.stringify({
          token: card_token,
          code: verification_code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        fastify.log.error({ error: data }, "Failed to verify card");
        return reply
          .status(response.status)
          .send({ error: data.error || "Failed to verify card" });
      }

      return reply.send(data);
    } catch (error) {
      fastify.log.error(error, "Failed to verify card");
      return reply.status(500).send({ error: "Failed to verify card" });
    }
  });

  fastify.post("/create-recurring", async (request, reply) => {
    try {
      const {
        card_token,
        userId,
        plan,
        yearly = false,
      } = request.body as {
        card_token: string;
        userId: string;
        plan: string;
        yearly?: boolean;
      };

      if (!config.PAYME_MERCHANT_ID || !config.PAYME_SECRET_KEY) {
        return reply.status(500).send({ error: "Payme not configured" });
      }

      const priceKey =
        `${plan}_${yearly ? "yearly" : "monthly"}` as keyof typeof PRICE_IDS;
      const amount = PRICE_IDS[priceKey];

      if (!amount) {
        return reply.status(400).send({ error: `Invalid plan: ${plan}` });
      }

      const amountInTiyins = amount * 100;

      const response = await fetch(`${paymeBaseUrl}/api/receipts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.PAYME_SECRET_KEY}`,
        },
        body: JSON.stringify({
          amount: amountInTiyins,
          currency: "UZS",
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan ${yearly ? "yearly" : "monthly"} - Callmind`,
          account: {
            user_id: userId,
            plan,
            yearly: yearly.toString(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        fastify.log.error({ error: data }, "Failed to create receipt");
        return reply
          .status(response.status)
          .send({ error: data.error || "Failed to create receipt" });
      }

      return reply.send(data);
    } catch (error) {
      fastify.log.error(error, "Failed to create recurring payment");
      return reply
        .status(500)
        .send({ error: "Failed to create recurring payment" });
    }
  });

  fastify.post("/pay-receipt", async (request, reply) => {
    try {
      const { receipt_id, card_token } = request.body as {
        receipt_id: string;
        card_token: string;
      };

      if (!config.PAYME_MERCHANT_ID || !config.PAYME_SECRET_KEY) {
        return reply.status(500).send({ error: "Payme not configured" });
      }

      const response = await fetch(`${paymeBaseUrl}/api/receipts/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.PAYME_SECRET_KEY}`,
        },
        body: JSON.stringify({
          receipt_id,
          card_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        fastify.log.error({ error: data }, "Failed to pay receipt");
        return reply
          .status(response.status)
          .send({ error: data.error || "Failed to pay receipt" });
      }

      return reply.send(data);
    } catch (error) {
      fastify.log.error(error, "Failed to pay receipt");
      return reply.status(500).send({ error: "Failed to pay receipt" });
    }
  });
};

export default paymeRoutes;
