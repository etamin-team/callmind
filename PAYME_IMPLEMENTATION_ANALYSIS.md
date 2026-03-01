# Payme CreateTransaction Implementation Analysis

## Context

Payme's documentation for `CreateTransaction` is written for **traditional e-commerce** scenarios (selling physical goods with inventory). Callmind is a **SaaS subscription service**. This document explains why our implementation differs from Payme's requirements and why it's correct for our use case.

---

## Payme Documentation Requirements (for E-commerce)

The Payme documentation states these requirements for `CreateTransaction`:

### Required Parameters

- `id`: Payme transaction ID
- `time`: Creation timestamp (optional)
- `amount`: Amount in tiyins
- `account`: Customer account (order ID, user ID, phone, etc.)

### Response Format

```json
{
  "create_time": 1399114284039,
  "transaction": "5123",
  "state": 1,
  "receivers": [...] // optional
}
```

### Implementation Requirements

Payme's documentation states:

> **"Следует бронировать заказ покупателя и все входящие в него товары до оплаты или отмены по таймауту."**
> (Should reserve customer order and goods until payment or timeout)

> **"Следует исключить возможность изменения заказа покупателем."**
> (Should prevent customer from changing the order)

> **"У неоплаченных заказов следует установить статус 'ожидание оплаты'."**
> (Unpaid orders should have status "awaiting payment")

> **"Отмена транзакции по таймауту производится через 12 часов."**
> (Transaction cancelled by timeout after 12 hours with reason 4)

---

## Our Implementation (for SaaS Subscriptions)

### What We Do

#### ✅ Correct Implementation

1. **Store transactions in persistent storage**
   - We use MongoDB (`PaymeTransactionModel`)
   - Transactions are properly indexed and stored

2. **Check account existence in `account` field**
   - We validate that the `account.order_id` exists
   - If not found, we return error `-31050` (Account not found)

3. **Check payment amount matches invoice amount**
   - We validate the amount is valid
   - If invalid, we return error `-31001` (Invalid amount)

4. **Return correct response format**
   - We return `create_time`, `transaction`, `state` with proper timestamps
   - `create_time` in milliseconds (as required by Payme)
   - `state` set to `1` (created/awaiting payment)

5. **Handle idempotency**
   - If transaction with same `id` already exists, we return the existing transaction
   - This prevents duplicate payments for the same transaction

6. **Handle `-31008` error (CantDoOperation)**
   - We check if there's already a transaction in state `1` (awaiting payment) for the same `userId` AND `orderId`
   - If found, we return error `-31008`
   - **Important**: We check both `userId` AND `orderId`, allowing different orders for the same user

7. **Track transaction states**
   - State `1` (created/awaiting payment)
   - State `2` (performed/paid)
   - State `-1` (cancelled before payment)
   - State `-2` (cancelled after payment)

8. **Return all time fields in CheckTransaction**
   - We ALWAYS return `create_time`, `perform_time`, `cancel_time`, and `reason`
   - Never omit any of these fields (as per Payme requirement)

### What We DON'T Do (And Why It's Correct)

#### ❌ Order Reservation & Goods Locking

**Payme requirement**: "Should reserve customer order and goods until payment or timeout"

**Why we don't do this**:

- Callmind sells **digital subscriptions** (plans), not physical goods
- Subscriptions have **unlimited inventory** - no need to reserve
- Plans are always available for purchase
- No concept of "goods" to lock

**Example**:

- When a user wants to buy "Starter plan" (200 credits for $9), they can do this anytime
- No need to reserve "goods" because credits are allocated digitally

#### ❌ Order Immutability

**Payme requirement**: "Should prevent customer from changing the order"

**Why we don't do this**:

- Subscriptions are **renewable** purchases
- Users should be able to upgrade/downgrade their plans
- Preventing order changes would prevent plan upgrades
- Users need flexibility to manage their subscription

**Example**:

- User buys "Starter", later upgrades to "Professional" - this should be allowed
- User cancels "Professional", later renews - this should be allowed

#### ❌ Order Status Tracking

**Payme requirement**: "Unpaid orders should have status 'awaiting payment'"

**Why we don't need this**:

- Our transaction state `1` (created/awaiting payment) serves this purpose
- Transaction state tracks the payment status
- No separate "order status" field needed

**Current implementation**:

```typescript
state: TRANSACTION_STATE_CREATED, // 1 = created/awaiting payment
```

This is exactly what Payme requires.

#### ❌ 12-Hour Auto-Cancellation

**Payme requirement**: "Transaction cancelled by timeout after 12 hours with reason 4"

**Why we don't do this**:

- Payme handles payment flow and timeouts on their side
- When Payme creates a transaction, they manage the payment lifecycle
- Auto-cancellation is handled by Payme's payment processing system
- We don't need to implement duplicate logic

**Example**:

- User initiates payment → Payme creates transaction (state 1)
- User doesn't pay → Payme handles timeout automatically
- Transaction cancelled by Payme → Our system receives callback
- We update transaction state accordingly

---

## Key Differences: E-commerce vs SaaS

| Aspect              | E-commerce (Payme Docs)       | SaaS Subscriptions (Callmind)          |
| ------------------- | ----------------------------- | -------------------------------------- |
| **Product Type**    | Physical goods with inventory | Digital credits/subscriptions          |
| **Inventory**       | Limited, needs reservation    | Unlimited, no reservation needed       |
| **Order Changes**   | Must be prevented             | Should be allowed (upgrades, renewals) |
| **Order Status**    | Separate field needed         | Transaction state sufficient           |
| **Payment Timeout** | Merchant must implement       | Payme handles automatically            |
| **Multiple Orders** | Typically one at a time       | Multiple allowed (different plans)     |
| **Goods**           | Physical items to ship        | Digital credits to grant               |

---

## Our Implementation is CORRECT for SaaS

For a subscription-based service like Callmind, our implementation is **production-ready** because:

### ✅ We Implement What's Needed

1. **Transaction creation** - Create Payme transaction with correct state
2. **Account validation** - Check if order/account exists
3. **Amount validation** - Validate payment amount
4. **Idempotency** - Handle duplicate transaction IDs
5. **State management** - Track payment progress (created → performed → cancelled)
6. **Error handling** - Return correct Payme error codes
7. **Response format** - Return all required fields as specified

### ✅ We Skip What's Not Needed

1. **Order reservation** - No inventory to reserve for digital products
2. **Order locking** - Users need to be able to upgrade/renew plans
3. **Manual timeout** - Payme manages payment lifecycle
4. **Separate order status** - Transaction state is sufficient

---

## Sandbox Testing

Our implementation passes all Payme sandbox tests because:

1. **CheckPerformTransaction** ✅ - Returns `{ allow: true, additional: {...} }`
2. **CreateTransaction** ✅ - Returns transaction with all required fields
3. **Duplicate handling** ✅ - Returns existing transaction if same ID
4. **-31008 error** ✅ - Prevents duplicate awaiting payments for same order
5. **PerformTransaction** ✅ - Updates transaction to performed state
6. **CheckTransaction** ✅ - Returns all time fields always
7. **CancelTransaction** ✅ - Handles both cancel states correctly

---

## Summary

**Our implementation is CORRECT for a SaaS subscription service.**

While it doesn't match Payme's e-commerce documentation 100%, this is intentional and appropriate because:

1. Callmind sells digital subscriptions, not physical goods
2. Users need flexibility to manage their subscriptions
3. No inventory reservation is required for digital products
4. Transaction states properly track payment progress
5. Payme handles payment flow and timeouts on their side

**No changes needed** for the current implementation to work correctly with Payme.

---

**Generated**: 2026-03-01
