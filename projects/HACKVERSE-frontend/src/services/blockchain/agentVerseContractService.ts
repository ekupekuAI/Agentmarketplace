import {
  ABIMethod,
  Algodv2,
  AtomicTransactionComposer,
  OnApplicationComplete,
  waitForConfirmation,
  type TransactionSigner,
} from 'algosdk'
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs'
import { getAgentVerseAppId } from './appConfig'

const recordExecutionMethod = new ABIMethod({
  name: 'record_execution',
  args: [
    { type: 'string', name: 'execution_id' },
    { type: 'string', name: 'agent_id' },
    { type: 'string', name: 'result_hash' },
  ],
  returns: { type: 'void' },
})

export interface ExecutionChainReceipt {
  appId: number
  transactionId: string
}

const createAlgodClient = () => {
  const config = getAlgodConfigFromViteEnvironment()
  if (config.network !== 'testnet') {
    throw new Error('Switch your wallet and environment to Algorand TestNet.')
  }

  return new Algodv2(String(config.token ?? ''), config.server, config.port)
}

const toHex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, '0')).join('')

export async function hashExecutionSummary(summary: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(summary))
  return toHex(digest)
}

export async function recordExecutionOnChain(args: {
  agentId: string
  executionId: string
  resultHash: string
  sender: string
  signer: TransactionSigner
}): Promise<ExecutionChainReceipt> {
  const appId = getAgentVerseAppId()
  const algod = createAlgodClient()
  const suggestedParams = await algod.getTransactionParams().do()
  const composer = new AtomicTransactionComposer()

  composer.addMethodCall({
    appID: appId,
    sender: args.sender,
    signer: args.signer,
    method: recordExecutionMethod,
    methodArgs: [args.executionId, args.agentId, args.resultHash],
    suggestedParams,
    onComplete: OnApplicationComplete.NoOpOC,
  })

  const result = await composer.execute(algod, 3)
  const transactionId = result.txIDs[result.txIDs.length - 1]
  if (!transactionId) {
    throw new Error('Execution receipt was submitted without a transaction id.')
  }

  await waitForConfirmation(algod, transactionId, 3)
  return { appId, transactionId }
}
