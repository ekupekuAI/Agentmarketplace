import { WalletId, WalletManager, type SupportedWallet } from '@txnlab/use-wallet-react'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

/** Pera Connect opens a WalletConnect QR modal; no injected extension is needed. */
export function createWalletManager() {
  const algodConfig = getAlgodConfigFromViteEnvironment()
  let wallets: SupportedWallet[]

  if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
    const kmdConfig = getKmdConfigFromViteEnvironment()
    wallets = [{ id: WalletId.KMD, options: { baseServer: kmdConfig.server, token: String(kmdConfig.token), port: String(kmdConfig.port) } }]
  } else {
    wallets = [{ id: WalletId.PERA, options: { chainId: algodConfig.network === 'testnet' ? 416002 : 416001, shouldShowSignTxnToast: true } }, { id: WalletId.DEFLY }, { id: WalletId.EXODUS }]
  }

  return new WalletManager({ wallets, defaultNetwork: algodConfig.network, networks: { [algodConfig.network]: { algod: { baseServer: algodConfig.server, port: algodConfig.port, token: String(algodConfig.token) } } }, options: { resetNetwork: true } })
}
