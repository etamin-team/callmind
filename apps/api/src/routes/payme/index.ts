import { FastifyPluginAsync } from "fastify";
import paymeRoutes from "./payme.routes.js";
import paymeMerchantRoutes from "./merchant.routes.js";
import paymeSubscribeRoutes from "./subscribe.routes.js";

const paymePlugin: FastifyPluginAsync = async (fastify) => {
  // Register checkout routes
  await fastify.register(paymeRoutes, { prefix: "/payme" });

  // Register Merchant API endpoint
  await fastify.register(paymeMerchantRoutes, { prefix: "/payme" });

  // Register Subscribe API endpoints
  await fastify.register(paymeSubscribeRoutes, { prefix: "/payme" });
};

export default paymePlugin;
