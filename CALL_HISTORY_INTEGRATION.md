# Call History Integration Guide

## Overview

Your call backend needs to send call data to the Callmind backend to store and display call history.

**Callmind Backend URL:** `https://your-callmind-api.com/api`

---

## Authentication

All API requests need a Bearer token in the headers:

```bash
Authorization: Bearer YOUR_CLERK_JWT_TOKEN
Content-Type: application/json
```

> **Note:** Get the token from Clerk authentication. For webhook calls from your backend, you may need to authenticate as the user who owns the agent.

---

## API Endpoints

### 1. Create Call Record (When Call Starts)

**Endpoint:** `POST /api/call-history`

**When to use:** When a call first starts ringing or is answered

**Request Body:**
```json
{
  "agentId": "agent_12345",
  "userId": "user_67890",
  "orgId": "org_abc123",
  "callSid": "CA-unique-call-id-from-phone-system",
  "direction": "inbound",
  "callerNumber": "+1234567890",
  "callerName": "John Doe",
  "status": "in-progress",
  "startedAt": "2025-01-17T10:30:00Z"
}
```

**Response:**
```json
{
  "id": "call_789",
  "agentId": "agent_12345",
  "status": "in-progress",
  "createdAt": "2025-01-17T10:30:00Z"
}
```

**Example (cURL):**
```bash
curl -X POST https://your-callmind-api.com/api/call-history \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_12345",
    "userId": "user_67890",
    "callSid": "CA-unique-call-id",
    "direction": "inbound",
    "callerNumber": "+1234567890",
    "status": "in-progress"
  }'
```

---

### 2. Update Call Status (When Call Ends)

**Endpoint:** `PATCH /api/call-history/{callId}/status`

**When to use:** When a call completes, is missed, or fails

**Request Body:**
```json
{
  "status": "completed",
  "duration": 245,
  "recordingUrl": "https://s3.amazonaws.com/recordings/call-123.mp3",
  "transcript": "Agent: Hello, thank you for calling...\nCaller: Hi, I need help with...",
  "sentiment": "positive",
  "topics": ["support", "billing"],
  "summary": "Customer called about billing issue, successfully resolved",
  "collectedData": {
    "name": "John Smith",
    "email": "john@example.com",
    "accountNumber": "ACC-12345"
  },
  "cost": 0.15
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `completed`, `missed`, or `failed` |
| duration | number | No | Call duration in seconds |
| recordingUrl | string | No | URL to audio recording |
| transcript | string | No | Full text transcript of conversation |
| sentiment | string | No | `positive`, `negative`, or `neutral` |
| topics | array | No | List of topics discussed |
| summary | string | No | AI-generated summary of call |
| collectedData | object | No | Data collected during call (email, name, etc.) |
| cost | number | No | Cost of the call in USD |

**Example (cURL):**
```bash
curl -X PATCH https://your-callmind-api.com/api/call-history/call_789/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "duration": 245,
    "transcript": "Full conversation text...",
    "sentiment": "positive"
  }'
```

---

### 3. Alternative: Use Webhook Endpoints (Simpler)

If you prefer webhook-style endpoints, these are also available:

#### Call Started Webhook
```bash
POST /api/webhooks/calls/started
```

**Request:**
```json
{
  "callSid": "CA-unique-call-id",
  "agentId": "agent_12345",
  "direction": "inbound",
  "callerNumber": "+1234567890"
}
```

#### Call Completed Webhook
```bash
POST /api/webhooks/calls/completed
```

**Request:**
```json
{
  "callSid": "CA-unique-call-id",
  "duration": 245,
  "recordingUrl": "https://...",
  "transcript": "Full text...",
  "sentiment": "positive",
  "summary": "Customer asked about pricing"
}
```

---

## Complete Example: Call Flow

Here's a complete example of handling a call from start to finish:

### Step 1: Call Starts
```bash
curl -X POST https://your-callmind-api.com/api/call-history \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_12345",
    "userId": "user_67890",
    "callSid": "CA-9876543210",
    "direction": "inbound",
    "callerNumber": "+1234567890",
    "status": "in-progress"
  }'
```

**Response:** Returns `callId` - save this: `"call_abc123"`

### Step 2: Call Ends (Update with Data)
```bash
curl -X PATCH https://your-callmind-api.com/api/call-history/call_abc123/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "duration": 180,
    "recordingUrl": "https://storage.com/recording.mp3",
    "transcript": "Agent: Hello...\nCaller: I need...",
    "sentiment": "positive",
    "topics": ["sales", "pricing"],
    "summary": "Lead interested in enterprise plan",
    "collectedData": {
      "name": "Jane Doe",
      "email": "jane@company.com",
      "company": "Acme Inc",
      "budget": "$5000"
    },
    "cost": 0.12
  }'
```

---

## Code Examples

### Node.js / JavaScript

```javascript
const API_URL = 'https://your-callmind-api.com/api'
const TOKEN = 'your-clerk-jwt-token'

// When call starts
async function callStarted(callData) {
  const response = await fetch(`${API_URL}/call-history`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agentId: callData.agentId,
      userId: callData.userId,
      callSid: callData.callSid,
      direction: 'inbound',
      callerNumber: callData.from,
      status: 'in-progress'
    })
  })

  const call = await response.json()
  return call.id // Save this for later
}

// When call ends
async function callEnded(callId, callData) {
  await fetch(`${API_URL}/call-history/${callId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'completed',
      duration: callData.duration,
      recordingUrl: callData.recordingUrl,
      transcript: callData.transcript,
      sentiment: callData.sentiment,
      topics: callData.topics,
      summary: callData.summary,
      collectedData: callData.collectedData,
      cost: callData.cost
    })
  })
}

// Usage
const callId = await callStarted({
  agentId: 'agent_123',
  userId: 'user_456',
  callSid: 'CA-unique-id',
  from: '+1234567890'
})

// ... call processing happens ...

await callEnded(callId, {
  duration: 180,
  recordingUrl: 'https://...',
  transcript: 'Full conversation...',
  sentiment: 'positive',
  topics: ['support'],
  summary: 'Helped customer with login issue'
})
```

### Python

```python
import requests
import json

API_URL = "https://your-callmind-api.com/api"
TOKEN = "your-clerk-jwt-token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# When call starts
def call_started(call_data):
    response = requests.post(
        f"{API_URL}/call-history",
        headers=headers,
        json={
            "agentId": call_data["agentId"],
            "userId": call_data["userId"],
            "callSid": call_data["callSid"],
            "direction": "inbound",
            "callerNumber": call_data["from"],
            "status": "in-progress"
        }
    )
    return response.json()["id"]

# When call ends
def call_ended(call_id, call_data):
    requests.patch(
        f"{API_URL}/call-history/{call_id}/status",
        headers=headers,
        json={
            "status": "completed",
            "duration": call_data["duration"],
            "recordingUrl": call_data.get("recordingUrl"),
            "transcript": call_data.get("transcript"),
            "sentiment": call_data.get("sentiment"),
            "topics": call_data.get("topics", []),
            "summary": call_data.get("summary"),
            "collectedData": call_data.get("collectedData", {}),
            "cost": call_data.get("cost", 0)
        }
    )

# Usage
call_id = call_started({
    "agentId": "agent_123",
    "userId": "user_456",
    "callSid": "CA-unique-id",
    "from": "+1234567890"
})

# ... call processing happens ...

call_ended(call_id, {
    "duration": 180,
    "recordingUrl": "https://...",
    "transcript": "Full conversation...",
    "sentiment": "positive"
})
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - Call updated |
| 201 | Created - New call record created |
| 400 | Bad Request - Missing or invalid data |
| 401 | Unauthorized - Invalid or missing token |
| 404 | Not Found - Call ID doesn't exist |
| 500 | Server Error - Something went wrong |

---

## Testing the Integration

You can test the endpoints without your call backend using cURL:

```bash
# Test creating a call
curl -X POST http://localhost:3001/api/call-history \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-agent",
    "userId": "test-user",
    "callSid": "TEST-123",
    "direction": "inbound",
    "callerNumber": "+1234567890",
    "status": "in-progress"
  }'

# Test updating status (use the ID returned above)
curl -X PATCH http://localhost:3001/api/call-history/{ID}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "duration": 60,
    "summary": "Test call completed"
  }'
```

---

## FAQ

**Q: What if I don't have all the data (transcript, recording, etc)?**
A: Only send what you have. All fields except `status` and `duration` are optional.

**Q: Can I update a call multiple times?**
A: Yes! You can call the status update endpoint multiple times to add more data as it becomes available.

**Q: How do I get the authentication token?**
A: The token comes from Clerk. You'll need to authenticate as the user who owns the agent.

**Q: What's `callSid`?**
A: It's a unique identifier for the call from your phone system (Twilio CallSid, Vonage call UUID, etc.). This prevents duplicate records if webhooks are sent multiple times.

**Q: Can I skip the "call started" step and just send completed call data?**
A: Yes! You can create and complete a call in one step by sending all data in the initial POST request with status `"completed"`.

---

## Need Help?

If you have questions or issues:
1. Check the server logs for error messages
2. Verify your authentication token is valid
3. Make sure the `agentId` exists in the database
4. Test with simple cURL commands first
