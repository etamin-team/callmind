import { FastifyPluginAsync } from "fastify";
import crypto from "crypto";
import { config } from "../../config/environment.js";
import { UserModel, PaymeCardTokenModel } from "@repo/db";
import { getCreditsForPlan } from "@repo/types";

const PAYME_API_BASE_URL =
  config.NODE_ENV === "production"
    ? "https://checkout.paycom.uz/api"
    : "https://checkout.test.paycom.uz/api";

interface PaymeSubscribeRequest {
  id: string | number;
  method: string;
  params: any;
}

interface PaymeSubscribeResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: string;
  };
}

function getAuthHeader(): string {
  const paymeId = config.PAYME_MERCHANT_ID;
  const paymeKey = config.PAYME_KEY;

  if (config.NODE_ENV !== "production") {
    return `${paymeId}:${paymeKey}`;
  }

  return `${paymeId}:${paymeKey}`;
}

async function callPaymeSubscribeApi(
  method: string,
  params: any,
): Promise<any> {
  const requestId = Date.now();

  const response = await fetch(`${PAYME_API_BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth": getAuthHeader(),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId,
      method,
      params,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payme API error: ${response.status} - ${errorText}`);
  }

  const data: PaymeSubscribeResponse = await response.json();

  if (data.error) {
    throw data.error;
  }

  return data.result;
}

async function cardsCreate(
  number: string,
  expire: string,
  save: boolean = true,
  customer: string,
): Promise<any> {
  return callPaymeSubscribeApi("cards.create", {
    card: { number, expire },
    save,
    customer,
  });
}

async function cardsCheck(token: string): Promise<any> {
  return callPaymeSubscribeApi("cards.check", { token });
}

async function cardsRemove(token: string): Promise<any> {
  return callPaymeSubscribeApi("cards.remove", { token });
}

async function receiptsCreate(
  amount: number,
  account: any,
  description?: string,
): Promise<any> {
  return callPaymeSubscribeApi("receipts.create", {
    amount,
    account,
    description,
  });
}

async function receiptsPay(
  id: string,
  token: string,
  payer?: any,
): Promise<any> {
  return callPaymeSubscribeApi("receipts.pay", {
    id,
    token,
    payer,
  });
}

const paymeSubscribeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/subscribe/cards/create", async (request, reply) => {
    try {
      const {
        number,
        expire,
        save = true,
        customer,
      } = request.body as {
        number: string;
        expire: string;
        save?: boolean;
        customer: string;
      };

      if (!config.PAYME_MERCHANT_ID || !config.PAYME_KEY) {
        return reply.status(500).send({ error: "Payme not configured" });
      }

      if (!number || !expire || !customer) {
        return reply
          .status(400)
          .send({ error: "Missing required fields: number, expire, customer" });
      }

      const result = await cardsCreate(number, expire, save, customer);

      fastify.log.info(
        {
          customer,
          cardNumber: number.slice(-4),
          save,
          recurrent: result.card.recurrent,
        },
        "Payme card token created",
      );

      return reply.send({
        success: true,
        card: {
          number: result.card.number,
          expire: result.card.expire,
          token: result.card.token,
          recurrent: result.card.recurrent,
          verify: result.card.verify,
        },
      });
    } catch (error: any) {
      fastify.log.error(error, "Failed to create Payme card token");
      return reply.status(500).send({
        error: error.message || "Failed to create card token",
      });
    }
  });

  fastify.post("/subscribe/cards/verify", async (request, reply) => {
    try {
      const { token, code } = request.body as {
        token: string;
        code: string;
      };

      if (!token || !code) {
        return reply
          .status(400)
          .send({ error: "Missing required fields: token, code" });
      }

      const result = await callPaymeSubscribeApi("cards.verify", {
        token,
        code,
      });

      fastify.log.info({ token }, "Payme card verified");

      return reply.send({
        success: true,
        verify: result.card.verify,
      });
    } catch (error: any) {
      fastify.log.error(error, "Failed to verify Payme card");
      return reply.status(500).send({
        error: error.message || "Failed to verify card",
      });
    }
  });

  fastify.post("/subscribe/cards/check", async (request, reply) => {
    try {
      const { token } = request.body as { token: string };

      if (!token) {
        return reply.status(400).send({ error: "Missing token" });
      }

      const result = await cardsCheck(token);

      return reply.send({
        success: true,
        card: result.card,
      });
    } catch (error: any) {
      fastify.log.error(error, "Failed to check Payme card token");
      return reply.status(500).send({
        error: error.message || "Failed to check card token",
      });
    }
  });

  fastify.delete("/subscribe/cards/:token", async (request, reply) => {
    try {
      const { token } = request.params as { token: string };

      if (!token) {
        return reply.status(400).send({ error: "Missing token" });
      }

      await cardsRemove(token);

      await PaymeCardTokenModel.deleteOne({ token });

      fastify.log.info({ token }, "Payme card token removed");

      return reply.send({ success: true });
    } catch (error: any) {
      fastify.log.error(error, "Failed to remove Payme card token");
      return reply.status(500).send({
        error: error.message || "Failed to remove card token",
      });
    }
  });

  fastify.post("/subscribe/save-card", async (request, reply) => {
    try {
      const { userId, token, cardNumber, cardExpire } = request.body as {
        userId: string;
        token: string;
        cardNumber: string;
        cardExpire: string;
      };

      if (!userId || !token || !cardNumber || !cardExpire) {
        return reply.status(400).send({
          error: "Missing required fields",
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      const existingCard = await PaymeCardTokenModel.findOne({
        userId,
        token,
      });
      if (existingCard) {
        return reply.status(400).send({
          error: "Card token already saved for this user",
        });
      }

      const cardToken = new PaymeCardTokenModel({
        userId,
        token,
        cardNumber,
        cardExpire,
        verify: true,
        recurrent: true,
        isDefault: false,
      });

      await cardToken.save();

      fastify.log.info({ userId, token }, "Payme card token saved");

      return reply.send({
        success: true,
        savedCard: {
          id: cardToken.id,
          cardNumber: cardToken.cardNumber,
          cardExpire: cardToken.cardExpire,
          isDefault: cardToken.isDefault,
        },
      });
    } catch (error: any) {
      fastify.log.error(error, "Failed to save Payme card token");
      return reply.status(500).send({
        error: error.message || "Failed to save card token",
      });
    }
  });

  fastify.get("/subscribe/cards/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const cards = await PaymeCardTokenModel.find({ userId }).sort({
        createdAt: -1,
      });

      const formattedCards = cards.map((card) => ({
        id: card.id,
        cardNumber: card.cardNumber,
        cardExpire: card.cardExpire,
        isDefault: card.isDefault,
        createdAt: card.createdAt,
      }));

      return reply.send({ success: true, cards: formattedCards });
    } catch (error: any) {
      fastify.log.error(error, "Failed to get Payme card tokens");
      return reply.status(500).send({
        error: error.message || "Failed to get saved cards",
      });
    }
  });

  fastify.post("/subscribe/subscription/create", async (request, reply) => {
    try {
      const {
        userId,
        plan,
        yearly = false,
      } = request.body as {
        userId: string;
        plan: string;
        yearly?: boolean;
      };

      if (!userId || !plan) {
        return reply
          .status(400)
          .send({ error: "Missing required fields: userId, plan" });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      const defaultCard = await PaymeCardTokenModel.findOne({
        userId,
        isDefault: true,
      });

      if (!defaultCard) {
        return reply.status(400).send({
          error: "No default card found. Please save a card first.",
        });
      }

      const credits = getCreditsForPlan(plan);
      const yearlyMultiplier = yearly ? 12 : 1;
      const totalCredits = credits * yearlyMultiplier;
      const amount = credits * (yearly ? 12 : 1) * 100;

      const orderId = `${userId}_${plan}_${yearly ? "yearly" : "monthly"}_${Date.now()}`;

      const receipt = await receiptsCreate(
        amount,
        {
          order_id: orderId,
        },
        `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan ${yearly ? "yearly" : "monthly"}`,
      );

      const paidReceipt = await receiptsPay(
        receipt.receipt._id,
        defaultCard.token,
        {
          phone: user.email,
        },
      );

      user.credits = (user.credits || 0) + totalCredits;
      user.paymeSubscriptionPlan = plan;
      user.paymeSubscriptionActive = true;
      user.paymeSubscriptionExpiry = yearly
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await user.save();

      fastify.log.info(
        {
          userId: user.id,
          plan,
          yearly,
          creditsAdded: totalCredits,
          expiry: user.paymeSubscriptionExpiry,
        },
        "Payme subscription created",
      );

      return reply.send({
        success: true,
        subscription: {
          plan,
          yearly,
          credits: totalCredits,
          expiry: user.paymeSubscriptionExpiry,
          receiptId: paidReceipt.receipt._id,
        },
      });
    } catch (error: any) {
      fastify.log.error(error, "Failed to create Payme subscription");
      return reply.status(500).send({
        error: error.message || "Failed to create subscription",
      });
    }
  });

  fastify.post("/subscribe/subscription/renew", async (request, reply) => {
    try {
      const { userId } = request.body as { userId: string };

      const user = await UserModel.findById(userId);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      if (!user.paymeSubscriptionActive || !user.paymeSubscriptionPlan) {
        return reply.status(400).send({
          error: "No active subscription found",
        });
      }

      const defaultCard = await PaymeCardTokenModel.findOne({
        userId,
        isDefault: true,
      });

      if (!defaultCard) {
        return reply.status(400).send({
          error: "No default card found",
        });
      }

      const plan = user.paymeSubscriptionPlan;
      const credits = getCreditsForPlan(plan);
      const isYearly =
        user.paymeSubscriptionExpiry &&
        user.paymeSubscriptionExpiry.getTime() - Date.now() >
          180 * 24 * 60 * 60 * 1000
          ? true
          : false;
      const totalCredits = credits * (isYearly ? 12 : 1);
      const amount = credits * (isYearly ? 12 : 1) * 100;

      const orderId = `${userId}_${plan}_${isYearly ? "yearly" : "monthly"}_${Date.now()}`;

      const receipt = await receiptsCreate(amount, {
        order_id: orderId,
      });

      const paidReceipt = await receiptsPay(
        receipt.receipt._id,
        defaultCard.token,
        {
          phone: user.email,
        },
      );

      user.credits = (user.credits || 0) + totalCredits;
      user.paymeSubscriptionExpiry =
        isYearly && user.paymeSubscriptionExpiry
          ? new Date(
              user.paymeSubscriptionExpiry.getTime() +
                365 * 24 * 60 * 60 * 1000,
            )
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await user.save();

      fastify.log.info(
        {
          userId: user.id,
          plan,
          creditsAdded: totalCredits,
          expiry: user.paymeSubscriptionExpiry,
        },
        "Payme subscription renewed",
      );

      return reply.send({
        success: true,
        subscription: {
          plan,
          credits: totalCredits,
          expiry: user.paymeSubscriptionExpiry,
          receiptId: paidReceipt.receipt._id,
        },
      });
    } catch (error: any) {
      fastify.log.error(error, "Failed to renew Payme subscription");
      return reply.status(500).send({
        error: error.message || "Failed to renew subscription",
      });
    }
  });

  fastify.post("/subscribe/subscription/cancel", async (request, reply) => {
    try {
      const { userId } = request.body as { userId: string };

      const user = await UserModel.findById(userId);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      user.paymeSubscriptionActive = false;
      await user.save();

      fastify.log.info({ userId }, "Payme subscription cancelled");

      return reply.send({ success: true });
    } catch (error: any) {
      fastify.log.error(error, "Failed to cancel Payme subscription");
      return reply.status(500).send({
        error: error.message || "Failed to cancel subscription",
      });
    }
  });

  fastify.get("/subscribe/subscription/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const user = await UserModel.findById(userId);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({
        success: true,
        subscription: user.paymeSubscriptionActive
          ? {
              plan: user.paymeSubscriptionPlan,
              active: user.paymeSubscriptionActive,
              expiry: user.paymeSubscriptionExpiry,
            }
          : null,
      });
    } catch (error: any) {
      fastify.log.error(error, "Failed to get Payme subscription status");
      return reply.status(500).send({
        error: error.message || "Failed to get subscription status",
      });
    }
  });

  fastify.get("/subscribe", async (request, reply) => {
    return reply.send({
      status: "ok",
      message: "Payme Subscribe API endpoint is active",
      supported_methods: [
        "cards.create",
        "cards.get_verify_code",
        "cards.verify",
        "cards.check",
        "cards.remove",
        "receipts.create",
        "receipts.pay",
      ],
    });
  });
};

export default paymeSubscribeRoutes;
