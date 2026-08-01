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
  // The deployed contract prefixes this key with `execution:` and stores the
  // agent id plus a 64-character result hash as its value. A UUID-based local
  // run id pushes the combined global-state entry beyond Algorand's 128-byte
  // key/value limit. Keep the full UUID locally and use this 24-hex receipt id
  // only for the immutable on-chain index.
  const onChainExecutionId = (await hashExecutionSummary(args.executionId)).slice(0, 24)
  const suggestedParams = await algod.getTransactionParams().do()
  const composer = new AtomicTransactionComposer()

  composer.addMethodCall({
    appID: appId,
    sender: args.sender,
    signer: args.signer,
    method: recordExecutionMethod,
    methodArgs: [onChainExecutionId, args.agentId, args.resultHash],
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
