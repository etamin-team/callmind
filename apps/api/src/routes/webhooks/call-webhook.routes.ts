import { FastifyPluginAsync } from "fastify";
import { CallHistoryModel, AgentModel, UserModel } from "@repo/db";
import { CreateCallHistorySchema, CREDIT_COST } from "@repo/types";
import { TranscriptAnalysisService } from "../../services/transcript-analysis.service.js";
import { calculateCallCost, isPremiumVoice } from "@repo/types";

const callWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  // Skip authentication for webhook endpoints (they will be called by external services)
  fastify.post(
    "/calls/status",
    {
      onRequest: async (request, reply) => {
        // Skip auth - allow external webhook calls
        return;
      },
    },
    async (request, reply) => {
      try {
        const webhookData = request.body as any;

        const {
          callSid,
          agentId,
          status,
          direction = "inbound",
          callerNumber,
          callerName,
          duration,
          recordingUrl,
          transcript,
          sentiment,
          topics,
          summary,
          collectedData,
          cost,
          startedAt,
          endedAt,
        } = webhookData;

        if (!callSid || !agentId) {
          return reply
            .status(400)
            .send({ error: "Missing required fields: callSid, agentId" });
        }

        const existingCall = await CallHistoryModel.findOne({ callSid });

        if (existingCall) {
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
          if (endedAt) updateData.endedAt = new Date(endedAt);
          if (
            status === "completed" ||
            status === "missed" ||
            status === "failed"
          ) {
            updateData.endedAt = new Date();
          }

          const updatedCall = await CallHistoryModel.findOneAndUpdate(
            { callSid },
            updateData,
            { new: true },
          );

          return reply.status(200).send(updatedCall);
        } else {
          const callData = {
            agentId,
            userId: webhookData.userId || "system",
            orgId: webhookData.orgId,
            callSid,
            direction,
            callerNumber,
            callerName,
            status: status || "ringing",
            duration: duration || 0,
            recordingUrl,
            transcript,
            sentiment,
            topics,
            summary,
            collectedData,
            cost,
            startedAt: startedAt ? new Date(startedAt) : new Date(),
            endedAt: endedAt ? new Date(endedAt) : undefined,
          };

          const validatedData = CreateCallHistorySchema.parse(callData);

          const newCall = await CallHistoryModel.create(validatedData);
          return reply.status(201).send(newCall);
        }
      } catch (error: any) {
        console.error("Error processing call webhook:", error);
        return reply.status(500).send({
          error: "Failed to process call webhook",
          details: error.message,
        });
      }
    },
  );

  fastify.post(
    "/calls/started",
    {
      onRequest: async (request, reply) => {
        // Skip auth - allow external webhook calls
        return;
      },
    },
    async (request, reply) => {
      try {
        const webhookData = request.body as any;
        const { callSid, agentId, direction, callerNumber, callerName } =
          webhookData;

        if (!callSid || !agentId) {
          return reply
            .status(400)
            .send({ error: "Missing required fields: callSid, agentId" });
        }

        const callData = {
          agentId,
          userId: webhookData.userId || "system",
          orgId: webhookData.orgId,
          callSid,
          direction: direction || "inbound",
          callerNumber,
          callerName,
          status: "in-progress",
          duration: 0,
          startedAt: new Date(),
        };

        const validatedData = CreateCallHistorySchema.parse(callData);
        const newCall = await CallHistoryModel.create(validatedData);

        return reply.status(201).send(newCall);
      } catch (error: any) {
        console.error("Error processing call started webhook:", error);
        return reply.status(500).send({
          error: "Failed to process call started webhook",
          details: error.message,
        });
      }
    },
  );

  fastify.post(
    "/calls/completed",
    {
      onRequest: async (request, reply) => {
        // Skip auth - allow external webhook calls
        return;
      },
    },
    async (request, reply) => {
      try {
        const webhookData = request.body as any;
        const {
          callSid,
          duration,
          recordingUrl,
          transcript,
          callerNumber,
          direction,
          agentId,
        } = webhookData;

        if (!callSid) {
          return reply
            .status(400)
            .send({ error: "Missing required field: callSid" });
        }

        const updateData: any = {
          status: "completed",
          endedAt: new Date(),
        };

        if (duration !== undefined) updateData.duration = duration;
        if (recordingUrl) updateData.recordingUrl = recordingUrl;
        if (transcript) updateData.transcript = transcript;
        if (callerNumber) updateData.callerNumber = callerNumber;
        if (direction) updateData.direction = direction;

        // Get the existing call to check if credits were already deducted
        const existingCall = await CallHistoryModel.findOne({ callSid });
        let shouldDeductCredits = false;
        let userIdForDeduction: string | null = null;

        if (
          existingCall &&
          !existingCall.creditsDeducted &&
          duration &&
          duration > 0
        ) {
          shouldDeductCredits = true;
          userIdForDeduction = existingCall.userId;
        }

        if (transcript && transcript.trim().length > 0) {
          try {
            let agentName: string | undefined;
            if (agentId) {
              try {
                const agent = await AgentModel.findById(agentId);
                agentName = agent?.name;
              } catch (e) {
                // Invalid agentId format, continue without agent name
              }
            }

            const analysis = await TranscriptAnalysisService.analyzeTranscript(
              transcript,
              duration,
              agentName,
            );

            updateData.sentiment = analysis.sentiment;
            updateData.summary = analysis.summary;
            updateData.topics = analysis.topics;
            updateData.status = analysis.status;
            updateData.notes = analysis.notes;
            if (analysis.callerName && !updateData.callerName) {
              updateData.callerName = analysis.callerName;
            }

            console.log(`[Transcript Analysis] Call ${callSid}:`, {
              sentiment: analysis.sentiment,
              status: analysis.status,
              topics: analysis.topics,
            });
          } catch (analysisError) {
            console.error("[Transcript Analysis] Failed:", analysisError);
          }
        }

        const updatedCall = await CallHistoryModel.findOneAndUpdate(
          { callSid },
          updateData,
          {
            new: true,
          },
        );

        // Deduct credits for completed call
        if (updatedCall && shouldDeductCredits && userIdForDeduction) {
          try {
            const agent = await AgentModel.findById(updatedCall.agentId);
            if (agent && duration) {
              const isPremium = isPremiumVoice(agent.voice);
              const callCost = calculateCallCost(duration, isPremium);
              const isSuperRealistic = agent.voiceMode === "superRealistic";

              // Prepare updates
              const userUpdates: any = { $inc: { credits: -callCost } };
              const callUpdates: any = {
                cost: callCost,
                creditsDeducted: true,
                isSuperRealistic,
              };

              // Also decrement super realistic quota if applicable
              if (isSuperRealistic) {
                userUpdates.$inc.superRealisticCallsRemaining = -1;
              }

              // Atomic credit deduction
              const user = await UserModel.findOneAndUpdate(
                { _id: userIdForDeduction, credits: { $gte: callCost } },
                userUpdates,
                { new: true },
              );

              if (user) {
                // Mark call as having credits deducted
                await CallHistoryModel.findByIdAndUpdate(
                  updatedCall.id,
                  callUpdates,
                );
                console.log(
                  `[Credits] Deducted ${callCost} credits for call ${callSid} (user: ${userIdForDeduction}, remaining: ${user.credits - callCost}, superRealistic: ${isSuperRealistic}, remainingSuperRealistic: ${user.superRealisticCallsRemaining - (isSuperRealistic ? 1 : 0)})`,
                );
              } else {
                console.warn(
                  `[Credits] Failed to deduct ${callCost} credits for call ${callSid} - insufficient credits or user not found`,
                );
              }
            }
          } catch (creditError) {
            console.error("[Credits] Error deducting credits:", creditError);
          }
        }

        if (!updatedCall) {
          if (agentId) {
            const newCallData = {
              agentId,
              userId: webhookData.userId || "system",
              orgId: webhookData.orgId,
              callSid,
              direction: direction || "inbound",
              callerNumber,
              status: updateData.status || "completed",
              duration: duration || 0,
              recordingUrl,
              transcript,
              sentiment: updateData.sentiment,
              topics: updateData.topics,
              summary: updateData.summary,
              notes: updateData.notes,
              startedAt: new Date(),
              endedAt: new Date(),
            };

            const validatedData = CreateCallHistorySchema.parse(newCallData);
            const newCall = await CallHistoryModel.create(validatedData);
            return reply.status(201).send(newCall);
          }

          return reply
            .status(404)
            .send({ error: "Call not found and no agentId provided" });
        }

        return reply.status(200).send(updatedCall);
      } catch (error: any) {
        console.error("Error processing call completed webhook:", error);
        return reply.status(500).send({
          error: "Failed to process call completed webhook",
          details: error.message,
        });
      }
    },
  );

  fastify.get(
    "/calls/health",
    {
      onRequest: async (request, reply) => {
        // Skip auth - allow health checks
        return;
      },
    },
    async () => {
      return {
        status: "ok",
        service: "call-webhooks",
        timestamp: new Date().toISOString(),
      };
    },
  );
};

export default callWebhookRoutes;
