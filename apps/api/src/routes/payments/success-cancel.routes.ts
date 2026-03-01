import { FastifyPluginAsync } from "fastify";

const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  // Payme success callback
  fastify.get("/success", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Payment was successful. You can close this window.",
    });
  });

  // Payme failure/cancel callback
  fastify.get("/cancel", async (request, reply) => {
    return reply.send({
      success: false,
      message: "Payment was cancelled or failed. Please try again.",
    });
  });
};

export default paymentRoutes;
