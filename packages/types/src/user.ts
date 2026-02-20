import { z } from "zod";

export const PlanEnum = z.enum([
  "free",
  "starter",
  "professional",
  "enterprise",
]);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  plan: PlanEnum.default("free"),
  credits: z.number().int().min(0).default(2),
  paddleCustomerId: z.string().optional(),
  paddleSubscriptionId: z.string().optional(),
  // FreedomPay fields
  freedompayCustomerId: z.string().optional(),
  freedompayRecurringProfile: z.string().optional(),
  freedompayRecurringExpiry: z.date().optional(),
  freedompaySubscriptionPlan: z.string().optional(),
  subscriptionId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
