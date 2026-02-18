import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/callmind";

const callHistorySchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true },
    userId: { type: String, required: true },
    orgId: { type: String },
    callSid: { type: String },
    direction: { type: String, enum: ["inbound", "outbound"] },
    callerNumber: { type: String },
    callerName: { type: String },
    duration: { type: Number },
    status: {
      type: String,
      enum: ["completed", "missed", "failed", "in-progress", "ringing"],
    },
    recordingUrl: { type: String },
    transcript: { type: String },
    sentiment: { type: String, enum: ["positive", "negative", "neutral"] },
    topics: [{ type: String }],
    summary: { type: String },
    collectedData: { type: Map, of: String },
    cost: { type: Number },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true },
);

const agentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    orgId: { type: String },
    name: { type: String, required: true },
    type: { type: String, default: "custom" },
    language: { type: String, default: "en" },
    voice: { type: String },
    businessName: { type: String },
    businessDescription: { type: String },
    businessIndustry: { type: String },
    targetCallers: { type: String },
    knowledgeText: { type: String },
    greeting: { type: String },
    primaryGoal: { type: String },
    phoneTransfer: { type: String },
    objectionHandling: { type: String },
    collectFields: [{ type: String }],
    systemPrompt: { type: String },
  },
  { timestamps: true },
);

const CallHistoryModel = mongoose.model("CallHistory", callHistorySchema);
const AgentModel = mongoose.model("Agent", agentSchema);

const dummyCalls = [
  {
    direction: "inbound",
    callerNumber: "+1-555-0101",
    callerName: "John Smith",
    duration: 185,
    status: "completed",
    sentiment: "positive",
    topics: ["pricing", "demo"],
    summary:
      "Customer interested in enterprise pricing. Requested a live demo.",
    collectedData: {
      name: "John Smith",
      email: "john@example.com",
      company: "Acme Corp",
    },
    cost: 0.45,
    startedAt: new Date("2026-02-17T10:30:00Z"),
    endedAt: new Date("2026-02-17T10:33:05Z"),
  },
  {
    direction: "inbound",
    callerNumber: "+1-555-0102",
    callerName: "Sarah Johnson",
    duration: 42,
    status: "missed",
    sentiment: "neutral",
    topics: ["support"],
    summary: "Customer called for support but agent was unavailable.",
    collectedData: { name: "Sarah Johnson", issue: "billing question" },
    cost: 0.05,
    startedAt: new Date("2026-02-17T11:15:00Z"),
    endedAt: new Date("2026-02-17T11:15:42Z"),
  },
  {
    direction: "inbound",
    callerNumber: "+1-555-0103",
    callerName: "Mike Williams",
    duration: 320,
    status: "completed",
    sentiment: "positive",
    topics: ["sales", "upgrade"],
    summary: "Customer looking to upgrade to premium plan. High-value lead.",
    collectedData: {
      name: "Mike Williams",
      email: "mike@techstart.io",
      plan: "premium",
    },
    cost: 0.82,
    startedAt: new Date("2026-02-16T14:00:00Z"),
    endedAt: new Date("2026-02-16T14:05:20Z"),
  },
  {
    direction: "inbound",
    callerNumber: "+1-555-0104",
    callerName: "Emily Brown",
    duration: 95,
    status: "failed",
    sentiment: "negative",
    topics: ["complaint"],
    summary: "Customer frustrated with service. Requires follow-up.",
    collectedData: { name: "Emily Brown", issue: "service outage" },
    cost: 0.12,
    startedAt: new Date("2026-02-16T09:20:00Z"),
    endedAt: new Date("2026-02-16T09:21:55Z"),
  },
  {
    direction: "outbound",
    callerNumber: "+1-555-0105",
    callerName: "David Lee",
    duration: 210,
    status: "completed",
    sentiment: "positive",
    topics: ["follow-up", "nurture"],
    summary: "Follow-up call after webinar. Customer interested in trial.",
    collectedData: {
      name: "David Lee",
      email: "david@startup.com",
      interest: "trial",
    },
    cost: 0.55,
    startedAt: new Date("2026-02-15T16:45:00Z"),
    endedAt: new Date("2026-02-15T16:49:15Z"),
  },
  {
    direction: "inbound",
    callerNumber: "+1-555-0106",
    callerName: "Lisa Chen",
    duration: 156,
    status: "completed",
    sentiment: "neutral",
    topics: ["inquiry", "features"],
    summary: "General inquiry about features. Not ready to buy yet.",
    collectedData: { name: "Lisa Chen", email: "lisa@enterprise.com" },
    cost: 0.38,
    startedAt: new Date("2026-02-15T13:10:00Z"),
    endedAt: new Date("2026-02-15T13:12:46Z"),
  },
  {
    direction: "inbound",
    callerNumber: "+1-555-0107",
    callerName: "Robert Taylor",
    duration: 0,
    status: "ringing",
    startedAt: new Date("2026-02-18T08:00:00Z"),
  },
  {
    direction: "inbound",
    callerNumber: "+1-555-0108",
    callerName: "Jennifer Davis",
    duration: 278,
    status: "completed",
    sentiment: "positive",
    topics: ["onboarding", "training"],
    summary: "New customer onboarding call. Very satisfied with setup.",
    collectedData: {
      name: "Jennifer Davis",
      company: "GlobalTech",
      plan: "business",
    },
    cost: 0.68,
    startedAt: new Date("2026-02-14T11:00:00Z"),
    endedAt: new Date("2026-02-14T11:04:38Z"),
  },
  {
    direction: "outbound",
    callerNumber: "+1-555-0109",
    callerName: "Chris Martinez",
    duration: 130,
    status: "completed",
    sentiment: "positive",
    topics: ["re-engagement"],
    summary: "Re-engagement call. Customer happy with service.",
    collectedData: { name: "Chris Martinez", feedback: "satisfied" },
    cost: 0.32,
    startedAt: new Date("2026-02-13T15:30:00Z"),
    endedAt: new Date("2026-02-13T15:32:40Z"),
  },
  {
    direction: "inbound",
    callerNumber: "+1-555-0110",
    callerName: "Amanda Wilson",
    duration: 65,
    status: "missed",
    sentiment: "neutral",
    topics: ["callback"],
    summary: "Requested callback. No message left.",
    collectedData: { name: "Amanda Wilson", phone: "+1-555-0110" },
    cost: 0.08,
    startedAt: new Date("2026-02-12T12:45:00Z"),
    endedAt: new Date("2026-02-12T12:46:10Z"),
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const testUserId = "test-user-123";
  const testOrgId = "test-org-456";

  let agent = await AgentModel.findOne({ userId: testUserId });
  if (!agent) {
    agent = await AgentModel.create({
      userId: testUserId,
      orgId: testOrgId,
      name: "Sales Assistant",
      type: "sales",
      language: "en",
      businessName: "Acme Corp",
      businessDescription: "SaaS company offering CRM solutions",
      greeting:
        "Hello, thank you for calling Acme Corp. How can I help you today?",
      primaryGoal: "Qualify leads and schedule demos",
    });
    console.log("Created test agent:", agent._id);
  } else {
    console.log("Using existing agent:", agent._id);
  }

  await CallHistoryModel.deleteMany({ agentId: agent._id.toString() });
  console.log("Cleared existing call history");

  const callsToInsert = dummyCalls.map((call) => ({
    ...call,
    agentId: agent!._id.toString(),
    userId: testUserId,
    orgId: testOrgId,
  }));

  await CallHistoryModel.insertMany(callsToInsert);
  console.log(`Inserted ${callsToInsert.length} dummy call records`);

  const stats = await CallHistoryModel.aggregate([
    { $match: { agentId: agent._id.toString() } },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        completedCalls: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        missedCalls: {
          $sum: { $cond: [{ $eq: ["$status", "missed"] }, 1, 0] },
        },
        failedCalls: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
        },
        totalDuration: { $sum: "$duration" },
        averageDuration: { $avg: "$duration" },
        totalCost: { $sum: "$cost" },
      },
    },
  ]);

  console.log("\nCall Statistics:");
  console.log(JSON.stringify(stats[0], null, 2));

  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB");
}

seed().catch(console.error);
