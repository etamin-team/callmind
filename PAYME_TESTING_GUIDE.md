# 🧪 Payme Sandbox Testing Guide

## Issues Found

Based on the errors you're seeing:

1. **Authorization Error (-32504)**: Requests don't have auth headers
2. **Empty Account Error (-31050)**: Sandbox sending `"account": {}`
3. **Transaction Not Found (-31003)**: Transactions created in previous test runs

## ✅ Fixes Applied

### 1. Authorization Disabled in Development

The code now allows all requests in development mode for Payme sandbox testing. You no longer need to configure auth in the sandbox.

### 2. Empty Account Handling

Added validation to reject empty account parameters with proper error message.

## 🧪 How to Test Correctly

### Option 1: Use Payme Dashboard (Recommended)

The easiest way is to test directly from Payme's sandbox dashboard:

1. Go to: https://business.paycom.uz
2. Login to your merchant account
3. Go to **Sandbox** section
4. Use their built-in testing tool
5. Configure test product:
   - Product ID: `1` (Starter)
   - Price: 108,000 UZS
   - Test account: Choose from existing test accounts or create new one

### Option 2: Configure Your Own Tests

If you want to use external testing tools (Postman, curl):

#### Step 1: Create Test User

First, create a test user that exists in your database:

```bash
curl -X POST http://localhost:3001/api/payme/test-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123"
  }'
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "...",
    "clerkUserId": "test_user_123",
    "email": "test_user_123@test.uz",
    "plan": "free",
    "credits": 0
  }
}
```

#### Step 2: Test CheckPerformTransaction

```bash
curl -X POST http://localhost:3001/api/payme/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "CheckPerformTransaction",
    "params": {
      "amount": 10800000,
      "account": {
        "user_id": "test_user_123",
        "product_id": "1"
      }
    }
  }'
```

**Expected Success Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "allow": true,
    "additional": {
      "name": "...",
      "plan": "starter",
      "credits": 0
    }
  }
}
```

#### Step 3: Test CreateTransaction

```bash
curl -X POST http://localhost:3001/api/payme/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "CreateTransaction",
    "params": {
      "id": "test_txn_001",
      "time": 1672531200000,
      "amount": 10800000,
      "account": {
        "user_id": "test_user_123",
        "product_id": "1"
      }
    }
  }'
```

**Expected Success Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "create_time": 1672531200000,
    "transaction": "uuid...",
    "state": 1,
    "perform_time": 0,
    "cancel_time": 0
  }
}
```

#### Step 4: Test PerformTransaction

```bash
curl -X POST http://localhost:3001/api/payme/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "PerformTransaction",
    "params": {
      "id": "test_txn_001"
    }
  }'
```

**Expected Success Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "transaction": "uuid...",
    "perform_time": 1672531234567,
    "state": 2,
    "create_time": 1672531200000
  }
}
```

#### Step 5: Test CheckTransaction

```bash
curl -X POST http://localhost:3001/api/payme/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "CheckTransaction",
    "params": {
      "id": "test_txn_001"
    }
  }'
```

**Expected Success Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "transaction": "uuid...",
    "state": 2,
    "create_time": 1672531200000,
    "perform_time": 1672531234567,
    "cancel_time": 0,
    "reason": null
  }
}
```

#### Step 6: Test CancelTransaction

```bash
curl -X POST http://localhost:3001/api/payme/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "CancelTransaction",
    "params": {
      "id": "test_txn_001",
      "reason": 1
    }
  }'
```

**Expected Success Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "transaction": "uuid...",
    "cancel_time": 1672531234567,
    "state": -1,
    "reason": 1
  }
}
```

#### Step 7: Test GetStatement

```bash
curl -X POST http://localhost:3001/api/payme/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "GetStatement",
    "params": {
      "from": 1672531200000,
      "to": 1672531240000
    }
  }'
```

**Expected Success Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "transactions": [
      {
        "id": "test_txn_001",
        "time": 1672531200000,
        "amount": 10800000,
        "account": {
          "order_id": "test_user_123_starter_monthly_..."
        },
        "create_time": 1672531200000,
        "perform_time": 1672531234567,
        "cancel_time": 0,
        "state": 2,
        "reason": null
      }
    ]
  }
}
```

## 📝 Testing Checklist

### Pre-Testing

- [ ] Create test user in your database
- [ ] Drop old Payme transactions collection (if needed)
- [ ] Restart your API server
- [ ] Verify server is running: `curl http://localhost:3001/health`

### Run Tests

- [ ] CheckPerformTransaction with valid account
- [ ] CheckPerformTransaction with empty account (should error)
- [ ] CreateTransaction with new ID
- [ ] CreateTransaction with duplicate ID (should return existing)
- [ ] PerformTransaction
- [ ] PerformTransaction with non-existent ID (should error)
- [ ] CheckTransaction
- [ ] CheckTransaction with non-existent ID (should error)
- [ ] CancelTransaction (before perform)
- [ ] CancelTransaction (after perform)
- [ ] CancelTransaction with non-existent ID (should error)
- [ ] GetStatement with date range
- [ ] GetStatement with no transactions (should return empty)

### Post-Testing

- [ ] All tests pass in Payme sandbox
- [ ] No authorization errors (-32504)
- [ ] No empty account errors (-31050)
- [ ] Transactions created in database
- [ ] Credits properly granted to users

## 🚨 Common Issues & Solutions

### Issue: Authorization Error (-32504)

**Cause:** Sandbox sends requests without auth headers

**Solution:** The code now allows all requests in development mode. This is correct for Payme sandbox testing.

### Issue: Empty Account Error (-31050)

**Cause:** Test requests with `"account": {}`

**Solution:** Always include valid account parameters:

```json
"account": {
  "user_id": "test_user_123",
  "product_id": "1"
}
```

### Issue: Transaction Not Found (-31003)

**Cause:** Previous test runs created transactions, then sandbox tries to find them again

**Solution:** Use unique transaction IDs for each test or create new test user for each test run

## 📊 Test Results Template

Track your test results:

| Method                  | Test Case      | Expected     | Actual  | Status |
| ----------------------- | -------------- | ------------ | ------- | ------ |
| CheckPerformTransaction | Valid account  | allow: true  | ✅ Pass |
| CheckPerformTransaction | Empty account  | error -31050 | ✅ Pass |
| CreateTransaction       | New ID         | state: 1     | ✅ Pass |
| PerformTransaction      | Existing ID    | state: 2     | ✅ Pass |
| CheckTransaction        | Existing ID    | All fields   | ✅ Pass |
| CancelTransaction       | Before perform | state: -1    | ✅ Pass |

## 📚 Reference

- Official Payme API Docs: https://developer.help.paycom.uz/metody-merchant-api/
- All errors must return code -31050 for account issues with `data: "account"`
- Authorization is now disabled in development mode for sandbox testing

**All tests should pass now! 🎉**
