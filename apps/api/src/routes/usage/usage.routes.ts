import { FastifyPluginAsync } from "fastify";
import { CallHistoryModel, AgentModel, UserModel } from "@repo/db";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { startOfDay, subDays, format } from "date-fns";

const usageRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // Get overall usage statistics for the current user
  fastify.get("/stats", async (request) => {
    const { userId, orgId } = request.auth;
    const {
      period = "30", // default to 30 days
      startDate,
      endDate,
    } = request.query as {
      period?: string;
      startDate?: string;
      endDate?: string;
    };

    // Calculate date range
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = startOfDay(new Date(startDate));
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const days = parseInt(period);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      start = startOfDay(subDays(end, days - 1));
    }

    // Get user's agents
    const agentFilter: any = { userId };
    if (orgId) agentFilter.orgId = orgId;
    const agents = await AgentModel.find(agentFilter).select("_id").lean();
    const agentIds = agents.map((a) => a._id.toString());

    if (agentIds.length === 0) {
      return {
        totalCalls: 0,
        totalMinutes: 0,
        totalCost: 0,
        avgCostPerCall: 0,
        period: { start, end },
      };
    }

    // Aggregate call history for the user's agents
    const stats = await CallHistoryModel.aggregate([
      {
        $match: {
          agentId: { $in: agentIds },
          startedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          totalDuration: { $sum: { $ifNull: ["$duration", 0] } },
          totalCost: { $sum: { $ifNull: ["$cost", 0] } },
        },
      },
    ]);

    const result = stats[0] || {
      totalCalls: 0,
      totalDuration: 0,
      totalCost: 0,
    };

    return {
      totalCalls: result.totalCalls || 0,
      totalMinutes: Math.round((result.totalDuration || 0) / 60),
      totalCost: Math.round((result.totalCost || 0) * 100) / 100,
      avgCostPerCall:
        result.totalCalls > 0
          ? Math.round((result.totalCost / result.totalCalls) * 100) / 100
          : 0,
      };
    });

  // Get usage trends over time (for charts)
  fastify.get("/trends", async (request) => {
    const { userId, orgId } = request.auth;
    const {
      period = "30", // default to 30 days
      groupBy = "day", // day, week
    } = request.query as {
      period?: string;
      groupBy?: "day" | "week";
    };

    const days = parseInt(period);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = startOfDay(subDays(end, days - 1));

    // Get user's agents
    const agentFilter: any = { userId };
    if (orgId) agentFilter.orgId = orgId;
    const agents = await AgentModel.find(agentFilter).select("_id").lean();
    const agentIds = agents.map((a) => a._id.toString());

    if (agentIds.length === 0) {
      return [];
    }

    // Group by date
    const formatDate = groupBy === "week"
      ? { $dateToString: { format: "%Y-%U", date: "$startedAt" } }
      : { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } };

    const trends = await CallHistoryModel.aggregate([
      {
        $match: {
          agentId: { $in: agentIds },
          startedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: formatDate,
          calls: { $sum: 1 },
          minutes: {
            $sum: { $divide: [{ $ifNull: ["$duration", 0] }, 60] },
          },
          cost: { $sum: { $ifNull: ["$cost", 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for frontend - create array with all dates filled in
    const result = [];
    const currentDate = new Date(start);

    for (let i = 0; i < days; i++) {
      const dateStr = format(currentDate, groupBy === "week" ? "yyyy-'W'ww" : "MMM d");
      const dateKey = groupBy === "week"
        ? format(currentDate, "yyyy-'W'ww")
        : format(currentDate, "yyyy-MM-dd");

      const found = trends.find((t) => t._id === dateKey);

      result.push({
        date: dateStr,
        calls: found ? Math.round(found.calls) : 0,
        minutes: found ? Math.round(found.minutes) : 0,
        cost: found ? Math.round(found.cost * 100) / 100 : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  });

  // Get usage breakdown by agent
  fastify.get("/agents", async (request) => {
    const { userId, orgId } = request.auth;
    const {
      period = "30",
      limit = "10",
    } = request.query as {
      period?: string;
      limit?: string;
    };

    const days = parseInt(period);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = startOfDay(subDays(end, days - 1));

    // Get user's agents
    const agentFilter: any = { userId };
    if (orgId) agentFilter.orgId = orgId;
    const agents = await AgentModel.find(agentFilter)
      .select("_id name")
      .lean();

    if (agents.length === 0) {
      return [];
    }

    const agentIds = agents.map((a) => a._id.toString());

    // Aggregate calls by agent
    const agentStats = await CallHistoryModel.aggregate([
      {
        $match: {
          agentId: { $in: agentIds },
          startedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$agentId",
          calls: { $sum: 1 },
          minutes: {
            $sum: { $divide: [{ $ifNull: ["$duration", 0] }, 60] },
          },
          cost: { $sum: { $ifNull: ["$cost", 0] } },
        },
      },
      { $sort: { calls: -1 } },
      { $limit: parseInt(limit) },
    ]);

    // Calculate total for percentages
    const totalCalls = agentStats.reduce((sum, a) => sum + a.calls, 0);

    // Map agent IDs to names
    const result = agentStats.map((stat) => {
      const agent = agents.find((a) => a._id.toString() === stat._id);
      return {
        agentId: stat._id,
        agentName: agent?.name || "Unknown Agent",
        calls: stat.calls,
        minutes: Math.round(stat.minutes),
        cost: Math.round(stat.cost * 100) / 100,
        percentage: totalCalls > 0 ? Math.round((stat.calls / totalCalls) * 100) : 0,
      };
    });

    return result;
  });

  // Get recent activity
  fastify.get("/recent", async (request) => {
    const { userId, orgId } = request.auth;
    const { limit = "20" } = request.query as { limit?: string };

    // Get user's agents
    const agentFilter: any = { userId };
    if (orgId) agentFilter.orgId = orgId;
    const agents = await AgentModel.find(agentFilter).select("_id").lean();
    const agentIds = agents.map((a) => a._id.toString());

    if (agentIds.length === 0) {
      return [];
    }

    const calls = await CallHistoryModel.find({
      agentId: { $in: agentIds },
    })
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .populate("agentId", "name")
      .lean();

    // Get agent names for calls that weren't populated
    const agentMap = new Map(
      agents.map((a) => [a._id.toString(), a.name || "Unknown"])
    );

    const result = calls.map((call) => {
      const agentName =
        (typeof call.agentId === "object" && call.agentId?.name) ||
        agentMap.get(call.agentId?.toString()) ||
        "Unknown Agent";

      const duration = call.duration || 0;
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;

      return {
        callId: call._id,
        agentName,
        agentId: call.agentId?.toString(),
        time: formatRelativeTime(call.startedAt),
        duration: `${minutes}m ${seconds}s`,
        durationMinutes: Math.round(duration / 60 * 10) / 10,
        cost: `$${(call.cost || 0).toFixed(2)}`,
        status: call.status,
        direction: call.direction,
        callerNumber: call.callerNumber,
      };
    });

    return result;
  });

  // Get current billing period usage
  fastify.get("/billing", async (request) => {
    const { userId, orgId } = request.auth;

    // Get user with current credits and plan
    const user = await UserModel.findOne({
      _id: userId,
    }).lean();

    if (!user) {
      return { error: "User not found" };
    }

    // Get user's agents
    const agentFilter: any = { userId };
    if (orgId) agentFilter.orgId = orgId;
    const agents = await AgentModel.find(agentFilter).select("_id").lean();
    const agentIds = agents.map((a) => a._id.toString());

    if (agentIds.length === 0) {
      return {
        credits: user.credits || 0,
        plan: user.plan || "free",
        usage: { totalCalls: 0, totalMinutes: 0, totalCost: 0 },
      };
    }

    // Get current month usage
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await CallHistoryModel.aggregate([
      {
        $match: {
          agentId: { $in: agentIds },
          startedAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          totalMinutes: {
            $sum: { $divide: [{ $ifNull: ["$duration", 0] }, 60] },
          },
          totalCost: { $sum: { $ifNull: ["$cost", 0] } },
        },
      },
    ]);

    const usageData = usage[0] || {
      totalCalls: 0,
      totalMinutes: 0,
      totalCost: 0,
    };

    return {
      credits: user.credits || 0,
      plan: user.plan || "free",
      usage: {
        totalCalls: usageData.totalCalls || 0,
        totalMinutes: Math.round(usageData.totalMinutes) || 0,
        totalCost: Math.round((usageData.totalCost || 0) * 100) / 100,
      },
    };
  });

  // Export usage data as CSV
  fastify.get("/export", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const {
      period = "30",
      format = "csv",
    } = request.query as {
      period?: string;
      format?: "csv" | "json";
    };

    const days = parseInt(period);
    const end = new Date();
    const start = startOfDay(subDays(end, days - 1));

    // Get user's agents
    const agentFilter: any = { userId };
    if (orgId) agentFilter.orgId = orgId;
    const agents = await AgentModel.find(agentFilter).select("_id name").lean();
    const agentMap = new Map(agents.map((a) => [a._id.toString(), a.name]));
    const agentIds = agents.map((a) => a._id.toString());

    if (agentIds.length === 0) {
      return reply
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", `attachment; filename="usage-export-${format(end, "yyyy-MM-dd")}.csv"`)
        .send("Date,Agent,Status,Duration (min),Cost\n");
    }

    const calls = await CallHistoryModel.find({
      agentId: { $in: agentIds },
      startedAt: { $gte: start },
    })
      .sort({ startedAt: -1 })
      .lean();

    if (format === "json") {
      return reply
        .header("Content-Type", "application/json")
        .header("Content-Disposition", `attachment; filename="usage-export-${format(end, "yyyy-MM-dd")}.json"`)
        .send(calls);
    }

    // CSV format
    const csvHeaders = "Date,Agent,Status,Direction,Duration (min),Cost,Caller\n";
    const csvRows = calls.map((call) => {
      const agentName = agentMap.get(call.agentId?.toString()) || "Unknown";
      const date = format(new Date(call.startedAt), "yyyy-MM-dd HH:mm");
      const duration = ((call.duration || 0) / 60).toFixed(2);
      const cost = (call.cost || 0).toFixed(2);
      return `${date},"${agentName}",${call.status},${call.direction},${duration},${cost},${call.callerNumber || ""}`;
    }).join("\n");

    return reply
      .header("Content-Type", "text/csv")
      .header("Content-Disposition", `attachment; filename="usage-export-${format(end, "yyyy-MM-dd")}.csv"`)
      .send(csvHeaders + csvRows);
  });
};

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return format(new Date(date), "MMM d, yyyy");
}

export default usageRoutes;
