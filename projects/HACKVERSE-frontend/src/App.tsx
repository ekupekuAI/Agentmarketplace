import { AppRouter } from './router/AppRouter'
import { WalletProvider } from '@txnlab/use-wallet-react'
import { useEffect, useState } from 'react'
import { createWalletManager } from './wallet/createWalletManager'
import { readSettings } from './services/workspace/localWorkspace'

export default function App() {
  const [walletManager] = useState(createWalletManager)
  const [settings, setSettings] = useState(readSettings)
  useEffect(() => {
    const syncSettings = () => setSettings(readSettings())
    window.addEventListener('agentverse:settings-changed', syncSettings)
    window.addEventListener('storage', syncSettings)
    return () => {
      window.removeEventListener('agentverse:settings-changed', syncSettings)
      window.removeEventListener('storage', syncSettings)
    }
  }, [])
  return <WalletProvider manager={walletManager}><div className={`theme-${settings.theme}`}><AppRouter /></div></WalletProvider>
}
