import { DemoAiProvider } from './demoAiProvider'
import type { AiProvider, AiProviderId } from './types'

const providers: Record<AiProviderId, AiProvider | undefined> = { demo: new DemoAiProvider(), openai: undefined, openrouter: undefined, anthropic: undefined, gemini: undefined }

export function getAiProvider(providerId: AiProviderId = 'demo'): AiProvider {
  const provider = providers[providerId]
  if (!provider) throw new Error(`${providerId} is not configured. Choose Demo AI or install a server-side adapter.`)
  return provider
}

export function registerAiProvider(provider: AiProvider) { providers[provider.id] = provider }
