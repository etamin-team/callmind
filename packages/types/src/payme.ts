export enum TransactionMethods {
  CheckPerformTransaction = "CheckPerformTransaction",
  CreateTransaction = "CreateTransaction",
  CheckTransaction = "CheckTransaction",
  PerformTransaction = "PerformTransaction",
  CancelTransaction = "CancelTransaction",
  GetStatement = "GetStatement",
}

export enum TransactionState {
  Pending = 1,
  Paid = 2,
  PendingCanceled = -1,
  PaidCanceled = -2,
}

export enum CancelingReasons {
  RecipientNotFound = 1,
  ErrorWhilePerformingDebitOperation = 2,
  TransactionFailed = 3,
  CanceledDueToTimeout = 4,
  Refund = 5,
  UnknownError = 10,
}

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
} as const;

export type PaymeErrorKey = keyof typeof PaymeError;

export interface PaymeRequestBase {
  id: number | string;
  method: TransactionMethods;
}

export interface CheckPerformTransactionParams {
  amount: number;
  account: Record<string, any>;
}

export interface CreateTransactionParams {
  id: string;
  time: number;
  amount: number;
  account: Record<string, any>;
}

export interface PerformTransactionParams {
  id: string;
}

export interface CancelTransactionParams {
  id: string;
  reason?: number;
}

export interface CheckTransactionParams {
  id: string;
}

export interface GetStatementParams {
  from: number;
  to: number;
}

export interface CheckPerformTransactionDto extends PaymeRequestBase {
  params: CheckPerformTransactionParams;
}

export interface CreateTransactionDto extends PaymeRequestBase {
  params: CreateTransactionParams;
}

export interface PerformTransactionDto extends PaymeRequestBase {
  params: PerformTransactionParams;
}

export interface CancelTransactionDto extends PaymeRequestBase {
  params: CancelTransactionParams;
}

export interface CheckTransactionDto extends PaymeRequestBase {
  params: CheckTransactionParams;
}

export interface GetStatementDto extends PaymeRequestBase {
  params: GetStatementParams;
}

export type PaymeRequestDto =
  | CheckPerformTransactionDto
  | CreateTransactionDto
  | PerformTransactionDto
  | CancelTransactionDto
  | CheckTransactionDto
  | GetStatementDto;

export interface PaymeResponse {
  jsonrpc: string;
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: string;
  };
}
