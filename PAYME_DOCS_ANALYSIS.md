# Payme Integration Fixes Based on Official Documentation

## Issues Found from Official Payme Docs

### 1. CheckPerformTransaction Response Format

**Current Issue:** Not returning proper response format

**Required Format (from docs):**

```json
{
  "result": {
    "allow": true,
    "additional": {
      // Optional additional info about user balance, order details
    }
  }
}
```

**Required Fields for Success:**

- ✅ `allow` (Boolean) - Required - MUST be included
- Optional: `additional` object with user details, balance, order info

### 2. Transaction States

From Payme docs, the states are:

- `1` - Created (initial state)
- `2` - Performed (paid/completed)
- `-1` - Cancelled (before perform)
- `-2` - Cancelled (after perform/for refund)

### 3. CreateTransaction Response

**Required Fields (from docs):**

```json
{
  "result": {
    "create_time": 1399114284039,  // Timestamp in milliseconds
    "transaction": "5123",              // Merchant's transaction ID string
    "state": 1,                        // Transaction state
    "receivers": [...]                  // Optional: For chained payments
  }
}
```

### 4. PerformTransaction Response

**Required Fields:**

```json
{
  "result": {
    "transaction": "5123", // Merchant's transaction ID string
    "perform_time": 1399114285002, // Timestamp in milliseconds
    "state": 2 // Transaction state (2=performed)
  }
}
```

### 5. CheckTransaction Response

**Required Fields:**

```json
{
  "result": {
    "transaction": "5123", // Merchant's transaction ID
    "create_time": 1399114284039, // Creation timestamp
    "perform_time": 1399114285002, // Performance timestamp
    "cancel_time": 0, // 0 if not cancelled
    "state": 2, // Current state
    "reason": null // Null if not cancelled
  }
}
```

### 6. CancelTransaction Response

**Required Fields:**

```json
{
  "result": {
    "transaction": "5123", // Merchant's transaction ID
    "cancel_time": 1399114285061, // Cancellation timestamp
    "state": -2 // -2=cancelled after perform, -1=cancelled before
  }
}
```

### 7. GetStatement Response

**Required Fields:**

```json
{
  "result": {
    "transactions": [
      {
        "id": "5305e3bab097f420a62ced0b", // Payme transaction ID
        "time": 1399114284039, // Transaction time
        "amount": 500000, // Amount in tiyins
        "account": { "phone": "903595731" }, // Account details
        "create_time": 1399114284039, // Creation timestamp
        "perform_time": 1399114285002, // Performance timestamp
        "cancel_time": 0, // 0 if not cancelled
        "state": 2, // Current state
        "reason": null // Null if not cancelled
      }
    ]
  }
}
```

### 8. Error Response Format

All errors must follow this format:

```json
{
  "error": {
    "code": -31050, // Payme error code
    "message": "localized message", // Required localized message
    "data": "account" // Optional: Must contain 'account' subfield name
  }
}
```

### 9. Error Codes

Critical error codes to implement:

- `-31001` - Invalid amount (amount mismatch or invalid)
- `-31003` - Transaction not found
- `-31007` - Cannot cancel (order fulfilled)
- `-31008` - Cannot perform operation
- `-31050` to `-31099` - Account errors (user not found, invalid input)
- `-32400` - System error
- `-32504` - Authorization error

### 10. Account Parameter

The `account` object should contain:

- `phone` - Consumer's phone number (for subscriptions/services)
- OR custom fields based on your needs (e.g., `user_id`, `order_id`)

**Note:** The docs specify `phone` as the field name, but Payme sandbox uses `user_id` and `product_id`. Our current implementation supports both formats, which is correct.

## Changes Needed

### 1. Update CheckPerformTransaction to return `allow` field

### 2. Ensure all timestamps are in milliseconds (getTime())

### 3. Ensure all responses include required fields based on method

### 4. Implement proper error codes with localized messages

### 5. Add `reason` field to CancelTransaction

### 6. Ensure transaction states match: 1, 2, -1, -2

## Migration Checklist

- [ ] Update CheckPerformTransaction to return `allow: true` format
- [ ] Update CreateTransaction response format
- [ ] Update PerformTransaction response format
- [ ] Update CheckTransaction to always include all time fields
- [ ] Update CancelTransaction to include proper reason handling
- [ ] Update GetStatement to return complete transaction details
- [ ] Add localized error messages
- [ ] Verify all timestamps are in milliseconds
- [ ] Test with Payme sandbox

## Reference

Official Payme Merchant API Documentation:
https://developer.help.paycom.uz/metody-merchant-api/
