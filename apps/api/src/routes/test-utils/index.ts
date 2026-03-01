import { FastifyPluginAsync } from "fastify";
import { UserModel } from "@repo/db";
import { CreateUserSchema } from "@repo/types";

const testUtilsRoutes: FastifyPluginAsync = async (fastify) => {
  // Create or get test user for Payme sandbox
  fastify.post("/payme/test-user", async (request, reply) => {
    try {
      const { user_id } = request.body as { user_id?: string };

      if (!user_id) {
        return reply.status(400).send({ error: "user_id is required" });
      }

      // Check if user exists
      let user = await UserModel.findOne({
        $or: [{ _id: user_id }, { clerkUserId: user_id }],
      });

      if (!user) {
        // Create test user
        const testUser = new UserModel({
          email: `test_${user_id}@payme.uz`,
          name: `Payme Test User ${user_id}`,
          clerkUserId: user_id,
          plan: "free",
          credits: 0,
        });

        await testUser.save();
        user = testUser;
        fastify.log.info({ userId: user_id }, "Created test Payme user");
      }

      return reply.send({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          clerkUserId: user.clerkUserId,
          plan: user.plan,
          credits: user.credits,
        },
      });
    } catch (error: any) {
      fastify.log.error(error, "Failed to create/get test user");

      // If duplicate key error, try to find existing user
      if (error.code === 11000 || error.code === 11001) {
        const { user_id } = request.body as { user_id?: string };
        const user = await UserModel.findOne({ clerkUserId: user_id });
        if (user) {
          return reply.send({
            success: true,
            user: {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              clerkUserId: user.clerkUserId,
              plan: user.plan,
              credits: user.credits,
            },
          });
        }
      }

      return reply.status(500).send({ error: "Failed to create test user" });
    }
  });

  // List test users (for debugging)
  fastify.get("/payme/test-users", async (request, reply) => {
    try {
      const users = await UserModel.find({
        clerkUserId: /^user_/, // Test users start with user_
      }).select("-__v");

      return reply.send({
        success: true,
        users: users.map((user) => ({
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          clerkUserId: user.clerkUserId,
          plan: user.plan,
          credits: user.credits,
        })),
      });
    } catch (error) {
      fastify.log.error(error, "Failed to list test users");
      return reply.status(500).send({ error: "Failed to list test users" });
    }
  });

  // Delete test users (for cleanup)
  fastify.delete("/payme/test-users", async (request, reply) => {
    try {
      const result = await UserModel.deleteMany({
        clerkUserId: /^user_/, // Test users start with user_
      });

      fastify.log.info({ deleted: result.deletedCount }, "Deleted test users");

      return reply.send({
        success: true,
        deleted: result.deletedCount,
      });
    } catch (error) {
      fastify.log.error(error, "Failed to delete test users");
      return reply.status(500).send({ error: "Failed to delete test users" });
    }
  });
};

export default testUtilsRoutes;
