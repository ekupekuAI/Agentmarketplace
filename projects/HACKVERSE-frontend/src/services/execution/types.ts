import type { AgentResult, AiProviderId } from '../ai/types'

export type ExecutionStatus = 'running' | 'completed' | 'failed'
export interface ExecutionLog { at: string; message: string }
export interface ExecutionRecord {
  id: string
  agentId: string
  startedAt: string
  completedAt?: string
  durationMs?: number
  status: ExecutionStatus
  input: Record<string, string>
  output?: AgentResult
  summary?: string
  logs: ExecutionLog[]
  providerId: AiProviderId
  network?: 'local' | 'testnet'
  applicationId?: number
  paymentTransactionId?: string
  chainTransactionId?: string
}
export interface ExecuteOptions { agentId: string; input: Record<string, string>; providerId?: AiProviderId; onProgress?: (log: ExecutionLog) => void }
