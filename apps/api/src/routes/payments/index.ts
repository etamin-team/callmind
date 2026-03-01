import { FastifyPluginAsync } from "fastify";
import paymentsRoutes from "./payments.routes.js";
import successCancelRoutes from "./success-cancel.routes.js";

const paymentPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(paymentsRoutes);
  await fastify.register(successCancelRoutes);
};

export default paymentPlugin;
