import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Plus, Bot, Loader2, MoreVertical, Trash } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'

import { useAgentStore } from '../store'

const agentTypeConfig: Record<
  string,
  {
    gradientFrom: string
    gradientTo: string
  }
> = {
  support: {
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-600',
  },
  sales: {
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
  },
  assistant: {
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-600',
  },
  default: {
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
  },
}

function AgentCard({
  agent,
  workspaceId,
  onDelete,
  index,
}: {
  agent: any
  workspaceId: string
  onDelete: (e: React.MouseEvent, id: string) => void
  index: number
}) {
  const config = agentTypeConfig[agent.type] || agentTypeConfig.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="group relative rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all"
    >
      <Link
        to="/$workspaceId/agents/$agentId"
        params={{ workspaceId, agentId: agent.id }}
        className="absolute inset-0 z-10"
      />

      {/* Gradient Header with Voice Waveform */}
      <div
        className={`relative h-32 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} overflow-hidden`}
      >
        {/* Animated Voice Waveform Bars */}
        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-white rounded-full"
              animate={{
                height: [
                  Math.random() * 40 + 20,
                  Math.random() * 60 + 30,
                  Math.random() * 40 + 20,
                ],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Bot Icon */}
        <div className="absolute bottom-4 left-4">
          <div className="p-2.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-lg shadow-sm">
            <Bot className="h-5 w-5 text-foreground" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5 pt-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-base line-clamp-1 pr-2">
            {agent.name}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative z-20 h-7 w-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={(e) => onDelete(e, agent.id!)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground">
          Last trained 2 months ago
        </p>
      </div>
    </motion.div>
  )
}

export default function AgentsPage() {
  const { workspaceId: workspaceIdRaw } = useParams({
    from: '/_app/$workspaceId/agents/',
  })
  const workspaceId = workspaceIdRaw!
  const { getToken } = useAuth()
  const { agents, isLoading, fetchAgents, deleteAgent } = useAgentStore()

  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    const loadAgents = async () => {
      const token = await getToken()
      if (token) {
        fetchAgents(token)
      }
    }
    loadAgents()
  }, [getToken, fetchAgents, workspaceId])

  useEffect(() => {
    document.title = 'AI Agents - Callmind'
  }, [])

  const handleDeleteClick = (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation()
    setDeleteAgentId(agentId)
    setDeleteConfirmation('')
  }

  const handleConfirmDelete = async () => {
    if (!deleteAgentId) return

    const token = await getToken()
    if (token) {
      deleteAgent(deleteAgentId, token)
    }
    setDeleteAgentId(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {agents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Agents</h1>
            <Button asChild>
              <Link to="/$workspaceId/agents/create" params={{ workspaceId }}>
                <Plus className="h-4 w-4 mr-2" />
                New AI agent
              </Link>
            </Button>
          </div>
        </div>
      )}

      {agents.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              workspaceId={workspaceId}
              onDelete={handleDeleteClick}
              index={index}
            />
          ))}
        </div>
      )}

      {!isLoading && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
          {/* Simple illustration */}
          <div className="relative w-64 h-40 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl opacity-10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-24 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-background rounded-lg border shadow-sm">
              <Bot className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first AI Agent to start automating support and
            answering customer questions.
          </p>

          <Button asChild size="lg">
            <Link to="/$workspaceId/agents/create" params={{ workspaceId }}>
              <Plus className="h-4 w-4 mr-2" />
              New AI Agent
            </Link>
          </Button>
        </div>
      )}

      <AlertDialog
        open={!!deleteAgentId}
        onOpenChange={(open) => !open && setDeleteAgentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              agent and remove all data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Type <span className="font-semibold">I understand</span> to
              confirm
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="I understand"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteConfirmation !== 'I understand'}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
