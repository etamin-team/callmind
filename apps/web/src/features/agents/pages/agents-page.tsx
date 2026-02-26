import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import {
  Plus,
  Bot,
  Loader2,
  MoreVertical,
  Trash,
  Phone,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

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
    color: string
    bgColor: string
    dotColor: string
    icon: typeof Bot
  }
> = {
  support: {
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    dotColor: 'bg-violet-500',
    icon: MessageSquare,
  },
  sales: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    dotColor: 'bg-amber-500',
    icon: Zap,
  },
  assistant: {
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    dotColor: 'bg-cyan-500',
    icon: Sparkles,
  },
  default: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    dotColor: 'bg-blue-500',
    icon: Bot,
  },
}

function AgentCard({
  agent,
  workspaceId,
  onDelete,
}: {
  agent: any
  workspaceId: string
  onDelete: (e: React.MouseEvent, id: string) => void
}) {
  const config = agentTypeConfig[agent.type] || agentTypeConfig.default

  return (
    <div className="group relative rounded-lg border border-border bg-card transition-all hover:border-primary/30 hover:shadow-sm">
      <Link
        to="/$workspaceId/agents/$agentId"
        params={{ workspaceId, agentId: agent.id }}
        className="absolute inset-0 z-10"
      />

      <div className="flex flex-col h-full">
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
              <h3 className="font-medium text-base">{agent.name}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative z-20 h-7 w-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
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

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {agent.businessDescription || 'No description'}
          </p>
        </div>

        <div className="px-5 pb-5 pt-0">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span
              className={`px-2 py-1 rounded-md ${config.bgColor} ${config.color} font-medium capitalize`}
            >
              {agent.type}
            </span>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              <span>{agent.language}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {agents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
              <p className="text-muted-foreground">
                Manage your intelligent workforce
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link to="/$workspaceId/agents/create" params={{ workspaceId }}>
                <Plus className="h-4 w-4" />
                New AI Agent
              </Link>
            </Button>
          </div>
        </div>
      )}

      {agents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              workspaceId={workspaceId}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {!isLoading && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
          <div className="relative w-64 h-40 mb-8">
            <div className="absolute inset-x-8 inset-y-0 bg-orange-400/20 rounded-2xl rotate-[-6deg] backdrop-blur-sm" />
            <div className="absolute inset-x-8 inset-y-0 bg-red-400/20 rounded-2xl rotate-[6deg] backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border border-orange-200/50 dark:border-orange-800/30 rounded-2xl shadow-sm flex items-center justify-center">
              <div className="space-y-3 w-3/4 opacity-50">
                <div className="h-2 w-1/3 bg-orange-200 dark:bg-orange-800 rounded-full" />
                <div className="h-2 w-full bg-orange-100 dark:bg-orange-900/50 rounded-full" />
                <div className="h-2 w-5/6 bg-orange-100 dark:bg-orange-900/50 rounded-full" />
              </div>
              <div className="absolute top-4 left-4 p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                <Bot className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold tracking-tight mb-3">
            No agents yet..
          </h3>
          <p className="text-muted-foreground max-w-md mb-8 text-base">
            Create your first AI Agent to start automating support, generating
            leads, and answering customer questions.
          </p>
          <Button
            asChild
            size="lg"
            className="h-10 px-6 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-md"
          >
            <Link to="/$workspaceId/agents/create" params={{ workspaceId }}>
              <Plus className="h-4 w-4 mr-2" />
              New AI agent
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              agent and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
              Type <span className="font-bold">I understand</span> to confirm.
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="I understand"
              className="col-span-3"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteConfirmation !== 'I understand'}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
