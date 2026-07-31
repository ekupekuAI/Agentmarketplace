import { getAiProvider } from '../ai/providerRegistry'
import type { ExecutionLog, ExecutionRecord, ExecuteOptions } from './types'
import { saveExecution } from './executionStore'

const stages = ['Validating your input', 'Preparing agent context', 'Running specialized analysis', 'Formatting your results']
const wait = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
const createId = () => `run_${crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`
const withTimeout = <T,>(operation: Promise<T>, timeoutMs: number) => Promise.race<T>([operation, new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error('The agent took too long to respond. Please retry your run.')), timeoutMs))])

export async function executeAgent({ agentId, input, providerId = 'demo', onProgress }: ExecuteOptions): Promise<ExecutionRecord> {
  const startedAt = new Date()
  const logs: ExecutionLog[] = []
  const addLog = (message: string) => { const log = { at: new Date().toISOString(), message }; logs.push(log); onProgress?.(log) }
  const record: ExecutionRecord = { id: createId(), agentId, startedAt: startedAt.toISOString(), status: 'running', input, logs, providerId }
  try {
    for (const stage of stages) { addLog(stage); await wait(260) }
    const result = await withTimeout(getAiProvider(providerId).execute({ agentId, input, runId: record.id }), 20_000)
    const completed: ExecutionRecord = { ...record, status: 'completed', completedAt: new Date().toISOString(), durationMs: Date.now() - startedAt.getTime(), output: result.output, summary: result.summary, logs: [...logs, { at: new Date().toISOString(), message: 'Analysis complete' }] }
    saveExecution(completed)
    return completed
  } catch (error) {
    const failed: ExecutionRecord = { ...record, status: 'failed', completedAt: new Date().toISOString(), durationMs: Date.now() - startedAt.getTime(), summary: error instanceof Error ? error.message : 'Execution failed unexpectedly.', logs: [...logs, { at: new Date().toISOString(), message: 'Execution could not be completed' }] }
    saveExecution(failed)
    throw new ExecutionError(failed)
  }
}

export class ExecutionError extends Error { constructor(readonly record: ExecutionRecord) { super(record.summary); this.name = 'ExecutionError' } }
