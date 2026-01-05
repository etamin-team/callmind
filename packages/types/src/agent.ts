import { z } from 'zod'

export const AgentSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  orgId: z.string().optional(),
  
  // Identity
  name: z.string().min(1, 'Name is required'),
  type: z.string(),
  language: z.string(),
  voice: z.string().optional(),
  
  // Business Context
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  businessIndustry: z.string().optional(),
  targetCallers: z.string().optional(),
  
  // Knowledge
  knowledgeText: z.string().optional(),
  
  // Call Flow
  greeting: z.string().optional(),
  primaryGoal: z.string().optional(),
  phoneTransfer: z.string().optional(),
  objectionHandling: z.string().optional(),
  collectFields: z.array(z.string()).optional(),
  
  // Meta
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Agent = z.infer<typeof AgentSchema>

export const CreateAgentSchema = AgentSchema.omit({
  id: true,
  userId: true,
  orgId: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateAgentRequest = z.infer<typeof CreateAgentSchema>

export const UpdateAgentSchema = CreateAgentSchema.partial()

export type UpdateAgentRequest = z.infer<typeof UpdateAgentSchema>
