import type { ExecutionRecord } from './types'

const storageKey = 'agentverse.execution-history.v1'
const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export function readExecutionHistory(): ExecutionRecord[] {
  if (!canUseStorage()) return []
  try { const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]'); return Array.isArray(parsed) ? parsed as ExecutionRecord[] : [] } catch { return [] }
}

export function saveExecution(record: ExecutionRecord) {
  if (!canUseStorage()) return
  const history = [record, ...readExecutionHistory().filter((run) => run.id !== record.id)].slice(0, 50)
  window.localStorage.setItem(storageKey, JSON.stringify(history))
}
