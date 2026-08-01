import { ExactAvmScheme } from '@x402/avm/exact/client'
import { type ClientAvmSigner } from '@x402/avm'
import { x402Client, x402HTTPClient, wrapFetchWithPayment } from '@x402/fetch'
import type { AgentResult } from '../ai/types'

export interface X402ExecutionResponse {
  summary: string
  output: AgentResult
  paymentTransactionId?: string
  provider: 'Gemini' | 'OpenRouter' | 'Python Agent'
  fallback?: boolean
}

type WalletSigner = {
  address: string
  /**
   * Pera WalletConnect exposes this byte-oriented signer. It matches
   * ClientAvmSigner exactly, preserving the signed group for PAYMENT-SIGNATURE.
   */
  signTransactions: (transactions: Uint8Array[], indexesToSign?: number[]) => Promise<(Uint8Array | null)[]>
}

const apiBaseUrl = import.meta.env.VITE_X402_API_URL?.replace(/\/$/, '') ?? ''
const ALGORAND_TESTNET_X402_NETWORK = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='

async function readErrorResponse(response: Response) {
  const text = await response.text().catch(() => '')
  let parsed: unknown
  try { parsed = text ? JSON.parse(text) : undefined } catch { parsed = undefined }
  const error = parsed && typeof parsed === 'object' && 'error' in parsed ? String((parsed as { error?: unknown }).error) : text || response.statusText
  return error || 'The x402 payment or agent execution failed.'
}

function toPeraX402Signer({ address, signTransactions }: WalletSigner): ClientAvmSigner {
  return {
    address,
    signTransactions,
  }
}

export async function executeAgentWithX402(agentId: string, input: Record<string, string>, signer: WalletSigner): Promise<X402ExecutionResponse> {
  const client = new x402Client().register(ALGORAND_TESTNET_X402_NETWORK, new ExactAvmScheme(toPeraX402Signer(signer)))
  const request = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input }),
  }
  let response: Response
  try {
    response = await wrapFetchWithPayment(fetch, client)(`${apiBaseUrl}/api/agents/${agentId}/execute`, request)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'The x402 payment flow failed before the paid request completed.')
  }
  if (!response.ok) throw new Error(await readErrorResponse(response))
  const settlementClient = new x402HTTPClient(client)
  let settlement: ReturnType<x402HTTPClient['getPaymentSettleResponse']>
  try {
    settlement = settlementClient.getPaymentSettleResponse((name) => response.headers.get(name))
  } catch (error) {
    throw new Error('The agent responded, but x402 did not return a verifiable settlement receipt. No payment is being claimed; check the facilitator and server logs.')
  }
  if (!settlement.success || !settlement.transaction) throw new Error('x402 did not confirm payment settlement. No result was accepted.')
  const body = await response.json() as Omit<X402ExecutionResponse, 'paymentTransactionId'>
  return { ...body, paymentTransactionId: settlement?.transaction }
}
