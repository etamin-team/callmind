# Payme Integration Fixes

## Issues Found & Fixed

### 1. MongoDB Duplicate Key Error

**Error:** `E11000 duplicate key error collection: mongodb.paymetransactions index: paymeTransactionId_1 dup key: { paymeTransactionId: null }`

**Cause:** MongoDB still has old index `paymeTransactionId_1` from before we renamed the field to `transactionId`.

**Fix:** Run the migration script:

```bash
pnpm fix-payme-indexes --filter=api
```

This will:

- Connect to MongoDB
- Drop old `paymeTransactionId_1` index
- Recreate collection with correct schema
- Mongoose will recreate indexes automatically on next startup

### 2. Missing Response Fields

**Error:** "Результат метода не соответствует спецификации" - Response doesn't match specification

**Cause:** Methods were conditionally including `perform_time`, `cancel_time`, `reason` fields instead of always including them.

**Fixes Applied:**

- ✅ `CheckTransaction` - Always includes all fields (even if 0/null)
- ✅ `PerformTransaction` - Always includes `create_time`, `cancel_time`
- ✅ `CreateTransaction` - Always includes `perform_time`, `cancel_time`
- ✅ `CancelTransaction` - Always includes `create_time`, `perform_time`

**Example Response Format:**

```json
{
  "transaction": "merchant-transaction-id",
  "state": 2,
  "create_time": 1772354907388,
  "perform_time": 1772354907400,
  "cancel_time": 0,
  "reason": null
}
```

### 3. Duplicate Transaction Error Handling

**Error:** MongoDB duplicate key errors weren't being caught and converted to Payme errors.

**Fix:** Added try-catch in `CreateTransaction` to:

- Catch MongoDB duplicate errors (code 11000/11001)
- Look for existing transaction
- Return existing transaction instead of throwing error

### 4. Test Users Not Found

**Issue:** Payme sandbox tests use `user_id` values that don't exist in your database.

**Solution:** Two approaches:

#### Option A: Auto-create test users

Create test users on demand using the new `/api/payme/test-user` endpoint:

```bash
curl -X POST http://localhost:3001/api/payme/test-user \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_37NW4YrLX0dw6A99b4o6bz0TYHs"}'
```

#### Option B: Pre-create test users

Create all expected test users before running Payme tests:

```bash
# Using MongoDB
use callmind
db.users.insertMany([
  {
    email: "user_37NW4YrLX0dw6A99b4o6bz0TYHs@test.uz",
    name: "Payme Test User 1",
    clerkUserId: "user_37NW4YrLX0dw6A99b4o6bz0TYHs",
    plan: "free",
    credits: 0
  },
  // Add more test users as needed
])
```

## How to Run Tests Again

### Step 1: Fix MongoDB Indexes

```bash
cd /home/abbskhnv/Desktop/etamin/Callmind
pnpm fix-payme-indexes --filter=api
```

### Step 2: Create Test Users (Option A - Recommended)

```bash
# Create the test users that Payme sandbox uses
curl -X POST http://localhost:3001/api/payme/test-user \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_37NW4YrLX0dw6A99b4o6bz0TYHs"}'
```

Or register the test-utils routes and use them to manage test users.

### Step 3: Start API

```bash
pnpm dev:api
```

### Step 4: Test in Payme Sandbox

Go to Payme Business dashboard and run the tests again.

## File Changes

### Core Files Updated:

- ✅ `packages/db/src/models/payme-transaction.model.ts` - Field names fixed
- ✅ `apps/api/src/routes/payme/merchant.routes.ts` - All methods return complete responses
- ✅ `apps/api/src/config/environment.ts` - PAYME_PASSWORD instead of PAYME_KEY
- ✅ `.env` and `.env.example` - Proper Payme configuration

### New Files Created:

- ✅ `packages/types/src/payme.ts` - Complete Payme types and constants
- ✅ `apps/api/scripts/fix-payme-indexes.ts` - MongoDB index migration script
- ✅ `apps/api/src/routes/test-utils/index.ts` - Test user management routes

## Environment Configuration

Make sure your `.env` has:

```env
# Payme Configuration (Uzbekistan)
PAYME_MERCHANT_ID=your_merchant_id
PAYME_LOGIN=Paycom  # "Paycom" for test mode
PAYME_PASSWORD=your_secret_key_from_payme_dashboard
PAYME_ENDPOINT_URL=https://checkout.paycom.uz/api
PAYME_CALLBACK_URL=https://your-domain.com
```

## Payme API Method Flow

1. **CheckPerformTransaction** - Validate payment is possible
2. **CreateTransaction** - Create pending transaction in DB
3. **CheckTransaction** - Get transaction status
4. **PerformTransaction** - Mark paid, grant credits
5. **CancelTransaction** - Cancel or refund transaction
6. **GetStatement** - Get transaction history

All methods now return proper JSON-RPC 2.0 responses with all required fields!
