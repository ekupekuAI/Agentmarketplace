import { BrowserFallbackProvider } from './browserFallbackProvider'
import type { AiProvider, AiProviderId } from './types'

const providers: Record<AiProviderId, AiProvider | undefined> = { gemini: undefined, openrouter: undefined, python: new BrowserFallbackProvider() }

export function getAiProvider(providerId: AiProviderId = 'python'): AiProvider {
  const provider = providers[providerId]
  if (!provider) throw new Error(`${providerId} is not configured. Use the x402 backend for paid Gemini execution.`)
  return provider
}

export function registerAiProvider(provider: AiProvider) { providers[provider.id] = provider }
