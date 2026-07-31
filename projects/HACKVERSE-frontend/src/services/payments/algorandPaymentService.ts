import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getApplicationAddress, type TransactionSigner } from 'algosdk'
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs'
import { getAgentVerseAppId } from '../blockchain/appConfig'

export interface TestNetPaymentRequest { sender: string; signer: TransactionSigner; amountAlgos: number }
export interface TestNetPaymentReceipt { transactionId: string; appId: number }

/** Uses AlgoKit Utils and the injected wallet signer; no private keys touch the client. */
export async function payAgentVerse(request: TestNetPaymentRequest): Promise<TestNetPaymentReceipt> {
  const config = getAlgodConfigFromViteEnvironment()
  if (config.network !== 'testnet') throw new Error('Switch your wallet and environment to Algorand TestNet.')
  const appId = getAgentVerseAppId()
  const algorand = AlgorandClient.fromConfig({ algodConfig: config })
  const result = await algorand.send.payment({ sender: request.sender, receiver: getApplicationAddress(appId), amount: algo(request.amountAlgos), signer: request.signer })
  return { transactionId: result.txIds[0], appId }
}
