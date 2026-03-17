import { FastifyPluginAsync } from "fastify";
import { externalCallService } from "../../services/external-call.service.js";

const campaignRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /campaign - Start a bulk campaign
  fastify.post("/", async (request, reply) => {
    try {
      const body = request.body as any;

      // Validate required fields
      if (
        !body.phones ||
        !Array.isArray(body.phones) ||
        body.phones.length === 0
      ) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "phones array is required and must not be empty",
        });
      }

      if (!body.prompt) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "prompt is required",
        });
      }

      // Set our webhook URL to receive campaign.completed events
      const webhookUrl =
        body.webhookUrl ||
        `${process.env.API_URL || "http://localhost:3001"}/api/webhooks/external/campaign-completed`;

      const result = await externalCallService.startCampaign({
        phones: body.phones,
        prompt: body.prompt,
        greetingPrompt: body.greetingPrompt,
        maxDuration: body.maxDuration,
        goodbyeMessage: body.goodbyeMessage,
        refusalPhrases: body.refusalPhrases,
        concurrency: body.concurrency,
        delayBetweenMs: body.delayBetweenMs,
        webhookUrl: webhookUrl,
        voiceConfig: body.voiceConfig,
      });

      return result;
    } catch (error: any) {
      console.error("Error starting campaign:", error);
      return reply.status(500).send({
        error: "Failed to start campaign",
        message: error.message,
      });
    }
  });

  // GET /campaigns - List all campaigns
  fastify.get("/", async (request, reply) => {
    try {
      const result = await externalCallService.getCampaigns();
      return result;
    } catch (error: any) {
      console.error("Error getting campaigns:", error);
      return reply.status(500).send({
        error: "Failed to get campaigns",
        message: error.message,
      });
    }
  });

  // GET /campaign/:id - Campaign status + per-contact results
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await externalCallService.getCampaign(id);
      return result;
    } catch (error: any) {
      console.error("Error getting campaign:", error);
      return reply.status(500).send({
        error: "Failed to get campaign",
        message: error.message,
      });
    }
  });

  // POST /campaign/:id/pause - Pause a running campaign
  fastify.post("/:id/pause", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await externalCallService.pauseCampaign(id);
      return result;
    } catch (error: any) {
      console.error("Error pausing campaign:", error);
      return reply.status(500).send({
        error: "Failed to pause campaign",
        message: error.message,
      });
    }
  });

  // POST /campaign/:id/resume - Resume a paused campaign
  fastify.post("/:id/resume", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await externalCallService.resumeCampaign(id);
      return result;
    } catch (error: any) {
      console.error("Error resuming campaign:", error);
      return reply.status(500).send({
        error: "Failed to resume campaign",
        message: error.message,
      });
    }
  });

  // DELETE /campaign/:id - Cancel a campaign
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await externalCallService.cancelCampaign(id);
      return result;
    } catch (error: any) {
      console.error("Error canceling campaign:", error);
      return reply.status(500).send({
        error: "Failed to cancel campaign",
        message: error.message,
      });
    }
  });
};

export default campaignRoutes;
