import { FastifyPluginAsync } from "fastify";
import { externalCallService } from "../../services/external-call.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { CallHistoryModel, UserModel } from "@repo/db";
import { config } from "../../config/environment.js";

const callRoutes: FastifyPluginAsync = async (fastify) => {
  const getPublicWebhookUrl = (path: string) => {
    if (!config.API_URL) {
      return undefined;
    }

    try {
      const apiUrl = new URL(config.API_URL);
      if (["localhost", "127.0.0.1"].includes(apiUrl.hostname)) {
        return undefined;
      }

      return new URL(path, `${apiUrl.origin}/`).toString();
    } catch {
      return undefined;
    }
  };

  const findOrCreateUserByClerkId = async (clerkUserId: string) => {
    let user = await UserModel.findOne({ clerkUserId });

    if (user) {
      return user;
    }

    user = await UserModel.create({
      clerkUserId,
      email: `user_${clerkUserId.slice(-8)}@placeholder.com`,
      name: "New User",
      plan: "free",
      credits: 2,
    });

    fastify.log.info(`Created new user for Clerk ID: ${clerkUserId}`);

    return user;
  };

  // ==================== Public Endpoints (No Auth) ====================

  // POST /call - Start a single AI outbound call
  fastify.post("/", async (request, reply) => {
    let creditedUserId: string | null = null;
    let deductedCredits = 0;
    let creditsRemaining: number | null = null;

    try {
      const body = request.body as any;

      // Validate required fields
      if (!body.phone || !body.prompt) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "phone and prompt are required fields",
        });
      }

      if (request.auth?.userId) {
        const user = await findOrCreateUserByClerkId(request.auth.userId);
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: user._id, credits: { $gte: 1 } },
          { $inc: { credits: -1 } },
          { new: true },
        );

        if (!updatedUser) {
          return reply.status(400).send({
            error: "Insufficient credits",
            message: "You need at least 1 credit to start a call",
          });
        }

        creditedUserId = request.auth.userId;
        deductedCredits = 1;
        creditsRemaining = updatedUser.credits ?? 0;
      }

      // Set our webhook URL to receive call.ended events
      const webhookUrl =
        body.webhookUrl ||
        getPublicWebhookUrl("/api/webhooks/external/call-ended");

      const result = await externalCallService.startCall({
        phone: body.phone,
        prompt: body.prompt,
        greetingPrompt: body.greetingPrompt,
        maxDuration: body.maxDuration,
        goodbyeMessage: body.goodbyeMessage,
        refusalPhrases: body.refusalPhrases,
        webhookUrl,
        voiceConfig: body.voiceConfig,
      });

      try {
        await CallHistoryModel.create({
          callSid: result.callSid,
          phone: body.phone,
          prompt: body.prompt,
          status: "ringing",
          direction: "outbound",
          startedAt: new Date(),
          userId: request.auth?.userId || "system",
          orgId: request.auth?.orgId || null,
          agentId: body.agentId || null,
        });
      } catch (dbError) {
        fastify.log.error(dbError, "Failed to persist outbound call history");
      }

      return {
        ...result,
        creditsCharged: deductedCredits,
        creditsRemaining,
      };
    } catch (error: any) {
      if (creditedUserId && deductedCredits > 0) {
        try {
          await UserModel.findOneAndUpdate(
            { clerkUserId: creditedUserId },
            { $inc: { credits: deductedCredits } },
          );
        } catch (refundError) {
          fastify.log.error(refundError, "Failed to refund call credits");
        }
      }

      console.error("Error starting call:", error);
      return reply.status(500).send({
        error: "Failed to start call",
        message: error.message,
      });
    }
  });

  // GET /call/:sid - Live call status + transcript
  fastify.get("/:sid", async (request, reply) => {
    try {
      const { sid } = request.params as { sid: string };
      const result = await externalCallService.getCallStatus(sid);
      return result;
    } catch (error: any) {
      console.error("Error getting call status:", error);
      return reply.status(500).send({
        error: "Failed to get call status",
        message: error.message,
      });
    }
  });

  // DELETE /call/:sid - Hang up an active call
  fastify.delete("/:sid", async (request, reply) => {
    try {
      const { sid } = request.params as { sid: string };
      const result = await externalCallService.hangUpCall(sid);

      // Update our database
      await CallHistoryModel.findOneAndUpdate(
        { callSid: sid },
        { status: "completed", endedAt: new Date() },
      );

      return result;
    } catch (error: any) {
      console.error("Error hanging up call:", error);
      return reply.status(500).send({
        error: "Failed to hang up call",
        message: error.message,
      });
    }
  });

  // ==================== Protected Endpoints (Clerk Auth) ====================

  // GET /call/:sid/result - Full result from DB after call ends (Auth required)
  fastify.get(
    "/:sid/result",
    { preHandler: requireAuth },
    async (request, reply) => {
      try {
        const { sid } = request.params as { sid: string };
        const result = await externalCallService.getCallResult(sid);
        return result;
      } catch (error: any) {
        console.error("Error getting call result:", error);
        return reply.status(500).send({
          error: "Failed to get call result",
          message: error.message,
        });
      }
    },
  );

  // GET /calls/recent - Recent call history list (Auth required)
  fastify.get(
    "/recent",
    { preHandler: requireAuth },
    async (request, reply) => {
      try {
        const { limit = "50" } = request.query as { limit?: string };
        const result = await externalCallService.getRecentCalls(
          parseInt(limit),
        );
        return result;
      } catch (error: any) {
        console.error("Error getting recent calls:", error);
        return reply.status(500).send({
          error: "Failed to get recent calls",
          message: error.message,
        });
      }
    },
  );
};

export default callRoutes;
