import { FastifyPluginAsync } from "fastify";
import paddleRoutes from "./paddle.routes.js";
import paymeWebhookRoutes from "./payme.routes.js";
import callWebhookRoutes from "./call-webhook.routes.js";

const webhooksRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(paddleRoutes);
  await fastify.register(paymeWebhookRoutes);
  await fastify.register(callWebhookRoutes);
};

export default webhooksRoutes;
