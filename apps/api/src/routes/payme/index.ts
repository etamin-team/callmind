import { FastifyPluginAsync } from "fastify";
import paymeRoutes from "./payme.routes.js";
import paymeMerchantRoutes from "./merchant.routes.js";

const paymePlugin: FastifyPluginAsync = async (fastify) => {
  // Register checkout routes (prefix added by auto-load from folder name)
  await fastify.register(paymeRoutes);

  // Register Merchant API endpoint (prefix added by auto-load from folder name)
  await fastify.register(paymeMerchantRoutes);
};

export default paymePlugin;
