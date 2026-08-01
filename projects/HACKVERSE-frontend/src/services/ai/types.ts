export type AiProviderId = 'gemini' | 'openrouter' | 'python'

export interface AgentInputField {
  key: string
  label: string
  placeholder: string
  helper?: string
  multiline?: boolean
  minLength: number
  upload?: { accept: string; label: string }
}
export interface AgentDefinition { agentId: string; fields: readonly AgentInputField[] }
export type AgentResult = Record<string, string | number | readonly string[]>

export interface AiExecutionRequest { agentId: string; input: Record<string, string>; runId: string }
export interface AiExecutionResult { output: AgentResult; summary: string }

/** All provider adapters implement this contract; the UI never imports a vendor SDK. */
export interface AiProvider { readonly id: AiProviderId; execute(request: AiExecutionRequest): Promise<AiExecutionResult> }
