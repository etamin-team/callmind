import { FastifyPluginAsync } from "fastify";
import { externalCallService } from "../../services/external-call.service.js";

const scheduleRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /schedule - Schedule a call or campaign for later
  fastify.post("/", async (request, reply) => {
    try {
      const body = request.body as any;

      // Validate required fields
      if (!body.runAt) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "runAt is required",
        });
      }

      // Validate runAt is a valid future date (max 30 days ahead)
      const runAtDate = new Date(body.runAt);
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      if (isNaN(runAtDate.getTime()) || runAtDate <= now) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "runAt must be a valid future datetime",
        });
      }

      if (runAtDate > thirtyDaysFromNow) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "runAt must be within 30 days from now",
        });
      }

      // Determine if it's a call or campaign schedule
      const type = body.type || "call";

      if (type === "campaign") {
        // Campaign schedule validation
        if (
          !body.phones ||
          !Array.isArray(body.phones) ||
          body.phones.length === 0
        ) {
          return reply.status(400).send({
            error: "Bad Request",
            message: "phones array is required for campaign scheduling",
          });
        }

        if (!body.prompt) {
          return reply.status(400).send({
            error: "Bad Request",
            message: "prompt is required for campaign scheduling",
          });
        }

        const result = await externalCallService.schedule({
          type: "campaign",
          runAt: body.runAt,
          phones: body.phones,
          prompt: body.prompt,
          greetingPrompt: body.greetingPrompt,
          maxDuration: body.maxDuration,
          goodbyeMessage: body.goodbyeMessage,
          refusalPhrases: body.refusalPhrases,
          concurrency: body.concurrency,
          delayBetweenMs: body.delayBetweenMs,
          voiceConfig: body.voiceConfig,
        });

        return result;
      } else {
        // Single call schedule validation
        if (!body.phone) {
          return reply.status(400).send({
            error: "Bad Request",
            message: "phone is required for call scheduling",
          });
        }

        if (!body.prompt) {
          return reply.status(400).send({
            error: "Bad Request",
            message: "prompt is required for call scheduling",
          });
        }

        const result = await externalCallService.schedule({
          type: "call",
          runAt: body.runAt,
          phone: body.phone,
          prompt: body.prompt,
          greetingPrompt: body.greetingPrompt,
          maxDuration: body.maxDuration,
          goodbyeMessage: body.goodbyeMessage,
          refusalPhrases: body.refusalPhrases,
          voiceConfig: body.voiceConfig,
        });

        return result;
      }
    } catch (error: any) {
      console.error("Error scheduling:", error);
      return reply.status(500).send({
        error: "Failed to schedule",
        message: error.message,
      });
    }
  });

  // GET /schedules - List all pending scheduled items
  fastify.get("/", async (request, reply) => {
    try {
      const result = await externalCallService.getSchedules();
      return result;
    } catch (error: any) {
      console.error("Error getting schedules:", error);
      return reply.status(500).send({
        error: "Failed to get schedules",
        message: error.message,
      });
    }
  });

  // DELETE /schedule/:id - Cancel a scheduled item
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await externalCallService.cancelSchedule(id);
      return result;
    } catch (error: any) {
      console.error("Error canceling schedule:", error);
      return reply.status(500).send({
        error: "Failed to cancel schedule",
        message: error.message,
      });
    }
  });
};

export default scheduleRoutes;
