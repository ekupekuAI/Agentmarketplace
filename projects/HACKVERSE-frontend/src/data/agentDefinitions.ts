import type { AgentDefinition } from '../services/ai/types'

export const agentDefinitions: readonly AgentDefinition[] = [
  { agentId: 'resume-analyzer', fields: [{ key: 'resume', label: 'Resume', placeholder: 'Paste your resume or professional summary...', helper: 'Include experience, skills, and education.', multiline: true, minLength: 80, upload: { accept: '.txt,.md,.csv,text/plain,text/markdown', label: 'Upload resume text' } }, { key: 'jobDescription', label: 'Job description', placeholder: 'Paste the role description you are targeting...', multiline: true, minLength: 80 }] },
  { agentId: 'research-assistant', fields: [{ key: 'question', label: 'What would you like to understand?', placeholder: 'e.g. What should a small team consider before adopting an AI support tool?', multiline: true, minLength: 12 }] },
  { agentId: 'interview-coach', fields: [{ key: 'role', label: 'Target role', placeholder: 'Paste the role, company context, or interview round...', multiline: true, minLength: 20 }, { key: 'experience', label: 'Candidate background', placeholder: 'Paste relevant experience, projects, or resume notes...', multiline: true, minLength: 40 }] },
  { agentId: 'code-reviewer', fields: [{ key: 'sourceCode', label: 'Source code', placeholder: 'Paste the code you would like reviewed...', helper: 'Use a representative snippet for the most useful review.', multiline: true, minLength: 20 }] },
  { agentId: 'document-analyzer', fields: [{ key: 'document', label: 'Document text', placeholder: 'Paste the document content, meeting notes, proposal, or policy text...', multiline: true, minLength: 40, upload: { accept: '.txt,.md,.csv,.json,text/plain,text/markdown,application/json', label: 'Upload document text' } }] },
  { agentId: 'csv-data-analyzer', fields: [{ key: 'csv', label: 'CSV data', placeholder: 'Paste CSV rows including a header row...', multiline: true, minLength: 20, upload: { accept: '.csv,text/csv', label: 'Upload CSV' } }] },
  { agentId: 'image-ocr', fields: [{ key: 'imageText', label: 'Image text or OCR capture', placeholder: 'Paste text from a screenshot or image...', helper: 'Upload an image to attach it, then add any context that improves OCR accuracy.', multiline: true, minLength: 10, upload: { accept: 'image/png,image/jpeg,image/webp', label: 'Upload image' } }] },
  { agentId: 'business-validator', fields: [{ key: 'businessIdea', label: 'Business idea', placeholder: 'Describe the customer, pain point, solution, pricing, and current traction...', multiline: true, minLength: 60 }] },
]

export const getAgentDefinition = (agentId: string): AgentDefinition => agentDefinitions.find((definition) => definition.agentId === agentId) ?? {
  agentId,
  fields: [{ key: 'task', label: 'Task context', placeholder: 'Describe the work you want this agent to perform.', multiline: true, minLength: 20 }],
}
