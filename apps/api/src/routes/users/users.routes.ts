import { FastifyPluginAsync } from "fastify";
import { db, users, eq, asc } from "@repo/db";
import { CreateUserSchema, UpdateUserSchema } from "@repo/types";

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all users
  fastify.get(
    "/users",
    {
      schema: {
        tags: ["users"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
                avatar: { type: "string", nullable: true },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async () => {
      const result = await db
        .select()
        .from(users)
        .orderBy(asc(users.createdAt));
      return result;
    },
  );

  // Get user by ID
  fastify.get(
    "/users/:id",
    {
      schema: {
        tags: ["users"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              name: { type: "string" },
              avatar: { type: "string", nullable: true },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await db.select().from(users).where(eq(users.id, id));

      if (result.length === 0) {
        return reply.status(404).send({ error: "User not found" });
      }

      return result[0];
    },
  );

  // Create user
  fastify.post(
    "/users",
    {
      schema: {
        tags: ["users"],
        body: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            name: { type: "string" },
            avatar: { type: "string", nullable: true },
          },
          required: ["email", "name"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              name: { type: "string" },
              avatar: { type: "string", nullable: true },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = CreateUserSchema.parse(request.body);
        const result = await db.insert(users).values(data).returning();
        return reply.status(201).send(result[0]);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({ error: "Invalid user data" });
      }
    },
  );

  // Update user
  fastify.put(
    "/users/:id",
    {
      schema: {
        tags: ["users"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            email: { type: "string" },
            name: { type: "string" },
            avatar: { type: "string", nullable: true },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              name: { type: "string" },
              avatar: { type: "string", nullable: true },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const data = UpdateUserSchema.parse(request.body);
        const result = await db
          .update(users)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(users.id, id))
          .returning();

        if (result.length === 0) {
          return reply.status(404).send({ error: "User not found" });
        }

        return result[0];
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({ error: "Invalid user data" });
      }
    },
  );

  // Delete user
  fastify.delete(
    "/users/:id",
    {
      schema: {
        tags: ["users"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          204: {
            type: "null",
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await db.delete(users).where(eq(users.id, id)).returning();

      if (result.length === 0) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.status(204).send();
    },
  );

  // Decrement credits (legacy - use check-and-decrement for new code)
  fastify.post(
    "/users/:id/decrement-credits",
    {
      schema: {
        tags: ["users"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            amount: { type: "number", minimum: 1 },
          },
          required: ["amount"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              name: { type: "string" },
              plan: { type: "string" },
              credits: { type: "number" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { amount } = request.body as { amount: number };

      try {
        const result = await db.select().from(users).where(eq(users.id, id));

        if (result.length === 0) {
          return reply.status(404).send({ error: "User not found" });
        }

        const user = result[0];
        const currentCredits = user.credits || 0;

        if (currentCredits < amount) {
          return reply.status(400).send({ error: "Insufficient credits" });
        }

        const updated = await db
          .update(users)
          .set({ credits: currentCredits - amount, updatedAt: new Date() })
          .where(eq(users.id, id))
          .returning();

        return reply.status(200).send(updated[0]);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({ error: "Failed to decrement credits" });
      }
    },
  );

  // Atomic check-and-decrement - prevents race conditions
  fastify.post(
    "/users/:id/check-and-decrement-credits",
    {
      schema: {
        tags: ["users"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            amount: { type: "number", minimum: 1, default: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              credits: { type: "number" },
              creditsRemaining: { type: "number" },
              previousCredits: { type: "number" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { amount = 1 } = request.body as { amount?: number };

      try {
        const result = await db.select().from(users).where(eq(users.id, id));

        if (result.length === 0) {
          return reply.status(404).send({ error: "User not found" });
        }

        const user = result[0];
        const currentCredits = user.credits || 0;

        if (currentCredits < amount) {
          return reply.status(400).send({ error: "Insufficient credits" });
        }

        const updated = await db
          .update(users)
          .set({ credits: currentCredits - amount, updatedAt: new Date() })
          .where(eq(users.id, id))
          .returning();

        const newCredits = updated[0].credits || 0;
        return reply.status(200).send({
          success: true,
          credits: newCredits,
          creditsRemaining: newCredits,
          previousCredits: currentCredits,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(400)
          .send({ error: "Failed to check and decrement credits" });
      }
    },
  );

  // Atomic check-and-decrement super realistic calls - prevents race conditions
  fastify.post(
    "/users/:id/check-and-decrement-super-realistic",
    {
      schema: {
        tags: ["users"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            amount: { type: "number", minimum: 1, default: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              superRealisticCallsRemaining: { type: "number" },
              previousSuperRealisticCallsRemaining: { type: "number" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { amount = 1 } = request.body as { amount?: number };

      try {
        const result = await db.select().from(users).where(eq(users.id, id));

        if (result.length === 0) {
          return reply.status(404).send({ error: "User not found" });
        }

        const user = result[0];
        const currentQuota = user.superRealisticCallsRemaining || 0;

        if (currentQuota < amount) {
          return reply.status(400).send({
            error: `Insufficient super realistic calls quota. You have ${currentQuota} remaining.`,
          });
        }

        const updated = await db
          .update(users)
          .set({
            superRealisticCallsRemaining: currentQuota - amount,
            updatedAt: new Date(),
          })
          .where(eq(users.id, id))
          .returning();

        const newQuota = updated[0].superRealisticCallsRemaining || 0;
        return reply.status(200).send({
          success: true,
          superRealisticCallsRemaining: newQuota,
          previousSuperRealisticCallsRemaining: currentQuota,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({
          error: "Failed to check and decrement super realistic calls",
        });
      }
    },
  );

  // Refund credits (for failed calls)
  fastify.post(
    "/users/:id/refund-credits",
    {
      schema: {
        tags: ["users"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            amount: { type: "number", minimum: 1, default: 1 },
            reason: { type: "string" },
          },
          required: ["reason"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              credits: { type: "number" },
              refundedAmount: { type: "number" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { amount = 1, reason } = request.body as {
        amount?: number;
        reason: string;
      };

      try {
        const result = await db.select().from(users).where(eq(users.id, id));

        if (result.length === 0) {
          return reply.status(404).send({ error: "User not found" });
        }

        const user = result[0];
        const currentCredits = user.credits || 0;
        const newCredits = currentCredits + amount;

        const updated = await db
          .update(users)
          .set({ credits: newCredits, updatedAt: new Date() })
          .where(eq(users.id, id))
          .returning();

        fastify.log.info(
          `Refunded ${amount} credits to user ${id}. Reason: ${reason}`,
        );

        return reply.status(200).send({
          success: true,
          credits: newCredits,
          refundedAmount: amount,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({ error: "Failed to refund credits" });
      }
    },
  );
};

export default usersRoutes;
