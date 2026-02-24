# Payme Payment Integration - Setup Guide

This guide explains how to set up and use Payme payments in the Callmind application.

## Overview

Payme Business is a payment gateway for accepting payments in Uzbekistan (UZS currency). This integration replaces the FreedomPay implementation with Payme's Merchant API.

## Prerequisites

Before setting up Payme, you need:

1. **Payme Merchant Account**: Contact Payme Business technical specialist to get:
   - Merchant ID (ID of web cash register)
   - Key (password for production environment)
   - TEST_KEY (password for test environment)
   - Login for Basic Authentication

2. **HTTPS Endpoint**: Payme requires HTTPS for production endpoints (SSL certificate required)

3. **Public Endpoint**: Your server must be accessible from the internet for Payme to send Merchant API requests

## Setup Steps

### 1. Payme Merchant Cabinet Configuration

1. Log in to your Payme merchant account
2. Create a new business or select existing one
3. Add a "Web Cash Register" (Веб-касса):
   - **Endpoint URL**: `https://your-domain.com/api/payme/merchant`
   - This is where Payme will send Merchant API requests
4. Save the cash register - Payme will provide:
   - Merchant ID (ID веб-кассы)
   - Key (Ключ для кабинета)
   - TEST_KEY (Ключ для песочницы)

### 2. Environment Variables

Add the following to your `.env` file:

```bash
# Payme Configuration
PAYME_MERCHANT_ID=your_merchant_id_here
PAYME_KEY=your_production_key_here
PAYME_TEST_KEY=your_test_key_here
PAYME_LOGIN=your_payme_login_here
PAYME_ENDPOINT_URL=https://checkout.paycom.uz/api
PAYME_CALLBACK_URL=https://your-domain.com

# Price Overrides (in UZS, optional - will use defaults if not set)
PAYME_STARTER_MONTHLY=108000
PAYME_STARTER_YEARLY=1032000
PAYME_PRO_MONTHLY=348000
PAYME_PRO_YEARLY=3336000
PAYME_BUSINESS_MONTHLY=948000
PAYME_BUSINESS_YEARLY=9096000
```

Frontend environment variable (in `apps/web/.env`):

```bash
VITE_PAYME_MERCHANT_ID=your_merchant_id_here
```

### 3. Test Environment Setup

For testing, Payme provides a sandbox environment:

- **Test Merchant URL**: https://checkout.test.paycom.uz
- **Login**: Your mobile phone number
- **Password**: `qwerty`
- **SMS Code**: `666666`

### 4. Database Collections

The integration creates/uses:

1. **users** collection (with new Payme fields):
   - `paymeCustomerId` - Payme customer/payment ID
   - `paymeTransactionId` - Last transaction ID
   - `paymeSubscriptionPlan` - Current subscription plan

2. **paymetransactions** collection (new):
   - Stores all Payme transactions
   - Tracks transaction states (created/performed/cancelled)
   - Links orders to users and plans

## How It Works

### Payment Flow

1. **User initiates payment**:
   ```
   POST /api/payme/checkout/{plan}
   ```

2. **Backend creates order**:
   - Generates unique `orderId`: `{userId}_{plan}_{monthly/yearly}_{timestamp}`
   - Returns payment parameters to frontend

3. **Frontend redirects to Payme**:
   - Submits form to `https://checkout.paycom.uz`
   - User completes payment on Payme's page

4. **Payme sends Merchant API requests** to `/api/payme/merchant`:
   - **CreateTransaction**: When payment starts
   - **PerformTransaction**: After successful payment
   - **CheckTransaction**: To check payment status
   - **CancelTransaction**: If payment is cancelled

5. **Backend processes PerformTransaction**:
   - Validates transaction
   - Adds credits to user account
   - Updates user's Payme info
   - Returns success to Payme

6. **User redirected back** to your `return_url`

### Security Features

1. **Basic Authentication**: Payme sends requests with `Authorization: Basic base64(login:password)`

2. **IP Whitelist** (production only):
   - Payme requests come from: `185.234.113.1` to `185.234.113.15`
   - Server verifies request origin

3. **Transaction Validation**:
   - Duplicate transaction handling
   - Amount validation
   - State transitions (created → performed or cancelled)

## API Endpoints

### Checkout API

**Create checkout session:**
```http
POST /api/payme/checkout/{plan}
Content-Type: application/json

{
  "yearly": false,
  "userId": "user_id_here",
  "phone": "+998901234567",
  "lang": "ru"
}
```

**Response:**
```json
{
  "merchantId": "your_merchant_id",
  "orderId": "user123_starter_monthly_1234567890",
  "merchantTransactionId": "uuid-here",
  "amount": 10800000,
  "amountDisplay": 108000,
  "currency": "UZS",
  "plan": "starter",
  "yearly": false,
  "return_url": "https://your-domain.com/payments/success"
}
```

**Get prices:**
```http
GET /api/payme/prices
```

### Merchant API (Called by Payme)

**Endpoint:** `POST /api/payme/merchant`

Payme sends JSON-RPC 2.0 requests:

```json
{
  "jsonrpc": "2.0",
  "id": "request_id",
  "method": "CreateTransaction",
  "params": {
    "id": "payme_transaction_id",
    "time": 1234567890,
    "amount": 10800000,
    "account": {
      "order_id": "user123_starter_monthly_1234567890"
    }
  }
}
```

Supported methods:
- `CreateTransaction` - Initialize payment
- `PerformTransaction` - Complete payment and grant credits
- `CheckTransaction` - Check payment status
- `CancelTransaction` - Cancel payment
- `GetStatement` - Get transaction history

## Frontend Usage

```tsx
import { usePayme, useCreatePaymeCheckout } from '@/features/payments/api'

function PaymentButton() {
  const { openCheckout } = usePayme()
  const { mutate: createCheckout, isLoading } = useCreatePaymeCheckout()

  const handlePayment = async () => {
    createCheckout(
      {
        plan: 'starter',
        data: {
          yearly: false,
          userId: 'user_id',
          lang: 'ru',
        },
      },
      {
        onSuccess: (response) => {
          // Open Payme checkout
          openCheckout({
            orderId: response.orderId,
            amount: response.amount,
            returnUrl: response.return_url,
            lang: response.lang || 'ru',
          })
        },
      }
    )
  }

  return <button onClick={handlePayment}>Pay with Payme</button>
}
```

## Testing

### Test Flow

1. **Create test checkout** using test credentials
2. **Complete payment** on Payme test page
3. **Verify transaction** created in `paymetransactions` collection
4. **Verify credits** added to user
5. **Test cancel flow** by cancelling payment

### Test Cards

Contact Payme for test card details, or use the sandbox with:
- Login: Your phone number
- Password: `qwerty`
- SMS code: `666666`

## Monitoring & Logging

The integration logs important events:

- `Payme checkout initiated` - Checkout creation
- `Payme Merchant API request` - Incoming Payme requests
- `Payme transaction created` - New transaction
- `Payme transaction performed` - Payment successful, credits granted
- `Payme transaction cancelled` - Payment cancelled

Check logs at:
- `POST /api/payme/checkout/*` - Checkout requests
- `POST /api/payme/merchant` - Payme Merchant API requests

## Error Handling

Payme uses specific error codes:

| Code | Meaning |
|------|---------|
| -31001 | Invalid amount |
| -31003 | Transaction not found |
| -31050 to -31099 | Invalid account (user/order not found) |
| -32400 | General error |

All errors are returned in JSON-RPC format:

```json
{
  "jsonrpc": "2.0",
  "id": "request_id",
  "error": {
    "code": -31050,
    "message": "User not found",
    "data": "user"
  }
}
```

## Troubleshooting

### Common Issues

**1. "Unauthorized" errors**
- Verify `PAYME_LOGIN` and `PAYME_KEY` (or `PAYME_TEST_KEY`) are correct
- Check Basic Auth header is being sent correctly

**2. "Forbidden" errors**
- Verify your server IP is whitelisted in Payme merchant cabinet
- Check Payme IP whitelist (185.234.113.1-15) in production

**3. "Transaction not found"**
- Check `paymetransactions` collection for the transaction
- Verify `paymeTransactionId` matches

**4. Credits not granted**
- Check logs for "Payme transaction performed"
- Verify user exists in database
- Check transaction state is 2 (performed)

**5. Webhook not received**
- Verify endpoint is publicly accessible
- Check PAYME_ENDPOINT_URL is correct
- Verify SSL certificate is valid (required for production)

## Migration from FreedomPay

The Payme integration is designed to replace FreedomPay. Key differences:

1. **No signature generation** - Payme handles this
2. **Basic Auth instead of MD5** - Simpler authentication
3. **Transaction states** - 1=created, 2=performed, -1=cancelled (vs "ok"/"error")
4. **No built-in recurring** - Payme requires Subscribe API for recurring (future feature)

Existing FreedomPay fields are preserved in the database for backward compatibility but are marked as "legacy".

## Next Steps

1. **Set up Payme merchant account** and get credentials
2. **Configure environment variables** in `.env` files
3. **Test in sandbox** using test credentials
4. **Deploy to production** with HTTPS and valid SSL
5. **Monitor transactions** in database and logs
6. **Future**: Implement Subscribe API for recurring payments

## Support

For Payme-specific issues:
- Payme Developer Documentation: https://developer.help.paycom.uz
- Contact Payme Business technical specialist

For code issues:
- Check application logs
- Verify environment variables
- Test Merchant API endpoint health: `GET /api/payme/merchant`
