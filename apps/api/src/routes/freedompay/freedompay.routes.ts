import { FastifyPluginAsync } from "fastify";
import crypto from "crypto";
import { config } from "../../config/environment.js";

const FREEDOMPAY_API_URL = "https://api.freedompay.uz";

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
    parseInt(process.env.FREEDOMPAY_STARTER_MONTHLY || "") ||
    DEFAULT_PRICES.starter_monthly,
  starter_yearly:
    parseInt(process.env.FREEDOMPAY_STARTER_YEARLY || "") ||
    DEFAULT_PRICES.starter_yearly,
  pro_monthly:
    parseInt(process.env.FREEDOMPAY_PRO_MONTHLY || "") ||
    DEFAULT_PRICES.pro_monthly,
  pro_yearly:
    parseInt(process.env.FREEDOMPAY_PRO_YEARLY || "") ||
    DEFAULT_PRICES.pro_yearly,
  business_monthly:
    parseInt(process.env.FREEDOMPAY_BUSINESS_MONTHLY || "") ||
    DEFAULT_PRICES.business_monthly,
  business_yearly:
    parseInt(process.env.FREEDOMPAY_BUSINESS_YEARLY || "") ||
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

function generateFreedompaySignature(
  params: Record<string, string | number>,
  secretKey: string,
): string {
  const sortedKeys = Object.keys(params)
    .filter((key) => key !== "pg_sig")
    .sort();

  const values = sortedKeys.map((key) => String(params[key]));
  values.push(secretKey);

  const signatureString = values.join(";");
  return crypto.createHash("md5").update(signatureString).digest("hex");
}

const freedompayRoutes: FastifyPluginAsync = async (fastify) => {
  const isTestMode = config.NODE_ENV !== "production";

  fastify.post("/checkout/:plan", async (request, reply) => {
    try {
      const { plan } = request.params as { plan: string };
      const {
        yearly = false,
        userId,
        phone,
      } = request.body as {
        yearly?: boolean;
        userId?: string;
        phone?: string;
      };

      if (!config.FREEDOMPAY_MERCHANT_ID || !config.FREEDOMPAY_SECRET_KEY) {
        return reply.status(500).send({ error: "FreedomPay not configured" });
      }

      const priceKey =
        `${plan}_${yearly ? "yearly" : "monthly"}` as keyof typeof PRICE_IDS;
      const amount = PRICE_IDS[priceKey];

      if (!amount) {
        return reply.status(400).send({ error: `Invalid plan: ${plan}` });
      }

      const amountInTiyins = amount * 100;
      const orderId = `${userId || "guest"}_${plan}_${yearly ? "yearly" : "monthly"}_${Date.now()}`;

      const recurringLifetime = yearly ? 12 : 1;

      const params: Record<string, string | number> = {
        pg_merchant_id: config.FREEDOMPAY_MERCHANT_ID,
        pg_amount: amountInTiyins,
        pg_order_id: orderId,
        pg_description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan ${yearly ? "yearly" : "monthly"} - Callmind`,
        pg_salt: crypto.randomBytes(16).toString("hex"),
        pg_recurring_start: 1,
        pg_recurring_lifetime: recurringLifetime,
        pg_currency: "UZS",
        pg_testing_mode: isTestMode ? 1 : 0,
        pg_user_id: userId || "guest",
        pg_user_contact_email: "",
        pg_user_phone: phone || "",
      };

      if (config.FREEDOMPAY_CALLBACK_URL) {
        params.pg_result_url = config.FREEDOMPAY_CALLBACK_URL;
      }

      const signature = generateFreedompaySignature(
        params,
        config.FREEDOMPAY_SECRET_KEY,
      );
      params.pg_sig = signature;

      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value));
      }

      const response = await fetch(`${FREEDOMPAY_API_URL}/init_payment.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const responseText = await response.text();

      if (!response.ok) {
        fastify.log.error(
          { status: response.status, body: responseText },
          "FreedomPay init_payment failed",
        );
        return reply
          .status(response.status)
          .send({ error: "Failed to initialize payment" });
      }

      const redirectUrlMatch = responseText.match(
        /<pg_redirect_url>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pg_redirect_url>/,
      );
      const paymentIdMatch = responseText.match(
        /<pg_payment_id>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pg_payment_id>/,
      );
      const statusMatch = responseText.match(
        /<pg_status>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pg_status>/,
      );

      const redirectUrl = redirectUrlMatch ? redirectUrlMatch[1] : null;
      const paymentId = paymentIdMatch ? paymentIdMatch[1] : null;
      const status = statusMatch ? statusMatch[1] : null;

      if (status !== "ok" || !redirectUrl) {
        fastify.log.error(
          { responseText, status, redirectUrl },
          "FreedomPay response parsing failed",
        );
        return reply
          .status(500)
          .send({ error: "Failed to parse FreedomPay response" });
      }

      fastify.log.info(
        {
          plan,
          yearly,
          amount: amountInTiyins,
          orderId,
          paymentId,
        },
        "FreedomPay checkout initiated",
      );

      return reply.send({
        checkoutUrl: redirectUrl,
        orderId,
        paymentId,
        amount: amountInTiyins,
        amountDisplay: amount,
        currency: "UZS",
        plan,
        yearly,
      });
    } catch (error) {
      fastify.log.error(error, "Failed to create FreedomPay checkout");
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

  fastify.post("/recurring/pay", async (request, reply) => {
    try {
      const { recurringProfileId, amount, orderId, description } =
        request.body as {
          recurringProfileId: string;
          amount: number;
          orderId: string;
          description?: string;
        };

      if (!config.FREEDOMPAY_MERCHANT_ID || !config.FREEDOMPAY_SECRET_KEY) {
        return reply.status(500).send({ error: "FreedomPay not configured" });
      }

      if (!recurringProfileId) {
        return reply
          .status(400)
          .send({ error: "Recurring profile ID is required" });
      }

      const params: Record<string, string | number> = {
        pg_merchant_id: config.FREEDOMPAY_MERCHANT_ID,
        pg_recurring_profile: recurringProfileId,
        pg_order_id: orderId,
        pg_amount: amount,
        pg_description: description || "Recurring payment - Callmind",
        pg_salt: crypto.randomBytes(16).toString("hex"),
      };

      const signature = generateFreedompaySignature(
        params,
        config.FREEDOMPAY_SECRET_KEY,
      );
      params.pg_sig = signature;

      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value));
      }

      const response = await fetch(
        `${FREEDOMPAY_API_URL}/make_recurring_payment.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        },
      );

      const responseText = await response.text();

      if (!response.ok) {
        fastify.log.error(
          { status: response.status, body: responseText },
          "FreedomPay recurring payment failed",
        );
        return reply
          .status(response.status)
          .send({ error: "Failed to process recurring payment" });
      }

      const statusMatch = responseText.match(
        /<pg_status>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pg_status>/,
      );
      const paymentIdMatch = responseText.match(
        /<pg_payment_id>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pg_payment_id>/,
      );

      const status = statusMatch ? statusMatch[1] : null;
      const paymentId = paymentIdMatch ? paymentIdMatch[1] : null;

      if (status !== "ok") {
        fastify.log.error(
          { responseText, status },
          "FreedomPay recurring payment returned error",
        );
        return reply
          .status(400)
          .send({ error: "Recurring payment failed", status });
      }

      fastify.log.info(
        {
          recurringProfileId,
          amount,
          orderId,
          paymentId,
        },
        "FreedomPay recurring payment successful",
      );

      return reply.send({
        success: true,
        paymentId,
        orderId,
        amount,
      });
    } catch (error) {
      fastify.log.error(error, "Failed to process recurring payment");
      return reply
        .status(500)
        .send({ error: "Failed to process recurring payment" });
    }
  });

  fastify.get("/status/:orderId", async (request, reply) => {
    try {
      const { orderId } = request.params as { orderId: string };

      if (!config.FREEDOMPAY_MERCHANT_ID || !config.FREEDOMPAY_SECRET_KEY) {
        return reply.status(500).send({ error: "FreedomPay not configured" });
      }

      const params: Record<string, string | number> = {
        pg_merchant_id: config.FREEDOMPAY_MERCHANT_ID,
        pg_order_id: orderId,
        pg_salt: crypto.randomBytes(16).toString("hex"),
      };

      const signature = generateFreedompaySignature(
        params,
        config.FREEDOMPAY_SECRET_KEY,
      );
      params.pg_sig = signature;

      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value));
      }

      const response = await fetch(`${FREEDOMPAY_API_URL}/get_status.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const responseText = await response.text();

      if (!response.ok) {
        fastify.log.error(
          { status: response.status, body: responseText },
          "FreedomPay status check failed",
        );
        return reply
          .status(response.status)
          .send({ error: "Failed to check payment status" });
      }

      return reply.send({ rawResponse: responseText });
    } catch (error) {
      fastify.log.error(error, "Failed to check payment status");
      return reply
        .status(500)
        .send({ error: "Failed to check payment status" });
    }
  });
};

export default freedompayRoutes;
