import { FastifyPluginAsync } from "fastify";
import paddleRoutes from "./paddle.routes.js";
import freedompayWebhookRoutes from "./freedompay.routes.js";
import callWebhookRoutes from "./call-webhook.routes.js";

const webhooksRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(paddleRoutes);
  await fastify.register(freedompayWebhookRoutes);
  await fastify.register(callWebhookRoutes);
};

export default webhooksRoutes;
