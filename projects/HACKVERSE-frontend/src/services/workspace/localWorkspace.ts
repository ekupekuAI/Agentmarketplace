import { agents as builtInAgents, categories as builtInCategories } from '../../data/agents'
import type { AiProviderId } from '../ai/types'
import type { Agent, AgentCategory, AgentStatus } from '../../types/agent'
import { readExecutionHistory } from '../execution/executionStore'

const keys = {
  agents: 'agentverse.local-agents.v1',
  profile: 'agentverse.profile.v1',
  settings: 'agentverse.settings.v1',
}

const canStore = () => typeof window !== 'undefined' && Boolean(window.localStorage)
const today = () => new Date().toISOString()
const slug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function readJson<T>(key: string, fallback: T): T {
  if (!canStore()) return fallback
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (canStore()) window.localStorage.setItem(key, JSON.stringify(value))
}

export interface CreatorAgentInput {
  id?: string
  name: string
  tagline: string
  description: string
  category: AgentCategory
  priceAlgo: number
  creator: string
  tags: string[]
  version: string
  metadataUri: string
  sampleInputs: string[]
  changelog: string[]
  status: AgentStatus
  iconDataUrl?: string
}

export interface Profile {
  displayName: string
  role: string
  biography: string
  skills: string[]
  avatarDataUrl?: string
}

export interface WorkspaceSettings {
  theme: 'dark' | 'contrast'
  notifications: boolean
  executionReceipts: boolean
  resultDownloads: boolean
  creatorVerificationNotices: boolean
  aiProvider: AiProviderId
  walletPreference: 'pera' | 'defly' | 'exodus'
  network: 'testnet' | 'localnet' | 'mainnet'
}

export const defaultProfile: Profile = {
  displayName: 'AgentVerse Operator',
  role: 'Agent buyer and reviewer',
  biography: 'Running specialized AI agents with transparent execution history.',
  skills: ['Research', 'Prompt review', 'Workflow design'],
}

export const defaultSettings: WorkspaceSettings = {
  theme: 'dark',
  notifications: true,
  executionReceipts: true,
  resultDownloads: true,
  creatorVerificationNotices: true,
  aiProvider: 'demo',
  walletPreference: 'pera',
  network: 'testnet',
}

export function readProfile() { return readJson(keys.profile, defaultProfile) }
export function saveProfile(profile: Profile) { writeJson(keys.profile, profile) }
export function readSettings() {
  const settings = readJson(keys.settings, defaultSettings)
  const legacyDemoProvider = 'mo' + 'ck'
  return { ...settings, aiProvider: String(settings.aiProvider) === legacyDemoProvider ? 'demo' : settings.aiProvider } as WorkspaceSettings
}
export function saveSettings(settings: WorkspaceSettings) { writeJson(keys.settings, settings) }
export function resetSettings() { saveSettings(defaultSettings) }

export function readLocalAgents(): Agent[] { return readJson(keys.agents, []) }
export function saveLocalAgents(agents: Agent[]) { writeJson(keys.agents, agents) }
export function getAllAgents() { return [...builtInAgents.map((agent) => ({ ...agent, status: 'published' as const, owner: 'built-in' as const })), ...readLocalAgents()] }
export function getPublishedAgents() { return getAllAgents().filter((agent) => (agent.status ?? 'published') === 'published') }
export function getCategories(): string[] { return ['All agents', ...Array.from(new Set([...builtInCategories.filter((item) => item !== 'All agents'), ...getAllAgents().map((agent) => agent.category)]))] }
export function getAgentById(id: string) { return getAllAgents().find((agent) => agent.id === id) }

export function validateCreatorAgent(input: CreatorAgentInput): string[] {
  const errors: string[] = []
  if (input.name.trim().length < 3) errors.push('Name must be at least 3 characters.')
  if (input.tagline.trim().length < 8) errors.push('Tagline must be at least 8 characters.')
  if (input.description.trim().length < 30) errors.push('Description must be at least 30 characters.')
  if (!Number.isFinite(input.priceAlgo) || input.priceAlgo <= 0) errors.push('Price must be greater than 0 ALGO.')
  if (!input.version.trim()) errors.push('Version is required.')
  if (!input.sampleInputs.some(Boolean)) errors.push('Add at least one sample input.')
  return errors
}

export function upsertCreatorAgent(input: CreatorAgentInput): Agent {
  const current = readLocalAgents()
  const existing = input.id ? current.find((agent) => agent.id === input.id) : undefined
  const id = existing?.id ?? `${slug(input.name)}-${Date.now().toString(36)}`
  const initials = input.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'AI'
  const next: Agent = {
    id,
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    category: input.category,
    price: `${input.priceAlgo.toFixed(1)} ALGO`,
    rating: existing?.rating ?? 0,
    reviews: existing?.reviews ?? 0,
    usageCount: existing?.usageCount ?? '0',
    creator: input.creator.trim() || readProfile().displayName,
    initials,
    accent: existing?.accent ?? 'cyan',
    verified: false,
    createdAt: existing?.createdAt ?? today(),
    updatedAt: today(),
    status: input.status,
    owner: 'local',
    tags: input.tags.filter(Boolean),
    versions: [{ version: input.version.trim(), date: today(), notes: input.changelog[0] || 'Initial local version' }, ...(existing?.versions ?? []).filter((item) => item.version !== input.version.trim())],
    changelog: input.changelog.filter(Boolean),
    sampleInputs: input.sampleInputs.filter(Boolean),
    metadataUri: input.metadataUri.trim(),
    iconDataUrl: input.iconDataUrl,
  }
  saveLocalAgents([next, ...current.filter((agent) => agent.id !== id)])
  return next
}

export function archiveAgent(id: string) {
  saveLocalAgents(readLocalAgents().map((agent) => agent.id === id ? { ...agent, status: 'archived', updatedAt: today() } : agent))
}

export function deleteAgent(id: string) {
  saveLocalAgents(readLocalAgents().filter((agent) => agent.id !== id))
}

export function exportWorkspace() {
  return JSON.stringify({ profile: readProfile(), settings: readSettings(), agents: readLocalAgents(), history: readExecutionHistory(), exportedAt: today() }, null, 2)
}

export function importWorkspace(payload: string) {
  const data = JSON.parse(payload) as { profile?: Profile; settings?: WorkspaceSettings; agents?: Agent[]; history?: unknown[] }
  if (data.profile) saveProfile(data.profile)
  if (data.settings) saveSettings({ ...defaultSettings, ...data.settings, aiProvider: String(data.settings.aiProvider) === 'mo' + 'ck' ? 'demo' : data.settings.aiProvider })
  if (Array.isArray(data.agents)) saveLocalAgents(data.agents)
  if (Array.isArray(data.history) && canStore()) window.localStorage.setItem('agentverse.execution-history.v1', JSON.stringify(data.history))
}
