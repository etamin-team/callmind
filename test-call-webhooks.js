#!/usr/bin/env node

/**
 * Test Call History Webhook Endpoints
 * Run with: node test-call-webhooks.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';
const AGENT_ID = process.env.AGENT_ID || 'test-agent-123';
const USER_ID = process.env.USER_ID || 'test-user-456';

async function testWebhooks() {
  console.log('🧪 Testing Call History Webhooks');
  console.log('================================');
  console.log(`API URL: ${API_URL}`);
  console.log(`Agent ID: ${AGENT_ID}`);
  console.log(`User ID: ${USER_ID}`);
  console.log('');

  try {
    // Test 1: Call Started
    console.log('📞 Test 1: Sending call started webhook...');
    const callSid1 = `TEST-${Date.now()}-001`;
    const startedRes = await fetch(`${API_URL}/api/webhooks/calls/started`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callSid: callSid1,
        agentId: AGENT_ID,
        userId: USER_ID,
        direction: 'outbound',
        callerNumber: '+998901234567',
        callerName: 'Test Customer'
      })
    });
    const startedData = await startedRes.json();
    console.log('✅ Response:', JSON.stringify(startedData, null, 2));
    console.log('');

    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));

    // Test 2: Call Completed with transcript
    console.log('✅ Test 2: Sending call completed webhook with transcript...');
    const completedRes = await fetch(`${API_URL}/api/webhooks/calls/completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callSid: callSid1,
        agentId: AGENT_ID,
        duration: 180,
        recordingUrl: `https://storage.example.com/recordings/${callSid1}.mp3`,
        transcript: `Agent: Assalomu alaykum! Thank you for calling Callmind. How can I help you today?
Caller: Hi, I'm interested in learning more about your AI voice agent service.
Agent: Great question! Our AI agents can handle both inbound and outbound calls 24/7. They speak multiple languages and can be customized for your business needs.
Caller: That sounds perfect. How much does it cost?
Agent: We have flexible pricing starting from just $49/month. Would you like me to schedule a demo?
Caller: Yes, that would be great.
Agent: Perfect! I've scheduled a demo for tomorrow at 2 PM. Is there anything else I can help with?
Caller: No, that's all. Thank you!
Agent: You're welcome. Have a great day!`,
        direction: 'outbound',
        callerNumber: '+998901234567'
      })
    });
    const completedData = await completedRes.json();
    console.log('✅ Response:', JSON.stringify(completedData, null, 2));
    console.log('');

    // Test 3: Missed call
    console.log('📞 Test 3: Creating a missed call...');
    const callSid2 = `TEST-${Date.now()}-002`;
    const missedRes = await fetch(`${API_URL}/api/webhooks/calls/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callSid: callSid2,
        agentId: AGENT_ID,
        status: 'missed',
        direction: 'inbound',
        callerNumber: '+998909876543',
        duration: 0
      })
    });
    const missedData = await missedRes.json();
    console.log('✅ Response:', JSON.stringify(missedData, null, 2));
    console.log('');

    // Test 4: Rich data call
    console.log('💼 Test 4: Creating call with rich collected data...');
    const callSid3 = `TEST-${Date.now()}-003`;

    // Start the call
    await fetch(`${API_URL}/api/webhooks/calls/started`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callSid: callSid3,
        agentId: AGENT_ID,
        userId: USER_ID,
        direction: 'outbound',
        callerNumber: '+998900000001',
        callerName: 'Business Lead'
      })
    });

    await new Promise(r => setTimeout(r, 500));

    // Complete with rich data
    const richRes = await fetch(`${API_URL}/api/webhooks/calls/completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callSid: callSid3,
        agentId: AGENT_ID,
        duration: 320,
        recordingUrl: `https://storage.example.com/recordings/${callSid3}.mp3`,
        transcript: `Agent: Hello! This is Sarah from Callmind. I'm calling to follow up on your inquiry.
Caller: Oh hi! Yes, I submitted a form on your website.
Agent: Great! I see you're interested in our enterprise plan. How many agents would you need?
Caller: We have about 50 agents handling customer support.
Agent: Perfect. And what's your monthly call volume?
Caller: Around 10,000 calls per month.
Agent: Excellent. Our enterprise plan would be ideal. It includes unlimited agents and 50,000 minutes.
Caller: What's the pricing?
Agent: For your volume, it would be $499/month. Would you like me to send over a contract?
Caller: Yes, please send it to john@acme-corp.com
Agent: Will do! And what's your company name again?
Caller: Acme Corporation. We're in manufacturing.
Agent: Perfect, I have all the details. I'll email the contract within the hour.
Caller: Great, thanks Sarah!
Agent: You're welcome. Talk soon!`,
        direction: 'outbound',
        callerNumber: '+998900000001',
        sentiment: 'positive',
        topics: ['enterprise', 'pricing', 'lead qualification'],
        summary: 'High-quality lead: Acme Corporation interested in enterprise plan. 50 agents, 10k calls/month. Contract requested. John@acme-corp.com',
        collectedData: {
          name: 'John',
          email: 'john@acme-corp.com',
          company: 'Acme Corporation',
          industry: 'Manufacturing',
          agentCount: '50',
          monthlyCalls: '10,000',
          budget: '$499/month',
          leadScore: 'hot'
        },
        cost: 0.35
      })
    });
    const richData = await richRes.json();
    console.log('✅ Response:', JSON.stringify(richData, null, 2));
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('');
    console.log('📊 Test Call SIDs created:');
    console.log(`   - ${callSid1} (successful outbound)`);
    console.log(`   - ${callSid2} (missed call)`);
    console.log(`   - ${callSid3} (with rich collected data)`);
    console.log('');
    console.log('🔍 View in MongoDB:');
    console.log(`   mongosh callmind --eval 'db.callhistories.find({callSid: {$in: ["${callSid1}", "${callSid2}", "${callSid3}"]}}).pretty()'`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure your API server is running on', API_URL);
    process.exit(1);
  }
}

// Run tests
testWebhooks();
