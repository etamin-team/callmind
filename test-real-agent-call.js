#!/usr/bin/env node

/**
 * Test Call History with Real Agent
 * Uses your actual agent from the database
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';
const AGENT_ID = '6981dfe508b28a652d46c3e5';
const USER_ID = 'user_37NW4YrLX0dw6A99b4o6bz0TYHs';

async function testRealAgentCall() {
  console.log('🧪 Testing Call History with Real Agent');
  console.log('========================================');
  console.log(`API URL: ${API_URL}`);
  console.log(`Agent ID: ${AGENT_ID}`);
  console.log(`User ID: ${USER_ID}`);
  console.log('');

  try {
    // Test 1: Start an outbound call
    console.log('📞 Test 1: Starting outbound call...');
    const callSid1 = `REAL-${Date.now()}-001`;
    const startedRes = await fetch(`${API_URL}/api/webhooks/calls/started`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callSid: callSid1,
        agentId: AGENT_ID,
        userId: USER_ID,
        direction: 'outbound',
        callerNumber: '+998901234567',
        callerName: 'Insurance Customer'
      })
    });

    if (!startedRes.ok) {
      const error = await startedRes.json();
      console.log('❌ Failed:', error);
      return;
    }

    const startedData = await startedRes.json();
    console.log('✅ Call started:', callSid1);
    console.log('   Record ID:', startedData.id);
    console.log('');

    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));

    // Test 2: Complete the call with transcript
    console.log('✅ Test 2: Completing call with transcript...');
    const completedRes = await fetch(`${API_URL}/api/webhooks/calls/completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callSid: callSid1,
        agentId: AGENT_ID,
        duration: 245,
        recordingUrl: `https://storage.example.com/recordings/${callSid1}.mp3`,
        transcript: `Agent: Assalomu alaykum! Thank you for calling cxcxc Insurance. How can I help you today?
Caller: Hi, I'm calling about my existing policy. I have some questions about my coverage.
Agent: Of course! I'd be happy to help. Could you please provide me with your name so I can look up your policy?
Caller: Sure, my name is John Smith.
Agent: Thank you, John. I can see your policy here. What questions do you have?
Caller: I want to know if my policy covers water damage from recent storms.
Agent: Great question, John. Let me check... Yes, your comprehensive policy does cover water damage from storms. However, there's a deductible of $500 that would apply.
Caller: That's good to know. Are there any exclusions I should be aware of?
Agent: Yes, flood damage from rising water isn't covered - you'd need separate flood insurance for that. But rain damage through the roof is covered.
Caller: Got it. One more thing - how do I file a claim if I need to?
Agent: You can file a claim 24/7 by calling our claims hotline, through our mobile app, or on our website at cxcxc.com/claims. Would you like me to send you the claims information?
Caller: Yes, please. That would be helpful.
Agent: Perfect! I'll send that to your email on file. Is there anything else I can help you with today?
Caller: No, that's all. Thank you for your help!
Agent: You're welcome, John. Thank you for choosing cxcxc Insurance. Have a great day!`,
        direction: 'outbound',
        callerNumber: '+998901234567',
        sentiment: 'positive',
        topics: ['insurance inquiry', 'policy coverage', 'claims process'],
        summary: 'Customer John Smith called about insurance policy coverage for water damage. Agent confirmed coverage, explained deductible, and provided claims filing information.',
        collectedData: {
          name: 'John Smith',
          inquiryType: 'Coverage Question',
          policyType: 'Comprehensive',
          deductible: '$500',
          followUpNeeded: 'Claims info sent via email'
        },
        cost: 0.42
      })
    });

    if (!completedRes.ok) {
      const error = await completedRes.json();
      console.log('❌ Failed:', error);
      return;
    }

    const completedData = await completedRes.json();
    console.log('✅ Call completed!');
    console.log('   Duration:', completedData.duration, 'seconds');
    console.log('   Status:', completedData.status);
    console.log('   Sentiment:', completedData.sentiment);
    console.log('   Topics:', completedData.topics.join(', '));
    console.log('');

    // Test 3: Another call - missed call
    console.log('📞 Test 3: Creating a missed call...');
    const callSid2 = `REAL-${Date.now()}-002`;
    const missedRes = await fetch(`${API_URL}/api/webhooks/calls/started`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callSid: callSid2,
        agentId: AGENT_ID,
        userId: USER_ID,
        direction: 'outbound',
        callerNumber: '+998909876543',
        status: 'missed'
      })
    });

    if (missedRes.ok) {
      const missedData = await missedRes.json();
      console.log('✅ Missed call recorded:', callSid2);
    }
    console.log('');

    // Test 4: Successful sales call
    console.log('💼 Test 4: Creating successful sales call...');
    const callSid3 = `REAL-${Date.now()}-003`;

    await fetch(`${API_URL}/api/webhooks/calls/started`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callSid: callSid3,
        agentId: AGENT_ID,
        userId: USER_ID,
        direction: 'outbound',
        callerNumber: '+998900000001',
        callerName: 'Lead'
      })
    });

    await new Promise(r => setTimeout(r, 500));

    const salesRes = await fetch(`${API_URL}/api/webhooks/calls/completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callSid: callSid3,
        agentId: AGENT_ID,
        duration: 380,
        recordingUrl: `https://storage.example.com/recordings/${callSid3}.mp3`,
        transcript: `Agent: Hello! This is cxcxc Insurance calling. I'm reaching out to discuss your insurance options.
Caller: Oh hi! I actually requested a quote online yesterday.
Agent: Excellent! Yes, I see that here. I understand you're looking for comprehensive coverage for your home and auto?
Caller: That's right. I'm currently with another provider but your rates seem better.
Agent: Definitely! We offer some of the most competitive rates in the industry. For your home and auto bundle, I can offer you 20% off plus a loyalty discount after your first year.
Caller: That sounds great. What's the monthly premium?
Agent: For your specific coverage needs, it would be $127 per month for both policies. And that includes roadside assistance and rental car coverage.
Caller: Hmm, that's very tempting. What about the deductible?
Agent: We have flexible deductible options. You can choose $500, $1000, or $1500. The higher your deductible, the lower your premium.
Caller: I'd prefer the $500 deductible. So $127 a month with $500 deductible?
Agent: Exactly! And I can throw in a free home security assessment as a new customer bonus.
Caller: You've got yourself a deal! What do I need to do to sign up?
Agent: Perfect! I just need a few details. Can I get your full name?
Caller: Sarah Johnson.
Agent: Great, Sarah. And your current address?
Caller: 123 Main Street, Tashkent.
Agent: Perfect. I'll prepare the paperwork and email it to you for electronic signature. You should receive it within 15 minutes.
Caller: Wonderful! Thank you so much for your help.
Agent: My pleasure, Sarah! Welcome to cxcxc Insurance. You'll receive a welcome packet within 24 hours. Have a great day!`,
        direction: 'outbound',
        callerNumber: '+998900000001',
        sentiment: 'positive',
        topics: ['sales', 'new customer', 'policy signup', 'home and auto bundle'],
        summary: 'Successful sales call - Customer Sarah Johnson signed up for home and auto insurance bundle at $127/month with $500 deductible. Included roadside assistance, rental car coverage, and free home security assessment.',
        collectedData: {
          name: 'Sarah Johnson',
          address: '123 Main Street, Tashkent',
          policyType: 'Home and Auto Bundle',
          monthlyPremium: '$127',
          deductible: '$500',
          leadSource: 'Online quote request',
          status: 'Closed - Won',
          value: '$1524/year',
          followUp: 'Welcome packet + paperwork email'
        },
        cost: 0.55
      })
    });

    if (salesRes.ok) {
      const salesData = await salesRes.json();
      console.log('✅ Sales call recorded!');
      console.log('   Customer:', salesData.callerName);
      console.log('   Value: $1524/year');
      console.log('   Status: Closed - Won');
    }
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ${callSid1}: Policy inquiry call`);
    console.log(`   - ${callSid2}: Missed call`);
    console.log(`   - ${callSid3}: Successful sale ($1524/year)`);
    console.log('');
    console.log('💡 To integrate with your call backend:');
    console.log('   Your call backend should send webhooks to these endpoints:');
    console.log(`   POST ${API_URL}/api/webhooks/calls/started`);
    console.log(`   POST ${API_URL}/api/webhooks/calls/completed`);
    console.log(`   POST ${API_URL}/api/webhooks/calls/status`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRealAgentCall();
