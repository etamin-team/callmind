import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";

interface ContactFormBody {
  firstName: string;
  lastName: string;
  business: string;
  businessType: string;
  phoneNumber: string;
}

const contactRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: ContactFormBody }>(
    "/waitlist-contact",
    {
      schema: {
        tags: ["contact"],
        description: "Submit waitlist contact form and send to Telegram",
        body: {
          type: "object",
          required: [
            "firstName",
            "lastName",
            "business",
            "businessType",
            "phoneNumber",
          ],
          properties: {
            firstName: { type: "string", minLength: 1, maxLength: 100 },
            lastName: { type: "string", minLength: 1, maxLength: 100 },
            business: { type: "string", minLength: 1, maxLength: 200 },
            businessType: { type: "string", minLength: 1, maxLength: 100 },
            phoneNumber: { type: "string", minLength: 5, maxLength: 20 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { firstName, lastName, business, businessType, phoneNumber } =
        request.body;

      const TELEGRAM_BOT_TOKEN = config.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = config.TELEGRAM_CHAT_ID;

      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        fastify.log.error("Telegram bot token or chat ID is not configured");
        return reply.code(500).send({
          success: false,
          message: "Service configuration error",
        });
      }

      const message = `
🎯 *New Waitlist Contact*

👤 *Name:* ${firstName} ${lastName}
🏢 *Business:* ${business}
📋 *Type:* ${businessType}
📞 *Phone:* ${phoneNumber}

Submitted at: ${new Date().toLocaleString("en-US", {
        timeZone: "UTC",
        dateStyle: "full",
        timeStyle: "short",
      })}
      `.trim();

      try {
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        const response = await fetch(telegramUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          fastify.log.error({ error: errorText }, "Telegram API error");
          return reply.code(500).send({
            success: false,
            message: "Failed to send message",
          });
        }

        return reply.code(200).send({
          success: true,
          message: "Thank you for your interest! We will contact you soon.",
        });
      } catch (error) {
        fastify.log.error({ error }, "Error sending to Telegram");
        return reply.code(500).send({
          success: false,
          message: "Failed to process your request",
        });
      }
    },
  );
};

export default contactRoutes;
