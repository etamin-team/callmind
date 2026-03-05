import { FastifyPluginAsync } from "fastify";
import { config } from "../../config/environment.js";
import { UserModel } from "@repo/db";
import { PaymeTransactionModel } from "@repo/db";
import { getCreditsForPlan, getPriceForPlan } from "@repo/types";
import { randomUUID } from "crypto";

// ─── Payme Transaction States (from official docs) ───
// 1 = created (pending), 2 = performed (paid)
// -1 = cancelled before perform, -2 = cancelled after perform
const STATE = {
  CREATED: 1,
  PERFORMED: 2,
  CANCELLED_BEFORE: -1,
  CANCELLED_AFTER: -2,
} as const;

// Transaction timeout: 12 hours in milliseconds (per Payme docs)
const TRANSACTION_TIMEOUT_MS = 43_200_000;

// ─── Payme Error Definitions ───
// Per docs: `message` MUST be a multi-language object { uz, ru, en }
const PaymeError = {
  InvalidAmount: {
    code: -31001,
    message: {
      uz: "Noto'g'ri summa",
      ru: "Недопустимая сумма",
      en: "Invalid amount",
    },
  },
  TransactionNotFound: {
    code: -31003,
    message: {
      uz: "Tranzaksiya topilmadi",
      ru: "Транзакция не найдена",
      en: "Transaction not found",
    },
  },
  CantDoOperation: {
    code: -31008,
    message: {
      uz: "Operatsiyani bajarib bo'lmaydi",
      ru: "Невозможно выполнить данную операцию",
      en: "Unable to perform operation",
    },
  },
  AccountNotFound: {
    code: -31050,
    message: {
      uz: "Hisob topilmadi",
      ru: "Счёт не найден",
      en: "Account not found",
    },
  },
  InvalidAuthorization: {
    code: -32504,
    message: {
      uz: "Avtorizatsiya xatosi",
      ru: "Ошибка авторизации",
      en: "Authorization error",
    },
  },
  MethodNotFound: {
    code: -32601,
    message: {
      uz: "Metod topilmadi",
      ru: "Метод не найден",
      en: "Method not found",
    },
  },
  InternalError: {
    code: -32400,
    message: {
      uz: "Ichki xatolik",
      ru: "Внутренняя ошибка",
      en: "Internal error",
    },
  },
};

// ─── Payme Request/Response Types ───
interface PaymeRequest {
  id: number; // JSON-RPC id — must be returned in response
  method: string;
  params: {
    id?: string; // Payme transaction ID
    account?: Record<string, string>;
    amount?: number; // in tiyins (1 UZS = 100 tiyin)
    time?: number; // ms timestamp
    from?: number; // ms timestamp
    to?: number; // ms timestamp
    reason?: number; // cancellation reason (1-10)
  };
}

// ─── Basic Auth Verification ───
// Payme sends: Authorization: Basic base64("Paycom:SECRET_KEY")
// In test mode: login = "Paycom", password = test key from merchant dashboard
function verifyAuth(authHeader: string | undefined): boolean {
  if (!authHeader) return false;

  const [type, token] = authHeader.split(" ");
  if (type !== "Basic" || !token) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64").toString("utf-8");
  } catch {
    return false;
  }

  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return false;

  const login = decoded.substring(0, colonIndex);
  const password = decoded.substring(colonIndex + 1);

  return login === config.PAYME_LOGIN && password === config.PAYME_PASSWORD;
}

// ─── Parse order_id to extract components ───
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

// ─── Find user by either MongoDB _id or clerkUserId ───
async function findUserByIdentifier(identifier: string) {
  try {
    const user = await UserModel.findById(identifier);
    if (user) return user;
  } catch {
    // Not a valid ObjectId, try clerkUserId
  }

  return UserModel.findOne({ clerkUserId: identifier });
}

// ─── Extract userId and plan from account params ───
// Supports both sandbox format (user_id + product_id) and production format (order_id)
function extractAccountInfo(account: Record<string, string> | undefined): {
  userId: string;
  plan: string;
  yearly: boolean;
  orderId: string;
  invalidField: string;
} | null {
  if (!account || Object.keys(account).length === 0) return null;

  if (account.user_id && account.product_id) {
    // Sandbox format
    const planMap: Record<string, string> = {
      "1": "starter",
      "2": "professional",
      "3": "business",
    };
    const plan = planMap[account.product_id] || "starter";
    return {
      userId: account.user_id,
      plan,
      yearly: false,
      orderId: `${account.user_id}_${plan}_monthly`,
      invalidField: "user_id",
    };
  }

  if (account.order_id) {
    const parsed = parseOrderId(account.order_id);
    return {
      userId: parsed.userId,
      plan: parsed.plan,
      yearly: parsed.yearly,
      orderId: account.order_id,
      invalidField: "order_id",
    };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// CheckPerformTransaction
// Checks if transaction can be performed. Returns { allow: true }.
// ═══════════════════════════════════════════════════════════════
async function checkPerformTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const accountInfo = extractAccountInfo(params.account);
  if (!accountInfo) {
    throw {
      ...PaymeError.AccountNotFound,
      data: "account",
    };
  }

  // Validate amount
  if (!params.amount || params.amount <= 0) {
    throw PaymeError.InvalidAmount;
  }

  // Verify user exists
  const user = await findUserByIdentifier(accountInfo.userId);
  if (!user) {
    throw {
      ...PaymeError.AccountNotFound,
      data: accountInfo.invalidField,
    };
  }

  // Verify plan is valid
  const credits = getCreditsForPlan(accountInfo.plan);
  if (!credits || credits <= 0) {
    throw {
      ...PaymeError.AccountNotFound,
      data: accountInfo.invalidField,
    };
  }

  // Validate amount matches expected price for the plan (amount is in tiyins)
  const expectedPriceUzs = getPriceForPlan(accountInfo.plan, accountInfo.yearly);
  const expectedAmountTiyins = expectedPriceUzs * 100;
  if (expectedAmountTiyins > 0 && params.amount !== expectedAmountTiyins) {
    fastify.log.warn(
      {
        expected: expectedAmountTiyins,
        received: params.amount,
        plan: accountInfo.plan,
        yearly: accountInfo.yearly,
      },
      "Payme amount mismatch",
    );
    throw PaymeError.InvalidAmount;
  }

  return {
    allow: true,
    additional: {
      name: user.name?.slice(0, 20),
      plan: accountInfo.plan,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// CreateTransaction
// Creates a pending transaction. Handles idempotency and timeout.
// ═══════════════════════════════════════════════════════════════
async function createTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id, account, amount, time } = params;

  // Extract account info
  const accountInfo = extractAccountInfo(account);
  if (!accountInfo) {
    throw {
      ...PaymeError.AccountNotFound,
      data: "account",
    };
  }

  if (!amount || amount <= 0) {
    throw PaymeError.InvalidAmount;
  }

  // Check if transaction with same Payme ID already exists (idempotency)
  const existing = await PaymeTransactionModel.findOne({ transactionId: id });

  if (existing) {
    // If cancelled — can't re-create
    if (
      existing.state === STATE.CANCELLED_BEFORE ||
      existing.state === STATE.CANCELLED_AFTER
    ) {
      throw PaymeError.CantDoOperation;
    }

    // If pending — check timeout
    if (existing.state === STATE.CREATED) {
      const elapsed = Date.now() - existing.createTime.getTime();
      if (elapsed > TRANSACTION_TIMEOUT_MS) {
        // Auto-cancel expired transaction
        existing.state = STATE.CANCELLED_BEFORE;
        existing.cancelTime = new Date();
        existing.reason = 4; // CanceledDueToTimeout
        await existing.save();
        throw PaymeError.CantDoOperation;
      }
    }

    // Return existing transaction (idempotent response)
    return {
      create_time: existing.createTime.getTime(),
      transaction: existing.merchantTransactionId,
      state: existing.state,
    };
  }

  // Verify user exists
  const user = await findUserByIdentifier(accountInfo.userId);
  if (!user) {
    throw {
      ...PaymeError.AccountNotFound,
      data: accountInfo.invalidField,
    };
  }

  // Create new transaction
  const merchantTransactionId = randomUUID();

  const transaction = new PaymeTransactionModel({
    transactionId: id,
    merchantTransactionId,
    orderId: accountInfo.orderId,
    amount: amount / 100, // tiyin → UZS for storage
    state: STATE.CREATED,
    createTime: time ? new Date(time) : new Date(),
    userId: accountInfo.userId,
    plan: accountInfo.plan,
    yearly: accountInfo.yearly,
    provider: "PAYME",
  });

  try {
    await transaction.save();
  } catch (error: any) {
    // Handle MongoDB duplicate key errors (race condition)
    if (error.code === 11000 || error.code === 11001) {
      fastify.log.warn(
        { transactionId: id, error: error.message },
        "Duplicate transaction detected, finding existing",
      );

      const dup = await PaymeTransactionModel.findOne({ transactionId: id });
      if (dup) {
        if (
          dup.state === STATE.CANCELLED_BEFORE ||
          dup.state === STATE.CANCELLED_AFTER
        ) {
          throw PaymeError.CantDoOperation;
        }
        return {
          create_time: dup.createTime.getTime(),
          transaction: dup.merchantTransactionId,
          state: dup.state,
        };
      }
    }

    fastify.log.error(
      { transactionId: id, error: error.message, stack: error.stack },
      "Failed to create transaction",
    );
    throw PaymeError.InternalError;
  }

  fastify.log.info(
    {
      transactionId: id,
      merchantTransactionId,
      orderId: accountInfo.orderId,
      amount,
      userId: accountInfo.userId,
      plan: accountInfo.plan,
    },
    "Payme transaction created",
  );

  return {
    create_time: transaction.createTime.getTime(),
    transaction: merchantTransactionId,
    state: STATE.CREATED,
  };
}

// ═══════════════════════════════════════════════════════════════
// PerformTransaction
// Marks transaction as paid, grants credits to user.
// ═══════════════════════════════════════════════════════════════
async function performTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id } = params;

  const transaction = await PaymeTransactionModel.findOne({
    transactionId: id,
  });

  if (!transaction) {
    throw PaymeError.TransactionNotFound;
  }

  // Already performed — return idempotent response
  if (transaction.state === STATE.PERFORMED) {
    return {
      transaction: transaction.merchantTransactionId,
      perform_time: transaction.performTime
        ? transaction.performTime.getTime()
        : 0,
      state: STATE.PERFORMED,
    };
  }

  // Cancelled — can't perform
  if (
    transaction.state === STATE.CANCELLED_BEFORE ||
    transaction.state === STATE.CANCELLED_AFTER
  ) {
    throw PaymeError.CantDoOperation;
  }

  // Check timeout for pending transactions
  if (transaction.state === STATE.CREATED) {
    const elapsed = Date.now() - transaction.createTime.getTime();
    if (elapsed > TRANSACTION_TIMEOUT_MS) {
      transaction.state = STATE.CANCELLED_BEFORE;
      transaction.cancelTime = new Date();
      transaction.reason = 4;
      await transaction.save();
      throw PaymeError.CantDoOperation;
    }
  }

  // Find and update user
  const user = await findUserByIdentifier(transaction.userId);
  if (!user) {
    fastify.log.warn(
      { userId: transaction.userId },
      "User not found for Payme transaction",
    );
    throw PaymeError.AccountNotFound;
  }

  // Calculate credits
  const credits = getCreditsForPlan(transaction.plan);
  const yearlyMultiplier = transaction.yearly ? 12 : 1;
  const totalCredits = credits * yearlyMultiplier;

  // Update user credits and plan
  user.credits = (user.credits || 0) + totalCredits;
  user.plan = transaction.plan;
  user.paymeCustomerId = id;
  user.paymeTransactionId = transaction.merchantTransactionId;
  user.paymeSubscriptionPlan = transaction.plan;
  await user.save();

  // Mark transaction as performed
  transaction.state = STATE.PERFORMED;
  transaction.performTime = new Date();
  await transaction.save();

  fastify.log.info(
    {
      transactionId: id,
      userId: user.id,
      creditsAdded: totalCredits,
      plan: transaction.plan,
    },
    "Payme transaction performed - credits granted",
  );

  return {
    transaction: transaction.merchantTransactionId,
    perform_time: transaction.performTime.getTime(),
    state: STATE.PERFORMED,
  };
}

// ═══════════════════════════════════════════════════════════════
// CheckTransaction
// Returns current transaction status.
// ═══════════════════════════════════════════════════════════════
async function checkTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id } = params;

  const transaction = await PaymeTransactionModel.findOne({
    transactionId: id,
  });

  if (!transaction) {
    throw PaymeError.TransactionNotFound;
  }

  return {
    create_time: transaction.createTime.getTime(),
    perform_time: transaction.performTime
      ? transaction.performTime.getTime()
      : 0,
    cancel_time: transaction.cancelTime
      ? transaction.cancelTime.getTime()
      : 0,
    transaction: transaction.merchantTransactionId,
    state: transaction.state,
    reason: transaction.reason ?? null,
  };
}

// ═══════════════════════════════════════════════════════════════
// CancelTransaction
// Cancels a created or performed transaction.
// ═══════════════════════════════════════════════════════════════
async function cancelTransaction(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { id, reason } = params;

  const transaction = await PaymeTransactionModel.findOne({
    transactionId: id,
  });

  if (!transaction) {
    throw PaymeError.TransactionNotFound;
  }

  // Already cancelled — return idempotent response
  if (
    transaction.state === STATE.CANCELLED_BEFORE ||
    transaction.state === STATE.CANCELLED_AFTER
  ) {
    return {
      transaction: transaction.merchantTransactionId,
      cancel_time: transaction.cancelTime
        ? transaction.cancelTime.getTime()
        : 0,
      state: transaction.state,
    };
  }

  // Determine cancel state based on whether it was already performed
  const cancelState =
    transaction.state === STATE.PERFORMED
      ? STATE.CANCELLED_AFTER
      : STATE.CANCELLED_BEFORE;

  // If cancelling after perform, reverse the credits granted to the user
  if (cancelState === STATE.CANCELLED_AFTER) {
    const user = await findUserByIdentifier(transaction.userId);
    if (user) {
      const credits = getCreditsForPlan(transaction.plan);
      const yearlyMultiplier = transaction.yearly ? 12 : 1;
      const totalCredits = credits * yearlyMultiplier;

      user.credits = Math.max(0, (user.credits || 0) - totalCredits);
      user.plan = "free";
      user.paymeSubscriptionPlan = undefined;
      await user.save();

      fastify.log.info(
        {
          transactionId: id,
          userId: user.id,
          creditsReversed: totalCredits,
          newCredits: user.credits,
        },
        "Payme cancellation — credits reversed, plan reset to free",
      );
    } else {
      fastify.log.warn(
        { userId: transaction.userId, transactionId: id },
        "User not found during cancellation — could not reverse credits",
      );
    }
  }

  // Update transaction
  transaction.state = cancelState;
  transaction.cancelTime = new Date();
  if (reason !== undefined) {
    transaction.reason = reason;
  }
  await transaction.save();

  fastify.log.info(
    { transactionId: id, reason, state: cancelState },
    "Payme transaction cancelled",
  );

  return {
    transaction: transaction.merchantTransactionId,
    cancel_time: transaction.cancelTime.getTime(),
    state: cancelState,
  };
}

// ═══════════════════════════════════════════════════════════════
// GetStatement
// Returns list of transactions for a given time period.
// Per docs: from <= createTime <= to, sorted ascending.
// ═══════════════════════════════════════════════════════════════
async function getStatement(
  fastify: any,
  params: PaymeRequest["params"],
): Promise<any> {
  const { from, to } = params;

  if (from === undefined || to === undefined) {
    throw PaymeError.InternalError;
  }

  const transactions = await PaymeTransactionModel.find({
    createTime: {
      $gte: new Date(from),
      $lte: new Date(to),
    },
  }).sort({ createTime: 1 });

  return {
    transactions: transactions.map((t) => ({
      id: t.transactionId,
      time: t.createTime.getTime(),
      amount: t.amount * 100, // UZS → tiyin for Payme
      account: { order_id: t.orderId },
      create_time: t.createTime.getTime(),
      perform_time: t.performTime?.getTime() || 0,
      cancel_time: t.cancelTime?.getTime() || 0,
      transaction: t.merchantTransactionId,
      state: t.state,
      reason: t.reason ?? null,
    })),
  };
}

// ═══════════════════════════════════════════════════════════════
// Route Registration
// ═══════════════════════════════════════════════════════════════
const paymeMerchantRoutes: FastifyPluginAsync = async (fastify) => {
  // Main Merchant API endpoint — single POST handler for all JSON-RPC methods
  fastify.post("/merchant", async (request, reply) => {
    const body = request.body as PaymeRequest;
    const requestId = body?.id;

    try {
      // ── Step 1: Verify Basic Auth ──
      const authHeader = request.headers["authorization"];
      if (!verifyAuth(authHeader)) {
        fastify.log.warn(
          { authHeader: authHeader?.substring(0, 20) },
          "Invalid Payme auth",
        );
        // Per Payme docs: auth error MUST still be HTTP 200
        return reply.status(200).send({
          jsonrpc: "2.0",
          id: requestId,
          error: PaymeError.InvalidAuthorization,
        });
      }

      // ── Step 2: Validate request structure ──
      const { method, params } = body;
      if (!requestId || !method) {
        return reply.status(200).send({
          jsonrpc: "2.0",
          id: requestId ?? null,
          error: PaymeError.InternalError,
        });
      }

      fastify.log.info({ method, params }, "Payme Merchant API request");

      // ── Step 3: Route to method handler ──
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
          // Per Payme docs: ALL responses must be HTTP 200
          return reply.status(200).send({
            jsonrpc: "2.0",
            id: requestId,
            error: PaymeError.MethodNotFound,
          });
      }

      return reply.status(200).send({
        jsonrpc: "2.0",
        id: requestId,
        result,
      });
    } catch (error: any) {
      fastify.log.error(error, "Payme Merchant API error");

      // Build JSON-RPC error response — always HTTP 200
      const errorResponse: any = {
        jsonrpc: "2.0",
        id: requestId ?? null,
      };

      if (error.code && error.message) {
        // Payme-formatted error (has code + message object)
        errorResponse.error = {
          code: error.code,
          message: error.message,
          ...(error.data && { data: error.data }),
        };
      } else {
        // Unexpected error — wrap in standard format
        errorResponse.error = PaymeError.InternalError;
      }

      return reply.status(200).send(errorResponse);
    }
  });

  // Health check endpoint
  fastify.get("/merchant", async (_request, reply) => {
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

  // Test user creation endpoint — for sandbox testing only
  fastify.post("/test-user", async (request, reply) => {
    try {
      const { userId, email, name } = request.body as any;

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

      const testUser = new UserModel({
        email: email || userId,
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
      return reply.status(500).send({ error: error.message });
    }
  });
};

export default paymeMerchantRoutes;
