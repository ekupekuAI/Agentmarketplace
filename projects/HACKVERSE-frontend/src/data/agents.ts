import type { Agent } from '../types/agent'

export const agents: readonly Agent[] = [
  {
    id: 'resume-analyzer', name: 'Resume Analyzer', tagline: 'Make every application count.',
    description: 'Receive a practical ATS score, missing keywords, and specific suggestions tailored to a role.',
    category: 'Career', price: '0.8 ALGO', rating: 4.9, reviews: 128, usageCount: '2.4k', creator: 'CareerLab', initials: 'RA', accent: 'violet', verified: true, featured: true, trending: true, createdAt: '2026-07-18',
  },
  {
    id: 'research-assistant', name: 'Research Assistant', tagline: 'Clear thinking, faster.',
    description: 'Turn complex questions into concise briefs with key insights, reference cues, and next questions.',
    category: 'Research', price: '1.2 ALGO', rating: 4.8, reviews: 94, usageCount: '1.8k', creator: 'Atlas Works', initials: 'RA', accent: 'cyan', verified: true, featured: true, createdAt: '2026-07-24',
  },
  {
    id: 'prompt-guard', name: 'Prompt Guard', tagline: 'Ship safer AI experiences.',
    description: 'Scan prompts for injection patterns, sensitive data, jailbreak attempts, and unsafe instructions.',
    category: 'Security', price: '0.5 ALGO', rating: 4.9, reviews: 76, usageCount: '3.1k', creator: 'Sentinel AI', initials: 'PG', accent: 'orange', verified: true, featured: true, createdAt: '2026-07-21',
  },
  {
    id: 'code-reviewer', name: 'Code Reviewer', tagline: 'A sharp second set of eyes.',
    description: 'Get a focused review of bugs, complexity, security risks, and practical improvements.',
    category: 'Development', price: '1.0 ALGO', rating: 4.7, reviews: 108, usageCount: '2.7k', creator: 'ByteCraft', initials: 'CR', accent: 'pink', verified: true, trending: true, createdAt: '2026-07-28',
  },
]

export const categories = ['All agents', 'Career', 'Research', 'Security', 'Development'] as const
