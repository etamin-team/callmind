import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { config } from "./config/environment.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import agentsRoutes from "./routes/agents/agents.routes.js";
import callHistoryRoutes from "./routes/call-history/call-history.routes.js";
import usersRoutes from "./routes/users/users.routes.js";
import todosRoutes from "./routes/todos/todos.routes.js";
import paymentsRoutes from "./routes/payments/payments.routes.js";
import paymeRoutes from "./routes/payme/payme.routes.js";
import freedompayRoutes from "./routes/freedompay/freedompay.routes.js";
import webhookRoutes from "./routes/webhooks/index.js";
import healthRoutes from "./routes/health/health.routes.js";

const app = new Elysia()
  // CORS configuration
  .use(
    cors({
      origin: (request: Request) => {
        const origin = request.headers.get("origin");
        if (!origin) return true;

        const allowedOrigins = [
          ...config.CORS_ORIGINS.split(","),
          /https:\/\/.*\.ngrok-free\.app$/,
          /https:\/\/.*\.ngrok\.io$/,
        ];

        const isAllowed = allowedOrigins.some((allowed) => {
          if (allowed instanceof RegExp) return allowed.test(origin);
          return origin === allowed;
        });

        return isAllowed;
      },
      credentials: true,
    }),
  )
  // Swagger/OpenAPI documentation
  .use(
    swagger({
      documentation: {
        info: {
          title: "Callmind API",
          version: "1.0.0",
        },
        tags: [
          { name: "health", description: "Health check endpoints" },
          { name: "users", description: "User management" },
          { name: "agents", description: "AI agents" },
          { name: "todos", description: "Todo management" },
          { name: "call-history", description: "Call history" },
          { name: "payments", description: "Payment processing" },
          { name: "webhooks", description: "Webhook handlers" },
        ],
      },
    }),
  )
  // Auth middleware - sets auth context on all requests
  .use(authMiddleware)
  // Health check (public)
  .use(healthRoutes)
  // API routes
  .use(agentsRoutes)
  .use(callHistoryRoutes)
  .use(usersRoutes)
  .use(todosRoutes)
  .use(paymentsRoutes)
  .use(paymeRoutes)
  .use(freedompayRoutes)
  .use(webhookRoutes)
  // Current user endpoint
  .get("/api/me", ({ auth, set }) => {
    if (!auth?.userId) {
      set.status = 401;
      return { error: "Unauthorized", message: "User not authenticated" };
    }
    return {
      userId: auth.userId,
      isAuthenticated: true,
    };
  })
  // 404 handler
  .onError(({ code, error, set }) => {
    console.error(`Error [${code}]:`, error);

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation error", message: error.message };
    }

    set.status = 500;
    return { error: "Internal server error" };
  });

// Start server
const port = config.PORT;
console.log(`Database configured (Drizzle + Neon)`);

app.listen(port, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  );
  console.log(
    `📚 API documentation available at http://localhost:${port}/swagger`,
  );
});

export type App = typeof app;
