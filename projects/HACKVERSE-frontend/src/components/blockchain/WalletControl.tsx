import { WalletId, useWallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'
import { getAgentVerseAppId } from '../../services/blockchain/appConfig'
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

  const connect = async () => {
    try {
      setError(undefined)
      const pera = wallets?.find((wallet) => wallet.id === WalletId.PERA)
      if (!pera) throw new Error('Pera Connect is not configured. Reload this page and try again.')
      await pera.connect()
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

  return <div className="wallet-control"><div className="wallet-meta"><span className="wallet-network">TestNet</span>{appId && <span className="wallet-app">App #{appId}</span>}<span className="wallet-hint">Scan the QR code with Pera Wallet to connect.</span></div><button className="button button-small" type="button" onClick={connect}>Connect Pera <span aria-hidden="true">↗</span></button>{error && <span className="wallet-error" role="alert">{error}</span>}</div>
}
