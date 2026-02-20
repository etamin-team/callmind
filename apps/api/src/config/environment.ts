import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local .env
dotenv.config();

// Load root .env (3 levels up from apps/api/src/config)
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const getOptionalEnv = (key: string, placeholders: string[] = []) => {
  const val = process.env[key];
  // Filter out placeholder values from .env.example
  if (!val) {
    return undefined;
  }
  // Check against provided placeholders
  for (const placeholder of placeholders) {
    if (val.includes(placeholder) || val === placeholder) {
      return undefined;
    }
  }
  return val;
};

// Specific validators for different services
const getClerkEnv = (key: string) =>
  getOptionalEnv(key, ["your_clerk_", "your-secret"]);

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3001"),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/callmind",
  CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-this",
  CLERK_PUBLISHABLE_KEY:
    getClerkEnv("CLERK_PUBLISHABLE_KEY") ||
    getClerkEnv("VITE_CLERK_PUBLISHABLE_KEY"),
  CLERK_SECRET_KEY: getClerkEnv("CLERK_SECRET_KEY"),
  PADDLE_API_KEY: getOptionalEnv("PADDLE_API_KEY"),
  PADDLE_WEBHOOK_SECRET_KEY: getOptionalEnv("PADDLE_WEBHOOK_SECRET_KEY"),

  // Payme.uz configuration
  PAYME_MERCHANT_ID: getOptionalEnv("PAYME_MERCHANT_ID"),
  PAYME_SECRET_KEY: getOptionalEnv("PAYME_SECRET_KEY"),
  PAYME_CALLBACK_URL: getOptionalEnv("PAYME_CALLBACK_URL", [
    "https://your-domain.com",
  ]),

  // Prices in UZS (will be converted to tiyins: amount * 100)
  PAYME_STARTER_MONTHLY: getOptionalEnv("PAYME_STARTER_MONTHLY"), // e.g., 108000 = 108,000 UZS
  PAYME_STARTER_YEARLY: getOptionalEnv("PAYME_STARTER_YEARLY"),
  PAYME_PRO_MONTHLY: getOptionalEnv("PAYME_PRO_MONTHLY"),
  PAYME_PRO_YEARLY: getOptionalEnv("PAYME_PRO_YEARLY"),
  PAYME_BUSINESS_MONTHLY: getOptionalEnv("PAYME_BUSINESS_MONTHLY"),
  PAYME_BUSINESS_YEARLY: getOptionalEnv("PAYME_BUSINESS_YEARLY"),

  GEMINI_API_KEY: getOptionalEnv("GEMINI_API_KEY"),
};

// Debug logging (masked)
if (config.CLERK_PUBLISHABLE_KEY) {
  console.log(
    `[Config] Clerk Publishable Key loaded: ${config.CLERK_PUBLISHABLE_KEY.substring(0, 8)}...`,
  );
} else {
  console.error(
    `[Config] Clerk Publishable Key is MISSING or invalid placeholder detected.`,
  );
}

if (config.CLERK_SECRET_KEY) {
  console.log(
    `[Config] Clerk Secret Key loaded: sk_test_...${config.CLERK_SECRET_KEY.substring(config.CLERK_SECRET_KEY.length - 4)}`,
  );
} else {
  console.error(
    `[Config] Clerk Secret Key is MISSING or invalid placeholder detected.`,
  );
}

// Paddle configuration validation
if (config.PADDLE_API_KEY) {
  console.log(`[Config] Paddle API Key loaded`);
} else {
  console.warn(
    `[Config] Paddle API Key is MISSING. Payment features will be disabled.`,
  );
}

if (config.PADDLE_WEBHOOK_SECRET_KEY) {
  console.log(`[Config] Paddle Webhook Secret Key loaded`);
} else {
  console.warn(
    `[Config] Paddle Webhook Secret Key is MISSING. Webhook verification will fail.`,
  );
}

// Payme configuration validation
if (config.PAYME_MERCHANT_ID) {
  console.log(`[Config] Payme Merchant ID loaded`);
} else {
  console.warn(
    `[Config] Payme Merchant ID is MISSING. Payme payment features will be disabled.`,
  );
}

if (config.PAYME_SECRET_KEY) {
  console.log(`[Config] Payme Secret Key loaded`);
} else {
  console.warn(
    `[Config] Payme Secret Key is MISSING. Payme webhook verification will fail.`,
  );
}

const hasPaymePrices = !!(
  config.PAYME_STARTER_MONTHLY ||
  config.PAYME_PRO_MONTHLY ||
  config.PAYME_BUSINESS_MONTHLY
);
if (hasPaymePrices) {
  console.log(`[Config] Payme prices configured`);
} else {
  console.warn(
    `[Config] Payme prices are MISSING. Using default placeholder prices.`,
  );
}

if (config.GEMINI_API_KEY) {
  console.log(`[Config] Gemini API Key loaded`);
} else {
  console.warn(
    `[Config] Gemini API Key is MISSING. Transcript analysis will be disabled.`,
  );
}
