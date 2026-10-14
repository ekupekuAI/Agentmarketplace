import { useWallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'
import { getAgentVerseAppId } from '../../services/blockchain/appConfig'
import { readSettings } from '../../services/workspace/localWorkspace'
import { ellipseAddress } from '../../utils/ellipseAddress'

export function WalletControl() {
  const { activeAddress, wallets } = useWallet()
  const [error, setError] = useState<string>()
  const appId = (() => {
    try {
      return getAgentVerseAppId()
    } catch {
      return undefined
    }
  })()

  const preferredWallet = () => wallets?.find((item) => item.id === readSettings().walletPreference) ?? wallets?.[0]
  const walletName = preferredWallet()?.metadata.name ?? 'wallet'

  const connect = async () => {
    try {
      setError(undefined)
      // Honour the wallet chosen in Settings; fall back to whatever this network offers (KMD on LocalNet).
      const wallet = preferredWallet()
      if (!wallet) throw new Error('No wallet is configured for this network. Reload this page and try again.')
      await wallet.connect()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Wallet connection failed.'
      if (!/modal.*closed|cancelled|canceled/i.test(message)) setError(message)
    }
  }

  const disconnect = async () => {
    const active = wallets?.find((wallet) => wallet.isActive)
    await active?.disconnect()
  }

  if (activeAddress) return <div className="wallet-control"><div className="wallet-meta"><span className="wallet-network">TestNet</span><span className="wallet-address"><i />{ellipseAddress(activeAddress)}</span>{appId && <span className="wallet-app">App #{appId}</span>}</div><button type="button" onClick={disconnect}>Disconnect</button></div>

  return <div className="wallet-control"><div className="wallet-meta"><span className="wallet-network">TestNet</span>{appId && <span className="wallet-app">App #{appId}</span>}<span className="wallet-hint">Connect with {walletName} to run paid agents.</span></div><button className="button button-small" type="button" onClick={connect}>Connect {walletName} <span aria-hidden="true">↗</span></button>{error && <span className="wallet-error" role="alert">{error}</span>}</div>
}
