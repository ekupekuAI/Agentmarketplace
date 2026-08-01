export type AgentCategory = 'Career' | 'Research' | 'Security' | 'Development' | 'Productivity' | 'Finance' | 'Education' | 'Custom'
export type AgentStatus = 'draft' | 'published' | 'archived'
export interface AgentVersion { version: string; date: string; notes: string }

export interface Agent {
  id: string
  name: string
  tagline: string
  description: string
  category: AgentCategory
  price: string
  rating: number
  reviews: number
  usageCount: string
  creator: string
  initials: string
  accent: string
  verified: boolean
  featured?: boolean
  trending?: boolean
  createdAt: string
  status?: AgentStatus
  tags?: string[]
  versions?: AgentVersion[]
  changelog?: string[]
  sampleInputs?: string[]
  metadataUri?: string
  iconDataUrl?: string
  owner?: 'built-in' | 'local'
  runtime?: 'Gemini' | 'Python Agent'
  endpoint?: string
  metadataHash?: string
  creatorWallet?: string
  listingOwner?: string
  updatedAt?: string
}
