import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";
import { UserModel } from "@repo/db";
import crypto from "crypto";

const CREDITS_PER_PLAN: Record<string, number> = {
  starter: 200,
  professional: 1000,
  business: 2000,
};

function parseXmlResponse(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<(\w+)>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/\1>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[1] && match[2] !== undefined) {
      result[match[1]] = match[2];
    }
  }
  return result;
}

function verifyFreedompaySignature(
  params: Record<string, string>,
  secretKey: string,
  receivedSig: string,
): boolean {
  const sortedKeys = Object.keys(params)
    .filter((key) => key !== "pg_sig")
    .sort();

  const values = sortedKeys.map((key) => params[key]);
  values.push(secretKey);

  const signatureString = values.join(";");
  const computedSig = crypto
    .createHash("md5")
    .update(signatureString)
    .digest("hex");

  return computedSig === receivedSig;
}

const freedompayWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/webhooks/freedompay", async (request, reply) => {
    try {
      const contentType = request.headers["content-type"] || "";
      let params: Record<string, string> = {};
      let receivedSig = "";

      if (contentType.includes("application/x-www-form-urlencoded")) {
        const body = request.body as Record<string, string>;
        receivedSig = body.pg_sig || "";
        params = { ...body };
      } else if (contentType.includes("application/xml")) {
        const rawBody = (request as any).rawBody || "";
        params = parseXmlResponse(rawBody);
        receivedSig = params.pg_sig || "";
      } else {
        const body = request.body as Record<string, string>;
        receivedSig = body.pg_sig || "";
        params = { ...body };
      }

      if (config.FREEDOMPAY_SECRET_KEY && receivedSig) {
        const isValid = verifyFreedompaySignature(
          params,
          config.FREEDOMPAY_SECRET_KEY,
          receivedSig,
        );
        if (!isValid) {
          fastify.log.warn(
            { received: receivedSig },
            "Invalid FreedomPay webhook signature",
          );
          return reply.status(401).send({ error: "Invalid signature" });
        }
      }

      const status = params.pg_status;
      const orderId = params.pg_order_id || "";
      const paymentId = params.pg_payment_id || "";
      const recurringProfileId = params.pg_recurring_profile || "";
      const recurringExpiry = params.pg_recurring_profile_expiry_date || "";

      const orderParts = orderId.split("_");
      const userId = orderParts[0] || "";
      const plan = orderParts[1] || "";
      const yearlyStr = orderParts[2] || "";
      const yearly = yearlyStr === "yearly";

      if (status === "ok") {
        fastify.log.info(
          {
            userId,
            plan,
            yearly,
            orderId,
            paymentId,
            recurringProfileId,
            amount: params.pg_amount,
          },
          "FreedomPay payment successful",
        );

        if (!userId || userId === "guest" || !plan) {
          fastify.log.warn(
            { orderId, params },
            "Missing userId or plan in FreedomPay webhook",
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
          fastify.log.warn({ userId }, "User not found for FreedomPay payment");
          return reply.status(200).send({ received: true });
        }

        const credits = CREDITS_PER_PLAN[plan] || 0;
        const yearlyMultiplier = yearly ? 12 : 1;
        const totalCredits = credits * yearlyMultiplier;

        if (totalCredits > 0) {
          user.credits = (user.credits || 0) + totalCredits;
          user.freedompayCustomerId = paymentId;
          if (recurringProfileId) {
            user.freedompayRecurringProfile = recurringProfileId;
            user.freedompaySubscriptionPlan = plan;
          }
          if (recurringExpiry) {
            user.freedompayRecurringExpiry = new Date(recurringExpiry);
          }
          await user.save();

          fastify.log.info(
            {
              userId: user.id,
              creditsAdded: totalCredits,
              plan,
              recurringProfileId,
            },
            "Credits granted from FreedomPay payment",
          );
        }

        return reply.status(200).send({ received: true });
      }

      if (status === "error" || status === "failed") {
        fastify.log.info(
          { userId, orderId, errorCode: params.pg_error_code },
          "FreedomPay payment failed",
        );
        return reply.status(200).send({ received: true });
      }

      if (status === "canceled") {
        fastify.log.info({ userId, orderId }, "FreedomPay payment canceled");
        return reply.status(200).send({ received: true });
      }

      fastify.log.info(
        { status, orderId, params },
        "Received FreedomPay webhook",
      );

      return reply.status(200).send({ received: true });
    } catch (error) {
      fastify.log.error(error, "FreedomPay webhook processing failed");
      return reply.status(500).send({ error: "Webhook processing failed" });
    }
  });

  fastify.get("/webhooks/freedompay", async (request, reply) => {
    return reply.status(200).send({
      status: "ok",
      message: "FreedomPay webhook endpoint is active",
      supported_events: [
        "payment.success",
        "payment.failed",
        "payment.canceled",
      ],
    });
  });
};

export default freedompayWebhookRoutes;
