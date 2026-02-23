#!/bin/bash

# Test Call History Webhook Endpoints
# This script sends dummy data to test if call logging works

API_URL="${API_URL:-http://localhost:3001}"
AGENT_ID="${AGENT_ID:-test-agent-123}"
USER_ID="${USER_ID:-test-user-456}"

echo "🧪 Testing Call History Webhooks"
echo "================================"
echo "API URL: $API_URL"
echo "Agent ID: $AGENT_ID"
echo "User ID: $USER_ID"
echo ""

# Test 1: Call Started Webhook
echo "📞 Test 1: Sending call started webhook..."
CALL_SID="TEST-$(date +%s)-001"
STARTED_RESPONSE=$(curl -s -X POST "$API_URL/webhooks/calls/started" \
  -H "Content-Type: application/json" \
  -d "{
    \"callSid\": \"$CALL_SID\",
    \"agentId\": \"$AGENT_ID\",
    \"userId\": \"$USER_ID\",
    \"direction\": \"outbound\",
    \"callerNumber\": \"+998901234567\",
    \"callerName\": \"Test Customer\"
  }")

echo "Response: $STARTED_RESPONSE"
echo ""

# Wait a bit
sleep 2

# Test 2: Call Completed Webhook with full data
echo "✅ Test 2: Sending call completed webhook with transcript..."
COMPLETED_RESPONSE=$(curl -s -X POST "$API_URL/webhooks/calls/completed" \
  -H "Content-Type: application/json" \
  -d "{
    \"callSid\": \"$CALL_SID\",
    \"agentId\": \"$AGENT_ID\",
    \"duration\": 180,
    \"recordingUrl\": \"https://storage.example.com/recordings/$CALL_SID.mp3\",
    \"transcript\": \"Agent: Assalomu alaykum! Thank you for calling Callmind. How can I help you today?\\nCaller: Hi, I'm interested in learning more about your AI voice agent service.\\nAgent: Great question! Our AI agents can handle both inbound and outbound calls 24/7. They speak multiple languages and can be customized for your business needs.\\nCaller: That sounds perfect. How much does it cost?\\nAgent: We have flexible pricing starting from just $49/month. Would you like me to schedule a demo?\\nCaller: Yes, that would be great.\\nAgent: Perfect! I've scheduled a demo for tomorrow at 2 PM. Is there anything else I can help with?\\nCaller: No, that's all. Thank you!\\nAgent: You're welcome. Have a great day!\",
    \"direction\": \"outbound\",
    \"callerNumber\": \"+998901234567\"
  }")

echo "Response: $COMPLETED_RESPONSE"
echo ""

# Test 3: Another call with different scenario (missed call)
echo "📞 Test 3: Creating a missed call..."
MISSED_CALL_SID="TEST-$(date +%s)-002"
MISSED_RESPONSE=$(curl -s -X POST "$API_URL/webhooks/calls/started" \
  -H "Content-Type: application/json" \
  -d "{
    \"callSid\": \"$MISSED_CALL_SID\",
    \"agentId\": \"$AGENT_ID\",
    \"userId\": \"$USER_ID\",
    \"direction\": \"inbound\",
    \"callerNumber\": \"+998909876543\",
    \"status\": \"missed\"
  }")

echo "Response: $MISSED_RESPONSE"
echo ""

# Test 4: Update missed call to completed
sleep 2
echo "🔄 Test 4: Updating call status..."
STATUS_UPDATE_RESPONSE=$(curl -s -X POST "$API_URL/webhooks/calls/status" \
  -H "Content-Type: application/json" \
  -d "{
    \"callSid\": \"$MISSED_CALL_SID\",
    \"agentId\": \"$AGENT_ID\",
    \"status\": \"completed\",
    \"duration\": 0,
    \"sentiment\": \"neutral\",
    \"summary\": \"Customer called but no agent was available\"
  }")

echo "Response: $STATUS_UPDATE_RESPONSE"
echo ""

# Test 5: Call with rich collected data
echo "💼 Test 5: Creating a call with collected business data..."
RICH_CALL_SID="TEST-$(date +%s)-003"
curl -s -X POST "$API_URL/webhooks/calls/started" \
  -H "Content-Type: application/json" \
  -d "{
    \"callSid\": \"$RICH_CALL_SID\",
    \"agentId\": \"$AGENT_ID\",
    \"userId\": \"$USER_ID\",
    \"direction\": \"outbound\",
    \"callerNumber\": \"+998900000001\",
    \"callerName\": \"Business Lead\"
  }" > /dev/null

sleep 2
RICH_RESPONSE=$(curl -s -X POST "$API_URL/webhooks/calls/completed" \
  -H "Content-Type: application/json" \
  -d "{
    \"callSid\": \"$RICH_CALL_SID\",
    \"agentId\": \"$AGENT_ID\",
    \"duration\": 320,
    \"recordingUrl\": \"https://storage.example.com/recordings/$RICH_CALL_SID.mp3\",
    \"transcript\": \"Agent: Hello! This is Sarah from Callmind. I'm calling to follow up on your inquiry.\\nCaller: Oh hi! Yes, I submitted a form on your website.\\nAgent: Great! I see you're interested in our enterprise plan. How many agents would you need?\\nCaller: We have about 50 agents handling customer support.\\nAgent: Perfect. And what's your monthly call volume?\\nCaller: Around 10,000 calls per month.\\nAgent: Excellent. Our enterprise plan would be ideal. It includes unlimited agents and 50,000 minutes.\\nCaller: What's the pricing?\\nAgent: For your volume, it would be $499/month. Would you like me to send over a contract?\\nCaller: Yes, please send it to john@acme-corp.com\\nAgent: Will do! And what's your company name again?\\nCaller: Acme Corporation. We're in manufacturing.\\nAgent: Perfect, I have all the details. I'll email the contract within the hour.\\nCaller: Great, thanks Sarah!\\nAgent: You're welcome. Talk soon!\",
    \"direction\": \"outbound\",
    \"callerNumber\": \"+998900000001\",
    \"sentiment\": \"positive\",
    \"topics\": [\"enterprise\", \"pricing\", \"lead qualification\"],
    \"summary\": \"High-quality lead: Acme Corporation interested in enterprise plan. 50 agents, 10k calls/month. Contract requested. John@acme-corp.com\",
    \"collectedData\": {
      \"name\": \"John\",
      \"email\": \"john@acme-corp.com\",
      \"company\": \"Acme Corporation\",
      \"industry\": \"Manufacturing\",
      \"agentCount\": \"50\",
      \"monthlyCalls\": \"10,000\",
      \"budget\": \"$499/month\",
      \"leadScore\": \"hot\"
    },
    \"cost\": 0.35
  }")

echo "Response: $RICH_RESPONSE"
echo ""

echo "✅ All tests completed!"
echo ""
echo "📊 To view the test data in MongoDB:"
echo "   mongosh callmind --eval 'db.callhistories.find().pretty()'"
echo ""
echo "🔍 Test Call SIDs created:"
echo "   - $CALL_SID (successful outbound)"
echo "   - $MISSED_CALL_SID (missed then updated)"
echo "   - $RICH_CALL_SID (with rich collected data)"
