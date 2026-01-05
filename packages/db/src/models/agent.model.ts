import mongoose, { Document, Schema } from 'mongoose'
import { Agent } from '@repo/types'

export interface IAgent extends Omit<Agent, 'id'>, Document {}

const agentSchema = new Schema<IAgent>(
  {
    userId: { type: String, required: true, index: true },
    orgId: { type: String, index: true },
    
    name: { type: String, required: true },
    type: { type: String, default: 'custom' },
    language: { type: String, default: 'en' },
    voice: { type: String },
    
    businessName: { type: String },
    businessDescription: { type: String },
    businessIndustry: { type: String },
    targetCallers: { type: String },
    
    knowledgeText: { type: String },
    
    greeting: { type: String },
    primaryGoal: { type: String },
    phoneTransfer: { type: String },
    objectionHandling: { type: String },
    collectFields: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id
        delete (ret as any)._id
        delete (ret as any).__v
        return ret
      },
    },
  }
)

export const AgentModel = mongoose.model<IAgent>('Agent', agentSchema)
