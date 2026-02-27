import { FastifyPluginAsync } from "fastify";
import { db, todos, eq, and, desc } from "@repo/db";
import { CreateTodoSchema, UpdateTodoSchema } from "@repo/types";
import { requireAuth } from "../../middleware/auth.middleware.js";

const todosRoutes: FastifyPluginAsync = async (fastify) => {
  // Add authentication hook for all routes in this plugin
  fastify.addHook("preHandler", requireAuth);

  // Get all todos for current user
  fastify.get(
    "/",
    {
      schema: {
        tags: ["todos"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                completed: { type: "boolean" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { userId, orgId } = request.auth;
      const result = await db
        .select()
        .from(todos)
        .where(and(eq(todos.userId, userId!), eq(todos.orgId, orgId || null)))
        .orderBy(desc(todos.createdAt));
      return result;
    },
  );

  // Create a new todo
  fastify.post(
    "/",
    {
      schema: {
        tags: ["todos"],
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
          },
          required: ["title"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              completed: { type: "boolean" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { userId, orgId } = request.auth;
      const data = CreateTodoSchema.parse(request.body);

      const result = await db
        .insert(todos)
        .values({
          ...data,
          userId: userId!,
          orgId: orgId || null,
        })
        .returning();

      return reply.status(201).send(result[0]);
    },
  );

  // Update a todo
  fastify.patch(
    "/:id",
    {
      schema: {
        tags: ["todos"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            completed: { type: "boolean" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              completed: { type: "boolean" },
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
      const { userId, orgId } = request.auth;
      const { id } = request.params as { id: string };
      const data = UpdateTodoSchema.parse(request.body);

      const result = await db
        .update(todos)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(
            eq(todos.id, id),
            eq(todos.userId, userId!),
            eq(todos.orgId, orgId || null),
          ),
        )
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ error: "Todo not found" });
      }

      return result[0];
    },
  );

  // Delete a todo
  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["todos"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          204: { type: "null" },
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
      const { userId, orgId } = request.auth;
      const { id } = request.params as { id: string };

      const result = await db
        .delete(todos)
        .where(
          and(
            eq(todos.id, id),
            eq(todos.userId, userId!),
            eq(todos.orgId, orgId || null),
          ),
        )
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ error: "Todo not found" });
      }

      return reply.status(204).send();
    },
  );
};

export default todosRoutes;
