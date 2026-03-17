import { FastifyPluginAsync } from "fastify";
import { externalCallService } from "../../services/external-call.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /health - Quick health check (forward to external API)
  fastify.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
              uptime: { type: "number" },
            },
          },
        },
      },
    },
    async () => {
      try {
        // Forward to external API health check
        const externalHealth = await externalCallService.getHealth();
        return externalHealth;
      } catch (error) {
        // If external API is down, return local health
        return {
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          externalApi: "unavailable",
        };
      }
    },
  );

  // GET /health/deep - Full services health (Auth required, forward to external API)
  fastify.get(
    "/health/deep",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      try {
        // Forward to external API deep health check
        const externalHealth = await externalCallService.getDeepHealth();
        return externalHealth;
      } catch (error: any) {
        console.error("Error getting deep health:", error);
        return reply.status(500).send({
          error: "Failed to get deep health status",
          message: error.message,
        });
      }
    },
  );
};

export default healthRoutes;
