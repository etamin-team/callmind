import { z } from "zod";

export const ContactSchema = z.object({
  id: z.string().optional(),
  agentId: z.string(),
  userId: z.string(),
  orgId: z.string().optional(),

  // Contact Details
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional(),

  // Status & Tags
  status: z
    .enum(["hot-lead", "potential", "customer", "cold", "inactive"])
    .default("potential"),
  tags: z.array(z.string()).default([]),

  // Notes
  notes: z.string().optional(),

  // Call Statistics
  totalCalls: z.number().default(0),
  lastCallAt: z.date().optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Contact = z.infer<typeof ContactSchema>;

export const CreateContactSchema = ContactSchema.omit({
  id: true,
  userId: true,
  orgId: true,
  createdAt: true,
  updatedAt: true,
  totalCalls: true,
  lastCallAt: true,
});

export type CreateContactRequest = z.infer<typeof CreateContactSchema>;

export const UpdateContactSchema = CreateContactSchema.partial();

export type UpdateContactRequest = z.infer<typeof UpdateContactSchema>;

// Query params for filtering contacts
export const ContactQuerySchema = z.object({
  agentId: z.string().optional(),
  status: z
    .enum(["hot-lead", "potential", "customer", "cold", "inactive"])
    .optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().optional().default("50"),
  offset: z.string().optional().default("0"),
});

export type ContactQueryParams = z.infer<typeof ContactQuerySchema>;
