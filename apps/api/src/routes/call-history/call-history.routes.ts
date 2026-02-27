import { FastifyPluginAsync } from "fastify";
import {
  db,
  callHistory,
  agents,
  users,
  eq,
  and,
  desc,
  asc,
  sql,
  count,
} from "@repo/db";
import {
  CreateCallHistorySchema,
  UpdateCallHistorySchema,
  CREDIT_COST,
} from "@repo/types";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { calculateCallCost, isPremiumVoice } from "@repo/types";

const callHistoryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // Get all call history for an agent
  fastify.get("/agent/:agentId", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { agentId } = request.params as { agentId: string };
    const {
      status,
      direction,
      limit = "50",
      skip = "0",
    } = request.query as {
      status?: string;
      direction?: string;
      limit?: string;
      skip?: string;
    };

    // Verify the agent belongs to the user
    const agentResult = await db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.id, agentId),
          eq(agents.userId, userId),
          eq(agents.orgId, orgId || null),
        ),
      );

    if (agentResult.length === 0) {
      return reply.status(404).send({ error: "Agent not found" });
    }

    // Build filter
    let filter = and(eq(callHistory.agentId, agentId));
    if (status) {
      filter = and(filter, eq(callHistory.status, status as any));
    }
    if (direction) {
      filter = and(filter, eq(callHistory.direction, direction as any));
    }

    const limitNum = parseInt(limit);
    const skipNum = parseInt(skip);

    const calls = await db
      .select()
      .from(callHistory)
      .where(filter)
      .orderBy(desc(callHistory.startedAt))
      .limit(limitNum)
      .offset(skipNum);

    const totalResult = await db
      .select({ count: count() })
      .from(callHistory)
      .where(filter);
    const total = totalResult[0]?.count || 0;

    return { calls, total, limit: limitNum, skip: skipNum };
  });

  // Get call statistics for an agent
  fastify.get("/agent/:agentId/stats", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { agentId } = request.params as { agentId: string };

    // Verify the agent belongs to the user
    const agentResult = await db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.id, agentId),
          eq(agents.userId, userId),
          eq(agents.orgId, orgId || null),
        ),
      );

    if (agentResult.length === 0) {
      return reply.status(404).send({ error: "Agent not found" });
    }

    // Calculate stats in memory since Drizzle doesn't have full aggregation
    const allCalls = await db
      .select()
      .from(callHistory)
      .where(eq(callHistory.agentId, agentId));

    const stats = {
      totalCalls: allCalls.length,
      completedCalls: allCalls.filter((c) => c.status === "completed").length,
      missedCalls: allCalls.filter((c) => c.status === "missed").length,
      totalDuration: allCalls.reduce((sum, c) => sum + (c.duration || 0), 0),
      averageDuration:
        allCalls.length > 0
          ? allCalls.reduce((sum, c) => sum + (c.duration || 0), 0) /
            allCalls.length
          : 0,
      totalCost: allCalls.reduce((sum, c) => sum + (c.cost || 0), 0),
    };

    return stats;
  });

  // Get single call record
  fastify.get("/:callId", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { callId } = request.params as { callId: string };

    const callResult = await db
      .select()
      .from(callHistory)
      .where(eq(callHistory.id, callId));

    if (callResult.length === 0) {
      return reply.status(404).send({ error: "Call not found" });
    }

    const call = callResult[0];

    // Verify the agent belongs to the user
    const agentResult = await db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.id, call.agentId),
          eq(agents.userId, userId),
          eq(agents.orgId, orgId || null),
        ),
      );

    if (agentResult.length === 0) {
      return reply.status(404).send({ error: "Call not found" });
    }

    return call;
  });

  // Create call record
  fastify.post("/", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const data = CreateCallHistorySchema.parse(request.body);

    // Check if agent exists and get its voice settings
    const agentResult = await db
      .select()
      .from(agents)
      .where(eq(agents.id, data.agentId));
    if (agentResult.length === 0) {
      return reply.status(404).send({ error: "Agent not found" });
    }

    const agent = agentResult[0];
    const isPremium = isPremiumVoice(agent.voice);
    const estimatedCost = isPremium
      ? CREDIT_COST.superRealisticCall
      : CREDIT_COST.callMinute;

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    if (userResult.length === 0) {
      return reply.status(404).send({ error: "User not found" });
    }

    const user = userResult[0];
    if ((user.credits || 0) < estimatedCost) {
      return reply.status(400).send({
        error: "Insufficient credits",
        required: estimatedCost,
        available: user.credits || 0,
      });
    }

    const result = await db
      .insert(callHistory)
      .values({
        ...data,
        userId: userId!,
        orgId: orgId || null,
      })
      .returning();

    return reply.status(201).send(result[0]);
  });

  // Update call record (for updating status, transcript, etc.)
  fastify.put("/:callId", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { callId } = request.params as { callId: string };
    const data = UpdateCallHistorySchema.parse(request.body);

    const result = await db
      .update(callHistory)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(callHistory.id, callId),
          eq(callHistory.userId, userId),
          eq(callHistory.orgId, orgId || null),
        ),
      )
      .returning();

    if (result.length === 0) {
      return reply.status(404).send({ error: "Call not found" });
    }

    return result[0];
  });

  // Delete call record
  fastify.delete("/:callId", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { callId } = request.params as { callId: string };

    const result = await db
      .delete(callHistory)
      .where(
        and(
          eq(callHistory.id, callId),
          eq(callHistory.userId, userId),
          eq(callHistory.orgId, orgId || null),
        ),
      )
      .returning();

    if (result.length === 0) {
      return reply.status(404).send({ error: "Call not found" });
    }

    return reply.status(204).send();
  });

  // Update call status (endpoint for call processing)
  fastify.patch("/:callId/status", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { callId } = request.params as { callId: string };
    const {
      status,
      duration,
      recordingUrl,
      transcript,
      sentiment,
      topics,
      summary,
      collectedData,
      cost,
    } = request.body as {
      status?: string;
      duration?: number;
      recordingUrl?: string;
      transcript?: string;
      sentiment?: string;
      topics?: string[];
      summary?: string;
      collectedData?: Record<string, string>;
      cost?: number;
    };

    const updateData: any = {};
    if (status) updateData.status = status;
    if (duration !== undefined) updateData.duration = duration;
    if (recordingUrl) updateData.recordingUrl = recordingUrl;
    if (transcript) updateData.transcript = transcript;
    if (sentiment) updateData.sentiment = sentiment;
    if (topics) updateData.topics = topics;
    if (summary) updateData.summary = summary;
    if (collectedData) updateData.collectedData = collectedData;
    if (cost !== undefined) updateData.cost = cost;
    if (status === "completed" || status === "missed" || status === "failed") {
      updateData.endedAt = new Date();
    }
    updateData.updatedAt = new Date();

    const result = await db
      .update(callHistory)
      .set(updateData)
      .where(
        and(
          eq(callHistory.id, callId),
          eq(callHistory.userId, userId),
          eq(callHistory.orgId, orgId || null),
        ),
      )
      .returning();

    if (result.length === 0) {
      return reply.status(404).send({ error: "Call not found" });
    }

    const call = result[0];

    // Deduct credits when call completes and credits haven't been deducted yet
    if (
      status === "completed" &&
      duration !== undefined &&
      duration > 0 &&
      !call.creditsDeducted
    ) {
      const agentResult = await db
        .select()
        .from(agents)
        .where(eq(agents.id, call.agentId));
      if (agentResult.length > 0) {
        const agent = agentResult[0];
        const isPremium = isPremiumVoice(agent.voice);
        const callCost = calculateCallCost(duration, isPremium);

        // Get current user credits
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));
        if (userResult.length > 0) {
          const currentUser = userResult[0];
          const currentCredits = currentUser.credits || 0;

          if (currentCredits >= callCost) {
            // Deduct credits
            await db
              .update(users)
              .set({
                credits: currentCredits - callCost,
                updatedAt: new Date(),
              })
              .where(eq(users.id, userId));

            // Mark call as having credits deducted
            await db
              .update(callHistory)
              .set({
                cost: callCost,
                creditsDeducted: true,
                updatedAt: new Date(),
              })
              .where(eq(callHistory.id, callId));

            fastify.log.info(
              {
                callId,
                userId,
                duration,
                isPremium,
                cost: callCost,
                remainingCredits: currentCredits - callCost,
              },
              "Credits deducted for completed call",
            );
          } else {
            fastify.log.warn(
              {
                callId,
                userId,
                requiredCredits: callCost,
              },
              "Insufficient credits to deduct - should have been checked earlier",
            );
          }
        }
      }
    }

    return call;
  });
};

export default callHistoryRoutes;
