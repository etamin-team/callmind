import React, { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function TodoList() {
  const [newTodo, setNewTodo] = useState('')
  const { data: todos, isLoading } = useTodos()
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    createTodo.mutate(newTodo, {
      onSuccess: () => setNewTodo(''),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground text-sm">Manage your workspace todos and productivity.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        />
        <Button disabled={createTodo.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </form>

      <div className="space-y-3">
        {todos?.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50/50 dark:bg-zinc-900/50">
            <p className="text-muted-foreground text-sm">No tasks yet. Add one above to get started!</p>
          </div>
        ) : (
          todos?.map((todo) => (
            <Card 
              key={todo.id} 
              className={cn(
                "p-4 flex items-center gap-3 transition-colors",
                todo.completed ? "bg-slate-50/50 dark:bg-zinc-900/20 opacity-70" : "bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <button
                onClick={() => updateTodo.mutate({ id: todo.id, completed: !todo.completed })}
                className="text-primary hover:scale-110 transition-transform"
              >
                {todo.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              
              <span className={cn(
                "flex-1 text-sm font-medium",
                todo.completed && "line-through text-muted-foreground"
              )}>
                {todo.title}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTodo.mutate(todo.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                disabled={deleteTodo.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
