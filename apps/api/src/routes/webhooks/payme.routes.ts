import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";
import { UserModel } from "@repo/db";
import crypto from "crypto";

const CREDITS_PER_PLAN: Record<string, number> = {
  starter: 200,
  professional: 1000,
  business: 2000,
};

const paymeWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/webhooks/payme", async (request, reply) => {
    try {
      const signature = request.headers["x-payme-sign"] as string | undefined;

      const rawBody = (request as any).rawBody || JSON.stringify(request.body);

      if (config.PAYME_SECRET_KEY && signature) {
        const hash = crypto
          .createHmac("sha256", config.PAYME_SECRET_KEY)
          .update(rawBody)
          .digest("hex");

        if (hash !== signature) {
          fastify.log.warn(
            { received: signature, computed: hash },
            "Invalid Payme webhook signature",
          );
          return reply.status(401).send({ error: "Invalid signature" });
        }
      }

      const body = request.body as any;

      if (body.action === "payment" && body.state === "success") {
        const account = body.account || {};
        const userId = account.user_id;
        const plan = account.plan;
        const yearly = account.yearly === "true";
        const orderId = account.order_id;

        fastify.log.info(
          {
            userId,
            plan,
            yearly,
            orderId,
            amount: body.amount,
          },
          "Payme payment successful",
        );

        if (!userId || !plan) {
          fastify.log.warn(
            { account },
            "Missing userId or plan in Payme webhook",
          );
          return reply.status(200).send({ received: true });
        }

        let user = null;
        try {
          user = await UserModel.findById(userId);
        } catch (e) {
          fastify.log.warn({ userId }, "Invalid userId format");
        }

        if (!user) {
          fastify.log.warn({ userId }, "User not found for Payme payment");
          return reply.status(200).send({ received: true });
        }

        const credits = CREDITS_PER_PLAN[plan] || 0;
        const yearlyMultiplier = yearly ? 12 : 1;
        const totalCredits = credits * yearlyMultiplier;

        if (totalCredits > 0) {
          user.credits = (user.credits || 0) + totalCredits;
          user.paymeCustomerId = orderId;
          user.paymePhone = account.phone;
          await user.save();

          fastify.log.info(
            {
              userId: user.id,
              creditsAdded: totalCredits,
              plan,
            },
            "Credits granted from Payme payment",
          );
        }

        return reply.status(200).send({ received: true });
      }

      if (body.action === "payment" && body.state === "canceled") {
        const account = body.account || {};
        const userId = account.user_id;

        fastify.log.info(
          { userId, orderId: account.order_id },
          "Payme payment canceled",
        );

        return reply.status(200).send({ received: true });
      }

      if (body.action === "verify") {
        const account = body.account || {};
        const userId = account.user_id;
        const cardToken = body.card?.token;
        const cardRecurrent = body.card?.recurrent;

        if (userId && cardToken) {
          let user = null;
          try {
            user = await UserModel.findById(userId);
          } catch (e) {
            fastify.log.warn(
              { userId },
              "Invalid userId format for card verification",
            );
          }

          if (user) {
            user.paymeCardToken = cardToken;
            user.paymeCardRecurrent = cardRecurrent || false;
            await user.save();

            fastify.log.info(
              { userId, cardRecurrent },
              "Card linked for recurring payments",
            );
          }
        }

        return reply.status(200).send({ received: true });
      }

      fastify.log.info(
        { action: body.action, state: body.state },
        "Received Payme webhook",
      );

      return reply.status(200).send({ received: true });
    } catch (error) {
      fastify.log.error(error, "Payme webhook processing failed");
      return reply.status(500).send({ error: "Webhook processing failed" });
    }
  });

  fastify.get("/webhooks/payme", async (request, reply) => {
    return reply.status(200).send({
      status: "ok",
      message: "Payme webhook endpoint is active",
      supported_events: ["payment.success", "payment.canceled", "card.verify"],
    });
  });
};

export default paymeWebhookRoutes;
