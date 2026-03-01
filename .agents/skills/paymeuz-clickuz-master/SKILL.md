---
name: paymeuz-clickuz-master
description: "Use this skill when integrating Payme.uz or Click.uz payment gateways into NestJS applications. Covers transaction flows, webhook handling, signature verification, TypeScript types, and error codes."
---

You are an expert Uzbek payment gateway integration specialist with deep
production experience in Payme.uz and Click.uz systems inside NestJS
applications.

**Before writing any code**: read the existing project structure to understand
the entity model (User, Order, Product, etc.) and ID types (number, string,
bigint). Adapt all patterns to the actual project — do not assume a fixed schema.

---

## Recommended File Structure

```
src/
├── click/
│   ├── click.module.ts
│   ├── click.service.ts
│   ├── click.controller.ts          # optional, can use shared payment.controller
│   ├── constants/
│   │   ├── click-error.ts
│   │   └── click-action.ts
│   ├── dto/
│   │   └── click-request.dto.ts
│   └── interfaces/
│       └── md5-params.interface.ts
├── payme/
│   ├── payme.module.ts
│   ├── payme.service.ts
│   ├── constants/
│   │   ├── payme-error.ts
│   │   ├── transaction-state.ts
│   │   ├── transaction-methods.ts
│   │   └── canceling-reasons.ts
│   ├── dto/                         # one DTO per RPC method
│   └── types/
│       └── request-body.type.ts
├── payment/
│   ├── payment.module.ts
│   ├── payment.controller.ts        # shared webhook controller
│   └── payment.service.ts           # payment link generator
└── auth/guards/
    └── payme.guard.ts
```

---

## NestJS Module Setup

```typescript
// src/payme/payme.module.ts
@Module({
  providers: [PaymeService],
  exports: [PaymeService],
})
export class PaymeModule {}

// src/click/click.module.ts
@Module({
  providers: [ClickService],
  exports: [ClickService],
})
export class ClickModule {}

// src/payment/payment.module.ts
@Module({
  imports: [PaymeModule, ClickModule],
  controllers: [PaymentController],
})
export class PaymentModule {}

// src/app.module.ts — PaymentModule ni import qiling
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PaymentModule],
})
export class AppModule {}
```

---

## Environment Variables

```env
PAYME_MERCHANT_ID=your_merchant_id
PAYME_LOGIN=Paycom              # "Paycom" in test mode, merchant_id in prod
PAYME_PASSWORD=your_secret_key
CLICK_SERVICE_ID=12345
CLICK_MERCHANT_ID=67890
CLICK_SECRET=your_click_secret_key
```

---

## Payment Link Generation

```typescript
// Payme — amount tiynda (1 UZS = 100 tiyn)
// ac.<key> — loyihadagi account identifikatori (user_id, order_id, etc.)
const data = `m=${PAYME_MERCHANT_ID};l=uz;ac.user_id=${entityId};a=${amount * 100};c=https://redirect.url`;
const encoded = Buffer.from(data).toString("base64");
const paymeLink = `https://checkout.paycom.uz/${encoded}`;

// Click — amount UZSda, transaction_param = entityId
const clickLink =
  `https://my.click.uz/services/pay` +
  `?service_id=${CLICK_SERVICE_ID}` +
  `&merchant_id=${CLICK_MERCHANT_ID}` +
  `&amount=${amount}` +
  `&transaction_param=${entityId}` +
  `&return_url=https://redirect.url`;
```

---

## Click.uz Integration

### Flow (2-phase)

```
User pays → Click calls your server twice:
  Phase 1 (action=0): PREPARE  — validate, reserve
  Phase 2 (action=1): COMPLETE — finalize, update DB
```

### Error Codes

```typescript
// src/click/constants/click-error.ts
export const ClickError = {
  Success: 0,
  SignFailed: -1, // MD5 hash mismatch
  InvalidAmount: -2, // amount mismatch
  ActionNotFound: -3, // action not 0 or 1
  AlreadyPaid: -4, // transaction already paid
  UserNotFound: -5, // entity not found in your DB
  TransactionNotFound: -6, // merchant_prepare_id not found
  FailedToUpdateUser: -7, // DB update error
  BadRequest: -8, // missing/invalid params
  TransactionCanceled: -9, // already cancelled
};
```

### Signature Verification (MD5)

```typescript
import { createHash } from "node:crypto";

// Prepare (action=0): merchantPrepareId YO'Q
const prepareContent = `${clickTransId}${serviceId}${secretKey}${merchantTransId}${amount}${action}${signTime}`;

// Complete (action=1): merchantPrepareId QO'SHILADI
const completeContent = `${clickTransId}${serviceId}${secretKey}${merchantTransId}${merchantPrepareId}${amount}${action}${signTime}`;

const hash = createHash("md5").update(content).digest("hex");
if (hash !== sign_string)
  return { error: ClickError.SignFailed, error_note: "Invalid sign_string" };
```

### DTO Types

```typescript
// src/click/dto/click-request.dto.ts
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";

export class ClickRequestDto {
  @IsNumber()
  @Type(() => Number)
  click_trans_id: number;

  @IsNumber()
  @Type(() => Number)
  service_id: number;

  @IsNumber()
  @Type(() => Number)
  click_paydoc_id: number;

  @IsOptional()
  @IsString()
  merchant_user_id?: string;

  @IsString()
  @IsNotEmpty()
  merchant_trans_id: string; // your entityId (user, order, etc.)

  @IsOptional()
  @IsString()
  param2?: string;

  @Type(() => Number)
  amount: number; // UZS — always parseFloat() it

  @IsIn([0, 1])
  @Type(() => Number)
  action: 0 | 1;

  @IsNumber()
  @Type(() => Number)
  error: number; // >0 means Click-side failure in complete

  @IsString()
  error_note: string;

  @IsString()
  sign_time: string;

  @IsString()
  sign_string: string;

  @IsNumber()
  @Type(() => Number)
  merchant_prepare_id: number; // your server generates in prepare; sent back in complete
}

// src/click/interfaces/md5-params.interface.ts
export interface ClickMd5Params {
  clickTransId: string;
  serviceId: number;
  secretKey: string;
  merchantTransId: string;
  merchantPrepareId?: number; // undefined in prepare, required in complete
  amount: number;
  action: number;
  signTime: string;
}
```

### Click Service Pattern

```typescript
@Injectable()
export class ClickService {
  private readonly logger = new Logger(ClickService.name);
  private readonly secretKey: string;

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.getOrThrow<string>("CLICK_SECRET");
  }

  async handleWebhook(body: ClickRequestDto) {
    this.logger.log(
      `Click webhook: action=${body.action} trans=${body.click_trans_id}`,
    );
    body.amount = parseFloat(body.amount as any); // always normalize

    switch (+body.action) {
      case 0:
        return this.prepare(body);
      case 1:
        return this.complete(body);
      default:
        return {
          error: ClickError.ActionNotFound,
          error_note: "Invalid action",
        };
    }
  }

  async prepare(body: ClickRequestDto) {
    // 1. Verify signature (no merchantPrepareId)
    if (!this.verifySign(body))
      return {
        error: ClickError.SignFailed,
        error_note: "Invalid sign_string",
      };

    // 2. Find entity — adapt to your model (user, order, product…)
    const entity = await this.findEntity(body.merchant_trans_id);
    if (!entity)
      return { error: ClickError.UserNotFound, error_note: "Entity not found" };

    // 3. Check idempotency
    const existing = await this.findTransaction(body.click_trans_id.toString());
    if (existing?.status === "PAID")
      return { error: ClickError.AlreadyPaid, error_note: "Already paid" };
    if (existing?.status === "CANCELED")
      return { error: ClickError.TransactionCanceled, error_note: "Cancelled" };

    // 4. Create PENDING record
    const prepareId = Date.now();
    await this.createTransaction({
      transactionId: body.click_trans_id.toString(),
      prepareId,
      amount: body.amount,
      entityId: body.merchant_trans_id,
      status: "PENDING",
      provider: "CLICK",
    });

    return {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      merchant_prepare_id: prepareId,
      error: ClickError.Success,
      error_note: "Success",
    };
  }

  async complete(body: ClickRequestDto) {
    // 1. Verify signature (with merchantPrepareId)
    if (!this.verifySign(body))
      return {
        error: ClickError.SignFailed,
        error_note: "Invalid sign_string",
      };

    // 2. Find transaction
    const tx = await this.findTransactionByPrepare(
      body.click_trans_id.toString(),
      body.merchant_prepare_id,
    );
    if (!tx)
      return { error: ClickError.TransactionNotFound, error_note: "Not found" };

    if (tx.status === "PAID")
      return { error: ClickError.AlreadyPaid, error_note: "Already paid" };
    if (tx.status === "CANCELED")
      return { error: ClickError.TransactionCanceled, error_note: "Cancelled" };

    if (Number(body.amount) !== Number(tx.amount))
      return { error: ClickError.InvalidAmount, error_note: "Amount mismatch" };

    // 3. Click error > 0 = Click-side failure → cancel
    if (body.error > 0) {
      await this.cancelTransaction(tx.id);
      return { error: body.error, error_note: "Failed" };
    }

    // 4. Mark PAID + business logic
    await this.markPaid(tx.id);
    await this.onPaymentSuccess(tx.id); // inject your own success handler

    return {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      merchant_confirm_id: null,
      error: ClickError.Success,
      error_note: "Success",
    };
  }

  private verifySign(body: ClickRequestDto): boolean {
    const params: ClickMd5Params = {
      clickTransId: body.click_trans_id.toString(),
      serviceId: body.service_id,
      secretKey: this.secretKey,
      merchantTransId: body.merchant_trans_id,
      amount: body.amount,
      action: body.action,
      signTime: body.sign_time,
      // only in complete:
      ...(body.action === 1 && { merchantPrepareId: body.merchant_prepare_id }),
    };
    const content = [
      params.clickTransId,
      params.serviceId,
      params.secretKey,
      params.merchantTransId,
      params.merchantPrepareId ?? "",
      params.amount,
      params.action,
      params.signTime,
    ].join("");
    return createHash("md5").update(content).digest("hex") === body.sign_string;
  }
}
```

### GetInfo (Optional — Advanced Shop)

GetInfo — Click tizimi to'lov oynasida foydalanuvchiga kerakli ma'lumotni ko'rsatish uchun **ixtiyoriy** so'rov. Barcha loyihalarda kerak emas.

**Click so'rovi:**

```json
{
  "action": 0,
  "service_id": 123,
  "params": {
    "contract": "***",
    "full_name": "***",
    "service_type": "***"
  }
}
```

**Muvaffaqiyatli javob:**

```json
{
  "error": 0,
  "error_note": "Muvaffaqiyatli",
  "params": {
    "caller_id": "...",
    "full_name": "...",
    "address": "...",
    "balance": "...",
    "account": "..."
  }
}
```

**Muvaffaqiyatsiz javob:**

```json
{
  "error": -5,
  "error_note": "Abonent topilmadi"
}
```

**Tekshirish shartlari:**

- `action` must be `0`
- `service_id` must match `CLICK_SERVICE_ID`
- `params` keys depend on your merchant agreement with Click

```typescript
// Faqat kerak bo'lsa implement qiling
async getInfo(body: { action: number; service_id: number; params: Record<string, any> }) {
  if (body.service_id !== Number(process.env.CLICK_SERVICE_ID) || body.action !== 0)
    return { error: -8, error_note: 'Service unavailable' };

  // Loyihaga qarab entity toping (user, contract, order…)
  const entity = await this.findEntityByParams(body.params);
  if (!entity) return { error: -5, error_note: 'Entity not found' };

  // Kerakli fieldlarni qaytaring — Click merchant agreement ga bog'liq
  return {
    error: 0,
    error_note: 'Muvaffaqiyatli',
    params: {
      caller_id: entity.id.toString(),
      full_name: entity.name?.slice(0, 20) ?? '',
      // qo'shimcha fieldlar: balance, address, account, etc.
    },
  };
}
```

**Click GetInfo params reference:**
| Key | Description |
|-----|-------------|
| `caller_id` | Entity ID |
| `full_name` | FIO (max 20 char) |
| `account` | Litsenziya/hisob raqami |
| `address` | Manzil |
| `balance` | Balans |
| `contract` | Shartnoma raqami |
| `phone_num` | Telefon |
| `email` | Email |
| `period` | Davr |
| `amount` | Summa |
| `service_type` | Xizmat turi |

---

## Payme.uz Integration

### Flow (JSON-RPC 2.0)

```
Payme sends POST requests → your single endpoint
Auth: Basic base64("Paycom:SECRET_KEY") → always HTTP 200!

Method sequence:
  1. CheckPerformTransaction — can we charge? validate amount + account
  2. CreateTransaction       — create pending record in your DB
  3. PerformTransaction      — mark paid, run business logic
  4. CancelTransaction       — cancel (before or after perform)
  5. CheckTransaction        — get transaction status
  6. GetStatement            — list transactions in time range
```

### Transaction States

```typescript
// src/payme/constants/transaction-state.ts
export const TransactionState = {
  Pending: 1, // yaratildi, kutmoqda
  Paid: 2, // muvaffaqiyatli bajarildi
  PendingCanceled: -1, // Perform dan oldin bekor qilindi
  PaidCanceled: -2, // Perform dan keyin bekor qilindi (refund)
};
```

### Transaction Methods

```typescript
// src/payme/constants/transaction-methods.ts
export enum TransactionMethods {
  CheckPerformTransaction = "CheckPerformTransaction",
  CreateTransaction = "CreateTransaction",
  CheckTransaction = "CheckTransaction",
  PerformTransaction = "PerformTransaction",
  CancelTransaction = "CancelTransaction",
  GetStatement = "GetStatement",
}
```

### Canceling Reasons

```typescript
// src/payme/constants/canceling-reasons.ts
export const CancelingReasons = {
  RecipientNotFound: 1,
  ErrorWhilePerformingDebitOperation: 2,
  TransactionFailed: 3,
  CanceledDueToTimeout: 4,
  Refund: 5,
  UnknownError: 10,
};
```

### Error Objects

```typescript
// src/payme/constants/payme-error.ts
export const PaymeError = {
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
      ru: "Невозможно выполнить операцию",
      en: "Can't perform operation",
    },
  },
  AccountNotFound: {
    code: -31050,
    message: {
      uz: "Hisob topilmadi",
      ru: "Аккаунт не найден",
      en: "Account not found",
    },
  },
  AlreadyDone: {
    code: -31060,
    message: {
      uz: "To'lov amalga oshirilgan",
      ru: "Оплата выполнена",
      en: "Already paid",
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
};
```

### DTO Types

```typescript
// Barcha DTOlar uchun umumiy baza
interface PaymeRequestBase {
  id: number; // JSON-RPC id — javobda qaytarilishi shart
  method: TransactionMethods;
}

export interface CheckPerformTransactionDto extends PaymeRequestBase {
  params: {
    amount: number; // tiyn (1 UZS = 100 tiyn)
    account: Record<string, any>; // loyihaga qarab: { user_id } yoki { order_id } yoki boshqa
  };
}

export interface CreateTransactionDto extends PaymeRequestBase {
  params: {
    id: string; // Payme transaction ID
    time: number; // ms timestamp
    amount: number; // tiyn
    account: Record<string, any>;
  };
}

export interface PerformTransactionDto extends PaymeRequestBase {
  params: { id: string };
}

export interface CancelTransactionDto extends PaymeRequestBase {
  params: { id: string; reason: number };
}

export interface CheckTransactionDto extends PaymeRequestBase {
  params: { id: string };
}

export interface GetStatementDto extends PaymeRequestBase {
  params: { from: number; to: number }; // ms timestamps
}

export type RequestBody =
  | CheckPerformTransactionDto
  | CreateTransactionDto
  | PerformTransactionDto
  | CancelTransactionDto
  | CheckTransactionDto
  | GetStatementDto;
```

### Payme Guard (Basic Auth)

```typescript
// src/auth/guards/payme.guard.ts
@Injectable()
export class PaymeBasicAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const id = req?.body?.id;

    const sendError = () => {
      res.status(200).json({ id, error: PaymeError.InvalidAuthorization });
      return false;
    };

    const [type, token] = req.headers["authorization"]?.split(" ") ?? [];
    if (type !== "Basic" || !token) return sendError();

    const decoded = atob(token); // "Paycom:SECRET_KEY"
    const [username, password] = decoded.split(":");

    if (
      this.config.get("PAYME_LOGIN") !== username ||
      this.config.get("PAYME_PASSWORD") !== password
    )
      return sendError();

    return true;
  }
}
```

### Payme Service Pattern

```typescript
@Injectable()
export class PaymeService {
  private readonly logger = new Logger(PaymeService.name);

  async handleTransactionMethods(body: RequestBody) {
    this.logger.log(`Payme method: ${body.method} id=${body.id}`);
    switch (body.method) {
      case TransactionMethods.CheckPerformTransaction:
        return this.checkPerformTransaction(body as CheckPerformTransactionDto);
      case TransactionMethods.CreateTransaction:
        return this.createTransaction(body as CreateTransactionDto);
      case TransactionMethods.CheckTransaction:
        return this.checkTransaction(body as CheckTransactionDto);
      case TransactionMethods.PerformTransaction:
        return this.performTransaction(body as PerformTransactionDto);
      case TransactionMethods.CancelTransaction:
        return this.cancelTransaction(body as CancelTransactionDto);
      case TransactionMethods.GetStatement:
        return this.getStatement(body as GetStatementDto);
      default:
        return { error: PaymeError.CantDoOperation, id: (body as any).id };
    }
  }

  private async checkPerformTransaction(dto: CheckPerformTransactionDto) {
    // 1. Find entity by account params — adapt to your project
    const entity = await this.findEntityByAccount(dto.params.account);
    if (!entity) return { error: PaymeError.AccountNotFound, id: dto.id };

    // 2. Validate amount
    if (dto.params.amount <= 0)
      return { error: PaymeError.InvalidAmount, id: dto.id };

    // 3. Optional: extra business validation (e.g. already subscribed, order status)

    return {
      result: {
        allow: true,
        additional: {
          // Return info shown in Payme checkout — adapt fields
          name: entity.name?.slice(0, 20),
        },
      },
    };
  }

  private async createTransaction(dto: CreateTransactionDto) {
    const transId = dto.params.id;

    const existing = await this.findTransactionById(transId);
    if (existing?.status === "PAID")
      return {
        result: {
          transaction: transId,
          state: TransactionState.Paid, // PAID → Paid (bug fix)
          create_time: +existing.createdAt,
        },
        id: dto.id,
      };
    if (existing?.status === "PENDING")
      return {
        result: {
          transaction: transId,
          state: TransactionState.Pending,
          create_time: +existing.createdAt,
        },
        id: dto.id,
      };
    if (existing?.status === "CANCELED")
      return { error: PaymeError.CantDoOperation, id: dto.id };

    const entity = await this.findEntityByAccount(dto.params.account);
    if (!entity) return { error: PaymeError.AccountNotFound, id: dto.id };

    const tx = await this.saveTransaction({
      transactionId: transId,
      entityId: this.extractEntityId(dto.params.account),
      amount: dto.params.amount / 100, // tiyn → UZS; store in UZS
      status: "PENDING",
      state: TransactionState.Pending,
      provider: "PAYME",
    });

    return {
      result: {
        transaction: transId,
        state: TransactionState.Pending,
        create_time: +tx.updatedAt,
      },
      id: dto.id,
    };
  }

  private async checkTransaction(dto: CheckTransactionDto) {
    const tx = await this.findTransactionById(dto.params.id);
    if (!tx)
      return { error: PaymeError.TransactionNotFound, id: dto.params.id };

    return {
      result: {
        create_time: +tx.createdAt,
        perform_time: tx.performTime ? +tx.performTime : 0,
        cancel_time: tx.cancelTime ? +tx.cancelTime : 0,
        transaction: tx.transactionId,
        state: tx.state,
        reason: tx.reason ?? null,
      },
    };
  }

  private async performTransaction(dto: PerformTransactionDto) {
    const tx = await this.findTransactionById(dto.params.id);
    if (!tx)
      return { error: PaymeError.TransactionNotFound, id: dto.params.id };

    if (tx.status === "PAID")
      return {
        result: {
          transaction: tx.transactionId,
          perform_time: tx.performTime ? +tx.performTime : 0,
          state: TransactionState.Paid,
        },
      };
    if (tx.status === "CANCELED")
      return { error: PaymeError.CantDoOperation, id: dto.params.id };

    const updated = await this.markTransactionPaid(tx.id);
    await this.onPaymentSuccess(tx.id); // your business logic

    return {
      result: {
        transaction: updated.transactionId,
        perform_time: updated.performTime ? +updated.performTime : 0,
        state: TransactionState.Paid,
      },
    };
  }

  private async cancelTransaction(dto: CancelTransactionDto) {
    const tx = await this.findTransactionById(dto.params.id);
    if (!tx)
      return { error: PaymeError.TransactionNotFound, id: dto.params.id };

    if (tx.status === "PENDING") {
      const cancelTime = new Date();
      await this.markTransactionCanceled(
        tx.id,
        TransactionState.PendingCanceled,
        CancelingReasons.TransactionFailed,
      );
      return {
        result: {
          cancel_time: +cancelTime,
          transaction: tx.transactionId,
          state: TransactionState.PendingCanceled,
        },
      };
    }

    if (tx.status === "PAID") {
      // Check if refund is possible (business logic)
      const canRefund = await this.checkRefundPossibility(tx);
      if (!canRefund)
        return { error: PaymeError.CantDoOperation, id: dto.params.id };

      const cancelTime = new Date();
      await this.onRefund(tx); // reverse business logic
      await this.markTransactionCanceled(
        tx.id,
        TransactionState.PaidCanceled,
        CancelingReasons.Refund,
      );
      return {
        result: {
          cancel_time: +cancelTime,
          transaction: tx.transactionId,
          state: TransactionState.PaidCanceled,
        },
      };
    }

    // Already canceled
    return {
      result: {
        cancel_time: tx.cancelTime ? +tx.cancelTime : 0,
        state: tx.state,
        transaction: tx.transactionId,
      },
    };
  }

  private async getStatement(dto: GetStatementDto) {
    const transactions = await this.findTransactionsByDateRange(
      new Date(dto.params.from),
      new Date(dto.params.to),
      "PAYME",
    );

    return {
      result: {
        transactions: transactions.map((tx) => ({
          id: tx.transactionId,
          account: tx.entityId,
          amount: Number(tx.amount) * 100, // UZS → tiyn for Payme
          create_time: +tx.createdAt,
          perform_time: tx.performTime ? +tx.performTime : 0,
          cancel_time: tx.cancelTime ? +tx.cancelTime : 0,
          state: tx.state,
          reason: tx.reason ?? null,
        })),
      },
    };
  }
}
```

---

## Payment Controller

```typescript
@Controller("payment")
export class PaymentController {
  constructor(
    private readonly paymeService: PaymeService,
    private readonly clickService: ClickService,
  ) {}

  @Post("payme")
  @UseGuards(PaymeBasicAuthGuard)
  @HttpCode(HttpStatus.OK) // ALWAYS 200 for Payme!
  handlePayme(@Body() body: RequestBody) {
    return this.paymeService.handleTransactionMethods(body);
  }

  @Post("click")
  @HttpCode(HttpStatus.OK)
  handleClick(@Req() req: Request) {
    return this.clickService.handleWebhook(req.body);
  }

  // Optional — only if merchant agreement requires GetInfo
  @Post("click/getinfo")
  @HttpCode(200)
  getClickInfo(@Body() body: any) {
    return this.clickService.getInfo(body);
  }
}
```

---

## Prisma Transaction Model Example

Adapt to your project — these are the minimum fields needed:

```prisma
model Payment {
  id            String   @id @default(cuid())
  transactionId String   @unique      // Payme/Click transaction ID
  prepareId     String?               // Click only: your server-generated timestamp
  provider      String                // "PAYME" | "CLICK"
  status        String   @default("PENDING")  // PENDING | PAID | CANCELED
  state         Int?                  // Payme state (-2, -1, 1, 2)
  amount        Decimal               // Store in UZS
  reason        Int?                  // Payme cancel reason
  entityId      String                // your user/order/product ID
  performTime   DateTime?
  cancelTime    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## Critical Rules

### Setup (bir marta)

```typescript
// main.ts — ValidationPipe global yoqilmasa DTO validatsiyasi ishlamaydi
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
```

### Payme

- HTTP response **har doim 200** — xatolar body'da `{ error: {...} }` ko'rinishida
- Amount **tiynda** keladi (`÷ 100` → DB ga UZS saqla, `× 100` → GetStatement da qaytarib ber)
- `id` response'da request'dagi `id` bilan mos bo'lishi shart (JSON-RPC qoidasi)
- Guard: `atob(token)` → `"Paycom:SECRET_KEY"` formatida decode qiladi

### Click

- Signature **har qanday DB operatsiyadan oldin** tekshirilsin
- `merchantPrepareId` — **prepare** hash'da YO'Q, **complete** hash'da BOR
- `body.error > 0` complete'da = Click'dan xato → tranzaktsiyani bekor qil
- `amount` string sifatida kelishi mumkin — har doim `parseFloat()` qil
- `prepareId` — **siz** generate qilasiz (masalan `Date.now()`)

### Ikkala tizim uchun

- Idempotency: har doim dublikat tranzaktsiyani tekshiring
- `onPaymentSuccess` va `onRefund` — business logikangizni alohida method'da saqlang
- Barcha webhook body'larini log qiling
- ID type'larini loyihadagi real type'ga moslang (`string`, `number`, yoki boshqa)

---

## Official Documentation

- **Click.uz**: https://docs.click.uz/en/
- **Payme.uz**: https://developer.help.paycom.uz/
