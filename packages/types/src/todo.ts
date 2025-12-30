import { z } from 'zod'

export const TodoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orgId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  completed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoSchema = TodoSchema.pick({
  title: true,
})

export type CreateTodo = z.infer<typeof CreateTodoSchema>

export const UpdateTodoSchema = TodoSchema.pick({
  title: true,
  completed: true,
}).partial()

export type UpdateTodo = z.infer<typeof UpdateTodoSchema>
