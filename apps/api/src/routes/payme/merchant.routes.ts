import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";
import { db, users, paymeTransactions, eq, and, gte, lte, asc } from "@repo/db";
import { getCreditsForPlan } from "@repo/types";
import { randomUUID } from "crypto";

const TRANSACTION_STATE_CREATED = "1";
const TRANSACTION_STATE_PERFORMED = "2";
const TRANSACTION_STATE_CANCELLED = "-1";

const ERROR_CODES = {
  INVALID_AMOUNT: -31001,
  TRANSACTION_NOT_FOUND: -31003,
  INVALID_ACCOUNT: -31050,
  ERROR_OCCURRED: -32400,
};

interface PaymeRequest {
  id: string;
  method: string;
  params: {
    id?: string;
    account?: Record<string, string>;
    amount?: number;
    time?: number;
    from?: number;
    to?: number;
    reason?: string | number;
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

function verifyAuth(authHeader: string | undefined): boolean {
  if (!config.PAYME_LOGIN || !config.PAYME_KEY) {
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

  const existingResult = await db
    .select()
    .from(paymeTransactions)
    .where(eq(paymeTransactions.paymeTransactionId, id as string));

  if (existingResult.length > 0) {
    const existingTransaction = existingResult[0];
    return {
      create_time: existingTransaction.createTime?.getTime() || Date.now(),
      transaction: existingTransaction.merchantTransactionId,
      state: existingTransaction.state,
    };
  }

  const merchantTransactionId = randomUUID();
  const now = new Date();

  await db.insert(paymeTransactions).values({
    paymeTransactionId: id as string,
    merchantTransactionId,
    orderId,
    amount,
    state: TRANSACTION_STATE_CREATED,
    createTime: time ? new Date(time) : now,
    userId,
    plan: plan as any,
    yearly,
  });

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

async function performTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id } = params;

  const result = await db
    .select()
    .from(paymeTransactions)
    .where(eq(paymeTransactions.paymeTransactionId, id as string));

  if (result.length === 0) {
    throw {
      code: ERROR_CODES.TRANSACTION_NOT_FOUND,
      message: "Transaction not found",
    };
  }

  const transaction = result[0];

  if (transaction.state === TRANSACTION_STATE_PERFORMED) {
    return {
      transaction: transaction.merchantTransactionId,
      perform_time: transaction.performTime?.getTime() || 0,
      state: TRANSACTION_STATE_PERFORMED,
    };
  }

  if (transaction.state === TRANSACTION_STATE_CANCELLED) {
    throw {
      code: ERROR_CODES.ERROR_OCCURRED,
      message: "Transaction is cancelled",
    };
  }

  const { userId, plan, yearly } = parseOrderId(transaction.orderId);

  const userResult = await db.select().from(users).where(eq(users.id, userId));

  if (userResult.length === 0) {
    fastify.log.warn({ userId }, "User not found for Payme transaction");
    throw {
      code: ERROR_CODES.INVALID_ACCOUNT,
      message: "User not found",
      data: "user",
    };
  }

  const user = userResult[0];
  const credits = getCreditsForPlan(plan);
  const yearlyMultiplier = yearly ? 12 : 1;
  const totalCredits = credits * yearlyMultiplier;

  await db
    .update(users)
    .set({
      credits: (user.credits || 0) + totalCredits,
      paymeCustomerId: id as string,
      paymeTransactionId: transaction.merchantTransactionId,
      paymeSubscriptionPlan: plan,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await db
    .update(paymeTransactions)
    .set({
      state: TRANSACTION_STATE_PERFORMED,
      performTime: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(paymeTransactions.paymeTransactionId, id as string));

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
    perform_time: Date.now(),
    state: TRANSACTION_STATE_PERFORMED,
  };
}

async function checkTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id } = params;

  const result = await db
    .select()
    .from(paymeTransactions)
    .where(eq(paymeTransactions.paymeTransactionId, id as string));

  if (result.length === 0) {
    throw {
      code: ERROR_CODES.TRANSACTION_NOT_FOUND,
      message: "Transaction not found",
    };
  }

  const transaction = result[0];

  const res: any = {
    transaction: transaction.merchantTransactionId,
    state: transaction.state,
    create_time: transaction.createTime?.getTime() || 0,
  };

  if (transaction.performTime) {
    res.perform_time = transaction.performTime.getTime();
  }

  if (transaction.cancelTime) {
    res.cancel_time = transaction.cancelTime.getTime();
  }

  return res;
}

async function cancelTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id, reason } = params;

  const result = await db
    .select()
    .from(paymeTransactions)
    .where(eq(paymeTransactions.paymeTransactionId, id as string));

  if (result.length === 0) {
    throw {
      code: ERROR_CODES.TRANSACTION_NOT_FOUND,
      message: "Transaction not found",
    };
  }

  const transaction = result[0];

  if (transaction.state === TRANSACTION_STATE_CANCELLED) {
    return {
      transaction: transaction.merchantTransactionId,
      cancel_time: transaction.cancelTime?.getTime() || 0,
      state: TRANSACTION_STATE_CANCELLED,
    };
  }

  await db
    .update(paymeTransactions)
    .set({
      state: TRANSACTION_STATE_CANCELLED,
      cancelTime: new Date(),
      reason: reason ? String(reason) : null,
      updatedAt: new Date(),
    })
    .where(eq(paymeTransactions.paymeTransactionId, id as string));

  fastify.log.info(
    { paymeTransactionId: id, reason },
    "Payme transaction cancelled",
  );

  return {
    transaction: transaction.merchantTransactionId,
    cancel_time: Date.now(),
    state: TRANSACTION_STATE_CANCELLED,
  };
}

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

  const transactions = await db
    .select()
    .from(paymeTransactions)
    .where(
      and(
        gte(paymeTransactions.createTime, startTime),
        lte(paymeTransactions.createTime, endTime),
      ),
    )
    .orderBy(asc(paymeTransactions.createTime));

  const result = transactions.map(
    (t: typeof paymeTransactions.$inferSelect) => ({
      id: t.paymeTransactionId,
      time: t.createTime?.getTime() || 0,
      amount: t.amount,
      account: { order_id: t.orderId },
      create_time: t.createTime?.getTime() || 0,
      perform_time: t.performTime?.getTime() || 0,
      cancel_time: t.cancelTime?.getTime() || 0,
      state: t.state,
      reason: t.reason,
    }),
  );

  return {
    transactions: result,
  };
}

const paymeMerchantRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/merchant", async (request, reply) => {
    try {
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
