import type { Agent } from '@/features/agents/types'

type WorkspaceLike = {
  name?: string | null
  fullName?: string | null
  username?: string | null
}

export function slugifySegment(value: string | null | undefined) {
  const normalized = (value || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'workspace'
}

export function getWorkspaceRouteParam(workspace?: WorkspaceLike | null) {
  return slugifySegment(
    workspace?.name ||
      workspace?.fullName ||
      workspace?.username ||
      'workspace',
  )
}

export function getAgentRouteParam(agent?: Pick<Agent, 'name'> | null) {
  return slugifySegment(agent?.name || 'agent')
}

export function matchesAgentRouteParam(
  agent: Pick<Agent, 'id' | 'name'>,
  routeParam: string,
) {
  if (agent.id && agent.id === routeParam) return true
  return getAgentRouteParam(agent) === routeParam
}

export function resolveAgentFromRouteParam<
  T extends Pick<Agent, 'id' | 'name'>,
>(agents: T[], routeParam: string) {
  return (
    agents.find((agent) => matchesAgentRouteParam(agent, routeParam)) || null
  )
}
