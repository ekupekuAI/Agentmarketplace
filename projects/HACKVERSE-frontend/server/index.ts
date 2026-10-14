import { config as loadEnv } from 'dotenv'
import express from 'express'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { GoogleGenAI } from '@google/genai'
import { paymentMiddleware, x402ResourceServer } from '@x402/express'
import { ExactAvmScheme } from '@x402/avm/exact/server'
import { USDC_TESTNET_ASA_ID } from '@x402/avm'
import { HTTPFacilitatorClient } from '@x402/core/server'

type AgentRuntime = 'Gemini' | 'OpenRouter' | 'Python Agent'
type AgentOutput = Record<string, string | number | readonly string[]>
type AgentConfig = { id: string; runtime: AgentRuntime; price: string; minLength: number; description: string }
type X402SettlementFailure = { errorReason?: string; errorMessage?: string; transaction?: string; network?: string; payer?: string; amount?: string }

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: [join(__dirname, '..', '.env.server'), join(__dirname, '..', '.env')], quiet: true })
const payTo = process.env.X402_PAY_TO_ADDRESS
const facilitatorUrl = process.env.X402_FACILITATOR_URL ?? 'https://facilitator.goplausible.xyz'
const geminiApiKey = process.env.GEMINI_API_KEY
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const openRouterApiKey = process.env.OPENROUTER_API_KEY
const openRouterModel = process.env.OPENROUTER_MODEL ?? 'openrouter/free'
const webOrigin = process.env.WEB_ORIGIN
const port = Number(process.env.PORT ?? 4021)
const ALGORAND_TESTNET_X402_NETWORK = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
const log = (entry: { level?: string; [key: string]: unknown }) => {
  if (entry.level === 'info' && String(entry.event).startsWith('http_')) return
  const write = entry.level === 'info' ? console.log : console.warn
  write(JSON.stringify(entry))
}
const MISSING_KEY_MESSAGE = 'No AI provider key is configured. Add GEMINI_API_KEY (https://aistudio.google.com/apikey) or OPENROUTER_API_KEY (https://openrouter.ai/keys) to projects/HACKVERSE-frontend/.env.server and restart the API server.'

class AgentError extends Error {
  constructor(readonly status: number, message: string) { super(message) }
}

const agents: Record<string, AgentConfig> = {
  'resume-analyzer': { id: 'resume-analyzer', runtime: 'Gemini', price: '$0.001', minLength: 80, description: 'Resume Analyzer execution' },
  'research-assistant': { id: 'research-assistant', runtime: 'Gemini', price: '$0.001', minLength: 12, description: 'Research Assistant execution' },
  'interview-coach': { id: 'interview-coach', runtime: 'Gemini', price: '$0.001', minLength: 40, description: 'Interview Coach execution' },
  'code-reviewer': { id: 'code-reviewer', runtime: 'Gemini', price: '$0.001', minLength: 20, description: 'Code Reviewer execution' },
  'business-validator': { id: 'business-validator', runtime: 'Gemini', price: '$0.001', minLength: 60, description: 'Business Validator execution' },
  'document-analyzer': { id: 'document-analyzer', runtime: 'Python Agent', price: '$0.001', minLength: 40, description: 'Document Analyzer execution' },
  'csv-data-analyzer': { id: 'csv-data-analyzer', runtime: 'Python Agent', price: '$0.001', minLength: 20, description: 'CSV Data Analyzer execution' },
  'image-ocr': { id: 'image-ocr', runtime: 'Python Agent', price: '$0.001', minLength: 10, description: 'Image OCR execution' },
}

const app = express()
const resourceServer = new x402ResourceServer(new HTTPFacilitatorClient({ url: facilitatorUrl }))
  .register(ALGORAND_TESTNET_X402_NETWORK, new ExactAvmScheme())

app.use((request, response, next) => {
  if (webOrigin) response.setHeader('Access-Control-Allow-Origin', webOrigin)
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'content-type, x-payment, payment, payment-signature, PAYMENT-SIGNATURE, access-control-expose-headers')
  response.setHeader('Access-Control-Expose-Headers', 'PAYMENT-REQUIRED, PAYMENT-RESPONSE, X-PAYMENT-RESPONSE, payment-required, payment-response, x-payment-response')
  if (request.method === 'OPTIONS') return response.sendStatus(204)
  return next()
})
app.use(express.json({ limit: '256kb' }))
app.use((request, response, next) => {
  const startedAt = Date.now()
  const hasPaymentSignature = Boolean(request.header('PAYMENT-SIGNATURE') || request.header('payment-signature'))
  log({ level: 'info', event: 'http_request', method: request.method, path: request.path, hasPaymentSignature })
  response.on('finish', () => {
    const hasPaymentResponse = Boolean(response.getHeader('PAYMENT-RESPONSE') || response.getHeader('X-PAYMENT-RESPONSE'))
    const entry = { level: response.statusCode >= 400 ? 'warn' : 'info', event: 'http_response', method: request.method, path: request.path, status: response.statusCode, hasPaymentSignature, hasPaymentResponse, durationMs: Date.now() - startedAt }
    log(entry)
  })
  next()
})

app.post('/api/agents/:agentId/execute', (request, response, next) => {
  const agent = agents[request.params.agentId]
  if (!agent) return response.status(404).json({ error: 'Agent not found.' })
  if (!payTo) return response.status(503).json({ error: 'Paid x402 execution is not configured on this server. Set X402_PAY_TO_ADDRESS in projects/HACKVERSE-frontend/.env.server and restart the API server.' })
  if (combinedLength(normalizeInput(request.body)) < agent.minLength) return response.status(400).json({ error: 'Input is too short for this agent.' })
  if (agent.runtime === 'Gemini' && !geminiApiKey && !openRouterApiKey) return response.status(503).json({ error: MISSING_KEY_MESSAGE })
  return next()
})

if (payTo) app.use(paymentMiddleware(Object.fromEntries(Object.values(agents).map((agent) => [
  `POST /api/agents/${agent.id}/execute`,
  {
    accepts: [{
      scheme: 'exact',
      price: agent.price,
      network: ALGORAND_TESTNET_X402_NETWORK,
      payTo: payTo!,
      extra: { asset: USDC_TESTNET_ASA_ID },
    }],
    description: `AgentVerse ${agent.description}`,
    mimeType: 'application/json',
    settlementFailedResponseBody: async (_request: unknown, failure: X402SettlementFailure) => {
      log({ level: 'warn', event: 'x402_settlement_failed', agentId: agent.id, failure })
      return {
        contentType: 'application/json',
        body: {
          error: failure.errorMessage || failure.errorReason || 'x402 payment settlement failed.',
          stage: 'facilitator_verification_or_settlement',
          transaction: failure.transaction,
          payer: failure.payer,
          network: failure.network,
        },
      }
    },
  },
])), resourceServer))

const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : undefined

const withTimeout = async <T,>(operation: Promise<T>, timeoutMs: number): Promise<T> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error('Agent runtime timed out.')))),
    ])
  } finally {
    clearTimeout(timeout)
  }
}

async function retry<T>(operation: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { return await operation() } catch (error) { lastError = error }
  }
  throw lastError instanceof Error ? lastError : new Error('Runtime failed.')
}

function normalizeInput(body: unknown) {
  const input = typeof body === 'object' && body && 'input' in body ? (body as { input?: unknown }).input : body
  if (!input || typeof input !== 'object') return {}
  return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([key, value]) => [key, String(value ?? '').trim()]))
}

function combinedLength(input: Record<string, string>) {
  return Object.values(input).join(' ').trim().length
}

function promptFor(agentId: string, input: Record<string, string>) {
  const payload = JSON.stringify(input, null, 2)
  return `You are AgentVerse ${agentId}. Return only a valid JSON object: no Markdown fences, commentary, or prose outside JSON. Use short descriptive keys and string arrays where useful. Input:\n${payload}`
}

function structuredModelOutput(text: string): { summary: string; output: AgentOutput } {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    const parsed = JSON.parse(clean) as Record<string, unknown>
    if (!parsed || Array.isArray(parsed)) throw new Error('Expected an object.')
    const output: AgentOutput = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) output[key] = value.map((item) => typeof item === 'string' ? item : JSON.stringify(item))
      else if (value && typeof value === 'object') output[key] = Object.entries(value).map(([itemKey, itemValue]) => `${itemKey}: ${typeof itemValue === 'string' ? itemValue : JSON.stringify(itemValue)}`)
      else output[key] = String(value ?? '')
    }
    const summaryValue = parsed['Executive Summary'] ?? parsed.Summary ?? parsed.summary
    const summary = typeof summaryValue === 'string' ? summaryValue : clean.slice(0, 280)
    return { summary: summary.slice(0, 280), output }
  } catch {
    return { summary: clean.slice(0, 280), output: { Response: clean } }
  }
}

async function runGemini(agentId: string, input: Record<string, string>) {
  if (ai) {
    try {
    const result = await retry(() => withTimeout(ai.models.generateContent({ model: geminiModel, contents: promptFor(agentId, input) }), 18_000), 2)
    const text = result.text?.trim()
    if (!text) throw new Error('Gemini returned an empty response.')
    const structured = structuredModelOutput(text)
    return {
      ...structured,
      output: { ...structured.output, Provider: 'Gemini', Model: geminiModel },
      fallback: false,
    }
    } catch (error) {
      log({ level: 'warn', event: 'gemini_unavailable', agentId, message: error instanceof Error ? error.message : 'unknown' })
    }
  }

  return runOpenRouter(agentId, input)
}

async function runOpenRouter(agentId: string, input: Record<string, string>) {
  if (!openRouterApiKey) throw new AgentError(geminiApiKey ? 502 : 503, geminiApiKey ? 'Gemini could not complete this run. You were not charged; please retry.' : MISSING_KEY_MESSAGE)
  try {
    const response = await retry(() => withTimeout(fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': webOrigin ?? 'http://localhost:5173',
        'X-Title': 'AgentVerse',
      },
      body: JSON.stringify({ model: openRouterModel, messages: [{ role: 'user', content: promptFor(agentId, input) }] }),
    }), 24_000), 2)
    if (!response.ok) throw new Error(`OpenRouter returned HTTP ${response.status}.`)
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const text = payload.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('OpenRouter returned an empty response.')
    const structured = structuredModelOutput(text)
    return {
      ...structured,
      output: { ...structured.output, Provider: 'OpenRouter', Model: openRouterModel },
      fallback: false,
      provider: 'OpenRouter' as const,
    }
  } catch (error) {
    log({ level: 'warn', event: 'openrouter_failed', agentId, message: error instanceof Error ? error.message : 'unknown' })
    throw new AgentError(502, 'The AI provider could not complete this run. You were not charged; please retry.')
  }
}

async function runPython(agentId: string, input: Record<string, string>) {
  const runner = join(__dirname, 'python_agents.py')
  const payload = JSON.stringify({ agentId, input })
  const pythonCandidates = [process.env.PYTHON_BIN, 'py', 'python3', 'python'].filter(Boolean) as string[]
  return await withTimeout(new Promise<{ summary: string; output: AgentOutput; fallback: boolean }>((resolve, reject) => {
    const tryCandidate = (index: number) => {
      const command = pythonCandidates[index]
      if (!command) {
        log({ level: 'warn', event: 'python_unavailable', agentId })
        reject(new AgentError(503, 'Python was not found on the API server. Install Python 3 or set PYTHON_BIN in .env.server.'))
        return
      }
      const child = spawn(command, [runner], { stdio: ['pipe', 'pipe', 'pipe'] })
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (chunk) => { stdout += chunk.toString() })
      child.stderr.on('data', (chunk) => { stderr += chunk.toString() })
      child.on('error', () => tryCandidate(index + 1))
      child.on('close', (code) => {
        if (code === 0) {
          try { resolve({ ...JSON.parse(stdout), fallback: false }) } catch { reject(new AgentError(502, 'The Python agent returned invalid output. You were not charged; please retry.')) }
        } else {
          log({ level: 'warn', event: 'python_failed', agentId, code, stderr: stderr.slice(0, 200) })
          reject(new AgentError(502, 'The Python agent failed. You were not charged; please retry.'))
        }
      })
      child.stdin.end(payload)
    }
    tryCandidate(0)
  }), 12_000)
}

app.post('/api/agents/:agentId/execute', async (request, response, next) => {
  const startedAt = Date.now()
  try {
    const agent = agents[request.params.agentId]
    if (!agent) return response.status(404).json({ error: 'Agent not found.' })
    const input = normalizeInput(request.body)
    if (combinedLength(input) < agent.minLength) return response.status(400).json({ error: 'Input is too short for this agent.' })
    const result = agent.runtime === 'Gemini' ? await runGemini(agent.id, input) : await runPython(agent.id, input)
    log({ level: 'info', event: 'agent_execution', agentId: agent.id, runtime: agent.runtime, fallback: result.fallback, durationMs: Date.now() - startedAt })
    return response.json({ summary: result.summary, output: result.output, provider: 'provider' in result ? result.provider : agent.runtime, fallback: result.fallback })
  } catch (error) {
    return next(error)
  }
})

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'The paid agent execution could not be completed.'
  log({ level: 'error', event: 'agent_execution_failed', message, stack: error instanceof Error ? error.stack : undefined })
  if (error instanceof AgentError) return response.status(error.status).json({ error: error.message })
  return response.status(500).json({ error: 'The paid agent execution could not be completed. You were not charged; please retry.' })
})

app.listen(port, () => log({ level: 'info', event: 'api_ready', port, x402: Boolean(payTo), gemini: Boolean(geminiApiKey), openrouter: Boolean(openRouterApiKey) }))
