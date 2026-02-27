import { FastifyPluginAsync } from "fastify";
import { db, agents, eq, and, desc } from "@repo/db";
import { CreateAgentSchema, UpdateAgentSchema } from "@repo/types";
import { requireAuth } from "../../middleware/auth.middleware.js";

const agentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // Get all agents
  fastify.get("/", async (request) => {
    const { userId } = request.auth;
    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, userId!))
      .orderBy(desc(agents.createdAt));
    return result;
  });

  // Get single agent
  fastify.get("/:id", async (request, reply) => {
    const { userId } = request.auth;
    const { id } = request.params as { id: string };
    const result = await db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.id, id),
          eq(agents.userId, userId!),
        ),
      );

    if (result.length === 0) {
      return reply.status(404).send({ error: "Agent not found" });
    }
    return result[0];
  });

  // Create agent
  fastify.post("/", async (request, reply) => {
    const { userId } = request.auth;
    const data = CreateAgentSchema.parse(request.body);

    const result = await db
      .insert(agents)
      .values({
        ...data,
        userId: userId!,
      })
      .returning();

    return reply.status(201).send(result[0]);
  });

  // Update agent
  fastify.put("/:id", async (request, reply) => {
    const { userId } = request.auth;
    const { id } = request.params as { id: string };
    const data = UpdateAgentSchema.parse(request.body);

    const result = await db
      .update(agents)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(agents.id, id),
          eq(agents.userId, userId!),
        ),
      )
      .returning();

    if (result.length === 0) {
      return reply.status(404).send({ error: "Agent not found" });
    }

    return result[0];
  });

  // Delete agent
  fastify.delete("/:id", async (request, reply) => {
    const { userId } = request.auth;
    const { id } = request.params as { id: string };

    const result = await db
      .delete(agents)
      .where(
        and(
          eq(agents.id, id),
          eq(agents.userId, userId!),
        ),
      )
      .returning();

    if (result.length === 0) {
      return reply.status(404).send({ error: "Agent not found" });
    }

    return reply.status(204).send();
  });
};

export default agentsRoutes;
