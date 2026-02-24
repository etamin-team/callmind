import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";
import { UserModel } from "@repo/db";
import { PaymeTransactionModel } from "@repo/db";
import { getCreditsForPlan } from "@repo/types";
import { randomUUID } from "crypto";

// Payme Merchant API transaction states
const TRANSACTION_STATE_CREATED = 1;
const TRANSACTION_STATE_PERFORMED = 2;
const TRANSACTION_STATE_CANCELLED = -1;

// Payme error codes
const ERROR_CODES = {
  INVALID_AMOUNT: -31001,
  TRANSACTION_NOT_FOUND: -31003,
  INVALID_ACCOUNT: -31050,
  ERROR_OCCURRED: -32400,
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
function verifyAuth(authHeader: string | undefined): boolean {
  if (!config.PAYME_LOGIN || !config.PAYME_KEY) {
    // Allow in test mode if credentials not set
    if (config.NODE_ENV !== "production") {
      return true;
    }
    return false;
  }

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const parts = authHeader.split(" ");
  if (parts.length < 2) {
    return false;
  }

  const base64Credentials = parts[1];
  if (!base64Credentials) {
    return false;
  }

  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8",
  );
  const [login, password] = credentials.split(":");

  const expectedKey =
    config.NODE_ENV === "production"
      ? config.PAYME_KEY
      : config.PAYME_TEST_KEY || config.PAYME_KEY;

  return login === config.PAYME_LOGIN && password === expectedKey;
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

// CreateTransaction - Called when user initiates payment
async function createTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id, account, amount, time } = params;

  if (!account?.order_id) {
    throw {
      code: ERROR_CODES.INVALID_ACCOUNT,
      message: "Order ID not found",
      data: "order_id",
    };
  }

  if (!amount || amount <= 0) {
    throw {
      code: ERROR_CODES.INVALID_AMOUNT,
      message: "Invalid amount",
    };
  }

  const orderId = account.order_id;
  const { userId, plan, yearly } = parseOrderId(orderId);

  // Check if transaction already exists
  let existingTransaction = await PaymeTransactionModel.findOne({
    paymeTransactionId: id,
  });

  if (existingTransaction) {
    // Return existing transaction
    return {
      create_time: existingTransaction.createTime.getTime(),
      transaction: existingTransaction.merchantTransactionId,
      state: existingTransaction.state,
    };
  }

  // Create new transaction
  const merchantTransactionId = randomUUID();
  const now = new Date();

  const transaction = new PaymeTransactionModel({
    paymeTransactionId: id,
    merchantTransactionId,
    orderId,
    amount,
    state: TRANSACTION_STATE_CREATED,
    createTime: time ? new Date(time) : now,
    userId,
    plan,
    yearly,
  });

  await transaction.save();

  fastify.log.info(
    {
      paymeTransactionId: id,
      merchantTransactionId,
      orderId,
      amount,
      userId,
      plan,
    },
    "Payme transaction created",
  );

  return {
    create_time: time || now.getTime(),
    transaction: merchantTransactionId,
    state: TRANSACTION_STATE_CREATED,
  };
}

// PerformTransaction - Called after payment is successful
async function performTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id } = params;

  const transaction = await PaymeTransactionModel.findOne({
    paymeTransactionId: id,
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
      perform_time: transaction.performTime?.getTime() || 0,
      state: TRANSACTION_STATE_PERFORMED,
    };
  }

  // If cancelled, cannot perform
  if (transaction.state === TRANSACTION_STATE_CANCELLED) {
    throw {
      code: ERROR_CODES.ERROR_OCCURRED,
      message: "Transaction is cancelled",
    };
  }

  const { userId, plan, yearly } = parseOrderId(transaction.orderId);

  // Find and update user
  const user = await UserModel.findById(userId);

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
      paymeTransactionId: id,
      userId: user.id,
      creditsAdded: totalCredits,
      plan,
    },
    "Payme transaction performed - credits granted",
  );

  return {
    transaction: transaction.merchantTransactionId,
    perform_time: transaction.performTime.getTime(),
    state: TRANSACTION_STATE_PERFORMED,
  };
}

// CheckTransaction - Check payment status
async function checkTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id } = params;

  const transaction = await PaymeTransactionModel.findOne({
    paymeTransactionId: id,
  });

  if (!transaction) {
    throw {
      code: ERROR_CODES.TRANSACTION_NOT_FOUND,
      message: "Transaction not found",
    };
  }

  const result: any = {
    transaction: transaction.merchantTransactionId,
    state: transaction.state,
    create_time: transaction.createTime.getTime(),
  };

  if (transaction.performTime) {
    result.perform_time = transaction.performTime.getTime();
  }

  if (transaction.cancelTime) {
    result.cancel_time = transaction.cancelTime.getTime();
  }

  return result;
}

// CancelTransaction - Cancel payment
async function cancelTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id, reason } = params;

  const transaction = await PaymeTransactionModel.findOne({
    paymeTransactionId: id,
  });

  if (!transaction) {
    throw {
      code: ERROR_CODES.TRANSACTION_NOT_FOUND,
      message: "Transaction not found",
    };
  }

  // If already cancelled, return current state
  if (transaction.state === TRANSACTION_STATE_CANCELLED) {
    return {
      transaction: transaction.merchantTransactionId,
      cancel_time: transaction.cancelTime?.getTime() || 0,
      state: TRANSACTION_STATE_CANCELLED,
    };
  }

  // Cancel the transaction
  transaction.state = TRANSACTION_STATE_CANCELLED;
  transaction.cancelTime = new Date();
  if (reason) {
    transaction.reason = String(reason);
  }
  await transaction.save();

  fastify.log.info(
    { paymeTransactionId: id, reason },
    "Payme transaction cancelled",
  );

  return {
    transaction: transaction.merchantTransactionId,
    cancel_time: transaction.cancelTime.getTime(),
    state: TRANSACTION_STATE_CANCELLED,
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
    id: t.paymeTransactionId,
    time: t.createTime.getTime(),
    amount: t.amount,
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
      // Verify Basic Auth
      const authHeader = request.headers["authorization"];
      if (!verifyAuth(authHeader)) {
        fastify.log.warn(
          { authHeader: authHeader?.substring(0, 20) },
          "Invalid Payme auth",
        );
        return reply.status(401).send({
          jsonrpc: "2.0",
          error: {
            code: ERROR_CODES.ERROR_OCCURRED,
            message: "Unauthorized",
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
          return reply.status(403).send({
            jsonrpc: "2.0",
            error: {
              code: ERROR_CODES.ERROR_OCCURRED,
              message: "Forbidden",
            },
          });
        }
      }

      const body = request.body as PaymeRequest;
      const { id, method, params } = body;

      if (!id || !method) {
        return reply.status(400).send({
          jsonrpc: "2.0",
          error: {
            code: ERROR_CODES.ERROR_OCCURRED,
            message: "Invalid request",
          },
        });
      }

      fastify.log.info({ method, params }, "Payme Merchant API request");

      let result: any;

      switch (method) {
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
          data: error.data,
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
        "CreateTransaction",
        "PerformTransaction",
        "CheckTransaction",
        "CancelTransaction",
        "GetStatement",
      ],
    });
  });
};

export default paymeMerchantRoutes;
