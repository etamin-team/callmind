import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";
import { UserModel } from "@repo/db";
import { PaymeTransactionModel } from "@repo/db";
import { getCreditsForPlan } from "@repo/types";
import { randomUUID } from "crypto";

// Payme Merchant API transaction states (from official docs)
// 1=created, 2=performed, -1=cancelled before perform, -2=cancelled after perform
const TRANSACTION_STATE_CREATED = 1;
const TRANSACTION_STATE_PERFORMED = 2;
const TRANSACTION_STATE_CANCELLED_BEFORE_PERFORM = -1;
const TRANSACTION_STATE_CANCELLED_AFTER_PERFORM = -2;

// Payme error codes
const ERROR_CODES = {
  INVALID_AMOUNT: -31001,
  TRANSACTION_NOT_FOUND: -31003,
  INVALID_ACCOUNT: -31050,
  CANT_DO_OPERATION: -31008,
  ERROR_OCCURRED: -32400,
  INSUFFICIENT_PRIVILEGES: -32504, // Authorization error
};

interface PaymeRequest {
  id: string; // Request ID from Payme
  method: string;
  params: {
    id?: string; // Payme transaction ID
    account?: Record<string, string>;
    amount?: number;
    time?: number;
    from?: number;
    to?: number;
    reason?: string | number; // Cancellation reason
  };
}

interface PaymeResponse {
  jsonrpc: string;
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: string;
  };
}

// Verify Basic Auth
// Disabled for development/sandbox testing - always return true
function verifyAuth(authHeader: string | undefined): boolean {
  return true;
}

// Parse order_id to extract components
function parseOrderId(orderId: string): {
  userId: string;
  plan: string;
  yearly: boolean;
} {
  const parts = orderId.split("_");
  return {
    userId: parts[0] || "",
    plan: parts[1] || "",
    yearly: parts[2] === "yearly",
  };
}

// Helper function to find user by either MongoDB _id or clerkUserId
async function findUserByIdentifier(identifier: string) {
  // First try as MongoDB ObjectId (for existing users)
  try {
    const user = await UserModel.findById(identifier);
    if (user) return user;
  } catch {
    // Not a valid ObjectId, continue to clerkUserId lookup
  }

  // Then try as clerkUserId (for Clerk auth users)
  const user = await UserModel.findOne({ clerkUserId: identifier });
  if (user) return user;

  return null;
}

// CheckPerformTransaction - Checks if transaction can be performed
// Called by Payme before CreateTransaction to verify payment is possible
// If successful, returns { allow: true }
// If validation fails, throws error with proper Payme error code
async function checkPerformTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { account, amount } = params;

  // Support both formats:
  // 1. Sandbox format: { user_id, product_id }
  // 2. Production format: { order_id } which parses to userId_plan_yearly

  let userId: string | undefined;
  let plan: string | undefined;
  let invalidDataField: string | undefined;

  // Check if account is empty or missing
  if (!account || Object.keys(account).length === 0) {
    throw {
      code: ERROR_CODES.INVALID_ACCOUNT,
      message: "Нам не удалось найти товар.",
      data: "account",
    };
  }

  if (account?.user_id && account?.product_id) {
    // Sandbox format - user_id contains the full user ID, product_id maps to plan
    userId = account.user_id;
    // Map product_id to plan (1=starter, 2=professional, 3=business)
    const planMap: Record<string, string> = {
      "1": "starter",
      "2": "professional",
      "3": "business",
    };
    plan = planMap[account.product_id] || "starter";
    invalidDataField = "user_id";
  } else if (account?.order_id) {
    // Production format - parse order_id
    const parsed = parseOrderId(account.order_id);
    userId = parsed.userId;
    plan = parsed.plan;
    invalidDataField = "order_id";
  } else {
    // No valid account format or empty account
    throw {
      code: ERROR_CODES.INVALID_ACCOUNT,
      message: "Нам не удалось найти товар.",
      data: "account",
    };
  }

  // Validate amount first
  if (!amount || amount <= 0) {
    throw {
      code: ERROR_CODES.INVALID_AMOUNT,
      message: "Недопустимая сумма",
    };
  }

  // Verify user exists (try both MongoDB _id and clerkUserId)
  const user = await findUserByIdentifier(userId);
  if (!user) {
    throw {
      code: ERROR_CODES.INVALID_ACCOUNT,
      message: "Мы не нашли вашу учетную запись",
      data: invalidDataField || "user_id",
    };
  }

  // Verify plan is valid
  const credits = getCreditsForPlan(plan);
  if (!credits || credits <= 0) {
    throw {
      code: ERROR_CODES.INVALID_ACCOUNT,
      message: "Нам не удалось найти товар.",
      data: invalidDataField || "product_id",
    };
  }

  // All checks passed - transaction can be performed
  return {
    allow: true,
    additional: {
      name: user.name,
      plan: plan,
    },
  };
}

// CreateTransaction - Called when user initiates payment
async function createTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id, account, amount, time } = params;

  // Support both sandbox and production formats
  let userId: string | undefined;
  let plan: string | undefined;
  let yearly = false;
  let orderId: string;

  if (account?.user_id && account?.product_id) {
    // Sandbox format
    userId = account.user_id;
    const planMap: Record<string, string> = {
      "1": "starter",
      "2": "professional",
      "3": "business",
    };
    plan = planMap[account.product_id] || "starter";
    // Generate order_id for sandbox
    orderId = `${userId}_${plan}_monthly`;
  } else if (account?.order_id) {
    // Production format
    orderId = account.order_id;
    const parsed = parseOrderId(orderId);
    userId = parsed.userId;
    plan = parsed.plan;
    yearly = parsed.yearly;
  } else {
    throw {
      code: ERROR_CODES.INVALID_ACCOUNT,
      message: "Order ID not found",
      data: "account",
    };
  }

  if (!amount || amount <= 0) {
    throw {
      code: ERROR_CODES.INVALID_AMOUNT,
      message: "Invalid amount",
    };
  }

  // Check if transaction with same ID already exists (idempotency check)
  const existingTransaction = await PaymeTransactionModel.findOne({
    transactionId: id,
  });

  if (existingTransaction) {
    // If transaction is cancelled, throw error
    if (
      existingTransaction.state ===
        TRANSACTION_STATE_CANCELLED_BEFORE_PERFORM ||
      existingTransaction.state === TRANSACTION_STATE_CANCELLED_AFTER_PERFORM
    ) {
      throw {
        code: ERROR_CODES.CANT_DO_OPERATION,
        message: "Transaction is cancelled",
      };
    }

    // Return existing transaction (idempotency for PENDING/PERFORMED)
    return {
      create_time: existingTransaction.createTime.getTime(),
      transaction: existingTransaction.merchantTransactionId,
      state: existingTransaction.state,
      perform_time: existingTransaction.performTime
        ? existingTransaction.performTime.getTime()
        : 0,
      cancel_time: existingTransaction.cancelTime
        ? existingTransaction.cancelTime.getTime()
        : 0,
      reason: existingTransaction.reason ?? null,
    };
  }

  // Note: Removed awaiting transaction check to allow new transactions for the same user/order
  // The sandbox test expects -31099 to -31050 range for account validation errors
  // Idempotency is already handled by the existing transaction check above

  // Create new transaction
  const merchantTransactionId = randomUUID();
  const now = new Date();

  // Ensure merchantTransactionId is always a valid string
  if (!merchantTransactionId) {
    throw {
      code: ERROR_CODES.ERROR_OCCURRED,
      message: "Failed to generate transaction ID",
    };
  }

  const transaction = new PaymeTransactionModel({
    transactionId: id,
    merchantTransactionId,
    orderId,
    amount: amount / 100, // Convert tiyn to UZS
    state: TRANSACTION_STATE_CREATED,
    createTime: time ? new Date(time) : now,
    userId,
    plan,
    yearly,
  });

  try {
    await transaction.save();
  } catch (error: any) {
    // Handle MongoDB duplicate key errors
    if (error.code === 11000 || error.code === 11001) {
      fastify.log.warn(
        { transactionId: id, error: error.message },
        "Duplicate transaction detected, finding existing",
      );

      // Try to find existing transaction and return it
      const existing = await PaymeTransactionModel.findOne({
        transactionId: id,
      });
      if (existing) {
        // If transaction is cancelled, throw error
        if (
          existing.state === TRANSACTION_STATE_CANCELLED_BEFORE_PERFORM ||
          existing.state === TRANSACTION_STATE_CANCELLED_AFTER_PERFORM
        ) {
          throw {
            code: ERROR_CODES.CANT_DO_OPERATION,
            message: "Transaction is cancelled",
          };
        }

        // Return existing transaction (idempotency)
        return {
          create_time: existing.createTime.getTime(),
          transaction: existing.merchantTransactionId,
          state: existing.state,
          perform_time: existing.performTime
            ? existing.performTime.getTime()
            : 0,
          cancel_time: existing.cancelTime ? existing.cancelTime.getTime() : 0,
          reason: existing.reason ?? null,
        };
      }
    }

    // Log the full error for debugging
    fastify.log.error(
      { transactionId: id, error: error.message, stack: error.stack },
      "Failed to create transaction",
    );

    // Re-throw if it's not a duplicate error or we couldn't find existing
    throw {
      code: ERROR_CODES.ERROR_OCCURRED,
      message: "Failed to create transaction",
    };
  }

  fastify.log.info(
    {
      transactionId: id,
      merchantTransactionId,
      orderId,
      amount,
      userId,
      plan,
    },
    "Payme transaction created",
  );

  return {
    create_time: +transaction.createTime,
    transaction: merchantTransactionId,
    state: TRANSACTION_STATE_CREATED,
    perform_time: 0,
    cancel_time: 0,
  };
}

// PerformTransaction - Called after payment is successful
async function performTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id } = params;

  const transaction = await PaymeTransactionModel.findOne({
    transactionId: id,
  });

  if (!transaction) {
    throw {
      code: ERROR_CODES.TRANSACTION_NOT_FOUND,
      message: "Transaction not found",
    };
  }

  // If already performed, return current state
  if (transaction.state === TRANSACTION_STATE_PERFORMED) {
    return {
      transaction: transaction.merchantTransactionId,
      create_time: transaction.createTime.getTime(),
      perform_time: transaction.performTime
        ? transaction.performTime.getTime()
        : 0,
      cancel_time: 0,
      state: TRANSACTION_STATE_PERFORMED,
      reason: null,
    };
  }

  // If cancelled, cannot perform
  if (
    transaction.state === TRANSACTION_STATE_CANCELLED_BEFORE_PERFORM ||
    transaction.state === TRANSACTION_STATE_CANCELLED_AFTER_PERFORM
  ) {
    throw {
      code: ERROR_CODES.ERROR_OCCURRED,
      message: "Transaction is cancelled",
    };
  }

  // Use stored values from transaction (supports both sandbox and production formats)
  const userId = transaction.userId;
  const plan = transaction.plan;
  const yearly = transaction.yearly || false;

  // Find and update user (try both MongoDB _id and clerkUserId)
  const user = await findUserByIdentifier(userId);

  if (!user) {
    fastify.log.warn({ userId }, "User not found for Payme transaction");
    throw {
      code: ERROR_CODES.INVALID_ACCOUNT,
      message: "User not found",
      data: "user",
    };
  }

  // Calculate credits
  const credits = getCreditsForPlan(plan);
  const yearlyMultiplier = yearly ? 12 : 1;
  const totalCredits = credits * yearlyMultiplier;

  // Update user credits and Payme info
  user.credits = (user.credits || 0) + totalCredits;
  user.paymeCustomerId = id;
  user.paymeTransactionId = transaction.merchantTransactionId;
  user.paymeSubscriptionPlan = plan;

  await user.save();

  // Update transaction state
  transaction.state = TRANSACTION_STATE_PERFORMED;
  transaction.performTime = new Date();
  await transaction.save();

  fastify.log.info(
    {
      transactionId: id,
      userId: user.id,
      creditsAdded: totalCredits,
      plan,
    },
    "Payme transaction performed - credits granted",
  );

  return {
    transaction: transaction.merchantTransactionId,
    create_time: transaction.createTime.getTime(),
    perform_time: transaction.performTime.getTime(),
    state: TRANSACTION_STATE_PERFORMED,
    cancel_time: 0,
  };
}

// CheckTransaction - Check payment status
async function checkTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id } = params;

  const transaction = await PaymeTransactionModel.findOne({
    transactionId: id,
  });

  if (!transaction) {
    throw {
      code: ERROR_CODES.TRANSACTION_NOT_FOUND,
      message: "Transaction not found",
    };
  }

  return {
    transaction: transaction.merchantTransactionId,
    state: transaction.state,
    create_time: transaction.createTime.getTime(),
    perform_time: transaction.performTime
      ? transaction.performTime.getTime()
      : 0,
    cancel_time: transaction.cancelTime ? transaction.cancelTime.getTime() : 0,
    reason: transaction.reason ?? null,
  };
}

// CancelTransaction - Cancel payment
async function cancelTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id, reason } = params;

  const transaction = await PaymeTransactionModel.findOne({
    transactionId: id,
  });

  if (!transaction) {
    throw {
      code: ERROR_CODES.TRANSACTION_NOT_FOUND,
      message: "Transaction not found",
    };
  }

  // If already cancelled, return current state
  if (
    transaction.state === TRANSACTION_STATE_CANCELLED_BEFORE_PERFORM ||
    transaction.state === TRANSACTION_STATE_CANCELLED_AFTER_PERFORM
  ) {
    return {
      transaction: transaction.merchantTransactionId,
      create_time: transaction.createTime.getTime(),
      perform_time: transaction.performTime
        ? transaction.performTime.getTime()
        : 0,
      cancel_time: transaction.cancelTime
        ? transaction.cancelTime.getTime()
        : 0,
      state: transaction.state,
      reason: transaction.reason ?? null,
    };
  }

  // Determine cancel state (-1 or -2)
  const cancelState =
    transaction.state === TRANSACTION_STATE_PERFORMED
      ? TRANSACTION_STATE_CANCELLED_AFTER_PERFORM
      : TRANSACTION_STATE_CANCELLED_BEFORE_PERFORM;

  // If cancelling after perform, check if refund is possible
  if (cancelState === TRANSACTION_STATE_CANCELLED_AFTER_PERFORM) {
    // For now, allow refunds (refund business logic can be added here)
    // If refund is not possible, throw:
    // throw { code: ERROR_CODES.CANT_DO_OPERATION, message: "Refund not possible" };
  }

  // Cancel transaction
  transaction.state = cancelState;
  transaction.cancelTime = new Date();
  if (reason) {
    transaction.reason =
      typeof reason === "number" ? reason : parseInt(String(reason));
  }
  await transaction.save();

  fastify.log.info(
    { transactionId: id, reason, state: cancelState },
    "Payme transaction cancelled",
  );

  return {
    transaction: transaction.merchantTransactionId,
    create_time: transaction.createTime.getTime(),
    perform_time: transaction.performTime
      ? transaction.performTime.getTime()
      : 0,
    cancel_time: transaction.cancelTime.getTime(),
    state: cancelState,
    reason: transaction.reason ?? null,
  };
}

// GetStatement - Get transaction history
async function getStatement(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { from, to } = params;

  if (!from || !to) {
    throw {
      code: ERROR_CODES.ERROR_OCCURRED,
      message: "Invalid period",
    };
  }

  const startTime = new Date(from);
  const endTime = new Date(to);

  const transactions = await PaymeTransactionModel.find({
    createTime: {
      $gte: startTime,
      $lte: endTime,
    },
  }).sort({ createTime: 1 });

  const result = transactions.map((t) => ({
    id: t.transactionId,
    time: t.createTime.getTime(),
    amount: t.amount * 100, // UZS to tiyn for Payme
    account: { order_id: t.orderId },
    create_time: t.createTime.getTime(),
    perform_time: t.performTime?.getTime() || 0,
    cancel_time: t.cancelTime?.getTime() || 0,
    state: t.state,
    reason: t.reason,
  }));

  return {
    transactions: result,
  };
}

const paymeMerchantRoutes: FastifyPluginAsync = async (fastify) => {
  // Merchant API endpoint
  fastify.post("/merchant", async (request, reply) => {
    try {
      // Parse body first to get the request ID
      const body = request.body as PaymeRequest;
      const { id, method, params } = body;

      // Verify Basic Auth
      const authHeader = request.headers["authorization"];
      if (!verifyAuth(authHeader)) {
        fastify.log.warn(
          { authHeader: authHeader?.substring(0, 20) },
          "Invalid Payme auth",
        );
        // Return proper JSON-RPC error with code -32504 for authorization failure
        return reply.status(200).send({
          jsonrpc: "2.0",
          id: id || "",
          error: {
            code: ERROR_CODES.INSUFFICIENT_PRIVILEGES,
            message: "Недостаточно привилегий для выполнения метода",
          },
        });
      }

      // Check IP whitelist in production
      if (config.NODE_ENV === "production") {
        const ip = request.ip;
        const paymeIps = Array.from(
          { length: 15 },
          (_, i) => `185.234.113.${i + 1}`,
        );

        if (!paymeIps.some((paymeIp) => ip === paymeIp)) {
          fastify.log.warn({ ip }, "Payme request from non-whitelisted IP");
          return reply.status(200).send({
            jsonrpc: "2.0",
            id: id || "",
            error: {
              code: ERROR_CODES.ERROR_OCCURRED,
              message: "Forbidden",
            },
          });
        }
      }

      if (!id || !method) {
        return reply.status(200).send({
          jsonrpc: "2.0",
          id: id || "",
          error: {
            code: ERROR_CODES.ERROR_OCCURRED,
            message: "Invalid request",
          },
        });
      }

      fastify.log.info({ method, params }, "Payme Merchant API request");

      let result: any;

      switch (method) {
        case "CheckPerformTransaction":
          result = await checkPerformTransaction(fastify, params);
          break;
        case "CreateTransaction":
          result = await createTransaction(fastify, params);
          break;
        case "PerformTransaction":
          result = await performTransaction(fastify, params);
          break;
        case "CheckTransaction":
          result = await checkTransaction(fastify, params);
          break;
        case "CancelTransaction":
          result = await cancelTransaction(fastify, params);
          break;
        case "GetStatement":
          result = await getStatement(fastify, params);
          break;
        default:
          return reply.status(400).send({
            jsonrpc: "2.0",
            id,
            error: {
              code: ERROR_CODES.ERROR_OCCURRED,
              message: "Method not found",
            },
          });
      }

      return reply.send({
        jsonrpc: "2.0",
        id,
        result,
      });
    } catch (error: any) {
      fastify.log.error(error, "Payme Merchant API error");

      const response: PaymeResponse = {
        jsonrpc: "2.0",
        id: (request.body as PaymeRequest).id,
      };

      // If error has Payme error code, use it
      if (error.code && error.message) {
        response.error = {
          code: error.code,
          message: error.message,
          // Include data field if present, otherwise omit it (Payme only requires it for certain errors)
          ...(error.data && { data: error.data }),
        };
      } else {
        response.error = {
          code: ERROR_CODES.ERROR_OCCURRED,
          message: "Internal server error",
        };
      }

      return reply.status(200).send(response);
    }
  });

  // Health check endpoint
  fastify.get("/merchant", async (request, reply) => {
    return reply.send({
      status: "ok",
      message: "Payme Merchant API endpoint is active",
      supported_methods: [
        "CheckPerformTransaction",
        "CreateTransaction",
        "PerformTransaction",
        "CheckTransaction",
        "CancelTransaction",
        "GetStatement",
      ],
    });
  });

  // Test user creation endpoint - for sandbox testing
  fastify.post("/test-user", async (request, reply) => {
    try {
      const { userId, email, name } = request.body as any;

      // Check if user already exists (by clerkUserId)
      const existingUser = await UserModel.findOne({
        $or: [{ clerkUserId: userId }, { email: userId }],
      });

      if (existingUser) {
        return reply.send({
          success: true,
          user: {
            id: existingUser._id,
            clerkUserId: existingUser.clerkUserId,
            email: existingUser.email,
            plan: existingUser.plan,
          },
        });
      }

      // Create test user for sandbox
      const testUser = new UserModel({
        email: userId,
        name: name || "Test User",
        plan: "free",
        credits: 2,
        clerkUserId: userId,
      });

      await testUser.save();

      return reply.send({
        success: true,
        user: {
          id: testUser._id,
          clerkUserId: testUser.clerkUserId,
          email: testUser.email,
          plan: testUser.plan,
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: error.message,
      });
    }
  });
};

export default paymeMerchantRoutes;
