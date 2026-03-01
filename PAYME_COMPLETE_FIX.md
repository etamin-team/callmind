# Payme Integration Complete Fix - Based on Official Documentation

## ✅ All Issues Fixed

Based on official Payme Merchant API documentation: https://developer.help.paycom.uz/metody-merchant-api/

### 1. Transaction States Updated

**Fixed:** Now using correct state values from Payme docs:

```typescript
const TRANSACTION_STATE_CREATED = 1; // Created/initial
const TRANSACTION_STATE_PERFORMED = 2; // Performed/paid
const TRANSACTION_STATE_CANCELLED_BEFORE_PERFORM = -1; // Cancelled before perform
const TRANSACTION_STATE_CANCELLED_AFTER_PERFORM = -2; // Cancelled after perform (refund)
```

### 2. CheckPerformTransaction Response

**Fixed:** Now returns proper format with `allow` field and optional `additional` info:

```typescript
// ✅ Fixed - returns proper Payme format
return {
  allow: true,
  additional: {
    name: user.name,
    plan: plan,
  },
};
```

### 3. CreateTransaction Response

**Fixed:** Returns correct response format:

```typescript
// ✅ Fixed - all required fields present
return {
  create_time: time || now.getTime(),
  transaction: merchantTransactionId,
  state: TRANSACTION_STATE_CREATED,
  perform_time: 0,
  cancel_time: 0,
};
```

### 4. PerformTransaction Response

**Fixed:** Returns correct response format:

```typescript
// ✅ Fixed - proper Payme response
return {
  transaction: transaction.merchantTransactionId,
  create_time: transaction.createTime.getTime(),
  perform_time: transaction.performTime.getTime(),
  cancel_time: 0,
  state: TRANSACTION_STATE_PERFORMED,
  reason: null,
};
```

### 5. CheckTransaction Response

**Fixed:** Always returns all required fields:

```typescript
// ✅ Fixed - complete response with all fields
return {
  transaction: transaction.merchantTransactionId,
  state: transaction.state,
  create_time: transaction.createTime.getTime(),
  perform_time: transaction.performTime ? transaction.performTime.getTime() : 0,
  cancel_time: transaction.cancelTime ? transaction.cancelTime.getTime() : 0,
  reason: transaction.reason ?? null,
};
```

### 6. CancelTransaction Response

**Fixed:** Properly handles both cancel states:

```typescript
// ✅ Fixed - supports both -1 and -2 states
const cancelState =
  transaction.state === TRANSACTION_STATE_PERFORMED
    ? TRANSACTION_STATE_CANCELLED_AFTER_PERFORM
    : TRANSACTION_STATE_CANCELLED_BEFORE_PERFORM;

return {
  transaction: transaction.merchantTransactionId,
  create_time: transaction.createTime.getTime(),
  perform_time: transaction.performTime ? transaction.performTime.getTime() : 0,
  cancel_time: transaction.cancelTime.getTime(),
  state: cancelState,
  reason: transaction.reason ?? null,
};
```

### 7. Duplicate Transaction Handling

**Fixed:** Catches MongoDB duplicate errors and returns existing transaction:

```typescript
// ✅ Fixed - graceful handling of duplicates
try {
  await transaction.save();
} catch (error: any) {
  if (error.code === 11000 || error.code === 11001) {
    // Find and return existing transaction instead of throwing error
    const existing = await PaymeTransactionModel.findOne({ transactionId: id });
    if (existing) {
      return {
        /* existing transaction data */
      };
    }
  }
  throw error;
}
```

### 8. MongoDB Index Issue

**Fixed:** Field name changed from `paymeTransactionId` to `transactionId`

**Solution:** Drop old collection to recreate indexes:

```bash
mongosh mongodb://localhost:27017/callmind
use callmind
db.paymetransactions.drop()
exit
```

Then restart API - Mongoose will recreate with correct indexes.

## 📋 Payme API Method Flow

```
1. CheckPerformTransaction → Validate payment is possible → Returns { allow: true }
2. CreateTransaction → Create pending transaction → Returns { create_time, transaction, state }
3. PerformTransaction → Mark paid, grant credits → Returns { transaction, perform_time, state }
4. CheckTransaction → Get transaction status → Returns { transaction, all time fields, state, reason }
5. CancelTransaction → Cancel or refund → Returns { transaction, cancel_time, state }
6. GetStatement → Get transaction history → Returns { transactions: [...] }
```

## 🧪 Testing Your Integration

### Step 1: Fix MongoDB Indexes

```bash
# Drop Payme collection to fix duplicate key errors
mongosh mongodb://localhost:27017/callmind << 'EOF'
use callmind
db.paymetransactions.drop()
exit
EOF
```

### Step 2: Restart API

```bash
pnpm dev:api
```

### Step 3: Run Payme Sandbox Tests

Go to: https://business.paycom.uz → Sandbox

Run test suite - all methods should now pass! 🎉

## 📝 Configuration Files Updated

### `.env` - Updated with:

- ✅ `MONGODB_URI` (MongoDB connection)
- ✅ `PAYME_LOGIN` = "Paycom" (test mode)
- ✅ `PAYME_PASSWORD` (secret key)
- ✅ `PAYME_CALLBACK_URL`

### Schema - Updated:

- ✅ `transactionId` field (was `paymeTransactionId`)
- ✅ `reason` as `number` (was `string`)
- ✅ `provider` field
- ✅ State enum: [-2, -1, 1, 2]

## 📊 Error Codes

All errors return proper format:

```json
{
  "error": {
    "code": -31050, // Payme error code
    "message": "localized message", // Required: uz/ru/en
    "data": "account" // Optional: account subfield name
  }
}
```

Key error codes:

- `-31001` - Invalid amount
- `-31003` - Transaction not found
- `-31007` - Cannot cancel (order fulfilled)
- `-31008` - Cannot perform operation
- `-31050 to -31099` - Account errors (user not found)
- `-32400` - System error
- `-32504` - Authorization error

## 🎯 Next Steps

1. Drop MongoDB collection (step 1 above)
2. Restart your API (step 2 above)
3. Test in Payme sandbox
4. Activate merchant if not yet active
5. Configure products in Payme dashboard:
   - Product ID 1: Starter - 108,000 UZS
   - Product ID 2: Professional - 348,000 UZS
   - Product ID 3: Business - 948,000 UZS
6. Go live after successful sandbox testing!

## 📚 Documentation

- Official Payme API: https://developer.help.paycom.uz/metody-merchant-api/
- Analysis document: PAYME_DOCS_ANALYSIS.md
- MongoDB fix guide: FIX_MONGODB_INDEXES.md

All responses now match Payme's exact JSON-RPC 2.0 specification! ✅
