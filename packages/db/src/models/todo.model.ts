import mongoose, { Document, Schema } from 'mongoose'
import { Todo } from '@repo/types'

export interface ITodo extends Omit<Todo, 'id'>, Document {}

const todoSchema = new Schema<ITodo>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orgId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
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

export const TodoModel = mongoose.model<ITodo>('Todo', todoSchema)
