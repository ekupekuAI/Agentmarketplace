import type { AgentDefinition } from '../services/ai/types'

export const agentDefinitions: readonly AgentDefinition[] = [
  { agentId: 'resume-analyzer', fields: [{ key: 'resume', label: 'Resume', placeholder: 'Paste your resume or professional summary...', helper: 'Include experience, skills, and education.', multiline: true, minLength: 80 }, { key: 'jobDescription', label: 'Job description', placeholder: 'Paste the role description you are targeting...', multiline: true, minLength: 80 }] },
  { agentId: 'research-assistant', fields: [{ key: 'question', label: 'What would you like to understand?', placeholder: 'e.g. What should a small team consider before adopting an AI support tool?', multiline: true, minLength: 12 }] },
  { agentId: 'prompt-guard', fields: [{ key: 'prompt', label: 'Prompt to inspect', placeholder: 'Paste the prompt or instruction you want to assess...', multiline: true, minLength: 8 }] },
  { agentId: 'code-reviewer', fields: [{ key: 'sourceCode', label: 'Source code', placeholder: 'Paste the code you would like reviewed...', helper: 'Use a representative snippet for the most useful review.', multiline: true, minLength: 20 }] },
]

export const getAgentDefinition = (agentId: string): AgentDefinition => agentDefinitions.find((definition) => definition.agentId === agentId) ?? {
  agentId,
  fields: [{ key: 'task', label: 'Task context', placeholder: 'Describe the work you want this local agent to perform.', multiline: true, minLength: 20 }],
}
