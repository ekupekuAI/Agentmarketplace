import { readExecutionHistory } from '../execution/executionStore'
import { getAllAgents } from '../workspace/localWorkspace'

export interface ExecutionAnalytics {
  todayCount: number
  mostUsedAgent: string
  averageRuntime: string
  successRate: string
  satisfaction: string
}

export function getExecutionAnalytics(): ExecutionAnalytics {
  const history = readExecutionHistory()
  const today = new Date().toDateString()
  const completed = history.filter((run) => run.status === 'completed')
  const counts = new Map<string, number>()
  history.forEach((run) => counts.set(run.agentId, (counts.get(run.agentId) ?? 0) + 1))
  const topAgentId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const averageRuntime = completed.length
    ? Math.round(completed.reduce((sum, run) => sum + (run.durationMs ?? 0), 0) / completed.length / 100) / 10
    : 0

  return {
    todayCount: history.filter((run) => new Date(run.startedAt).toDateString() === today).length,
    mostUsedAgent: getAllAgents().find((agent) => agent.id === topAgentId)?.name ?? 'No runs yet',
    averageRuntime: averageRuntime ? `${averageRuntime}s` : '—',
    successRate: history.length ? `${Math.round((completed.length / history.length) * 100)}%` : '—',
    satisfaction: history.length ? 'Not collected' : 'No ratings yet',
  }
}
