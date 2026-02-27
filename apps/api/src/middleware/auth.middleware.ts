import { Elysia } from "elysia";
import { verifyToken } from "@clerk/backend";
import { config } from "../config/environment.js";

export interface AuthContext {
  userId: string | null;
  sessionId: string | null;
  orgId: string | null;
  user: any | null;
}

// Extend Elysia context to include auth
declare module "elysia" {
  interface Context {
    auth: AuthContext;
  }
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).derive(
  { as: "scoped" },
  async ({ request, set }) => {
    const authHeader = request.headers.get("authorization");

    const authContext: AuthContext = {
      userId: null,
      sessionId: null,
      orgId: null,
      user: null,
    };

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);

      try {
        // Verify the JWT token with Clerk
        const payload = await verifyToken(token, {
          secretKey: config.CLERK_SECRET_KEY,
        });

        authContext.userId = payload.sub || null;
        authContext.sessionId = payload.sid || null;
        authContext.orgId = payload.org_id || null;
      } catch (error) {
        // Token verification failed - auth context remains null
        console.log("Token verification failed:", error);
      }
    }

    return { auth: authContext };
  },
);

export const requireAuth = (context: { auth: AuthContext; set: any }) => {
  if (!context.auth?.userId) {
    context.set.status = 401;
    return {
      error: "Unauthorized",
      message: "Authentication required",
    };
  }
  return undefined;
};

export const optionalAuth = () => {
  // No-op for optional auth
  return undefined;
};
