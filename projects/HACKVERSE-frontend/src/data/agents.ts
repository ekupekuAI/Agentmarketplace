import type { Agent } from '../types/agent'

export const agents: readonly Agent[] = [
  {
    id: 'resume-analyzer', name: 'Resume Analyzer', tagline: 'Make every application count.',
    description: 'Receive a practical ATS score, missing keywords, and specific suggestions tailored to a role.',
    category: 'Career', price: '0.8 ALGO', rating: 0, reviews: 0, usageCount: '0', creator: 'CareerLab', initials: 'RA', accent: 'violet', verified: true, featured: true, trending: true, createdAt: '2026-07-18', runtime: 'Gemini', endpoint: '/api/agents/resume-analyzer/execute', metadataHash: 'ipfs://agentverse/resume-analyzer',
  },
  {
    id: 'research-assistant', name: 'Research Assistant', tagline: 'Clear thinking, faster.',
    description: 'Turn complex questions into concise briefs with key insights, reference cues, and next questions.',
    category: 'Research', price: '1.2 ALGO', rating: 0, reviews: 0, usageCount: '0', creator: 'Atlas Works', initials: 'RA', accent: 'cyan', verified: true, featured: true, createdAt: '2026-07-24', runtime: 'Gemini', endpoint: '/api/agents/research-assistant/execute', metadataHash: 'ipfs://agentverse/research-assistant',
  },
  {
    id: 'interview-coach', name: 'Interview Coach', tagline: 'Practice with useful pressure.',
    description: 'Turn a role brief and experience summary into interview questions, answer guidance, and coaching notes.',
    category: 'Career', price: '0.7 ALGO', rating: 0, reviews: 0, usageCount: '0', creator: 'CareerLab', initials: 'IC', accent: 'orange', verified: true, featured: true, createdAt: '2026-07-21', runtime: 'Gemini', endpoint: '/api/agents/interview-coach/execute', metadataHash: 'ipfs://agentverse/interview-coach',
  },
  {
    id: 'code-reviewer', name: 'Code Reviewer', tagline: 'A sharp second set of eyes.',
    description: 'Get a focused review of bugs, complexity, security risks, and practical improvements.',
    category: 'Development', price: '1.0 ALGO', rating: 0, reviews: 0, usageCount: '0', creator: 'ByteCraft', initials: 'CR', accent: 'pink', verified: true, trending: true, createdAt: '2026-07-28', runtime: 'Gemini', endpoint: '/api/agents/code-reviewer/execute', metadataHash: 'ipfs://agentverse/code-reviewer',
  },
  {
    id: 'document-analyzer', name: 'Document Analyzer', tagline: 'Extract the signal from long documents.',
    description: 'Summarize pasted documents, identify sections, surface action items, and produce a compact brief.',
    category: 'Productivity', price: '0.6 ALGO', rating: 0, reviews: 0, usageCount: '0', creator: 'DocForge', initials: 'DA', accent: 'cyan', verified: true, createdAt: '2026-07-29', runtime: 'Python Agent', endpoint: '/api/agents/document-analyzer/execute', metadataHash: 'ipfs://agentverse/document-analyzer',
  },
  {
    id: 'csv-data-analyzer', name: 'CSV Data Analyzer', tagline: 'Make spreadsheet data readable.',
    description: 'Inspect pasted CSV data, detect columns, estimate quality, and summarize numerical and categorical patterns.',
    category: 'Productivity', price: '0.6 ALGO', rating: 0, reviews: 0, usageCount: '0', creator: 'DataDesk', initials: 'CA', accent: 'violet', verified: true, createdAt: '2026-07-29', runtime: 'Python Agent', endpoint: '/api/agents/csv-data-analyzer/execute', metadataHash: 'ipfs://agentverse/csv-data-analyzer',
  },
  {
    id: 'image-ocr', name: 'Image OCR', tagline: 'Turn screenshots into usable text.',
    description: 'Read pasted image text or OCR output, clean it, and return structured fields for downstream workflows.',
    category: 'Productivity', price: '0.5 ALGO', rating: 0, reviews: 0, usageCount: '0', creator: 'VisionBench', initials: 'IO', accent: 'orange', verified: true, createdAt: '2026-07-30', runtime: 'Python Agent', endpoint: '/api/agents/image-ocr/execute', metadataHash: 'ipfs://agentverse/image-ocr',
  },
  {
    id: 'business-validator', name: 'Business Validator', tagline: 'Stress-test the idea before building.',
    description: 'Review a business concept for customer pain, moat, go-to-market risk, pricing, and next validation steps.',
    category: 'Finance', price: '1.1 ALGO', rating: 0, reviews: 0, usageCount: '0', creator: 'VentureOps', initials: 'BV', accent: 'pink', verified: true, trending: true, createdAt: '2026-07-30', runtime: 'Gemini', endpoint: '/api/agents/business-validator/execute', metadataHash: 'ipfs://agentverse/business-validator',
  },
]

export const categories = ['All agents', 'Career', 'Research', 'Development', 'Productivity', 'Finance'] as const
