// Test script for external Call API integration
import axios from "axios";

const API_BASE_URL = process.env.API_URL || "http://localhost:3001/api";
const EXTERNAL_API_URL =
  process.env.CALL_API_BASE_URL || "http://89.126.208.106:3000";

console.log("Testing Call API Integration\n");
console.log("============================\n");

async function testHealth() {
  console.log("1. Testing GET /health (external API)...");
  try {
    const response = await axios.get(`${EXTERNAL_API_URL}/health`, {
      timeout: 5000,
    });
    console.log("✓ External API is healthy:");
    console.log("  Status:", response.data.status);
    console.log("  Active calls:", response.data.activeCalls);
    console.log("  Max concurrent:", response.data.maxConcurrent);
    return true;
  } catch (error: any) {
    console.log("✗ External API health check failed:", error.message);
    return false;
  }
}

async function testLocalHealth() {
  console.log("\n2. Testing GET /api/health (local proxy)...");
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    console.log("✓ Local health endpoint works:");
    console.log("  Status:", response.data.status);
    return true;
  } catch (error: any) {
    console.log("✗ Local health check failed:", error.message);
    return false;
  }
}

async function testStartCall() {
  console.log("\n3. Testing POST /api/calls (start call)...");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/calls`,
      {
        phone: "+998930902520",
        prompt: "You are Aziza, a sales agent for CallMind. Speak in Uzbek.",
        greetingPrompt: "Greet the user warmly and introduce yourself.",
        maxDuration: 120,
        goodbyeMessage: "Rahmat vaqtingiz uchun! Xayr!",
        refusalPhrases: ["qiziqmayman", "kerak emas"],
      },
      { timeout: 10000 },
    );

    console.log("✓ Call started successfully:");
    console.log("  callSid:", response.data.callSid);
    return response.data.callSid;
  } catch (error: any) {
    console.log("✗ Start call failed:", error.message);
    if (error.response) {
      console.log("  Response:", error.response.data);
    }
    return null;
  }
}

async function testGetCallStatus(callSid: string) {
  console.log(`\n4. Testing GET /api/calls/${callSid} (get status)...`);
  try {
    const response = await axios.get(`${API_BASE_URL}/calls/${callSid}`, {
      timeout: 5000,
    });
    console.log("✓ Got call status:");
    console.log("  Status:", response.data.status);
    console.log("  Turn count:", response.data.turnCount);
    console.log("  Duration:", response.data.durationSeconds, "seconds");
    return true;
  } catch (error: any) {
    console.log("✗ Get call status failed:", error.message);
    if (error.response) {
      console.log("  Response:", error.response.data);
    }
    return false;
  }
}

async function testStartCampaign() {
  console.log("\n5. Testing POST /api/campaigns (start campaign)...");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/campaigns`,
      {
        phones: ["+998901234567", "+998907654321"],
        prompt: "You are Aziza, a sales agent. Speak in Uzbek.",
        greetingPrompt: "Greet warmly and ask if they have a minute.",
        maxDuration: 120,
        concurrency: 2,
        delayBetweenMs: 2000,
      },
      { timeout: 10000 },
    );

    console.log("✓ Campaign started successfully:");
    console.log("  campaignId:", response.data.campaignId);
    console.log("  Total:", response.data.total);
    console.log("  Concurrency:", response.data.concurrency);
    return response.data.campaignId;
  } catch (error: any) {
    console.log("✗ Start campaign failed:", error.message);
    if (error.response) {
      console.log("  Response:", error.response.data);
    }
    return null;
  }
}

async function testGetCampaigns() {
  console.log("\n6. Testing GET /api/campaigns (list campaigns)...");
  try {
    const response = await axios.get(`${API_BASE_URL}/campaigns`, {
      timeout: 5000,
    });
    console.log("✓ Got campaigns list:");
    console.log("  Count:", response.data.campaigns?.length || 0);
    return true;
  } catch (error: any) {
    console.log("✗ Get campaigns failed:", error.message);
    if (error.response) {
      console.log("  Response:", error.response.data);
    }
    return false;
  }
}

async function testScheduleCall() {
  console.log("\n7. Testing POST /api/schedules (schedule call)...");
  try {
    const runAt = new Date();
    runAt.setMinutes(runAt.getMinutes() + 5); // Schedule 5 minutes from now

    const response = await axios.post(
      `${API_BASE_URL}/schedules`,
      {
        type: "call",
        runAt: runAt.toISOString(),
        phone: "+998930902520",
        prompt: "You are Aziza, a sales agent. Speak in Uzbek.",
        maxDuration: 120,
      },
      { timeout: 10000 },
    );

    console.log("✓ Call scheduled successfully:");
    console.log("  scheduleId:", response.data.scheduleId);
    console.log("  Run at:", response.data.runAt);
    console.log("  Delay (seconds):", response.data.delaySeconds);
    return response.data.scheduleId;
  } catch (error: any) {
    console.log("✗ Schedule call failed:", error.message);
    if (error.response) {
      console.log("  Response:", error.response.data);
    }
    return null;
  }
}

async function testGetSchedules() {
  console.log("\n8. Testing GET /api/schedules (list schedules)...");
  try {
    const response = await axios.get(`${API_BASE_URL}/schedules`, {
      timeout: 5000,
    });
    console.log("✓ Got schedules list:");
    console.log("  Count:", response.data.scheduled?.length || 0);
    return true;
  } catch (error: any) {
    console.log("✗ Get schedules failed:", error.message);
    if (error.response) {
      console.log("  Response:", error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log("Make sure the API server is running on port 3001");
  console.log("and MongoDB is running.\n");

  const results: any = {};

  // Test external API health first
  results.externalHealth = await testHealth();

  // Test local health
  results.localHealth = await testLocalHealth();

  // Test call endpoints
  const callSid = await testStartCall();
  if (callSid) {
    results.startCall = true;
    results.getCallStatus = await testGetCallStatus(callSid);
  }

  // Test campaign endpoints
  const campaignId = await testStartCampaign();
  if (campaignId) {
    results.startCampaign = true;
  }
  results.getCampaigns = await testGetCampaigns();

  // Test schedule endpoints
  const scheduleId = await testScheduleCall();
  if (scheduleId) {
    results.scheduleCall = true;
  }
  results.getSchedules = await testGetSchedules();

  // Summary
  console.log("\n============================");
  console.log("Test Summary\n");

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  console.log(`Passed: ${passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log("\n✓ All tests passed!");
  } else {
    console.log("\n✗ Some tests failed");
    console.log("\nFailed tests:");
    Object.entries(results)
      .filter(([, passed]) => !passed)
      .forEach(([name]) => console.log(`  - ${name}`));
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTests().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});
