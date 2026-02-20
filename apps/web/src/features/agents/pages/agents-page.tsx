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
    icon: typeof Bot
  }
> = {
  support: {
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    icon: MessageSquare,
  },
  sales: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: Zap,
  },
  assistant: {
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    icon: Sparkles,
  },
  default: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: Bot,
  },
}

const languageLabels: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  uz: "O'zbek",
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
  const IconComponent = config.icon

  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden">
      <Link
        to="/$workspaceId/agents/$agentId"
        params={{ workspaceId, agentId: agent.id }}
        className="absolute inset-0 z-10"
      />

      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-2.5 rounded-lg ${config.bgColor}`}>
            <IconComponent className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{agent.name}</h3>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}
            >
              {agent.type}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative z-20 h-8 w-8 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
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

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {agent.businessDescription || 'No description'}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span>{languageLabels[agent.language] || agent.language}</span>
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
